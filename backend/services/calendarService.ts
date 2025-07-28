// Calendar service that uses the repository pattern
import { CalendarEvent, RecurrencePattern } from '../../types';
import { CalendarRepository } from '../repositories/interfaces';
import { recurrenceEngine } from './recurrenceEngine';

/**
 * Calendar service that handles business logic for calendar operations
 */
export class CalendarService {
  private calendarRepository: CalendarRepository;

  constructor(calendarRepository: CalendarRepository) {
    this.calendarRepository = calendarRepository;
  }

  /**
   * Get all calendar events
   */
  async getAllEvents(): Promise<CalendarEvent[]> {
    return await this.calendarRepository.findAll();
  }

  /**
   * Get calendar event by ID
   */
  async getEventById(id: string): Promise<CalendarEvent | null> {
    if (!id) {
      throw new Error('Event ID is required');
    }
    return await this.calendarRepository.findById(id);
  }

  /**
   * Get calendar events by date range
   */
  async getEventsByDateRange(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      throw new Error('Dates must be in YYYY-MM-DD format');
    }

    // Validate that start date is before or equal to end date
    if (new Date(startDate) > new Date(endDate)) {
      throw new Error('Start date must be before or equal to end date');
    }

    return await this.calendarRepository.findByDateRange(startDate, endDate);
  }

  /**
   * Get calendar events by month
   */
  async getEventsByMonth(year: number, month: number): Promise<CalendarEvent[]> {
    if (!year || !month) {
      throw new Error('Year and month are required');
    }

    if (year < 1900 || year > 2100) {
      throw new Error('Year must be between 1900 and 2100');
    }

    if (month < 1 || month > 12) {
      throw new Error('Month must be between 1 and 12');
    }

    return await this.calendarRepository.findByMonth(year, month);
  }

  /**
   * Get calendar events by type
   */
  async getEventsByType(type: CalendarEvent['type']): Promise<CalendarEvent[]> {
    if (!type) {
      throw new Error('Event type is required');
    }

    const validTypes: CalendarEvent['type'][] = ['meeting', 'exam', 'holiday', 'task', 'reminder'];
    if (!validTypes.includes(type)) {
      throw new Error('Invalid event type');
    }

    return await this.calendarRepository.findByType(type);
  }

  /**
   * Get calendar events by user
   */
  async getEventsByUser(userId: string): Promise<CalendarEvent[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }
    return await this.calendarRepository.findByUser(userId);
  }

  /**
   * Create a new calendar event
   */
  async createEvent(eventData: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    // Business logic validation
    if (!eventData.title || !eventData.date || !eventData.type) {
      throw new Error('Title, date, and type are required');
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(eventData.date)) {
      throw new Error('Date must be in YYYY-MM-DD format');
    }

    // Validate that the date is not in the past (optional business rule)
    const eventDate = new Date(eventData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (eventDate < today) {
      console.warn('Creating event in the past:', eventData.date);
    }

    return await this.calendarRepository.create(eventData);
  }

  /**
   * Update an existing calendar event
   */
  async updateEvent(id: string, eventData: Partial<CalendarEvent>): Promise<CalendarEvent> {
    if (!id) {
      throw new Error('Event ID is required');
    }

    // Check if event exists
    const existingEvent = await this.calendarRepository.findById(id);
    if (!existingEvent) {
      throw new Error('Calendar event not found');
    }

    // Validate date format if date is being updated
    if (eventData.date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(eventData.date)) {
        throw new Error('Date must be in YYYY-MM-DD format');
      }
    }

    return await this.calendarRepository.update(id, eventData);
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(id: string): Promise<void> {
    if (!id) {
      throw new Error('Event ID is required');
    }

    // Check if event exists
    const existingEvent = await this.calendarRepository.findById(id);
    if (!existingEvent) {
      throw new Error('Calendar event not found');
    }

    await this.calendarRepository.delete(id);
  }

  /**
   * Get upcoming events (next 7 days)
   */
  async getUpcomingEvents(days: number = 7): Promise<CalendarEvent[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    const startDate = today.toISOString().split('T')[0];
    const endDate = futureDate.toISOString().split('T')[0];

    return await this.calendarRepository.findByDateRange(startDate, endDate);
  }

  /**
   * Get events statistics
   */
  async getEventsStatistics(): Promise<{
    total: number;
    byType: Record<CalendarEvent['type'], number>;
    upcoming: number;
  }> {
    const allEvents = await this.calendarRepository.findAll();
    const upcomingEvents = await this.getUpcomingEvents();
    
    const byType: Record<CalendarEvent['type'], number> = {
      meeting: 0,
      exam: 0,
      holiday: 0,
      task: 0,
      reminder: 0,
    };

    allEvents.forEach(event => {
      byType[event.type]++;
    });

    return {
      total: allEvents.length,
      byType,
      upcoming: upcomingEvents.length,
    };
  }

  /**
   * Get events with recurring instances expanded for a date range
   */
  async getEventsWithRecurring(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    // Get all regular events in the date range
    const regularEvents = await this.calendarRepository.findByDateRange(startDate, endDate);
    
    // Get all recurring events
    const recurringEvents = await this.calendarRepository.findRecurringEvents();
    
    // Generate occurrences for recurring events
    const allEvents: CalendarEvent[] = [...regularEvents];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (const recurringEvent of recurringEvents) {
      if (recurringEvent.recurrencePattern) {
        const occurrences = recurrenceEngine.generateOccurrences(recurringEvent, start, end);
        allEvents.push(...occurrences);
      }
    }
    
    // Get exceptions and filter out overridden occurrences
    const exceptions = await Promise.all(
      recurringEvents.map(event => this.calendarRepository.findExceptions(event.id))
    );
    const flatExceptions = exceptions.flat();
    
    // Remove occurrences that have exceptions
    const filteredEvents = allEvents.filter(event => {
      if (event.recurrenceId && !event.isException) {
        // Check if there's an exception for this date
        return !flatExceptions.some(exception => 
          exception.recurrenceId === event.recurrenceId && 
          exception.date === event.date
        );
      }
      return true;
    });
    
    // Add exceptions
    filteredEvents.push(...flatExceptions);
    
    // Sort by date
    return filteredEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Create a recurring event
   */
  async createRecurringEvent(
    eventData: Omit<CalendarEvent, 'id'>,
    recurrencePattern: RecurrencePattern
  ): Promise<CalendarEvent> {
    // Validate recurrence pattern
    const validation = recurrenceEngine.validatePattern(recurrencePattern);
    if (!validation.valid) {
      throw new Error(`Invalid recurrence pattern: ${validation.errors.join(', ')}`);
    }

    // Create the event with recurrence pattern
    const recurringEventData = {
      ...eventData,
      recurrencePattern,
    };

    return await this.calendarRepository.create(recurringEventData);
  }

  /**
   * Update a recurring event
   */
  async updateRecurringEvent(
    id: string,
    eventData: Partial<CalendarEvent>,
    updateType: 'single' | 'all' = 'single'
  ): Promise<CalendarEvent> {
    const existingEvent = await this.calendarRepository.findById(id);
    if (!existingEvent) {
      throw new Error('Event not found');
    }

    if (updateType === 'single') {
      // Create an exception for this single occurrence
      if (existingEvent.recurrenceId) {
        // This is already an instance, just update it
        return await this.calendarRepository.update(id, eventData);
      } else if (existingEvent.recurrencePattern) {
        // This is the master event, create an exception
        return await this.calendarRepository.createException(id, existingEvent.date, eventData);
      } else {
        // Regular event, just update
        return await this.calendarRepository.update(id, eventData);
      }
    } else {
      // Update all occurrences (update the master event)
      if (existingEvent.recurrenceId) {
        // Find the master event
        const masterEvent = await this.calendarRepository.findById(existingEvent.recurrenceId);
        if (masterEvent) {
          return await this.calendarRepository.update(masterEvent.id, eventData);
        }
      }
      return await this.calendarRepository.update(id, eventData);
    }
  }

  /**
   * Delete a recurring event
   */
  async deleteRecurringEvent(
    id: string,
    deleteType: 'single' | 'all' = 'single'
  ): Promise<void> {
    const existingEvent = await this.calendarRepository.findById(id);
    if (!existingEvent) {
      throw new Error('Event not found');
    }

    if (deleteType === 'single') {
      if (existingEvent.recurrenceId) {
        // This is an instance or exception, just delete it
        await this.calendarRepository.delete(id);
      } else if (existingEvent.recurrencePattern) {
        // This is the master event, create a deletion exception
        await this.calendarRepository.createException(id, existingEvent.date, { 
          title: '[DELETED]',
          description: 'This occurrence was deleted'
        });
      } else {
        // Regular event, just delete
        await this.calendarRepository.delete(id);
      }
    } else {
      // Delete all occurrences
      if (existingEvent.recurrenceId) {
        // Find and delete the master event
        const masterEvent = await this.calendarRepository.findById(existingEvent.recurrenceId);
        if (masterEvent) {
          await this.calendarRepository.delete(masterEvent.id);
        }
        // Delete all instances
        const instances = await this.calendarRepository.findByRecurrenceId(existingEvent.recurrenceId);
        for (const instance of instances) {
          await this.calendarRepository.delete(instance.id);
        }
      } else {
        // Delete the master event and all instances
        await this.calendarRepository.delete(id);
        const instances = await this.calendarRepository.findByRecurrenceId(id);
        for (const instance of instances) {
          await this.calendarRepository.delete(instance.id);
        }
      }
    }
  }

  /**
   * Get next occurrence of a recurring event
   */
  async getNextOccurrence(eventId: string): Promise<Date | null> {
    const event = await this.calendarRepository.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    return recurrenceEngine.getNextOccurrence(event);
  }

  /**
   * Get future occurrences of a recurring event
   */
  async getFutureOccurrences(eventId: string, limit: number = 10): Promise<CalendarEvent[]> {
    const event = await this.calendarRepository.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    return recurrenceEngine.getFutureOccurrences(event, limit);
  }

  /**
   * Get all events in a recurring series
   */
  async getEventSeries(seriesId: string): Promise<CalendarEvent[]> {
    // First, try to find the parent event
    let parentEvent = await this.calendarRepository.findById(seriesId);
    
    // If not found, it might be a series instance, so find by recurrenceId
    if (!parentEvent) {
      const allEvents = await this.calendarRepository.findAll();
      parentEvent = allEvents.find(e => e.recurrenceId === seriesId);
      
      if (!parentEvent) {
        throw new Error('Event series not found');
      }
    }

    // Get the actual parent event if we found an instance
    const actualParentId = parentEvent.recurrenceId || parentEvent.id;
    const actualParent = parentEvent.recurrenceId 
      ? await this.calendarRepository.findById(actualParentId) || parentEvent
      : parentEvent;

    if (!actualParent.recurrencePattern) {
      // Not a recurring event, return just this event
      return [actualParent];
    }

    // Generate occurrences for a wide date range to get all instances
    const startDate = new Date(actualParent.date);
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 2); // Look 2 years ahead

    const generatedOccurrences = recurrenceEngine.generateOccurrences(
      actualParent,
      startDate,
      endDate
    );

    // Also get any exceptions/modifications from the database
    const allEvents = await this.calendarRepository.findAll();
    const exceptions = allEvents.filter(e => 
      e.recurrenceId === actualParentId && e.isException
    );

    // Merge generated occurrences with exceptions
    const allSeriesEvents = [...generatedOccurrences];
    
    // Replace generated occurrences with exceptions where they exist
    exceptions.forEach(exception => {
      const index = allSeriesEvents.findIndex(e => e.date === exception.date);
      if (index >= 0) {
        allSeriesEvents[index] = exception;
      } else {
        allSeriesEvents.push(exception);
      }
    });

    // Sort by date
    return allSeriesEvents.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  /**
   * Update recurrence pattern and handle future occurrences
   */
  async updateRecurrencePattern(
    eventId: string,
    newPattern: RecurrencePattern,
    effectiveDate?: string
  ): Promise<CalendarEvent> {
    // Get the master event
    const masterEvent = await this.calendarRepository.findById(eventId);
    if (!masterEvent) {
      throw new Error('Event not found');
    }

    // If this is not a master event, find the master
    let actualMasterEvent = masterEvent;
    if (masterEvent.recurrenceId) {
      const master = await this.calendarRepository.findById(masterEvent.recurrenceId);
      if (master) {
        actualMasterEvent = master;
      }
    }

    if (!actualMasterEvent.recurrencePattern) {
      throw new Error('Event is not a recurring event');
    }

    // Validate the new pattern
    const validation = recurrenceEngine.validatePattern(newPattern);
    if (!validation.valid) {
      throw new Error(`Invalid recurrence pattern: ${validation.errors.join(', ')}`);
    }

    const changeDate = effectiveDate ? new Date(effectiveDate) : new Date();
    
    // Check if the pattern actually changed
    const currentPattern = actualMasterEvent.recurrencePattern;
    const patternChanged = !recurrenceEngine.patternsEqual(currentPattern, newPattern);
    
    if (patternChanged) {
      // Handle future occurrences based on the effective date
      await this.handleFutureOccurrencesForPatternChange(
        actualMasterEvent.id,
        newPattern,
        changeDate
      );

      // Update the master event with the new pattern
      const updatedMasterEvent = await this.calendarRepository.update(actualMasterEvent.id, {
        recurrencePattern: newPattern
      });

      // Log the pattern change for audit purposes
      console.log(`Recurrence pattern updated for event ${actualMasterEvent.id}`, {
        oldPattern: currentPattern,
        newPattern: newPattern,
        effectiveDate: changeDate.toISOString()
      });

      return updatedMasterEvent;
    }

    // No change needed, return the existing event
    return actualMasterEvent;
  }

  /**
   * Handle future occurrences when recurrence pattern changes
   */
  private async handleFutureOccurrencesForPatternChange(
    masterEventId: string,
    newPattern: RecurrencePattern,
    effectiveDate: Date
  ): Promise<void> {
    try {
      // Get the master event to understand the original pattern
      const masterEvent = await this.calendarRepository.findById(masterEventId);
      if (!masterEvent || !masterEvent.recurrencePattern) {
        throw new Error('Master event not found or not recurring');
      }

      const originalPattern = masterEvent.recurrencePattern;
      
      // Get all existing instances and exceptions for this recurring event
      const existingInstances = await this.calendarRepository.findByRecurrenceId(masterEventId);
      const existingExceptions = await this.calendarRepository.findExceptions(masterEventId);
      
      // Filter to only future occurrences (after effective date)
      const futureInstances = existingInstances.filter(instance => {
        const instanceDate = new Date(instance.date);
        return instanceDate >= effectiveDate && !instance.isException;
      });

      const futureExceptions = existingExceptions.filter(exception => {
        const exceptionDate = new Date(exception.date);
        return exceptionDate >= effectiveDate;
      });

      console.log(`Processing pattern change for event ${masterEventId}:`, {
        futureInstances: futureInstances.length,
        futureExceptions: futureExceptions.length,
        effectiveDate: effectiveDate.toISOString()
      });

      // Delete future instances that are not exceptions
      // These will be regenerated with the new pattern
      for (const instance of futureInstances) {
        await this.calendarRepository.delete(instance.id);
        console.log(`Deleted future instance ${instance.id} for date ${instance.date}`);
      }

      // Handle exceptions more carefully
      const originalEventDate = new Date(masterEvent.date);
      
      for (const exception of futureExceptions) {
        const exceptionDate = new Date(exception.date);
        
        // Check if this exception date would be generated by the new pattern
        const wouldBeGeneratedByNewPattern = recurrenceEngine.matchesPattern(
          exceptionDate,
          originalEventDate,
          newPattern
        );

        // Check if this exception date was generated by the old pattern
        const wasGeneratedByOldPattern = recurrenceEngine.matchesPattern(
          exceptionDate,
          originalEventDate,
          originalPattern
        );

        if (wouldBeGeneratedByNewPattern && wasGeneratedByOldPattern) {
          // This date would be generated by both patterns
          // Check if the exception only has minimal changes
          const hasSignificantChanges = this.hasSignificantChangesFromMaster(exception, masterEvent);
          
          if (!hasSignificantChanges) {
            // Remove the exception and let the new pattern generate it
            await this.calendarRepository.delete(exception.id);
            console.log(`Removed exception ${exception.id} - will be regenerated by new pattern`);
          } else {
            // Keep the exception as it has significant modifications
            console.log(`Keeping exception ${exception.id} - has significant changes`);
          }
        } else if (!wouldBeGeneratedByNewPattern && wasGeneratedByOldPattern) {
          // This date was in the old pattern but not in the new pattern
          // Keep the exception as it represents a date that would otherwise be lost
          console.log(`Keeping exception ${exception.id} - date not in new pattern`);
        } else if (wouldBeGeneratedByNewPattern && !wasGeneratedByOldPattern) {
          // This date wasn't in the old pattern but is in the new pattern
          // This is an unusual case - keep the exception to preserve user intent
          console.log(`Keeping exception ${exception.id} - unusual case (not in old, in new)`);
        } else {
          // This date is not in either pattern - keep the exception
          console.log(`Keeping exception ${exception.id} - not in either pattern`);
        }
      }

      // Generate a preview of new occurrences to validate the change
      const previewEndDate = new Date(effectiveDate);
      previewEndDate.setMonth(previewEndDate.getMonth() + 6); // Preview 6 months ahead
      
      const newOccurrences = recurrenceEngine.generateFutureOccurrencesFromDate(
        masterEvent,
        newPattern,
        effectiveDate,
        previewEndDate
      );

      console.log(`Pattern change will generate ${newOccurrences.length} new occurrences in the next 6 months`);

    } catch (error) {
      console.error('Error handling future occurrences for pattern change:', error);
      throw new Error('Failed to update future occurrences');
    }
  }

  /**
   * Check if an exception has significant changes from the master event
   */
  private hasSignificantChangesFromMaster(exception: CalendarEvent, masterEvent: CalendarEvent): boolean {
    const fieldsToCompare = ['title', 'description', 'time', 'type'];
    
    for (const field of fieldsToCompare) {
      const exceptionValue = exception[field as keyof CalendarEvent];
      const masterValue = masterEvent[field as keyof CalendarEvent];
      
      // Handle empty strings and undefined/null values
      const normalizedExceptionValue = exceptionValue || '';
      const normalizedMasterValue = masterValue || '';
      
      if (normalizedExceptionValue !== normalizedMasterValue) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check if an exception only differs in recurrence pattern from the master event
   */
  private isOnlyRecurrencePatternChange(exception: CalendarEvent, masterEvent: CalendarEvent): boolean {
    return !this.hasSignificantChangesFromMaster(exception, masterEvent);
  }

  /**
   * Update multiple recurring events with pattern changes
   */
  async bulkUpdateRecurrencePatterns(
    updates: Array<{
      eventId: string;
      newPattern: RecurrencePattern;
      effectiveDate?: string;
    }>
  ): Promise<{ successful: string[]; failed: Array<{ eventId: string; error: string }> }> {
    const successful: string[] = [];
    const failed: Array<{ eventId: string; error: string }> = [];

    console.log(`Starting bulk update of ${updates.length} recurrence patterns`);

    for (const update of updates) {
      try {
        await this.updateRecurrencePattern(
          update.eventId,
          update.newPattern,
          update.effectiveDate
        );
        successful.push(update.eventId);
        console.log(`Successfully updated pattern for event ${update.eventId}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        failed.push({ eventId: update.eventId, error: errorMessage });
        console.error(`Failed to update pattern for event ${update.eventId}:`, errorMessage);
      }
    }

    console.log(`Bulk update completed: ${successful.length} successful, ${failed.length} failed`);
    return { successful, failed };
  }

  /**
   * Create a migration for existing events when recurrence patterns change
   */
  async migrateExistingRecurringEvents(): Promise<void> {
    try {
      console.log('Starting migration of existing recurring events...');
      
      // Get all recurring events
      const recurringEvents = await this.calendarRepository.findRecurringEvents();
      console.log(`Found ${recurringEvents.length} recurring events to process`);
      
      let fixedCount = 0;
      let validCount = 0;
      let errorCount = 0;
      
      for (const event of recurringEvents) {
        if (!event.recurrencePattern) continue;

        try {
          // Validate the existing pattern
          const validation = recurrenceEngine.validatePattern(event.recurrencePattern);
          
          if (!validation.valid) {
            console.warn(`Invalid recurrence pattern found for event ${event.id}: ${validation.errors.join(', ')}`);
            
            // Try to fix common issues
            const fixedPattern = this.attemptPatternFix(event.recurrencePattern);
            
            if (fixedPattern) {
              const fixValidation = recurrenceEngine.validatePattern(fixedPattern);
              if (fixValidation.valid) {
                await this.calendarRepository.update(event.id, {
                  recurrencePattern: fixedPattern
                });
                console.log(`Fixed recurrence pattern for event ${event.id}`);
                fixedCount++;
              } else {
                console.error(`Could not fix pattern for event ${event.id}: ${fixValidation.errors.join(', ')}`);
                errorCount++;
              }
            } else {
              console.error(`Could not generate fix for event ${event.id}`);
              errorCount++;
            }
          } else {
            validCount++;
          }

          // Clean up any orphaned instances
          await this.cleanupOrphanedInstances(event.id);
          
          // Ensure pattern consistency across the series
          await this.ensurePatternConsistency(event.id);
          
        } catch (error) {
          console.error(`Error processing event ${event.id}:`, error);
          errorCount++;
        }
      }
      
      console.log(`Migration completed: ${validCount} valid, ${fixedCount} fixed, ${errorCount} errors`);
      
      if (errorCount > 0) {
        console.warn(`${errorCount} events could not be migrated and may need manual attention`);
      }
      
    } catch (error) {
      console.error('Error during recurring events migration:', error);
      throw new Error('Failed to migrate existing recurring events');
    }
  }

  /**
   * Attempt to fix common recurrence pattern issues
   */
  private attemptPatternFix(pattern: RecurrencePattern): RecurrencePattern | null {
    const fixedPattern = { ...pattern };
    
    // Fix interval if it's less than 1
    if (fixedPattern.interval < 1) {
      fixedPattern.interval = 1;
    }

    // Fix weekly patterns without daysOfWeek
    if (fixedPattern.type === 'weekly' && (!fixedPattern.daysOfWeek || fixedPattern.daysOfWeek.length === 0)) {
      // Default to the same day of week as the original event would be
      fixedPattern.daysOfWeek = [new Date().getDay()]; // This is a fallback, ideally we'd use the event's original date
    }

    // Fix monthly patterns without dayOfMonth
    if (fixedPattern.type === 'monthly' && fixedPattern.dayOfMonth === undefined) {
      fixedPattern.dayOfMonth = 1; // Default to first day of month
    }

    // Fix yearly patterns without required fields
    if (fixedPattern.type === 'yearly') {
      if (fixedPattern.monthOfYear === undefined) {
        fixedPattern.monthOfYear = 1; // Default to January
      }
      if (fixedPattern.dayOfMonth === undefined) {
        fixedPattern.dayOfMonth = 1; // Default to first day
      }
    }

    // Ensure at least one end condition exists
    if (!fixedPattern.endDate && !fixedPattern.endAfterOccurrences) {
      fixedPattern.endAfterOccurrences = 10; // Default to 10 occurrences
    }

    return fixedPattern;
  }

  /**
   * Clean up orphaned instances (instances without a valid master event)
   */
  private async cleanupOrphanedInstances(masterEventId: string): Promise<void> {
    try {
      const instances = await this.calendarRepository.findByRecurrenceId(masterEventId);
      let cleanedCount = 0;
      
      for (const instance of instances) {
        // Check if the master event still exists
        const masterExists = await this.calendarRepository.findById(instance.recurrenceId || masterEventId);
        
        if (!masterExists) {
          // Master event doesn't exist, delete the instance
          await this.calendarRepository.delete(instance.id);
          console.log(`Cleaned up orphaned instance ${instance.id}`);
          cleanedCount++;
        }
      }
      
      if (cleanedCount > 0) {
        console.log(`Cleaned up ${cleanedCount} orphaned instances for event ${masterEventId}`);
      }
    } catch (error) {
      console.error(`Error cleaning up orphaned instances for event ${masterEventId}:`, error);
    }
  }

  /**
   * Ensure pattern consistency across a recurring event series
   */
  private async ensurePatternConsistency(masterEventId: string): Promise<void> {
    try {
      const masterEvent = await this.calendarRepository.findById(masterEventId);
      if (!masterEvent || !masterEvent.recurrencePattern) {
        return;
      }

      // Get all instances that are not exceptions
      const instances = await this.calendarRepository.findByRecurrenceId(masterEventId);
      const nonExceptionInstances = instances.filter(instance => !instance.isException);

      // Check if any instances have inconsistent data
      let inconsistentCount = 0;
      
      for (const instance of nonExceptionInstances) {
        let needsUpdate = false;
        const updates: Partial<CalendarEvent> = {};

        // Check if basic properties match the master event
        if (instance.title !== masterEvent.title) {
          updates.title = masterEvent.title;
          needsUpdate = true;
        }
        
        if (instance.description !== masterEvent.description) {
          updates.description = masterEvent.description;
          needsUpdate = true;
        }
        
        if (instance.time !== masterEvent.time) {
          updates.time = masterEvent.time;
          needsUpdate = true;
        }
        
        if (instance.type !== masterEvent.type) {
          updates.type = masterEvent.type;
          needsUpdate = true;
        }

        // Ensure instance doesn't have its own recurrence pattern
        if (instance.recurrencePattern) {
          updates.recurrencePattern = undefined;
          needsUpdate = true;
        }

        if (needsUpdate) {
          await this.calendarRepository.update(instance.id, updates);
          inconsistentCount++;
        }
      }

      if (inconsistentCount > 0) {
        console.log(`Fixed ${inconsistentCount} inconsistent instances for event ${masterEventId}`);
      }
    } catch (error) {
      console.error(`Error ensuring pattern consistency for event ${masterEventId}:`, error);
    }
  }
}