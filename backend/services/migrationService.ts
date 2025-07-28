import PocketBase from 'pocketbase';
import { 
  MigrationManager, 
  SchemaVersion, 
  SchemaCompatibility,
  initializeApp,
  AppStartupOptions
} from '../migrations';

/**
 * MigrationService class for managing database migrations
 */
export class MigrationService {
  private pb: PocketBase;
  private migrationManager: MigrationManager;
  private schemaVersion: SchemaVersion;
  private schemaCompatibility: SchemaCompatibility;

  /**
   * Constructor for MigrationService
   * @param pb PocketBase instance
   */
  constructor(pb: PocketBase) {
    this.pb = pb;
    this.migrationManager = new MigrationManager(pb);
    this.schemaVersion = new SchemaVersion(pb);
    this.schemaCompatibility = new SchemaCompatibility(pb);
  }

  /**
   * Initialize the database with migrations
   * @param options Application startup options
   * @returns Promise<boolean> True if initialization was successful
   */
  async initialize(options: AppStartupOptions = {}): Promise<boolean> {
    try {
      const result = await initializeApp({
        ...options,
        pb: this.pb,
      });
      
      return result.compatible;
    } catch (error) {
      console.error('Error initializing database:', error);
      return false;
    }
  }

  /**
   * Get the current schema version
   * @returns Promise<string> Current schema version
   */
  async getSchemaVersion(): Promise<string> {
    return await this.schemaVersion.getCurrentVersion();
  }

  /**
   * Check if the current schema version is compatible with the application
   * @param minVersion Minimum required version
   * @param maxVersion Maximum supported version
   * @returns Promise<boolean> True if compatible
   */
  async isSchemaCompatible(minVersion?: string, maxVersion?: string): Promise<boolean> {
    const result = await this.schemaCompatibility.checkCompatibility({
      minVersion,
      maxVersion,
    });
    
    return result.compatible;
  }

  /**
   * Apply pending migrations
   * @param verbose Whether to log verbose output
   * @returns Promise<boolean> True if migrations were applied successfully
   */
  async applyMigrations(verbose: boolean = false): Promise<boolean> {
    try {
      // Load migrations
      await this.migrationManager.loadMigrations();
      
      // Apply pending migrations
      return await this.migrationManager.applyPendingMigrations({ verbose });
    } catch (error) {
      console.error('Error applying migrations:', error);
      return false;
    }
  }

  /**
   * Get the number of pending migrations
   * @returns Promise<number> Number of pending migrations
   */
  async getPendingMigrationsCount(): Promise<number> {
    try {
      // Load migrations
      await this.migrationManager.loadMigrations();
      
      // Get pending migrations
      const pendingMigrations = this.migrationManager.getPendingMigrations();
      return pendingMigrations.length;
    } catch (error) {
      console.error('Error getting pending migrations count:', error);
      return 0;
    }
  }
}