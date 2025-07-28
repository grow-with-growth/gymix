import { PocketBaseConnection, ConnectionFactory, PocketBaseConnectionConfig } from './connectionFactory';

/**
 * Connection pool configuration
 */
export interface ConnectionPoolConfig {
  minConnections: number;
  maxConnections: number;
  acquireTimeout: number;
  idleTimeout: number;
  connectionConfig: PocketBaseConnectionConfig;
}

/**
 * Pool connection wrapper
 */
interface PooledConnection {
  connection: PocketBaseConnection;
  id: string;
  createdAt: Date;
  lastUsed: Date;
  inUse: boolean;
}

/**
 * Connection pool statistics
 */
export interface PoolStats {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  pendingAcquires: number;
  totalAcquired: number;
  totalReleased: number;
  totalCreated: number;
  totalDestroyed: number;
}

/**
 * Connection pool for managing PocketBase connections
 */
export class ConnectionPool {
  private config: Required<ConnectionPoolConfig>;
  private connections: Map<string, PooledConnection> = new Map();
  private pendingAcquires: Array<{
    resolve: (connection: PocketBaseConnection) => void;
    reject: (error: Error) => void;
    timestamp: Date;
  }> = [];
  private stats: PoolStats = {
    totalConnections: 0,
    activeConnections: 0,
    idleConnections: 0,
    pendingAcquires: 0,
    totalAcquired: 0,
    totalReleased: 0,
    totalCreated: 0,
    totalDestroyed: 0
  };
  private cleanupTimer?: NodeJS.Timeout;
  private isDestroyed: boolean = false;

  constructor(config: ConnectionPoolConfig) {
    this.config = {
      minConnections: 1,
      maxConnections: 10,
      acquireTimeout: 30000,
      idleTimeout: 300000, // 5 minutes
      ...config
    };

    // Validate configuration
    if (this.config.minConnections < 0) {
      throw new Error('minConnections must be >= 0');
    }
    if (this.config.maxConnections < this.config.minConnections) {
      throw new Error('maxConnections must be >= minConnections');
    }
    if (this.config.acquireTimeout <= 0) {
      throw new Error('acquireTimeout must be > 0');
    }
    if (this.config.idleTimeout <= 0) {
      throw new Error('idleTimeout must be > 0');
    }

    // Start cleanup timer
    this.startCleanupTimer();

    // Initialize minimum connections
    this.initializeMinConnections();
  }

  /**
   * Acquire a connection from the pool
   */
  async acquire(): Promise<PocketBaseConnection> {
    if (this.isDestroyed) {
      throw new Error('Connection pool has been destroyed');
    }

    // Try to get an idle connection first
    const idleConnection = this.getIdleConnection();
    if (idleConnection) {
      this.markConnectionInUse(idleConnection);
      this.stats.totalAcquired++;
      return idleConnection.connection;
    }

    // If we can create more connections, do so
    if (this.connections.size < this.config.maxConnections) {
      try {
        const pooledConnection = await this.createConnection();
        this.markConnectionInUse(pooledConnection);
        this.stats.totalAcquired++;
        return pooledConnection.connection;
      } catch (error) {
        // If connection creation fails, fall through to queuing
        console.warn('Failed to create new connection:', error);
      }
    }

    // Queue the request
    return new Promise((resolve, reject) => {
      const request = {
        resolve,
        reject,
        timestamp: new Date()
      };

      this.pendingAcquires.push(request);
      this.stats.pendingAcquires++;

      // Set timeout for the request
      setTimeout(() => {
        const index = this.pendingAcquires.indexOf(request);
        if (index > -1) {
          this.pendingAcquires.splice(index, 1);
          this.stats.pendingAcquires--;
          reject(new Error(`Connection acquire timeout after ${this.config.acquireTimeout}ms`));
        }
      }, this.config.acquireTimeout);
    });
  }

  /**
   * Release a connection back to the pool
   */
  async release(connection: PocketBaseConnection): Promise<void> {
    if (this.isDestroyed) {
      return;
    }

    const pooledConnection = this.findConnectionById(connection);
    if (!pooledConnection) {
      console.warn('Attempted to release unknown connection');
      return;
    }

    // Mark as not in use
    pooledConnection.inUse = false;
    pooledConnection.lastUsed = new Date();
    this.stats.totalReleased++;
    this.updateStats();

    // Try to fulfill pending requests
    if (this.pendingAcquires.length > 0) {
      const request = this.pendingAcquires.shift();
      if (request) {
        this.stats.pendingAcquires--;
        this.markConnectionInUse(pooledConnection);
        this.stats.totalAcquired++;
        request.resolve(connection);
        return;
      }
    }

    // If we have too many idle connections, destroy some
    if (this.getIdleConnectionCount() > this.config.minConnections) {
      await this.destroyConnection(pooledConnection);
    }
  }

  /**
   * Get pool statistics
   */
  getStats(): PoolStats {
    this.updateStats();
    return { ...this.stats };
  }

  /**
   * Destroy the connection pool
   */
  async destroy(): Promise<void> {
    if (this.isDestroyed) {
      return;
    }

    this.isDestroyed = true;

    // Stop cleanup timer
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }

