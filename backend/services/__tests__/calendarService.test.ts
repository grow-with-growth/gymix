import { CalendarService } from '../calendarService';
import { CalendarRepository } from '../../repositories/interfaces';
import { CalendarEvent, RecurrencePattern } from '../../../types';

// Mock repository
class MockCalendarRepository implements CalendarRepository {
  private events: CalendarEvent[] = [];
  private nextId = 1;

  async findAll(): Promise<CalendarEvent[]> {
    return [...this.events];
  }

  async findById(id: string): Promise<CalendarEvent | null> {
    return this.events.find(e => e.id === id) || null;
  }

  async findByDateRange(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    return this.events.filter(e => e.date >= startDate && e.date <= endDate);
  }

  async findByMonth(year: number, month: number): Promise<CalendarEvent[]> {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
    return this.findByDateRange(startDate, endDate);
  }

  async findByType(type: CalendarEvent['type']): Promise<CalendarEvent[]> {
    return this.events.filter(e => e.type === type);
  }

  async findByUser(userId: string): Promise<CalendarEvent[]> {
    return this.events.filter(e => e.user === userId);
  }

  async findRecurringEvents(): Promise<CalendarEvent[]> {
    return this.events.filter(e => e.recurrencePattern);
  }

  async findByRecurrenceId(recurrenceId: string): Promise<CalendarEvent[]> {
    return this.events.filter(e => e.recurrenceId === recurrenceId);
  }

  async findExceptions(recurrenceId: string): Promise<CalendarEvent[]> {
    return this.events.filter(e => e.recurrenceId === recurrenceId && e.isException);
  }

  async create(eventData: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    const event: CalendarEvent = {
      ...eventData,
      id: (this.nextId++).toString(),
    };
    this.events.push(event);
    return event;
  }

  async update(id: string, eventData: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const index = this.events.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error('Event not found');
    }
    this.events[index] = { ...this.events[index], ...eventData };
    return this.events[index];
  }

  async delete(id: string): Promise<void> {
    const index = this.events.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error('Event not found');
    }
    this.events.splice(index, 1);
  }

  async createException(recurringEventId: string, date: string, changes: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const originalEvent = await this.findById(recurringEventId);
    if (!originalEvent) {
      throw new Error('Original event not found');
    }

    const exception: CalendarEvent = {
      ...originalEvent,
      ...changes,
      id: (this.nextId++).toString(),
      date,
      recurrenceId: recurringEventId,
      isException: true,
      recurrencePattern: undefined,
    };

    this.events.push(exception);
    return exception;
  }

  // Helper method to reset the mock
  reset(): void {
    this.events = [];
    this.nextId = 1;
  }
}

