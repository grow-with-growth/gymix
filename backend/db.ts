// Database implementation for the application
// Supports both mock data and PocketBase

import { 
  dbCalendarEvents,
  addCalendarEvent as addCalendarEventToMock
} from '../lib/data/calendar';

import { 
  dbEmails,
  dbEmailFolders
} from '../lib/data/communications';

import {
  dbKnowledgeArticles
} from '../lib/data/knowledge';

import {
  dbMarketplaceProducts
} from '../lib/data/marketplace';

import {
  dbSchoolUsers,
  dbSchoolHubDashboardData
} from '../lib/data/school-hub';

import {
  dbGames
} from '../lib/data/gamification';

import {
  dbMedia
} from '../lib/data/media';

import { DatabaseConnection } from './types';
import PocketBase from 'pocketbase';
import { MigrationService } from './services/migrationService';
import { ConnectionManager, createConnectionManagerFromEnv } from './connection/connectionManager';
import { ServiceContainer, initializeServiceContainer } from './services/serviceContainer';

// Mock database connection for development
class MockDatabaseConnection implements DatabaseConnection {
  private connected: boolean = false;

  async connect(): Promise<void> {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 100));
    this.connected = true;
    console.log('Mock database connected');
    return Promise.resolve();
  }

  async disconnect(): Promise<void> {
    // Simulate disconnection delay
    await new Promise(resolve => setTimeout(resolve, 100));
    this.connected = false;
    console.log('Mock database disconnected');
    return Promise.resolve();
  }

  isConnected(): boolean {
    return this.connected;
  }
}

// Enhanced PocketBase database connection with connection management
class PocketBaseConnection implements DatabaseConnection {
  private connectionManager: ConnectionManager;
  private connected: boolean = false;
  private migrationService?: MigrationService;
  private serviceContainer?: ServiceContainer;

  constructor(url: string = 'http://127.0.0.1:8090') {
    // Create connection manager from environment or use provided URL
    if (process.env.USE_CONNECTION_POOLING === 'true') {
      this.connectionManager = createConnectionManagerFromEnv();
    } else {
      this.connectionManager = createConnectionManagerFromEnv();
      // Override URL if provided
      if (url !== 'http://127.0.0.1:8090') {
        console.warn('URL parameter ignored when using connection manager. Use environment variables instead.');
      }
    }
  }

  async connect(): Promise<void> {
    try {
      // Connect using the connection manager
      await this.connectionManager.connect();
      
      // Get a connection to initialize migrations
      const connection = await this.connectionManager.acquireConnection();
      const pb = connection.getInstance();
      this.migrationService = new MigrationService(pb);
      
      try {
        // Initialize migrations
        const migrationResult = await this.migrationService.initialize({
          minSchemaVersion: '1.0.0',
          applyMigrations: true,
          migrationOptions: { verbose: true },
          exitOnIncompatible: false,
        });
        
        if (!migrationResult) {
          console.warn('Database schema is not compatible with the application');
          
          // Check if there are pending migrations
          const pendingCount = await this.migrationService.getPendingMigrationsCount();
          if (pendingCount > 0) {
            console.log(`There are ${pendingCount} pending migrations`);
            console.log('Run migrations using: pnpm run migration:run');
          }
        }
        
        // Log schema version
        const schemaVersion = await this.migrationService.getSchemaVersion();
        console.log(`Database schema version: ${schemaVersion}`);
        
        // Log connection pool stats if using pooling
        const poolStats = this.connectionManager.getPoolStats();
        if (poolStats) {
          console.log('Connection pool initialized:', poolStats);
        }

        // Initialize service container
        this.serviceContainer = initializeServiceContainer(pb);
        console.log('Service container initialized');
        
      } finally {
        // Release the connection back to the pool
        await this.connectionManager.releaseConnection(connection);
      }
      
      this.connected = true;
      console.log('PocketBase connected with enhanced connection management');
      
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to connect to PocketBase:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.connectionManager.disconnect();
      this.connected = false;
      console.log('PocketBase disconnected');
      return Promise.resolve();
    } catch (error) {
      console.error('Error during disconnect:', error);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get a PocketBase instance (for backward compatibility)
   * Note: This method is deprecated. Use withConnection() instead.
   */
  getPocketBase(): PocketBase {
    console.warn('getPocketBase() is deprecated. Use withConnection() for proper connection management.');
    return this.connectionManager.getPocketBaseInstance() as PocketBase;
  }

  /**
   * Execute a function with a managed connection
   */
  async withConnection<T>(fn: (pb: PocketBase) => Promise<T>): Promise<T> {
    return this.connectionManager.withConnection(async (connection) => {
      return fn(connection.getInstance());
    });
  }

  /**
   * Get connection manager for advanced usage
   */
  getConnectionManager(): ConnectionManager {
    return this.connectionManager;
  }

  getMigrationService(): MigrationService | undefined {
    return this.migrationService;
  }

  /**
   * Get connection pool statistics (if using pooling)
   */
  getPoolStats() {
    return this.connectionManager.getPoolStats();
  }

  /**
   * Get service container
   */
  getServiceContainer(): ServiceContainer | undefined {
    return this.serviceContainer;
  }
}

// Determine which database connection to use
const useMockDatabase = process.env.USE_MOCK_DB === 'true' || !process.env.POCKETBASE_URL;

// Create a singleton instance of the database connection
export const dbConnection = useMockDatabase 
  ? new MockDatabaseConnection() 
  : new PocketBaseConnection(process.env.POCKETBASE_URL);

// Export PocketBase instance if using PocketBase
export const getPocketBase = (): PocketBase | null => {
  if (dbConnection instanceof PocketBaseConnection) {
    return (dbConnection as PocketBaseConnection).getPocketBase();
  }
  return null;
};

// Export migration service if using PocketBase
export const getMigrationService = (): MigrationService | null => {
  if (dbConnection instanceof PocketBaseConnection) {
    return (dbConnection as PocketBaseConnection).getMigrationService() || null;
  }
  return null;
};

// Export service container if using PocketBase
export const getServiceContainer = (): ServiceContainer | null => {
  if (dbConnection instanceof PocketBaseConnection) {
    return (dbConnection as PocketBaseConnection).getServiceContainer() || null;
  }
  return null;
};

// Export getDb function for backward compatibility with existing API routes
export const getDb = async (): Promise<PocketBase> => {
  if (!dbConnection.isConnected()) {
    await dbConnection.connect();
  }
  
  const pb = getPocketBase();
  if (!pb) {
    throw new Error('PocketBase instance not available');
  }
  
  return pb;
};

// Export all mock data collections for direct access (used in mock mode)
export {
  dbCalendarEvents,
  addCalendarEventToMock,
  dbEmails,
  dbEmailFolders,
  dbKnowledgeArticles,
  dbMarketplaceProducts,
  dbSchoolUsers,
  dbSchoolHubDashboardData,
  dbGames,
  dbMedia
};

// Initialize the database connection
export const initializeDatabase = async () => {
  try {
    await dbConnection.connect();
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
};