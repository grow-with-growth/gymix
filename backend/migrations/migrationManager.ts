import fs from 'fs';
import path from 'path';
import PocketBase from 'pocketbase';
import { Migration, MigrationRegistry, MigrationOptions } from './types';

/**
 * MigrationManager class for handling database migrations
 */
export class MigrationManager {
  private pb: PocketBase;
  private registryPath: string;
  private migrationsDir: string;
  private registry: MigrationRegistry;
  private migrations: Migration[] = [];

  /**
   * Constructor for MigrationManager
   * @param pb PocketBase instance
   * @param registryPath Path to the migration registry file
   * @param migrationsDir Path to the migrations directory
   */
  constructor(
    pb: PocketBase, 
    registryPath: string = path.join(__dirname, 'registry.json'),
    migrationsDir: string = path.join(__dirname, 'scripts')
  ) {
    this.pb = pb;
    this.registryPath = registryPath;
    this.migrationsDir = migrationsDir;
    
    // Ensure migrations directory exists
    if (!fs.existsSync(this.migrationsDir)) {
      fs.mkdirSync(this.migrationsDir, { recursive: true });
    }
    
    // Load registry
    this.registry = this.loadRegistry();
  }

  /**
   * Load the migration registry from file
   * @returns MigrationRegistry
   */
  private loadRegistry(): MigrationRegistry {
    try {
      if (fs.existsSync(this.registryPath)) {
        const data = fs.readFileSync(this.registryPath, 'utf8');
        return JSON.parse(data) as MigrationRegistry;
      }
    } catch (error) {
      console.error('Error loading migration registry:', error);
    }
    
    // Return default registry if file doesn't exist or has errors
    return {
      schemaVersion: '1.0.0',
      appliedMigrations: [],
    };
  }

  /**
   * Save the migration registry to file
   */
  private saveRegistry(): void {
    try {
      fs.writeFileSync(
        this.registryPath,
        JSON.stringify(this.registry, null, 2),
        'utf8'
      );
    } catch (error) {
      console.error('Error saving migration registry:', error);
      throw new Error('Failed to save migration registry');
    }
  }

  /**
   * Load all migration scripts from the migrations directory
   */
  async loadMigrations(): Promise<void> {
    try {
      // Clear existing migrations
      this.migrations = [];
      
      // Ensure migrations directory exists
      if (!fs.existsSync(this.migrationsDir)) {
        return;
      }
      
      // Get all migration files
      const files = fs.readdirSync(this.migrationsDir)
        .filter(file => file.endsWith('.js') || file.endsWith('.ts'))
        .sort();
      
      // Load each migration
      for (const file of files) {
        const filePath = path.join(this.migrationsDir, file);
        try {
          // Dynamic import for ESM compatibility
          const migration = await import(filePath);
          if (migration.default && 
              typeof migration.default.up === 'function' && 
              typeof migration.default.down === 'function') {
            this.migrations.push(migration.default);
          } else {
            console.warn(`Migration file ${file} does not export a valid migration object`);
          }
        } catch (error) {
          console.error(`Error loading migration ${file}:`, error);
        }
      }
      
      // Sort migrations by timestamp
      this.migrations.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      console.error('Error loading migrations:', error);
      throw new Error('Failed to load migrations');
    }
  }

  /**
   * Get all pending migrations
   * @returns Array of pending migrations
   */
  getPendingMigrations(): Migration[] {
    return this.migrations.filter(
      migration => !this.registry.appliedMigrations.includes(migration.id)
    );
  }

  /**
   * Get all applied migrations
   * @returns Array of applied migrations
   */
  getAppliedMigrations(): Migration[] {
    return this.migrations.filter(
      migration => this.registry.appliedMigrations.includes(migration.id)
    );
  }

  /**
   * Apply a single migration
   * @param migration Migration to apply
   * @param options Migration options
   * @returns Promise<boolean> True if migration was applied successfully
   */
  async applyMigration(migration: Migration, options: MigrationOptions = {}): Promise<boolean> {
    try {
      if (options.verbose) {
        console.log(`Applying migration: ${migration.name} (${migration.id})`);
      }
      
      if (!options.dryRun) {
        await migration.up(this.pb);
        
        // Update registry
        if (!this.registry.appliedMigrations.includes(migration.id)) {
          this.registry.appliedMigrations.push(migration.id);
          this.registry.lastApplied = migration.id;
          this.registry.lastAppliedTimestamp = Date.now();
          this.saveRegistry();
        }
      }
      
      return true;
    } catch (error) {
      console.error(`Error applying migration ${migration.name}:`, error);
      return false;
    }
  }

