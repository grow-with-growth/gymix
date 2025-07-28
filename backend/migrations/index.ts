// Export all migration utilities
export * from './types';
export * from './migrationManager';
export * from './migrationRunner';
export * from './migrationTemplate';
export * from './schemaVersion';
export * from './schemaCompatibility';
export * from './appStartup';

// Export a convenience function to create a new migration
import { createMigration } from './migrationTemplate';
import path from 'path';

/**
 * Create a new migration file
 * @param name Migration name
 * @returns Path to the created migration file
 */
export function createNewMigration(name: string): string {
  return createMigration(name, path.join(__dirname, 'scripts'));
}