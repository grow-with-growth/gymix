// Migration system types
import PocketBase from 'pocketbase';

/**
 * Interface for a migration
 */
export interface Migration {
  id: string;
  name: string;
  timestamp: number;
  up: (pb: PocketBase) => Promise<void>;
  down: (pb: PocketBase) => Promise<void>;
}

/**
 * Interface for the migration registry
 */
export interface MigrationRegistry {
  schemaVersion: string;
  appliedMigrations: string[];
  lastApplied?: string;
  lastAppliedTimestamp?: number;
}

/**
 * Interface for migration options
 */
export interface MigrationOptions {
  dryRun?: boolean;
  verbose?: boolean;
}