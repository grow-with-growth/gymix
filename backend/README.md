# Database Migration System

This directory contains the backend implementation for the GROW YouR NEED SaaS School Provider platform, including a custom migration system for PocketBase schema changes.

## Directory Structure

- `db.ts` - Database connection implementation
- `types.ts` - TypeScript interfaces for database operations
- `api.ts` - API implementation
- `dbInit.ts` - Database initialization CLI
- `migrations/` - Migration system implementation
- `services/` - Backend services

## Database Connection

The application supports two database modes:

1. **Mock Database**: Uses in-memory data for development and testing
2. **PocketBase**: Uses PocketBase for production

The database mode is determined by the `USE_MOCK_DB` environment variable:

- `USE_MOCK_DB=true` - Use mock database
- `USE_MOCK_DB=false` - Use PocketBase

When using PocketBase, the connection URL is specified by the `POCKETBASE_URL` environment variable.

## Migration System

The migration system provides a structured way to manage database schema changes. See the [migrations README](./migrations/README.md) for more details.

### Creating a New Migration

To create a new migration, use the following command:

```bash
npm run migration:create "Migration Name"
```

### Running Migrations

To run all pending migrations:

```bash
pnpm run migration:run
```

### Database Initialization

To initialize the database and check for pending migrations:

```bash
pnpm run db:init
```

To initialize the database and apply pending migrations:

```bash
pnpm run db:migrate
```

## Environment Variables

The following environment variables are used by the backend:

- `USE_MOCK_DB` - Whether to use the mock database (default: `true`)
- `POCKETBASE_URL` - PocketBase URL (default: `http://127.0.0.1:8090`)
- `POCKETBASE_ADMIN_EMAIL` - Admin email for authentication
- `POCKETBASE_ADMIN_PASSWORD` - Admin password for authentication

## Usage in Application

To use the database in the application:

```typescript
import { initializeDatabase, dbConnection } from './backend/db';

// Initialize the database
await initializeDatabase();

// Check if connected
if (dbConnection.isConnected()) {
  console.log('Database connected');
}

// When using PocketBase, you can access the PocketBase instance
import { getPocketBase } from './backend/db';

const pb = getPocketBase();
if (pb) {
  // Use PocketBase API
  const users = await pb.collection('users').getList(1, 50);
}

// Access the migration service
import { getMigrationService } from './backend/db';

const migrationService = getMigrationService();
if (migrationService) {
  // Get schema version
  const schemaVersion = await migrationService.getSchemaVersion();
  console.log(`Database schema version: ${schemaVersion}`);
}
```