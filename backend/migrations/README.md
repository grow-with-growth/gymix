# PocketBase Migration System

This directory contains a custom migration system for PocketBase schema changes. Since PocketBase doesn't have a built-in migration system like traditional ORMs, this custom solution provides a structured way to manage database schema changes.

## Directory Structure

- `index.ts` - Main entry point that exports all migration utilities
- `types.ts` - TypeScript interfaces for migrations
- `migrationManager.ts` - Core migration manager class
- `migrationRunner.ts` - Command-line utility for running migrations
- `migrationTemplate.ts` - Utility for creating new migration files
- `schemaVersion.ts` - Utility for managing schema versions
- `registry.json` - JSON file that tracks all migrations and their status
- `scripts/` - Directory containing individual migration scripts

## Usage

### Creating a New Migration

To create a new migration, use the following command:

```bash
npm run migration:create "Migration Name"
```

This will create a new migration file in the `scripts` directory with a timestamp prefix.

### Running Migrations

To run all pending migrations:

```bash
npm run migration:run
```

Options:
- `--verbose` - Show detailed output
- `--dry-run` - Simulate migration without making changes

### Rolling Back Migrations

To roll back the last applied migration:

```bash
npm run migration:rollback
```

To roll back to a specific migration:

```bash
npm run migration:rollback-to <migration-id>
```

### Managing Schema Version

To get the current schema version:

```bash
npm run migration:version
```

To update the schema version:

```bash
npm run migration:version <new-version>
```

## Migration File Structure

Each migration file exports a default object that implements the `Migration` interface:

```typescript
import { Migration } from '../types';
import PocketBase from 'pocketbase';

const migration: Migration = {
  id: 'unique_id',
  name: 'Migration Name',
  timestamp: 1721865600000,
  
  async up(pb: PocketBase): Promise<void> {
    // Implementation for applying the migration
  },
  
  async down(pb: PocketBase): Promise<void> {
    // Implementation for rolling back the migration
  },
};

export default migration;
```

## Environment Variables

The migration runner uses the following environment variables:

- `POCKETBASE_URL` - PocketBase URL (default: http://127.0.0.1:8090)
- `POCKETBASE_ADMIN_EMAIL` - Admin email for authentication
- `POCKETBASE_ADMIN_PASSWORD` - Admin password for authentication

## Schema Versioning

The migration system includes a schema versioning utility that tracks the current schema version in the database. This is useful for checking compatibility between the application and the database schema.

```typescript
import { SchemaVersion } from './schemaVersion';
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');
const schemaVersion = new SchemaVersion(pb);

// Get current schema version
const version = await schemaVersion.getCurrentVersion();

// Update schema version
await schemaVersion.updateVersion('1.0.0');

// Compare versions
const comparison = schemaVersion.compareVersions('1.0.0', '1.1.0'); // Returns -1

// Check if current version is at least a specific version
const isAtLeast = await schemaVersion.isVersionAtLeast('1.0.0'); // Returns true if current version >= 1.0.0
```

### Schema Compatibility

The schema compatibility utility helps ensure that the application is compatible with the current database schema version.

```typescript
import { SchemaCompatibility } from './schemaCompatibility';
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');
const schemaCompatibility = new SchemaCompatibility(pb);

// Check if current schema version is compatible with the application
const result = await schemaCompatibility.checkCompatibility({
  minVersion: '1.0.0',
  maxVersion: '2.0.0',
});

console.log(result.compatible); // true if compatible
console.log(result.message); // Compatibility message

// Check if current schema version is at least a specific version
const minVersionResult = await schemaCompatibility.requireMinVersion('1.0.0');

// Check if current schema version is exactly a specific version
const exactVersionResult = await schemaCompatibility.requireExactVersion('1.0.0');

// Check if current schema version is within a specific range
const rangeResult = await schemaCompatibility.requireVersionRange('1.0.0', '2.0.0');
```

### Application Startup

The application startup utility helps initialize the application with schema version checking and optional migration.

```typescript
import { initializeApp } from './appStartup';

// Initialize the application
const result = await initializeApp({
  pocketbaseUrl: 'http://127.0.0.1:8090',
  adminEmail: 'admin@example.com',
  adminPassword: 'password',
  minSchemaVersion: '1.0.0',
  maxSchemaVersion: '2.0.0',
  applyMigrations: true,
  migrationOptions: { verbose: true },
  exitOnIncompatible: true,
});

// Access the initialized components
const { pb, migrationManager, schemaCompatibility } = result;

// Check if the schema is compatible
if (result.compatible) {
  console.log(`Schema version ${result.schemaVersion} is compatible`);
} else {
  console.error(`Schema version ${result.schemaVersion} is incompatible`);
}

// Check if migrations were applied
if (result.migrationsApplied) {
  console.log(`Applied ${result.migrationsAppliedCount} migrations`);
}
```

### Command-Line Tools

The migration system includes command-line tools for managing schema versions.

```bash
# Get the current schema version
npm run schema:version get

# Set the schema version
npm run schema:version set 1.0.0

# Check if the current schema version is compatible with a target version
npm run schema:check 1.0.0
```