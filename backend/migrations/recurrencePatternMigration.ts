import PocketBase from 'pocketbase';
import { CalendarService } from '../services/calendarService';
import { PocketBaseCalendarRepository } from '../repositories/pocketbase/calendarRepository';

/**
 * Migration script for recurrence pattern changes
 * This script handles the migration of existing recurring events to ensure
 * they comply with the new recurrence pattern requirements
 */
export class RecurrencePatternMigration {
  private pb: PocketBase;
  private calendarService: CalendarService;

  constructor(pb: PocketBase) {
    this.pb = pb;
    const calendarRepository = new PocketBaseCalendarRepository(pb);
    this.calendarService = new CalendarService(calendarRepository);
  }

  /**
   * Run the migration
   */
  async run(): Promise<void> {
    console.log('Starting recurrence pattern migration...');
    
    try {
      // Step 1: Backup current state (log current patterns)
      await this.logCurrentState();
      
      // Step 2: Migrate existing recurring events
      await this.calendarService.migrateExistingRecurringEvents();
      
      // Step 3: Clean up any inconsistent data
      await this.cleanupInconsistentData();
      
      // Step 4: Validate all recurring events
      await this.validateAllRecurringEvents();
      
      // Step 5: Generate migration report
      await this.generateMigrationReport();
      
      console.log('Recurrence pattern migration completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  /**
   * Clean up inconsistent data
   */
  private async cleanupInconsistentData(): Promise<void> {
    console.log('Cleaning up inconsistent data...');
    
    try {
      // Get all calendar events
      const allEvents = await this.pb.collection('calendar_events').getFullList();
      
      for (const event of allEvents) {
        let needsUpdate = false;
        const updates: any = {};

        // Check for instances without a valid master event
        if (event.recurrenceId) {
          try {
            await this.pb.collection('calendar_events').getOne(event.recurrenceId);
          } catch (error) {
            if ((error as any).status === 404) {
              // Master event doesn't exist, remove recurrenceId
              updates.recurrenceId = null;
              needsUpdate = true;
              console.log(`Removed invalid recurrenceId from event ${event.id}`);
            }
          }
        }

        // Check for events with recurrencePattern but also recurrenceId (should not happen)
        if (event.recurrencePattern && event.recurrenceId) {
          updates.recurrenceId = null;
          needsUpdate = true;
          console.log(`Removed recurrenceId from master event ${event.id}`);
        }

        // Check for exceptions without recurrenceId
        if (event.isException && !event.recurrenceId) {
          updates.isException = false;
          needsUpdate = true;
          console.log(`Removed exception flag from event without recurrenceId ${event.id}`);
        }

        if (needsUpdate) {
          await this.pb.collection('calendar_events').update(event.id, updates);
        }
      }
      
      console.log('Data cleanup completed');
    } catch (error) {
      console.error('Error during data cleanup:', error);
      throw error;
    }
  }

  /**
   * Validate all recurring events after migration
   */
  private async validateAllRecurringEvents(): Promise<void> {
    console.log('Validating all recurring events...');
    
    try {
      const recurringEvents = await this.pb.collection('calendar_events').getFullList({
        filter: 'recurrencePattern != null'
      });
      
      let validCount = 0;
      let invalidCount = 0;
      
      for (const event of recurringEvents) {
        if (event.recurrencePattern) {
          try {
            // Try to parse the recurrence pattern
            const pattern = typeof event.recurrencePattern === 'string' 
              ? JSON.parse(event.recurrencePattern) 
              : event.recurrencePattern;
            
            // Validate required fields based on type
            let isValid = true;
            const errors: string[] = [];
            
            if (!pattern.type || !['daily', 'weekly', 'monthly', 'yearly'].includes(pattern.type)) {
              isValid = false;
              errors.push('Invalid or missing recurrence type');
            }
            
            if (!pattern.interval || pattern.interval < 1) {
              isValid = false;
              errors.push('Invalid interval');
            }
            
            switch (pattern.type) {
              case 'weekly':
                if (!pattern.daysOfWeek || !Array.isArray(pattern.daysOfWeek) || pattern.daysOfWeek.length === 0) {
                  isValid = false;
                  errors.push('Weekly recurrence missing daysOfWeek');
                }
                break;
                
              case 'monthly':
                if (pattern.dayOfMonth === undefined || pattern.dayOfMonth < 1 || pattern.dayOfMonth > 31) {
                  isValid = false;
                  errors.push('Monthly recurrence missing or invalid dayOfMonth');
                }
                break;
                
              case 'yearly':
                if (pattern.monthOfYear === undefined || pattern.dayOfMonth === undefined) {
                  isValid = false;
                  errors.push('Yearly recurrence missing monthOfYear or dayOfMonth');
                }
                break;
            }
            
            if (!pattern.endDate && !pattern.endAfterOccurrences) {
              isValid = false;
              errors.push('Missing end condition (endDate or endAfterOccurrences)');
            }
            
            if (isValid) {
              validCount++;
            } else {
              invalidCount++;
              console.warn(`Invalid recurring event ${event.id}: ${errors.join(', ')}`);
            }
            
          } catch (parseError) {
            invalidCount++;
            console.warn(`Failed to parse recurrence pattern for event ${event.id}:`, parseError);
          }
        }
      }
      
      console.log(`Validation completed: ${validCount} valid, ${invalidCount} invalid recurring events`);
      
      if (invalidCount > 0) {
        console.warn(`Found ${invalidCount} invalid recurring events that may need manual attention`);
      }
      
    } catch (error) {
      console.error('Error during validation:', error);
      throw error;
    }
  }

  /**
   * Log current state before migration
   */
  private async logCurrentState(): Promise<void> {
    console.log('Logging current state before migration...');
    
    try {
      const recurringEvents = await this.pb.collection('calendar_events').getFullList({
        filter: 'recurrencePattern != null'
      });
      
      console.log(`Found ${recurringEvents.length} recurring events before migration`);
      
      const patternTypes: Record<string, number> = {};
      let invalidPatterns = 0;
      
      for (const event of recurringEvents) {
        if (event.recurrencePattern) {
          try {
            const pattern = typeof event.recurrencePattern === 'string' 
              ? JSON.parse(event.recurrencePattern) 
              : event.recurrencePattern;
            
            patternTypes[pattern.type] = (patternTypes[pattern.type] || 0) + 1;
          } catch (error) {
            invalidPatterns++;
          }
        }
      }
      
      console.log('Pattern distribution:', patternTypes);
      console.log(`Invalid patterns: ${invalidPatterns}`);
      
    } catch (error) {
      console.error('Error logging current state:', error);
    }
  }

  /**
   * Generate migration report
   */
  private async generateMigrationReport(): Promise<void> {
    console.log('Generating migration report...');
    
    try {
      const recurringEvents = await this.pb.collection('calendar_events').getFullList({
        filter: 'recurrencePattern != null'
      });
      
      const allInstances = await this.pb.collection('calendar_events').getFullList({
        filter: 'recurrenceId != null'
      });
      
      const exceptions = allInstances.filter(instance => instance.isException);
      
      console.log('='.repeat(50));
      console.log('MIGRATION REPORT');
      console.log('='.repeat(50));
      console.log(`Total recurring events: ${recurringEvents.length}`);
      console.log(`Total instances: ${allInstances.length}`);
      console.log(`Total exceptions: ${exceptions.length}`);
      
      // Group by pattern type
      const patternTypes: Record<string, number> = {};
      let validPatterns = 0;
      let invalidPatterns = 0;
      
      for (const event of recurringEvents) {
        if (event.recurrencePattern) {
          try {
            const pattern = typeof event.recurrencePattern === 'string' 
              ? JSON.parse(event.recurrencePattern) 
              : event.recurrencePattern;
            
            patternTypes[pattern.type] = (patternTypes[pattern.type] || 0) + 1;
            validPatterns++;
          } catch (error) {
            invalidPatterns++;
          }
        }
      }
      
      console.log('\nPattern distribution after migration:');
      Object.entries(patternTypes).forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });
      
      console.log(`\nValid patterns: ${validPatterns}`);
      console.log(`Invalid patterns: ${invalidPatterns}`);
      
      if (invalidPatterns > 0) {
        console.warn(`⚠️  ${invalidPatterns} events still have invalid patterns and may need manual attention`);
      } else {
        console.log('✅ All recurring events have valid patterns');
      }
      
      console.log('='.repeat(50));
      
    } catch (error) {
      console.error('Error generating migration report:', error);
    }
  }

  /**
   * Rollback the migration (if needed)
   */
  async rollback(): Promise<void> {
    console.log('Rolling back recurrence pattern migration...');
    
    // This is a placeholder for rollback logic
    // In a real scenario, you would implement logic to revert changes
    // For now, we'll just log that rollback was requested
    
    console.warn('Rollback functionality not implemented. Manual intervention may be required.');
    console.warn('To manually rollback:');
    console.warn('1. Restore database from backup if available');
    console.warn('2. Review and manually fix any problematic recurring events');
    console.warn('3. Re-run validation to ensure data integrity');
  }
}

/**
 * Utility function to run the migration
 */
export async function runRecurrencePatternMigration(pocketbaseUrl: string, adminEmail: string, adminPassword: string): Promise<void> {
  const pb = new PocketBase(pocketbaseUrl);
  
  try {
    // Authenticate as admin
    await pb.admins.authWithPassword(adminEmail, adminPassword);
    
    // Run the migration
    const migration = new RecurrencePatternMigration(pb);
    await migration.run();
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    // Clear auth
    pb.authStore.clear();
  }
}