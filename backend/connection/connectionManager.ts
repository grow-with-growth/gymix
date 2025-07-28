import { ConnectionPool, ConnectionPoolConfig, initializeConnectionPool, getConnectionPool, destroyConnectionPool } from './connectionPool';
import { PocketBaseConnection, ConnectionFactory } from './connectionFactory';
import { DatabaseConnection } from '../types';

/**
 * Connection manager configuration
 */
export interface ConnectionManagerConfig {
  usePooling: boolean;
  poolConfig?: ConnectionPoolConfig;
  singleConnectionConfig?: {
    url: string;
    timeout?: number;
    retryAttempts?: number;
    retryDelay?: number;
    healthCheckInterval?: number;
  };
}

/**
 * Connection manager that handles both pooled and single connections
 */
export class ConnectionManager implements DatabaseConnection {
  private config: ConnectionManagerConfig;
  private pool?: ConnectionPool;
  private singleConnection?: PocketBaseConnection;
  private isConnected: boolean = false;

  constructor(config: ConnectionManagerConfig) {
    this.config = config;
  }

  /**
   * Connect to the database
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      if (this.config.usePooling) {
        await this.initializePool();
      } else {
        await this.initializeSingleConnection();
      }

      this.isConnected = true;
      console.log(`Database connected using ${this.config.usePooling ? 'connection pooling' : 'single connection'}`);
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  }

  /**
   * Disconnect from the database
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      if (this.pool) {
        await destroyConnectionPool();
        this.pool = undefined;
      }

      if (this.singleConnection) {
        await this.singleConnection.disconnect();
        this.singleConnection.destroy();
        this.singleConnection = undefined;
      }

      this.isConnected = false;
      console.log('Database disconnected');
    } catch (error) {
      console.error('Error during disconnect:', error);
      throw error;
    }
  }

  /**
   * Check if connected
   */
  isConnectionActive(): boolean {
    return this.isConnected;
  }

  /**
   * Acquire a connection for use
   */
  async acquireConnection(): Promise<PocketBaseConnection> {
    if (!this.isConnected) {
      throw new Error('Connection manager not connected');
    }

    if (this.config.usePooling) {
      if (!this.pool) {
        throw new Error('Connection pool not initialized');
      }
      return await this.pool.acquire();
    } else {
      if (!this.singleConnection) {
        throw new Error('Single connection not initialized');
      }
      return this.singleConnection;
    }
  }

  /**
   * Release a connection back to the pool (no-op for single connections)
   */
  async releaseConnection(connection: PocketBaseConnection): Promise<void> {
    if (this.config.usePooling && this.pool) {
      await this.pool.release(connection);
    }
    // For single connections, we don't need to do anything
  }

  /**
   * Execute a function with a connection
   */
  async withConnection<T>(fn: (connection: PocketBaseConnection) => Promise<T>): Promise<T> {
    const connection = await this.acquireConnection();
    
    try {
      return await fn(connection);
    } finally {
      await this.releaseConnection(connection);
    }
  }

  /**
   * Get connection pool statistics (only available when using pooling)
   */
  getPoolStats() {
    if (!this.config.usePooling || !this.pool) {
      return null;
    }

    return this.pool.getStats();
  }

  /**
   * Get the raw PocketBase instance (for backward compatibility)
   * Note: This should be used sparingly as it bypasses connection management
   */
  getPocketBaseInstance(): any {
    if (this.config.usePooling) {
      console.warn('getPocketBaseInstance() called on pooled connection manager. This bypasses connection management.');
      // Return a connection from the pool, but this is not recommended
      return this.acquireConnection().then(conn => conn.getInstance());
    } else {
      return this.singleConnection?.getInstance();
    }
  }

  /**
   * Initialize connection pool
   */
  private async initializePool(): Promise<void> {
    if (!this.config.poolConfig) {
      throw new Error('Pool configuration required when usePooling is true');
    }

    this.pool = initializeConnectionPool(this.config.poolConfig);
    
    // Test the pool by acquiring and releasing a connection
    const testConnection = await this.pool.acquire();
    await this.pool.release(testConnection);
  }

  /**
   * Initialize single connection
   */
  private async initializeSingleConnection(): Promise<void> {
    if (!this.config.singleConnectionConfig) {
      throw new Error('Single connection configuration required when usePooling is false');
    }

    this.singleConnection = ConnectionFactory.create(this.config.singleConnectionConfig);
    await this.singleConnection.connect();
  }
}

/**
 * Create connection manager from environment variables
 */
export function createConnectionManagerFromEnv(): ConnectionManager {
  const usePooling = process.env.USE_CONNECTION_POOLING === 'true';
  const url = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';

  if (usePooling) {
    const poolConfig: ConnectionPoolConfig = {
      minConnections: parseInt(process.env.POOL_MIN_CONNECTIONS || '2'),
      maxConnections: parseInt(process.env.POOL_MAX_CONNECTIONS || '10'),
      acquireTimeout: parseInt(process.env.POOL_ACQUIRE_TIMEOUT || '30000'),
      idleTimeout: parseInt(process.env.POOL_IDLE_TIMEOUT || '300000'),
      connectionConfig: {
        url,
        timeout: parseInt(process.env.POCKETBASE_TIMEOUT || '5000'),
        retryAttempts: parseInt(process.env.POCKETBASE_RETRY_ATTEMPTS || '3'),
        retryDelay: parseInt(process.env.POCKETBASE_RETRY_DELAY || '1000'),
        healthCheckInterval: parseInt(process.env.POCKETBASE_HEALTH_CHECK_INTERVAL || '30000')
      }
    };

    return new ConnectionManager({
      usePooling: true,
      poolConfig
    });
  } else {
    return new ConnectionManager({
      usePooling: false,
      singleConnectionConfig: {
        url,
        timeout: parseInt(process.env.POCKETBASE_TIMEOUT || '5000'),
        retryAttempts: parseInt(process.env.POCKETBASE_RETRY_ATTEMPTS || '3'),
        retryDelay: parseInt(process.env.POCKETBASE_RETRY_DELAY || '1000'),
        healthCheckInterval: parseInt(process.env.POCKETBASE_HEALTH_CHECK_INTERVAL || '30000')
      }
    });
  }
}