    // Reject all pending requests
    for (const request of this.pendingAcquires) {
      request.reject(new Error('Connection pool destroyed'));
    }
    this.pendingAcquires = [];

    // Destroy all connections
    const destroyPromises = Array.from(this.connections.values()).map(
      pooledConnection => this.destroyConnection(pooledConnection)
    );

    await Promise.all(destroyPromises);
    this.connections.clear();
    this.updateStats();
  }

  /**
   * Get an idle connection from the pool
   */
  private getIdleConnection(): PooledConnection | null {
    for (const pooledConnection of this.connections.values()) {
      if (!pooledConnection.inUse && pooledConnection.connection.isConnectionActive()) {
        return pooledConnection;
      }
    }
    return null;
  }

  /**
   * Mark a connection as in use
   */
  private markConnectionInUse(pooledConnection: PooledConnection): void {
    pooledConnection.inUse = true;
    pooledConnection.lastUsed = new Date();
    this.updateStats();
  }

  /**
   * Find a pooled connection by its PocketBase connection instance
   */
  private findConnectionById(connection: PocketBaseConnection): PooledConnection | null {
    for (const pooledConnection of this.connections.values()) {
      if (pooledConnection.connection === connection) {
        return pooledConnection;
      }
    }
    return null;
  }

  /**
   * Create a new connection
   */
  private async createConnection(): Promise<PooledConnection> {
    const connection = ConnectionFactory.create(this.config.connectionConfig);
    await connection.connect();

    const pooledConnection: PooledConnection = {
      connection,
      id: this.generateConnectionId(),
      createdAt: new Date(),
      lastUsed: new Date(),
      inUse: false
    };

    this.connections.set(pooledConnection.id, pooledConnection);
    this.stats.totalCreated++;
    this.updateStats();

    return pooledConnection;
  }

  /**
   * Destroy a connection
   */
  private async destroyConnection(pooledConnection: PooledConnection): Promise<void> {
    try {
      await pooledConnection.connection.disconnect();
      pooledConnection.connection.destroy();
    } catch (error) {
      console.warn('Error destroying connection:', error);
    }

    this.connections.delete(pooledConnection.id);
    this.stats.totalDestroyed++;
    this.updateStats();
  }

  /**
   * Initialize minimum connections
   */
  private async initializeMinConnections(): Promise<void> {
    const promises: Promise<PooledConnection>[] = [];
    
    for (let i = 0; i < this.config.minConnections; i++) {
      promises.push(this.createConnection().catch(error => {
        console.warn('Failed to create initial connection:', error);
        return null;
      }));
    }

    await Promise.all(promises);
  }

  /**
   * Start the cleanup timer for idle connections
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupIdleConnections();
    }, Math.min(this.config.idleTimeout / 4, 60000)); // Check every 1/4 of idle timeout or 1 minute, whichever is smaller
  }

  /**
   * Clean up idle connections that have exceeded the idle timeout
   */
  private async cleanupIdleConnections(): Promise<void> {
    if (this.isDestroyed) {
      return;
    }

    const now = new Date();
    const connectionsToDestroy: PooledConnection[] = [];

    for (const pooledConnection of this.connections.values()) {
      if (!pooledConnection.inUse) {
        const idleTime = now.getTime() - pooledConnection.lastUsed.getTime();
        
        if (idleTime > this.config.idleTimeout && this.connections.size > this.config.minConnections) {
          connectionsToDestroy.push(pooledConnection);
        }
      }
    }

    // Destroy idle connections
    for (const pooledConnection of connectionsToDestroy) {
      await this.destroyConnection(pooledConnection);
    }
  }

  /**
   * Get the count of idle connections
   */
  private getIdleConnectionCount(): number {
    let count = 0;
    for (const pooledConnection of this.connections.values()) {
      if (!pooledConnection.inUse) {
        count++;
      }
    }
    return count;
  }

  /**
   * Update pool statistics
   */
  private updateStats(): void {
    this.stats.totalConnections = this.connections.size;
    this.stats.activeConnections = 0;
    this.stats.idleConnections = 0;

    for (const pooledConnection of this.connections.values()) {
      if (pooledConnection.inUse) {
        this.stats.activeConnections++;
      } else {
        this.stats.idleConnections++;
      }
    }

    this.stats.pendingAcquires = this.pendingAcquires.length;
  }

  /**
   * Generate a unique connection ID
   */
  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Global connection pool instance
 */
let globalPool: ConnectionPool | null = null;

/**
 * Initialize the global connection pool
 */
export function initializeConnectionPool(config: ConnectionPoolConfig): ConnectionPool {
  if (globalPool) {
    throw new Error('Connection pool already initialized');
  }

  globalPool = new ConnectionPool(config);
  return globalPool;
}

/**
 * Get the global connection pool instance
 */
export function getConnectionPool(): ConnectionPool {
  if (!globalPool) {
    throw new Error('Connection pool not initialized. Call initializeConnectionPool() first.');
  }

  return globalPool;
}

/**
 * Destroy the global connection pool
 */
export async function destroyConnectionPool(): Promise<void> {
  if (globalPool) {
    await globalPool.destroy();
    globalPool = null;
  }
}