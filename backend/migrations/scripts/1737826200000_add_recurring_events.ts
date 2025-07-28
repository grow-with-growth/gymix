import { Migration } from '../types';
import PocketBase from 'pocketbase';

/**
 * Recurring events migration
 * This migration updates the calendar_events collection to support recurring events
 */
const migration: Migration = {
  id: 'add_recurring_events_001',
  name: 'Add Recurring Events Support',
  timestamp: 1737826200000,
  
  /**
   * Apply the migration
   * @param pb PocketBase instance
   */
  async up(pb: PocketBase): Promise<void> {
    try {
      // Get the existing calendar_events collection
      const collection = await pb.collections.getOne('calendar_events');
      
      // Add new fields for recurring events
      const updatedSchema = [
        ...collection.schema,
        {
          name: 'recurrencePattern',
          type: 'json',
          required: false,
          options: {},
        },
        {
          name: 'recurrenceId',
          type: 'text',
          required: false,
          options: {},
        },
        {
          name: 'isException',
          type: 'bool',
          required: false,
          options: {},
        },
      ];
      
      // Update the collection schema
      await pb.collections.update(collection.id, {
        schema: updatedSchema,
      });
      
      console.log('Successfully added recurring events fields to calendar_events collection');
      
    } catch (error) {
      // If calendar_events collection doesn't exist, create it with the new schema
      if (error.status === 404) {
        await pb.collections.create({
          name: 'calendar_events',
          schema: [
            {
              name: 'date',
              type: 'date',
              required: true,
            },
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              type: 'text',
              required: false,
            },
            {
              name: 'time',
              type: 'text',
              required: false,
            },
            {
              name: 'type',
              type: 'select',
              required: true,
              options: {
                values: ['meeting', 'exam', 'holiday', 'task', 'reminder'],
              },
            },
            {
              name: 'user',
              type: 'relation',
              required: true,
              options: {
                collectionId: 'users',
                cascadeDelete: false,
              },
            },
            {
              name: 'recurrencePattern',
              type: 'json',
              required: false,
              options: {},
            },
            {
              name: 'recurrenceId',
              type: 'text',
              required: false,
              options: {},
            },
            {
              name: 'isException',
              type: 'bool',
              required: false,
              options: {},
            },
          ],
        });
        
        console.log('Created calendar_events collection with recurring events support');
      } else {
        throw error;
      }
    }
    
    // Create indexes for better query performance
    try {
      const collection = await pb.collections.getOne('calendar_events');
      
      // Add index for recurrenceId for faster queries of recurring event instances
      await pb.collections.update(collection.id, {
        indexes: [
          'CREATE INDEX idx_calendar_events_recurrence_id ON calendar_events (recurrenceId)',
          'CREATE INDEX idx_calendar_events_date ON calendar_events (date)',
          'CREATE INDEX idx_calendar_events_type ON calendar_events (type)',
          'CREATE INDEX idx_calendar_events_user ON calendar_events (user)',
          'CREATE INDEX idx_calendar_events_is_exception ON calendar_events (isException)',
        ],
      });
      
      console.log('Created indexes for calendar_events collection');
    } catch (indexError) {
      console.warn('Failed to create indexes (they may already exist):', indexError);
    }
  },
  
  /**
   * Rollback the migration
   * @param pb PocketBase instance
   */
  async down(pb: PocketBase): Promise<void> {
    try {
      // Get the existing calendar_events collection
      const collection = await pb.collections.getOne('calendar_events');
      
      // Remove the recurring events fields from schema
      const updatedSchema = collection.schema.filter(field => 
        !['recurrencePattern', 'recurrenceId', 'isException'].includes(field.name)
      );
      
      // Update the collection schema
      await pb.collections.update(collection.id, {
        schema: updatedSchema,
      });
      
      console.log('Successfully removed recurring events fields from calendar_events collection');
      
    } catch (error) {
      console.warn('Failed to rollback recurring events migration:', error);
      throw error;
    }
    
    // Remove indexes
    try {
      const collection = await pb.collections.getOne('calendar_events');
      
      await pb.collections.update(collection.id, {
        indexes: [
          'DROP INDEX IF EXISTS idx_calendar_events_recurrence_id',
          'DROP INDEX IF EXISTS idx_calendar_events_is_exception',
        ],
      });
      
      console.log('Removed recurring events indexes');
    } catch (indexError) {
      console.warn('Failed to remove indexes:', indexError);
    }
  },
};

export default migration;