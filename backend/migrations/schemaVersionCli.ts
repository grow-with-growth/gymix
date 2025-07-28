import PocketBase from 'pocketbase';
import { SchemaVersion } from './schemaVersion';

/**
 * Command-line tool for managing schema versions
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  // Configuration
  const pocketbaseUrl = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
  const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
  const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;
  
  // Create PocketBase instance
  const pb = new PocketBase(pocketbaseUrl);
  
  // Authenticate if credentials are provided
  if (adminEmail && adminPassword) {
    try {
      await pb.admins.authWithPassword(adminEmail, adminPassword);
      console.log('Authenticated successfully');
    } catch (error) {
      console.error('Authentication failed:', error);
      process.exit(1);
    }
  }
  
  // Create schema version manager
  const schemaVersion = new SchemaVersion(pb);
  
  // Process command
  switch (command) {
    case 'get':
      try {
        const version = await schemaVersion.getCurrentVersion();
        console.log(`Current schema version: ${version}`);
      } catch (error) {
        console.error('Error getting schema version:', error);
        process.exit(1);
      }
      break;
      
    case 'set':
      const newVersion = args[1];
      if (!newVersion) {
        console.error('New version is required');
        console.log('Usage: node schemaVersionCli.js set <version>');
        process.exit(1);
      }
      
      try {
        const success = await schemaVersion.updateVersion(newVersion);
        if (success) {
          console.log(`Schema version updated to ${newVersion}`);
        } else {
          console.error('Failed to update schema version');
          process.exit(1);
        }
      } catch (error) {
        console.error('Error updating schema version:', error);
        process.exit(1);
      }
      break;
      
    case 'check':
      const targetVersion = args[1];
      if (!targetVersion) {
        console.error('Target version is required');
        console.log('Usage: node schemaVersionCli.js check <version>');
        process.exit(1);
      }
      
      try {
        const currentVersion = await schemaVersion.getCurrentVersion();
        const comparison = schemaVersion.compareVersions(currentVersion, targetVersion);
        
        console.log(`Current version: ${currentVersion}`);
        console.log(`Target version: ${targetVersion}`);
        
        if (comparison < 0) {
          console.log('Current version is LESS THAN target version');
        } else if (comparison > 0) {
          console.log('Current version is GREATER THAN target version');
        } else {
          console.log('Current version is EQUAL TO target version');
        }
        
        const isAtLeast = await schemaVersion.isVersionAtLeast(targetVersion);
        console.log(`Is current version at least ${targetVersion}? ${isAtLeast ? 'Yes' : 'No'}`);
      } catch (error) {
        console.error('Error checking schema version:', error);
        process.exit(1);
      }
      break;
      
    default:
      console.log(`
Schema Version Manager

Usage:
  node schemaVersionCli.js get
  node schemaVersionCli.js set <version>
  node schemaVersionCli.js check <version>

Environment Variables:
  POCKETBASE_URL             PocketBase URL (default: http://127.0.0.1:8090)
  POCKETBASE_ADMIN_EMAIL     Admin email for authentication
  POCKETBASE_ADMIN_PASSWORD  Admin password for authentication
      `);
      break;
  }
}

// Run the CLI
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}