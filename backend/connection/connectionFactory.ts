import PocketBase from 'pocketbase';

/**
 * Configuration options for PocketBase connection
 */
export interface PocketBaseConnectionConfig {
  url: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  healthCheckInterval?: number;
}

/**
 * Connection health status
 */
export interface ConnectionHealth {
  isHealthy: boolean;
  lastChecked: Date;
  responseTime?: number;
  error?: string;
}

/**
 * Connection lifecycle events
 */
export type ConnectionEvent = 'connected' | 'disconnected' | 'error' | 'health-check';

export type ConnectionEventListener = (event: ConnectionEvent, data?: any) => void;

/**
 * PocketBase connection wrapper with lifecycle management and health checks
 */
export class PocketBaseConnection {
  private pb: PocketBase;
  private config: Required<PocketBaseConnectionConfig>;
  private health: ConnectionHealth;
  private healthCheckTimer?: NodeJS.Timeout;
  private eventListeners: Map<ConnectionEvent, ConnectionEventListener[]> = new Map();
  private isConnected: boolean = false;

  constructor(config: PocketBaseConnectionConfig) {
    this.config = {
      timeout: 5000,
      retryAttempts: 3,
      retryDelay: 1000,
      healthCheckInterval: 30000, // 30 seconds
      ...config
    };

    this.pb = new PocketBase(this.config.url);
    this.health = {
      isHealthy: false,
      lastChecked: new Date()
    };

    // Set up PocketBase timeout
    this.pb.beforeSend = (url, options) => {
      options.signal = AbortSignal.timeout(this.config.timeout);
      return { url, options };
    };
  }

  /**
   * Get the PocketBase instance
   */
  getInstance(): PocketBase {
    return this.pb;
  }

  /**
   * Connect to PocketBase with retry logic
   */
  async connect(): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        await this.performHealthCheck();
        
        if (this.health.isHealthy) {
          this.isConnected = true;
          this.startHealthCheckTimer();
          this.emit('connected', { attempt, responseTime: this.health.responseTime });
          return;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown connection error');
        
        if (attempt < this.config.retryAttempts) {
          await this.delay(this.config.retryDelay * attempt); // Exponential backoff
        }
      }
    }

    this.emit('error', lastError);
    throw new Error(`Failed to connect to PocketBase after ${this.config.retryAttempts} attempts: ${lastError?.message}`);
  }

  /**
   * Disconnect from PocketBase
   */
  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.stopHealthCheckTimer();
    this.health.isHealthy = false;
    this.emit('disconnected');
  }

  /**
   * Check if the connection is established
   */
  isConnectionActive(): boolean {
    return this.isConnected && this.health.isHealthy;
  }

  /**
   * Get current health status
   */
  getHealth(): ConnectionHealth {
    return { ...this.health };
  }

  /**
   * Perform a health check
   */
  async performHealthCheck(): Promise<ConnectionHealth> {
    const startTime = Date.now();
    
    try {
      await this.pb.health.check();
      
      const responseTime = Date.now() - startTime;
      this.health = {
        isHealthy: true,
        lastChecked: new Date(),
        responseTime,
        error: undefined
      };
      
      this.emit('health-check', this.health);
      return this.health;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown health check error';
      
      this.health = {
        isHealthy: false,
        lastChecked: new Date(),
        error: errorMessage
      };
      
      this.emit('health-check', this.health);
      
      if (this.isConnected) {
        this.emit('error', error);
      }
      
      throw error;
    }
  }

  /**
   * Add event listener
   */
  on(event: ConnectionEvent, listener: ConnectionEventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * Remove event listener
   */
  off(event: ConnectionEvent, listener: ConnectionEventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: ConnectionEvent, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event, data);
        } catch (error) {
          console.error(`Error in connection event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Start periodic health checks
   */
  private startHealthCheckTimer(): void {
    this.stopHealthCheckTimer();
    
    this.healthCheckTimer = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        // Health check failed, but we don't need to throw here
        // The error is already emitted in performHealthCheck
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * Stop periodic health checks
   */
  private stopHealthCheckTimer(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }
  }

  /**
   * Utility method for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.disconnect();
    this.eventListeners.clear();
  }
}

/**
 * Connection factory for creating PocketBase connections
 */
export class ConnectionFactory {
  private static defaultConfig: Partial<PocketBaseConnectionConfig> = {
    timeout: 5000,
    retryAttempts: 3,
    retryDelay: 1000,
    healthCheckInterval: 30000
  };

  /**
   * Create a new PocketBase connection
   */
  static create(config: PocketBaseConnectionConfig): PocketBaseConnection {
    const fullConfig = { ...this.defaultConfig, ...config };
    return new PocketBaseConnection(fullConfig as PocketBaseConnectionConfig);
  }

  /**
   * Create a connection with environment-based configuration
   */
  static createFromEnv(): PocketBaseConnection {
    const url = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
    const timeout = parseInt(process.env.POCKETBASE_TIMEOUT || '5000');
    const retryAttempts = parseInt(process.env.POCKETBASE_RETRY_ATTEMPTS || '3');
    const retryDelay = parseInt(process.env.POCKETBASE_RETRY_DELAY || '1000');
    const healthCheckInterval = parseInt(process.env.POCKETBASE_HEALTH_CHECK_INTERVAL || '30000');

    return this.create({
      url,
      timeout,
      retryAttempts,
      retryDelay,
      healthCheckInterval
    });
  }

  /**
   * Update default configuration
   */
  static setDefaults(config: Partial<PocketBaseConnectionConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }
}