import { Migration } from '../types';
import PocketBase from 'pocketbase';

/**
 * Initial schema migration
 * This migration creates the migrations collection to track applied migrations
 */
const migration: Migration = {
  id: 'initial_schema_001',
  name: 'Initial Schema',
  timestamp: 1721865600000,
  
  /**
   * Apply the migration
   * @param pb PocketBase instance
   */
  async up(pb: PocketBase): Promise<void> {
    // Create migrations collection to track applied migrations
    await pb.collections.create({
      name: 'migrations',
      schema: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'timestamp',
          type: 'number',
          required: true,
        },
        {
          name: 'applied',
          type: 'bool',
          required: true,
        },
      ],
    });
    
    // Create schema_version collection to track schema version
    await pb.collections.create({
      name: 'schema_version',
      schema: [
        {
          name: 'version',
          type: 'text',
          required: true,
        },
        {
          name: 'updatedAt',
          type: 'date',
          required: true,
        },
      ],
    });
    
    // Insert initial schema version
    await pb.collection('schema_version').create({
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
    });
  },
  
  /**
   * Rollback the migration
   * @param pb PocketBase instance
   */
  async down(pb: PocketBase): Promise<void> {
    // Delete migrations collection
    try {
      await pb.collections.delete('migrations');
    } catch (error) {
      console.warn('Failed to delete migrations collection:', error);
    }
    
    // Delete schema_version collection
    try {
      await pb.collections.delete('schema_version');
    } catch (error) {
      console.warn('Failed to delete schema_version collection:', error);
    }
  },
};

export default migration;