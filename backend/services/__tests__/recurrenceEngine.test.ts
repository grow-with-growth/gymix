import { RecurrenceEngine } from '../recurrenceEngine';
import { CalendarEvent, RecurrencePattern } from '../../../types';

describe('RecurrenceEngine', () => {
  let engine: RecurrenceEngine;
  let baseEvent: CalendarEvent;

  beforeEach(() => {
    engine = new RecurrenceEngine();
    baseEvent = {
      id: 'test-event-1',
      title: 'Test Event',
      description: 'Test Description',
      date: '2024-01-01',
      time: '10:00 AM - 11:00 AM',
      type: 'meeting',
    };
  });

  describe('Daily Recurrence', () => {
    it('should generate daily occurrences', () => {
      const pattern: RecurrencePattern = {
        type: 'daily',
        interval: 1,
        endAfterOccurrences: 5,
      };

      const eventWithPattern = { ...baseEvent, recurrencePattern: pattern };
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-10');

      const occurrences = engine.generateOccurrences(eventWithPattern, startDate, endDate);

      expect(occurrences).toHaveLength(5);
      expect(occurrences[0].date).toBe('2024-01-01');
      expect(occurrences[1].date).toBe('2024-01-02');
      expect(occurrences[4].date).toBe('2024-01-05');
    });

    it('should generate daily occurrences with interval', () => {
      const pattern: RecurrencePattern = {
        type: 'daily',
        interval: 2,
        endAfterOccurrences: 3,
      };

      const eventWithPattern = { ...baseEvent, recurrencePattern: pattern };
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-10');

      const occurrences = engine.generateOccurrences(eventWithPattern, startDate, endDate);

      expect(occurrences).toHaveLength(3);
      expect(occurrences[0].date).toBe('2024-01-01');
      expect(occurrences[1].date).toBe('2024-01-03');
      expect(occurrences[2].date).toBe('2024-01-05');
    });
  });

  describe('Weekly Recurrence', () => {
    it('should generate weekly occurrences', () => {
      const pattern: RecurrencePattern = {
        type: 'weekly',
        interval: 1,
        daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
        endAfterOccurrences: 6,
      };

      const eventWithPattern = { ...baseEvent, recurrencePattern: pattern };
      const startDate = new Date('2024-01-01'); // Monday
      const endDate = new Date('2024-01-31');

      const occurrences = engine.generateWeeklyOccurrences(eventWithPattern, startDate, endDate);

      expect(occurrences.length).toBeGreaterThan(0);
      // Should have occurrences on Monday, Wednesday, Friday
      const dates = occurrences.map(o => new Date(o.date).getDay());
      dates.forEach(day => {
        expect([1, 3, 5]).toContain(day);
      });
    });
  });

  describe('Monthly Recurrence', () => {
    it('should generate monthly occurrences', () => {
      const pattern: RecurrencePattern = {
        type: 'monthly',
        interval: 1,
        dayOfMonth: 15,
        endAfterOccurrences: 3,
      };

      const eventWithPattern = { ...baseEvent, date: '2024-01-15', recurrencePattern: pattern };
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-06-30');

      const occurrences = engine.generateOccurrences(eventWithPattern, startDate, endDate);

      expect(occurrences).toHaveLength(3);
      expect(occurrences[0].date).toBe('2024-01-15');
      expect(occurrences[1].date).toBe('2024-02-15');
      expect(occurrences[2].date).toBe('2024-03-15');
    });
  });

  describe('Yearly Recurrence', () => {
    it('should generate yearly occurrences', () => {
      const pattern: RecurrencePattern = {
        type: 'yearly',
        interval: 1,
        monthOfYear: 1,
        dayOfMonth: 1,
        endAfterOccurrences: 3,
      };

      const eventWithPattern = { ...baseEvent, date: '2024-01-01', recurrencePattern: pattern };
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2026-12-31');

      const occurrences = engine.generateOccurrences(eventWithPattern, startDate, endDate);

      expect(occurrences).toHaveLength(3);
      expect(occurrences[0].date).toBe('2024-01-01');
      expect(occurrences[1].date).toBe('2025-01-01');
      expect(occurrences[2].date).toBe('2026-01-01');
    });
  });

  describe('Exception Handling', () => {
    it('should create an exception to a recurring event', () => {
      const exception = engine.createException(
        baseEvent,
        new Date('2024-01-02'),
        { title: 'Modified Event', time: '2:00 PM - 3:00 PM' }
      );

      expect(exception.title).toBe('Modified Event');
      expect(exception.time).toBe('2:00 PM - 3:00 PM');
      expect(exception.date).toBe('2024-01-02');
      expect(exception.recurrenceId).toBe('test-event-1');
      expect(exception.isException).toBe(true);
    });
  });

  describe('Pattern Validation', () => {
    it('should validate daily pattern', () => {
      const pattern: RecurrencePattern = {
        type: 'daily',
        interval: 1,
        endAfterOccurrences: 5,
      };

      const validation = engine.validatePattern(pattern);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should validate weekly pattern with days of week', () => {
      const pattern: RecurrencePattern = {
        type: 'weekly',
        interval: 1,
        daysOfWeek: [1, 3, 5],
        endAfterOccurrences: 5,
      };

      const validation = engine.validatePattern(pattern);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should invalidate weekly pattern without days of week', () => {
      const pattern: RecurrencePattern = {
        type: 'weekly',
        interval: 1,
        endAfterOccurrences: 5,
      };

      const validation = engine.validatePattern(pattern);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Weekly recurrence must specify days of week');
    });

    it('should invalidate monthly pattern without day of month', () => {
      const pattern: RecurrencePattern = {
        type: 'monthly',
        interval: 1,
        endAfterOccurrences: 5,
      };

      const validation = engine.validatePattern(pattern);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Monthly recurrence must specify day of month');
    });

    it('should invalidate pattern without end condition', () => {
      const pattern: RecurrencePattern = {
        type: 'daily',
        interval: 1,
      };

      const validation = engine.validatePattern(pattern);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Must specify either end date or number of occurrences');
    });
  });

  describe('Next Occurrence', () => {
    it('should get next occurrence for daily recurrence', () => {
      const pattern: RecurrencePattern = {
        type: 'daily',
        interval: 1,
        endDate: '2024-12-31',
      };

      const eventWithPattern = { ...baseEvent, recurrencePattern: pattern };
      const nextOccurrence = engine.getNextOccurrence(eventWithPattern, new Date('2024-01-05'));

      expect(nextOccurrence).toEqual(new Date('2024-01-06'));
    });

    it('should return null when no more occurrences', () => {
      const pattern: RecurrencePattern = {
        type: 'daily',
        interval: 1,
        endDate: '2024-01-05',
      };

      const eventWithPattern = { ...baseEvent, recurrencePattern: pattern };
      const nextOccurrence = engine.getNextOccurrence(eventWithPattern, new Date('2024-01-10'));

      expect(nextOccurrence).toBeNull();
    });
  });

  describe('Future Occurrences', () => {
    it('should get future occurrences with limit', () => {
      // Use a future date for the event
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];
      
      const pattern: RecurrencePattern = {
        type: 'daily',
        interval: 1,
        endDate: '2025-12-31',
      };

      const eventWithPattern = { 
        ...baseEvent, 
        date: futureDateString,
        recurrencePattern: pattern 
      };
      const futureOccurrences = engine.getFutureOccurrences(eventWithPattern, 5);

      expect(futureOccurrences.length).toBeGreaterThan(0);
      expect(futureOccurrences.length).toBeLessThanOrEqual(5);
      expect(futureOccurrences[0].recurrenceId).toBe('test-event-1');
    });
  });

  describe('Pattern Matching', () => {
    it('should match daily pattern', () => {
      const pattern: RecurrencePattern = {
        type: 'daily',
        interval: 2,
        endDate: '2024-12-31',
      };

      const originalDate = new Date('2024-01-01');
      const testDate1 = new Date('2024-01-03'); // Should match (2 days later)
      const testDate2 = new Date('2024-01-04'); // Should not match (3 days later)

      expect(engine.matchesPattern(testDate1, originalDate, pattern)).toBe(true);
      expect(engine.matchesPattern(testDate2, originalDate, pattern)).toBe(false);
    });

    it('should match weekly pattern', () => {
      const pattern: RecurrencePattern = {
        type: 'weekly',
        interval: 1,
        daysOfWeek: [1, 3], // Monday, Wednesday
        endDate: '2024-12-31',
      };

      const originalDate = new Date('2024-01-01'); // Monday
      const testDate1 = new Date('2024-01-03'); // Wednesday (same week)
      const testDate2 = new Date('2024-01-08'); // Monday (next week)
      const testDate3 = new Date('2024-01-04'); // Thursday (should not match)

      expect(engine.matchesPattern(testDate1, originalDate, pattern)).toBe(true);
      expect(engine.matchesPattern(testDate2, originalDate, pattern)).toBe(true);
      expect(engine.matchesPattern(testDate3, originalDate, pattern)).toBe(false);
    });
  });
});