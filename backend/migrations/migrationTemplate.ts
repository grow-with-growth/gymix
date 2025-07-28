import { Migration } from './types';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Create a new migration file
 * @param name Migration name
 * @param migrationsDir Directory to create the migration in
 * @returns Path to the created migration file
 */
export function createMigration(
  name: string,
  migrationsDir: string = path.join(__dirname, 'scripts')
): string {
  // Ensure migrations directory exists
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }
  
  // Generate migration ID
  const timestamp = Date.now();
  const id = crypto.randomBytes(8).toString('hex');
  
  // Format name for filename
  const safeName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  
  // Create filename
  const filename = `${timestamp}_${safeName}.ts`;
  const filePath = path.join(migrationsDir, filename);
  
  // Create migration file content
  const content = `import { Migration } from '../types';
import PocketBase from 'pocketbase';

/**
 * ${name}
 */
const migration: Migration = {
  id: '${id}',
  name: '${name}',
  timestamp: ${timestamp},
  
  /**
   * Apply the migration
   * @param pb PocketBase instance
   */
  async up(pb: PocketBase): Promise<void> {
    // TODO: Implement migration
    
    // Example: Create a new collection
    // await pb.collections.create({
    //   name: 'example',
    //   schema: [
    //     {
    //       name: 'title',
    //       type: 'text',
    //       required: true,
    //     },
    //   ],
    // });
    
    // Example: Update an existing collection
    // const collection = await pb.collections.getOne('example');
    // await pb.collections.update(collection.id, {
    //   schema: [
    //     ...collection.schema,
    //     {
    //       name: 'description',
    //       type: 'text',
    //     },
    //   ],
    // });
  },
  
  /**
   * Rollback the migration
   * @param pb PocketBase instance
   */
  async down(pb: PocketBase): Promise<void> {
    // TODO: Implement rollback
    
    // Example: Delete a collection
    // await pb.collections.delete('example');
    
    // Example: Remove a field from a collection
    // const collection = await pb.collections.getOne('example');
    // const updatedSchema = collection.schema.filter(
    //   (field) => field.name !== 'description'
    // );
    // await pb.collections.update(collection.id, {
    //   schema: updatedSchema,
    // });
  },
};

export default migration;
`;
  
  // Write migration file
  fs.writeFileSync(filePath, content, 'utf8');
  
  return filePath;
}

/**
 * Run the migration template generator from the command line
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  const name = args[0];
  
  if (!name) {
    console.error('Migration name is required');
    console.log('Usage: node migrationTemplate.js "Migration Name"');
    process.exit(1);
  }
  
  const filePath = createMigration(name);
  console.log(`Migration created: ${filePath}`);
}