  /**
   * Rollback a single migration
   * @param migration Migration to rollback
   * @param options Migration options
   * @returns Promise<boolean> True if migration was rolled back successfully
   */
  async rollbackMigration(migration: Migration, options: MigrationOptions = {}): Promise<boolean> {
    try {
      if (options.verbose) {
        console.log(`Rolling back migration: ${migration.name} (${migration.id})`);
      }
      
      if (!options.dryRun) {
        await migration.down(this.pb);
        
        // Update registry
        const index = this.registry.appliedMigrations.indexOf(migration.id);
        if (index !== -1) {
          this.registry.appliedMigrations.splice(index, 1);
          
          // Update last applied
          if (this.registry.appliedMigrations.length > 0) {
            const lastAppliedId = this.registry.appliedMigrations[this.registry.appliedMigrations.length - 1];
            const lastApplied = this.migrations.find(m => m.id === lastAppliedId);
            if (lastApplied) {
              this.registry.lastApplied = lastApplied.id;
              this.registry.lastAppliedTimestamp = Date.now();
            }
          } else {
            this.registry.lastApplied = undefined;
            this.registry.lastAppliedTimestamp = undefined;
          }
          
          this.saveRegistry();
        }
      }
      
      return true;
    } catch (error) {
      console.error(`Error rolling back migration ${migration.name}:`, error);
      return false;
    }
  }

  /**
   * Apply all pending migrations
   * @param options Migration options
   * @returns Promise<boolean> True if all migrations were applied successfully
   */
  async applyPendingMigrations(options: MigrationOptions = {}): Promise<boolean> {
    const pendingMigrations = this.getPendingMigrations();
    
    if (pendingMigrations.length === 0) {
      if (options.verbose) {
        console.log('No pending migrations to apply');
      }
      return true;
    }
    
    if (options.verbose) {
      console.log(`Applying ${pendingMigrations.length} pending migrations...`);
    }
    
    let success = true;
    
    for (const migration of pendingMigrations) {
      const result = await this.applyMigration(migration, options);
      if (!result) {
        success = false;
        break;
      }
    }
    
    return success;
  }

  /**
   * Rollback migrations to a specific point
   * @param targetMigrationId Migration ID to rollback to (exclusive)
   * @param options Migration options
   * @returns Promise<boolean> True if all migrations were rolled back successfully
   */
  async rollbackToMigration(targetMigrationId: string, options: MigrationOptions = {}): Promise<boolean> {
    const appliedMigrations = this.getAppliedMigrations();
    
    if (appliedMigrations.length === 0) {
      if (options.verbose) {
        console.log('No migrations to roll back');
      }
      return true;
    }
    
    // Find migrations to roll back (in reverse order)
    const migrationsToRollback = [];
    let foundTarget = false;
    
    for (let i = appliedMigrations.length - 1; i >= 0; i--) {
      const migration = appliedMigrations[i];
      
      if (migration.id === targetMigrationId) {
        foundTarget = true;
        break;
      }
      
      migrationsToRollback.push(migration);
    }
    
    if (!foundTarget && targetMigrationId !== 'initial') {
      console.error(`Target migration ${targetMigrationId} not found or not applied`);
      return false;
    }
    
    if (migrationsToRollback.length === 0) {
      if (options.verbose) {
        console.log('No migrations to roll back');
      }
      return true;
    }
    
    if (options.verbose) {
      console.log(`Rolling back ${migrationsToRollback.length} migrations...`);
    }
    
    let success = true;
    
    for (const migration of migrationsToRollback) {
      const result = await this.rollbackMigration(migration, options);
      if (!result) {
        success = false;
        break;
      }
    }
    
    return success;
  }

  /**
   * Rollback the last applied migration
   * @param options Migration options
   * @returns Promise<boolean> True if the migration was rolled back successfully
   */
  async rollbackLastMigration(options: MigrationOptions = {}): Promise<boolean> {
    const appliedMigrations = this.getAppliedMigrations();
    
    if (appliedMigrations.length === 0) {
      if (options.verbose) {
        console.log('No migrations to roll back');
      }
      return true;
    }
    
    const lastMigration = appliedMigrations[appliedMigrations.length - 1];
    return await this.rollbackMigration(lastMigration, options);
  }

  /**
   * Get the current schema version
   * @returns string Schema version
   */
  getSchemaVersion(): string {
    return this.registry.schemaVersion;
  }

  /**
   * Update the schema version
   * @param version New schema version
   */
  updateSchemaVersion(version: string): void {
    this.registry.schemaVersion = version;
    this.saveRegistry();
  }
}