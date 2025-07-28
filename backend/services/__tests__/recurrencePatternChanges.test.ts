import { CalendarService } from '../calendarService';
import { RecurrenceEngine } from '../recurrenceEngine';
import { CalendarEvent, RecurrencePattern } from '../../../types';

// Mock the calendar repository
const mockCalendarRepository = {
  findById: jest.fn(),
  findByRecurrenceId: jest.fn(),
  findExceptions: jest.fn(),
  findRecurringEvents: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
  findByDateRange: jest.fn(),
  findByMonth: jest.fn(),
  findByType: jest.fn(),
  findByUser: jest.fn(),
  createException: jest.fn(),
};

describe('Recurrence Pattern Changes', () => {
  let calendarService: CalendarService;
  let recurrenceEngine: RecurrenceEngine;

  beforeEach(() => {
    jest.clearAllMocks();
    calendarService = new CalendarService(mockCalendarRepository as any);
    recurrenceEngine = new RecurrenceEngine();
  });

  describe('updateRecurrencePattern', () => {
    it('should update recurrence pattern for a master event', async () => {
      const masterEvent: CalendarEvent = {
        id: 'master-1',
        title: 'Weekly Meeting',
        description: 'Team meeting',
        date: '2024-01-01',
        time: '10:00',
        type: 'meeting',
        recurrencePattern: {
          type: 'weekly',
          interval: 1,
          daysOfWeek: [1], // Monday
          endAfterOccurrences: 10
        }
      };

      const newPattern: RecurrencePattern = {
        type: 'weekly',
        interval: 2,
        daysOfWeek: [1, 3], // Monday and Wednesday
        endAfterOccurrences: 20
      };

      mockCalendarRepository.findById.mockResolvedValue(masterEvent);
      mockCalendarRepository.findByRecurrenceId.mockResolvedValue([]);
      mockCalendarRepository.findExceptions.mockResolvedValue([]);
      mockCalendarRepository.update.mockResolvedValue({
        ...masterEvent,
        recurrencePattern: newPattern
      });

      const result = await calendarService.updateRecurrencePattern('master-1', newPattern);

      expect(mockCalendarRepository.findById).toHaveBeenCalledWith('master-1');
      expect(mockCalendarRepository.update).toHaveBeenCalledWith('master-1', {
        recurrencePattern: newPattern
      });
      expect(result.recurrencePattern).toEqual(newPattern);
    });

    it('should handle updating pattern for an instance event', async () => {
      const instanceEvent: CalendarEvent = {
        id: 'instance-1',
        title: 'Weekly Meeting',
        description: 'Team meeting',
        date: '2024-01-08',
        time: '10:00',
        type: 'meeting',
        recurrenceId: 'master-1'
      };

      const masterEvent: CalendarEvent = {
        id: 'master-1',
        title: 'Weekly Meeting',
        description: 'Team meeting',
        date: '2024-01-01',
        time: '10:00',
        type: 'meeting',
        recurrencePattern: {
          type: 'weekly',
          interval: 1,
          daysOfWeek: [1],
          endAfterOccurrences: 10
        }
      };

      const newPattern: RecurrencePattern = {
        type: 'weekly',
        interval: 2,
        daysOfWeek: [1, 3],
        endAfterOccurrences: 20
      };

      mockCalendarRepository.findById
        .mockResolvedValueOnce(instanceEvent)
        .mockResolvedValueOnce(masterEvent)
        .mockResolvedValueOnce(masterEvent);
      mockCalendarRepository.findByRecurrenceId.mockResolvedValue([]);
      mockCalendarRepository.findExceptions.mockResolvedValue([]);
      mockCalendarRepository.update.mockResolvedValue({
        ...masterEvent,
        recurrencePattern: newPattern
      });

      const result = await calendarService.updateRecurrencePattern('instance-1', newPattern);

      expect(mockCalendarRepository.findById).toHaveBeenCalledWith('master-1');
      expect(mockCalendarRepository.update).toHaveBeenCalledWith('master-1', {
        recurrencePattern: newPattern
      });
      expect(result.recurrencePattern).toEqual(newPattern);
    });

    it('should throw error for non-recurring event', async () => {
      const regularEvent: CalendarEvent = {
        id: 'regular-1',
        title: 'One-time Meeting',
        description: 'Single meeting',
        date: '2024-01-01',
        time: '10:00',
        type: 'meeting'
      };

      const newPattern: RecurrencePattern = {
        type: 'weekly',
        interval: 1,
        daysOfWeek: [1],
        endAfterOccurrences: 10
      };

      mockCalendarRepository.findById.mockResolvedValue(regularEvent);

      await expect(
        calendarService.updateRecurrencePattern('regular-1', newPattern)
      ).rejects.toThrow('Event is not a recurring event');
    });

    it('should throw error for invalid pattern', async () => {
      const masterEvent: CalendarEvent = {
        id: 'master-1',
        title: 'Weekly Meeting',
        description: 'Team meeting',
        date: '2024-01-01',
        time: '10:00',
        type: 'meeting',
        recurrencePattern: {
          type: 'weekly',
          interval: 1,
          daysOfWeek: [1],
          endAfterOccurrences: 10
        }
      };

      const invalidPattern: RecurrencePattern = {
        type: 'weekly',
        interval: 0, // Invalid interval
        daysOfWeek: [],
        endAfterOccurrences: 10
      };

      mockCalendarRepository.findById.mockResolvedValue(masterEvent);

      await expect(
        calendarService.updateRecurrencePattern('master-1', invalidPattern)
      ).rejects.toThrow('Invalid recurrence pattern');
    });
  });

  describe('handleFutureOccurrencesForPatternChange', () => {
    it('should delete future non-exception instances', async () => {
      const futureInstance: CalendarEvent = {
        id: 'instance-future',
        title: 'Weekly Meeting',
        description: 'Team meeting',
        date: '2024-02-01',
        time: '10:00',
        type: 'meeting',
        recurrenceId: 'master-1',
        isException: false
      };

      const futureException: CalendarEvent = {
        id: 'exception-future',
        title: 'Modified Meeting',
        description: 'Modified team meeting',
        date: '2024-02-08',
        time: '11:00',
        type: 'meeting',
        recurrenceId: 'master-1',
        isException: true
      };

      mockCalendarRepository.findByRecurrenceId.mockResolvedValue([futureInstance]);
      mockCalendarRepository.findExceptions.mockResolvedValue([futureException]);

      // This is a private method, so we'll test it indirectly through updateRecurrencePattern
      const masterEvent: CalendarEvent = {
        id: 'master-1',
        title: 'Weekly Meeting',
        description: 'Team meeting',
        date: '2024-01-01',
        time: '10:00',
        type: 'meeting',
        recurrencePattern: {
          type: 'weekly',
          interval: 1,
          daysOfWeek: [1],
          endAfterOccurrences: 10
        }
      };

      const newPattern: RecurrencePattern = {
        type: 'weekly',
        interval: 2,
        daysOfWeek: [1, 3],
        endAfterOccurrences: 20
      };

      mockCalendarRepository.findById.mockResolvedValue(masterEvent);
      mockCalendarRepository.update.mockResolvedValue({
        ...masterEvent,
        recurrencePattern: newPattern
      });

      await calendarService.updateRecurrencePattern('master-1', newPattern, '2024-01-15');

      // Should delete the future non-exception instance
      expect(mockCalendarRepository.delete).toHaveBeenCalledWith('instance-future');
      // Should not delete the exception
      expect(mockCalendarRepository.delete).not.toHaveBeenCalledWith('exception-future');
    });
  });

  describe('migrateExistingRecurringEvents', () => {
    it('should fix invalid recurrence patterns', async () => {
      const invalidEvent: CalendarEvent = {
        id: 'invalid-1',
        title: 'Invalid Weekly Meeting',
        description: 'Meeting with invalid pattern',
        date: '2024-01-01',
        time: '10:00',
        type: 'meeting',
        recurrencePattern: {
          type: 'weekly',
          interval: 1,
          daysOfWeek: [], // Invalid: empty array
          endAfterOccurrences: 10
        }
      };

      mockCalendarRepository.findRecurringEvents.mockResolvedValue([invalidEvent]);
      mockCalendarRepository.findByRecurrenceId.mockResolvedValue([]);
      mockCalendarRepository.findById.mockResolvedValue(invalidEvent);
      mockCalendarRepository.update.mockResolvedValue({
        ...invalidEvent,
        recurrencePattern: {
          type: 'weekly',
          interval: 1,
          daysOfWeek: [0], // Fixed: default to Sunday
          endAfterOccurrences: 10
        }
      });

      await calendarService.migrateExistingRecurringEvents();

      expect(mockCalendarRepository.update).toHaveBeenCalledWith('invalid-1', {
        recurrencePattern: expect.objectContaining({
          type: 'weekly',
          interval: 1,
          daysOfWeek: expect.arrayContaining([expect.any(Number)]),
          endAfterOccurrences: 10
        })
      });
    });

    it('should clean up orphaned instances', async () => {
      const orphanedMasterEvent: CalendarEvent = {
        id: 'orphaned-master',
        title: 'Orphaned Master Event',
        description: 'Master event that will be deleted',
        date: '2024-01-01',
        time: '10:00',
        type: 'meeting',
        recurrencePattern: {
          type: 'weekly',
          interval: 1,
          daysOfWeek: [1],
          endAfterOccurrences: 10
        }
      };

      const orphanedInstance: CalendarEvent = {
        id: 'orphaned-1',
        title: 'Orphaned Instance',
        description: 'Instance without master',
        date: '2024-01-08',
        time: '10:00',
        type: 'meeting',
        recurrenceId: 'orphaned-master'
      };

      mockCalendarRepository.findRecurringEvents.mockResolvedValue([orphanedMasterEvent]);
      mockCalendarRepository.findByRecurrenceId.mockResolvedValue([orphanedInstance]);
      
      // Set up the findById calls:
      // 1. First call during migration loop - return the master event
      // 2. Second call during cleanupOrphanedInstances - return null to simulate master not found
      mockCalendarRepository.findById
        .mockResolvedValueOnce(orphanedMasterEvent) // For the master event during migration loop
        .mockResolvedValueOnce(null); // For the master check in cleanupOrphanedInstances

      await calendarService.migrateExistingRecurringEvents();

      expect(mockCalendarRepository.delete).toHaveBeenCalledWith('orphaned-1');
    });
  });

  describe('RecurrenceEngine pattern comparison', () => {
    it('should correctly compare patterns for equality', () => {
      const pattern1: RecurrencePattern = {
        type: 'weekly',
        interval: 1,
        daysOfWeek: [1, 3, 5],
        endAfterOccurrences: 10
      };

      const pattern2: RecurrencePattern = {
        type: 'weekly',
        interval: 1,
        daysOfWeek: [1, 3, 5],
        endAfterOccurrences: 10
      };

      const pattern3: RecurrencePattern = {
        type: 'weekly',
        interval: 2,
        daysOfWeek: [1, 3, 5],
        endAfterOccurrences: 10
      };

      expect(recurrenceEngine.patternsEqual(pattern1, pattern2)).toBe(true);
      expect(recurrenceEngine.patternsEqual(pattern1, pattern3)).toBe(false);
    });

    it('should handle different day orders in weekly patterns', () => {
      const pattern1: RecurrencePattern = {
        type: 'weekly',
        interval: 1,
        daysOfWeek: [1, 3, 5],
        endAfterOccurrences: 10
      };

      const pattern2: RecurrencePattern = {
        type: 'weekly',
        interval: 1,
        daysOfWeek: [5, 1, 3], // Different order
        endAfterOccurrences: 10
      };

      expect(recurrenceEngine.patternsEqual(pattern1, pattern2)).toBe(true);
    });
  });

  describe('generateFutureOccurrencesFromDate', () => {
    it('should generate occurrences from a specific date with new pattern', () => {
      const event: CalendarEvent = {
        id: 'test-1',
        title: 'Test Event',
        description: 'Test description',
        date: '2024-01-01',
        time: '10:00',
        type: 'meeting',
        recurrencePattern: {
          type: 'daily',
          interval: 1,
          endAfterOccurrences: 5
        }
      };

      const newPattern: RecurrencePattern = {
        type: 'weekly',
        interval: 1,
        daysOfWeek: [1], // Monday
        endAfterOccurrences: 3
      };

      const fromDate = new Date('2024-01-08'); // Start from second week
      const endDate = new Date('2024-01-31');

      const occurrences = recurrenceEngine.generateFutureOccurrencesFromDate(
        event,
        newPattern,
        fromDate,
        endDate
      );

      expect(occurrences).toHaveLength(3);
      expect(occurrences[0].date).toBe('2024-01-08'); // First Monday after fromDate
      expect(occurrences[1].date).toBe('2024-01-15'); // Second Monday
      expect(occurrences[2].date).toBe('2024-01-22'); // Third Monday
    });
  });
});