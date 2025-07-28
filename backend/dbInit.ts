import { initializeDatabase, getPocketBase, getMigrationService } from './db';

/**
 * Initialize the database and run migrations
 */
async function main() {
  try {
    console.log('Initializing database...');
    
    // Initialize database
    const success = await initializeDatabase();
    
    if (!success) {
      console.error('Failed to initialize database');
      process.exit(1);
    }
    
    console.log('Database initialized successfully');
    
    // Check if using PocketBase
    const pb = getPocketBase();
    const migrationService = getMigrationService();
    
    if (pb && migrationService) {
      // Get schema version
      const schemaVersion = await migrationService.getSchemaVersion();
      console.log(`Database schema version: ${schemaVersion}`);
      
      // Check for pending migrations
      const pendingCount = await migrationService.getPendingMigrationsCount();
      
      if (pendingCount > 0) {
        console.log(`There are ${pendingCount} pending migrations`);
        
        // Ask to apply migrations
        const args = process.argv.slice(2);
        const applyMigrations = args.includes('--apply-migrations');
        
        if (applyMigrations) {
          console.log('Applying migrations...');
          
          const migrationSuccess = await migrationService.applyMigrations(true);
          
          if (migrationSuccess) {
            console.log('Migrations applied successfully');
            
            // Get updated schema version
            const updatedSchemaVersion = await migrationService.getSchemaVersion();
            console.log(`Updated database schema version: ${updatedSchemaVersion}`);
          } else {
            console.error('Failed to apply migrations');
            process.exit(1);
          }
        } else {
          console.log('Run migrations using: npm run migration:run');
        }
      } else {
        console.log('No pending migrations');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run the CLI
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}