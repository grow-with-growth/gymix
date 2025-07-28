import PocketBase from 'pocketbase';
import { SchemaCompatibility } from './schemaCompatibility';
import { MigrationManager } from './migrationManager';
import { MigrationOptions } from './types';

/**
 * Application startup options
 */
export interface AppStartupOptions {
  /**
   * PocketBase URL
   * @default 'http://127.0.0.1:8090'
   */
  pocketbaseUrl?: string;
  
  /**
   * Admin email for authentication
   */
  adminEmail?: string;
  
  /**
   * Admin password for authentication
   */
  adminPassword?: string;
  
  /**
   * Minimum required schema version
   */
  minSchemaVersion?: string;
  
  /**
   * Maximum supported schema version
   */
  maxSchemaVersion?: string;
  
  /**
   * Whether to apply pending migrations on startup
   * @default false
   */
  applyMigrations?: boolean;
  
  /**
   * Migration options
   */
  migrationOptions?: MigrationOptions;
  
  /**
   * Whether to exit the process on schema incompatibility
   * @default true
   */
  exitOnIncompatible?: boolean;
}

/**
 * Application startup result
 */
export interface AppStartupResult {
  /**
   * Whether the schema is compatible
   */
  compatible: boolean;
  
  /**
   * Current schema version
   */
  schemaVersion: string;
  
  /**
   * PocketBase instance
   */
  pb: PocketBase;
  
  /**
   * Migration manager
   */
  migrationManager: MigrationManager;
  
  /**
   * Schema compatibility checker
   */
  schemaCompatibility: SchemaCompatibility;
  
  /**
   * Whether migrations were applied
   */
  migrationsApplied: boolean;
  
  /**
   * Number of migrations applied
   */
  migrationsAppliedCount: number;
  
  /**
   * Error message if any
   */
  error?: string;
}

/**
 * Initialize the application with schema version checking and optional migration
 * @param options Application startup options
 * @returns Promise<AppStartupResult> Startup result
 */
export async function initializeApp(options: AppStartupOptions = {}): Promise<AppStartupResult> {
  const {
    pocketbaseUrl = 'http://127.0.0.1:8090',
    adminEmail,
    adminPassword,
    minSchemaVersion,
    maxSchemaVersion,
    applyMigrations = false,
    migrationOptions = { verbose: true },
    exitOnIncompatible = true,
  } = options;
  
  // Create PocketBase instance
  const pb = new PocketBase(pocketbaseUrl);
  
  // Create schema compatibility checker
  const schemaCompatibility = new SchemaCompatibility(pb);
  
  // Create migration manager
  const migrationManager = new MigrationManager(pb);
  
  try {
    // Authenticate if credentials are provided
    if (adminEmail && adminPassword) {
      try {
        await pb.admins.authWithPassword(adminEmail, adminPassword);
        console.log('Authenticated successfully');
      } catch (error) {
        const errorMessage = 'Authentication failed';
        console.error(errorMessage, error);
        
        return {
          compatible: false,
          schemaVersion: '0.0.0',
          pb,
          migrationManager,
          schemaCompatibility,
          migrationsApplied: false,
          migrationsAppliedCount: 0,
          error: errorMessage,
        };
      }
    }
    
    // Check schema compatibility
    const compatibilityResult = await schemaCompatibility.checkCompatibility({
      minVersion: minSchemaVersion,
      maxVersion: maxSchemaVersion,
    });
    
    console.log(compatibilityResult.message);
    
    // Apply migrations if needed and requested
    let migrationsApplied = false;
    let migrationsAppliedCount = 0;
    
    if (applyMigrations && (!compatibilityResult.compatible || migrationOptions.verbose)) {
      console.log('Checking for pending migrations...');
      
      // Load migrations
      await migrationManager.loadMigrations();
      
      // Get pending migrations
      const pendingMigrations = migrationManager.getPendingMigrations();
      migrationsAppliedCount = pendingMigrations.length;
      
      if (pendingMigrations.length > 0) {
        console.log(`Found ${pendingMigrations.length} pending migrations`);
        
        // Apply migrations
        migrationsApplied = await migrationManager.applyPendingMigrations(migrationOptions);
        
        if (migrationsApplied) {
          console.log('Migrations applied successfully');
          
          // Check compatibility again after migrations
          const updatedCompatibilityResult = await schemaCompatibility.checkCompatibility({
            minVersion: minSchemaVersion,
            maxVersion: maxSchemaVersion,
          });
          
          console.log(updatedCompatibilityResult.message);
          
          // Update compatibility result
          compatibilityResult.compatible = updatedCompatibilityResult.compatible;
          compatibilityResult.currentVersion = updatedCompatibilityResult.currentVersion;
          compatibilityResult.message = updatedCompatibilityResult.message;
        } else {
          console.error('Failed to apply migrations');
        }
      } else {
        console.log('No pending migrations found');
      }
    }
    
    // Exit if incompatible and exitOnIncompatible is true
    if (!compatibilityResult.compatible && exitOnIncompatible) {
      console.error('Schema version is incompatible with the application');
      process.exit(1);
    }
    
    return {
      compatible: compatibilityResult.compatible,
      schemaVersion: compatibilityResult.currentVersion,
      pb,
      migrationManager,
      schemaCompatibility,
      migrationsApplied,
      migrationsAppliedCount,
    };
  } catch (error) {
    const errorMessage = 'Error initializing application';
    console.error(errorMessage, error);
    
    if (exitOnIncompatible) {
      process.exit(1);
    }
    
    return {
      compatible: false,
      schemaVersion: '0.0.0',
      pb,
      migrationManager,
      schemaCompatibility,
      migrationsApplied: false,
      migrationsAppliedCount: 0,
      error: errorMessage,
    };
  }
}