import PocketBase from 'pocketbase';
import { MigrationManager } from './migrationManager';
import { MigrationOptions } from './types';
import path from 'path';

/**
 * MigrationRunner class for running migrations from the command line
 */
export class MigrationRunner {
  private pb: PocketBase;
  private manager: MigrationManager;

  /**
   * Constructor for MigrationRunner
   * @param pocketbaseUrl PocketBase URL
   * @param adminEmail Admin email for authentication
   * @param adminPassword Admin password for authentication
   * @param registryPath Path to the migration registry file
   * @param migrationsDir Path to the migrations directory
   */
  constructor(
    pocketbaseUrl: string,
    adminEmail?: string,
    adminPassword?: string,
    registryPath?: string,
    migrationsDir?: string
  ) {
    this.pb = new PocketBase(pocketbaseUrl);
    this.manager = new MigrationManager(this.pb, registryPath, migrationsDir);
  }

  /**
   * Authenticate with PocketBase
   * @param email Admin email
   * @param password Admin password
   */
  async authenticate(email: string, password: string): Promise<void> {
    try {
      await this.pb.admins.authWithPassword(email, password);
    } catch (error) {
      console.error('Authentication failed:', error);
      throw new Error('Failed to authenticate with PocketBase');
    }
  }

  /**
   * Run migrations
   * @param options Migration options
   */
  async run(options: MigrationOptions = {}): Promise<void> {
    try {
      // Load migrations
      await this.manager.loadMigrations();
      
      // Apply pending migrations
      const success = await this.manager.applyPendingMigrations(options);
      
      if (success) {
        console.log('Migrations completed successfully');
      } else {
        console.error('Migration failed');
        process.exit(1);
      }
    } catch (error) {
      console.error('Error running migrations:', error);
      process.exit(1);
    }
  }

  /**
   * Rollback the last migration
   * @param options Migration options
   */
  async rollback(options: MigrationOptions = {}): Promise<void> {
    try {
      // Load migrations
      await this.manager.loadMigrations();
      
      // Rollback last migration
      const success = await this.manager.rollbackLastMigration(options);
      
      if (success) {
        console.log('Rollback completed successfully');
      } else {
        console.error('Rollback failed');
        process.exit(1);
      }
    } catch (error) {
      console.error('Error rolling back migration:', error);
      process.exit(1);
    }
  }

  /**
   * Rollback to a specific migration
   * @param targetMigrationId Migration ID to rollback to
   * @param options Migration options
   */
  async rollbackTo(targetMigrationId: string, options: MigrationOptions = {}): Promise<void> {
    try {
      // Load migrations
      await this.manager.loadMigrations();
      
      // Rollback to target migration
      const success = await this.manager.rollbackToMigration(targetMigrationId, options);
      
      if (success) {
        console.log('Rollback completed successfully');
      } else {
        console.error('Rollback failed');
        process.exit(1);
      }
    } catch (error) {
      console.error('Error rolling back migrations:', error);
      process.exit(1);
    }
  }

  /**
   * Get the current schema version
   * @returns string Schema version
   */
  getSchemaVersion(): string {
    return this.manager.getSchemaVersion();
  }

  /**
   * Update the schema version
   * @param version New schema version
   */
  updateSchemaVersion(version: string): void {
    this.manager.updateSchemaVersion(version);
    console.log(`Schema version updated to ${version}`);
  }
}

/**
 * Run migrations from the command line
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  // Configuration
  const pocketbaseUrl = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
  const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
  const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;
  
  // Options
  const options: MigrationOptions = {
    verbose: args.includes('--verbose'),
    dryRun: args.includes('--dry-run'),
  };
  
  // Create runner
  const runner = new MigrationRunner(
    pocketbaseUrl,
    adminEmail,
    adminPassword
  );
  
  // Run command
  (async () => {
    try {
      // Authenticate if credentials are provided
      if (adminEmail && adminPassword) {
        await runner.authenticate(adminEmail, adminPassword);
      }
      
      switch (command) {
        case 'run':
          await runner.run(options);
          break;
        case 'rollback':
          await runner.rollback(options);
          break;
        case 'rollback-to':
          const targetMigrationId = args[1];
          if (!targetMigrationId) {
            console.error('Missing target migration ID');
            process.exit(1);
          }
          await runner.rollbackTo(targetMigrationId, options);
          break;
        case 'version':
          if (args[1]) {
            runner.updateSchemaVersion(args[1]);
          } else {
            console.log(`Current schema version: ${runner.getSchemaVersion()}`);
          }
          break;
        default:
          console.log(`
Migration Runner

Usage:
  node migrationRunner.js run [options]
  node migrationRunner.js rollback [options]
  node migrationRunner.js rollback-to <migration-id> [options]
  node migrationRunner.js version [new-version]

Options:
  --verbose     Show detailed output
  --dry-run     Simulate migration without making changes

Environment Variables:
  POCKETBASE_URL             PocketBase URL (default: http://127.0.0.1:8090)
  POCKETBASE_ADMIN_EMAIL     Admin email for authentication
  POCKETBASE_ADMIN_PASSWORD  Admin password for authentication
          `);
          break;
      }
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  })();
}