describe('CalendarService - Recurrence Pattern Changes', () => {
  let calendarService: CalendarService;
  let mockRepository: MockCalendarRepository;

  beforeEach(() => {
    mockRepository = new MockCalendarRepository();
    calendarService = new CalendarService(mockRepository);
  });

  describe('updateRecurrencePattern', () => {
    it('should update recurrence pattern for a recurring event', async () => {
      // Create a recurring event
      const originalPattern: RecurrencePattern = {
        type: 'weekly',
        interval: 1,
        daysOfWeek: [1], // Monday
        endAfterOccurrences: 5,
      };

      const recurringEvent = await mockRepository.create({
        title: 'Weekly Meeting',
        description: 'Team meeting',
        date: '2024-01-01',
        time: '10:00 AM',
        type: 'meeting',
        recurrencePattern: originalPattern,
      });

      // Update the pattern
      const newPattern: RecurrencePattern = {
        type: 'weekly',
        interval: 2,
        daysOfWeek: [1, 3], // Monday and Wednesday
        endAfterOccurrences: 10,
      };

      const updatedEvent = await calendarService.updateRecurrencePattern(
        recurringEvent.id,
        newPattern
      );

      expect(updatedEvent.recurrencePattern).toEqual(newPattern);
    });

    it('should throw error for non-recurring event', async () => {
      // Create a regular event
      const regularEvent = await mockRepository.create({
        title: 'One-time Meeting',
        description: 'Single meeting',
        date: '2024-01-01',
        time: '10:00 AM',
        type: 'meeting',
      });

      const newPattern: RecurrencePattern = {
        type: 'daily',
        interval: 1,
        endAfterOccurrences: 5,
      };

      await expect(
        calendarService.updateRecurrencePattern(regularEvent.id, newPattern)
      ).rejects.toThrow('Event is not a recurring event');
    });

    it('should validate new recurrence pattern', async () => {
      // Create a recurring event
      const originalPattern: RecurrencePattern = {
        type: 'daily',
        interval: 1,
        endAfterOccurrences: 5,
      };

      const recurringEvent = await mockRepository.create({
        title: 'Daily Task',
        description: 'Daily task',
        date: '2024-01-01',
        time: '09:00 AM',
        type: 'task',
        recurrencePattern: originalPattern,
      });

      // Try to update with invalid pattern
      const invalidPattern: RecurrencePattern = {
        type: 'weekly',
        interval: 0, // Invalid interval
        daysOfWeek: [], // Missing days for weekly
      };

      await expect(
        calendarService.updateRecurrencePattern(recurringEvent.id, invalidPattern)
      ).rejects.toThrow('Invalid recurrence pattern');
    });
  });

  describe('bulkUpdateRecurrencePatterns', () => {
    it('should update multiple recurrence patterns', async () => {
      // Create multiple recurring events
      const pattern1: RecurrencePattern = {
        type: 'daily',
        interval: 1,
        endAfterOccurrences: 5,
      };

      const pattern2: RecurrencePattern = {
        type: 'weekly',
        interval: 1,
        daysOfWeek: [1],
        endAfterOccurrences: 5,
      };

      const event1 = await mockRepository.create({
        title: 'Daily Task',
        description: 'Task 1',
        date: '2024-01-01',
        time: '09:00 AM',
        type: 'task',
        recurrencePattern: pattern1,
      });

      const event2 = await mockRepository.create({
        title: 'Weekly Meeting',
        description: 'Meeting 1',
        date: '2024-01-01',
        time: '10:00 AM',
        type: 'meeting',
        recurrencePattern: pattern2,
      });

      // Update patterns
      const newPattern1: RecurrencePattern = {
        type: 'daily',
        interval: 2,
        endAfterOccurrences: 10,
      };

      const newPattern2: RecurrencePattern = {
        type: 'weekly',
        interval: 1,
        daysOfWeek: [1, 3],
        endAfterOccurrences: 8,
      };

      const updates = [
        { eventId: event1.id, newPattern: newPattern1 },
        { eventId: event2.id, newPattern: newPattern2 },
      ];

      const result = await calendarService.bulkUpdateRecurrencePatterns(updates);

      expect(result.successful).toHaveLength(2);
      expect(result.failed).toHaveLength(0);
      expect(result.successful).toContain(event1.id);
      expect(result.successful).toContain(event2.id);
    });

    it('should handle partial failures in bulk update', async () => {
      // Create one recurring event
      const pattern: RecurrencePattern = {
        type: 'daily',
        interval: 1,
        endAfterOccurrences: 5,
      };

      const event = await mockRepository.create({
        title: 'Daily Task',
        description: 'Task 1',
        date: '2024-01-01',
        time: '09:00 AM',
        type: 'task',
        recurrencePattern: pattern,
      });

      // Try to update one valid and one invalid event
      const newPattern: RecurrencePattern = {
        type: 'daily',
        interval: 2,
        endAfterOccurrences: 10,
      };

      const updates = [
        { eventId: event.id, newPattern },
        { eventId: 'non-existent', newPattern },
      ];

      const result = await calendarService.bulkUpdateRecurrencePatterns(updates);

      expect(result.successful).toHaveLength(1);
      expect(result.failed).toHaveLength(1);
      expect(result.successful).toContain(event.id);
      expect(result.failed[0].eventId).toBe('non-existent');
    });
  });

  describe('migrateExistingRecurringEvents', () => {
    it('should complete migration without errors for valid events', async () => {
      // Create a valid recurring event
      const validPattern: RecurrencePattern = {
        type: 'weekly',
        interval: 1,
        daysOfWeek: [1],
        endAfterOccurrences: 5,
      };

      await mockRepository.create({
        title: 'Weekly Meeting',
        description: 'Team meeting',
        date: '2024-01-01',
        time: '10:00 AM',
        type: 'meeting',
        recurrencePattern: validPattern,
      });

      // Migration should complete without throwing
      await expect(calendarService.migrateExistingRecurringEvents()).resolves.not.toThrow();
    });
  });
});