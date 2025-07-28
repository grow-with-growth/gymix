// PocketBase implementation of CalendarRepository
import PocketBase from 'pocketbase';
import { CalendarEvent } from '../../../types';
import { CalendarRepository } from '../interfaces';
import { calendarEventCreateSchema, calendarEventUpdateSchema } from '../../validation/schemas';

/**
 * PocketBase implementation of CalendarRepository
 */
export class PocketBaseCalendarRepository implements CalendarRepository {
  private pb: PocketBase;
  private collectionName = 'calendar_events';

  constructor(pb: PocketBase) {
    this.pb = pb;
  }

  /**
   * Find all calendar events
   */
  async findAll(): Promise<CalendarEvent[]> {
    try {
      const records = await this.pb.collection(this.collectionName).getFullList({
        sort: 'date',
      });
      return records.map(record => this.mapToCalendarEvent(record));
    } catch (error) {
      console.error('Error finding all calendar events:', error);
      throw new Error('Failed to retrieve calendar events');
    }
  }

  /**
   * Find calendar event by ID
   */
  async findById(id: string): Promise<CalendarEvent | null> {
    try {
      const record = await this.pb.collection(this.collectionName).getOne(id);
      return this.mapToCalendarEvent(record);
    } catch (error) {
      if ((error as any).status === 404) {
        return null;
      }
      console.error('Error finding calendar event by ID:', error);
      throw new Error('Failed to retrieve calendar event');
    }
  }

  /**
   * Find calendar events by date range
   */
  async findByDateRange(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    try {
      const records = await this.pb.collection(this.collectionName).getFullList({
        filter: `date >= "${startDate}" && date <= "${endDate}"`,
        sort: 'date',
      });
      return records.map(record => this.mapToCalendarEvent(record));
    } catch (error) {
      console.error('Error finding calendar events by date range:', error);
      throw new Error('Failed to retrieve calendar events by date range');
    }
  }

  /**
   * Find calendar events by month
   */
  async findByMonth(year: number, month: number): Promise<CalendarEvent[]> {
    try {
      // Create start and end dates for the month
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
      
      const records = await this.pb.collection(this.collectionName).getFullList({
        filter: `date >= "${startDate}" && date <= "${endDate}"`,
        sort: 'date',
      });
      return records.map(record => this.mapToCalendarEvent(record));
    } catch (error) {
      console.error('Error finding calendar events by month:', error);
      throw new Error('Failed to retrieve calendar events by month');
    }
  }

  /**
   * Find calendar events by type
   */
  async findByType(type: CalendarEvent['type']): Promise<CalendarEvent[]> {
    try {
      const records = await this.pb.collection(this.collectionName).getFullList({
        filter: `type="${type}"`,
        sort: 'date',
      });
      return records.map(record => this.mapToCalendarEvent(record));
    } catch (error) {
      console.error('Error finding calendar events by type:', error);
      throw new Error('Failed to retrieve calendar events by type');
    }
  }

  /**
   * Find calendar events by user
   */
  async findByUser(userId: string): Promise<CalendarEvent[]> {
    try {
      const records = await this.pb.collection(this.collectionName).getFullList({
        filter: `user="${userId}"`,
        sort: 'date',
      });
      return records.map(record => this.mapToCalendarEvent(record));
    } catch (error) {
      console.error('Error finding calendar events by user:', error);
      throw new Error('Failed to retrieve calendar events by user');
    }
  }

  /**
   * Find all recurring events (events with recurrence patterns)
   */
  async findRecurringEvents(): Promise<CalendarEvent[]> {
    try {
      const records = await this.pb.collection(this.collectionName).getFullList({
        filter: 'recurrencePattern != null',
        sort: 'date',
      });
      return records.map(record => this.mapToCalendarEvent(record));
    } catch (error) {
      console.error('Error finding recurring events:', error);
      throw new Error('Failed to retrieve recurring events');
    }
  }

  /**
   * Find all instances of a recurring event by recurrence ID
   */
  async findByRecurrenceId(recurrenceId: string): Promise<CalendarEvent[]> {
    try {
      const records = await this.pb.collection(this.collectionName).getFullList({
        filter: `recurrenceId="${recurrenceId}"`,
        sort: 'date',
      });
      return records.map(record => this.mapToCalendarEvent(record));
    } catch (error) {
      console.error('Error finding events by recurrence ID:', error);
      throw new Error('Failed to retrieve recurring event instances');
    }
  }

  /**
   * Find exceptions to a recurring event
   */
  async findExceptions(recurrenceId: string): Promise<CalendarEvent[]> {
    try {
      const records = await this.pb.collection(this.collectionName).getFullList({
        filter: `recurrenceId="${recurrenceId}" && isException=true`,
        sort: 'date',
      });
      return records.map(record => this.mapToCalendarEvent(record));
    } catch (error) {
      console.error('Error finding recurring event exceptions:', error);
      throw new Error('Failed to retrieve recurring event exceptions');
    }
  }

  /**
   * Create an exception to a recurring event
   */
  async createException(recurringEventId: string, date: string, changes: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      // Get the original recurring event
      const originalEvent = await this.findById(recurringEventId);
      if (!originalEvent) {
        throw new Error('Original recurring event not found');
      }

      // Create the exception event
      const exceptionData = {
        ...originalEvent,
        ...changes,
        date,
        recurrenceId: recurringEventId,
        isException: true,
        recurrencePattern: undefined, // Exceptions don't have their own recurrence pattern
      };

      // Remove the id to create a new record
      delete (exceptionData as any).id;

      const record = await this.pb.collection(this.collectionName).create(exceptionData);
      return this.mapToCalendarEvent(record);
    } catch (error) {
      console.error('Error creating recurring event exception:', error);
      throw new Error('Failed to create recurring event exception');
    }
  }

  /**
   * Create a new calendar event
   */
  async create(eventData: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    try {
      // Validate the event data
      const validatedData = calendarEventCreateSchema.parse(eventData);
      
      const record = await this.pb.collection(this.collectionName).create(validatedData);
      return this.mapToCalendarEvent(record);
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw new Error('Failed to create calendar event');
    }
  }

  /**
   * Update an existing calendar event
   */
  async update(id: string, eventData: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      // Validate the event data
      const validatedData = calendarEventUpdateSchema.parse({ ...eventData, id });
      
      const record = await this.pb.collection(this.collectionName).update(id, validatedData);
      return this.mapToCalendarEvent(record);
    } catch (error) {
      if ((error as any).status === 404) {
        throw new Error('Calendar event not found');
      }
      console.error('Error updating calendar event:', error);
      throw new Error('Failed to update calendar event');
    }
  }

  /**
   * Delete a calendar event
   */
  async delete(id: string): Promise<void> {
    try {
      await this.pb.collection(this.collectionName).delete(id);
    } catch (error) {
      if ((error as any).status === 404) {
        throw new Error('Calendar event not found');
      }
      console.error('Error deleting calendar event:', error);
      throw new Error('Failed to delete calendar event');
    }
  }

  /**
   * Map PocketBase record to CalendarEvent
   */
  private mapToCalendarEvent(record: any): CalendarEvent {
    return {
      id: record.id,
      date: record.date,
      title: record.title,
      description: record.description || '',
      time: record.time || '',
      type: record.type,
      recurrencePattern: record.recurrencePattern || undefined,
      recurrenceId: record.recurrenceId || undefined,
      isException: record.isException || false,
    };
  }
}