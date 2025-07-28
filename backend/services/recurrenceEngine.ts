import { CalendarEvent, RecurrencePattern } from '../../types';

/**
 * Recurrence Engine for generating recurring calendar events
 */
export class RecurrenceEngine {
  /**
   * Generate occurrences of a recurring event within a date range
   */
  generateOccurrences(
    event: CalendarEvent,
    startDate: Date,
    endDate: Date
  ): CalendarEvent[] {
    if (!event.recurrencePattern) {
      // If no recurrence pattern, return the original event if it falls within the range
      const eventDate = new Date(event.date);
      if (eventDate >= startDate && eventDate <= endDate) {
        return [event];
      }
      return [];
    }

    const occurrences: CalendarEvent[] = [];
    const pattern = event.recurrencePattern;
    const eventStartDate = new Date(event.date);
    
    // Determine the end date for recurrence
    let recurrenceEndDate: Date;
    if (pattern.endDate) {
      recurrenceEndDate = new Date(pattern.endDate);
    } else {
      // Use a far future date if no end date specified
      recurrenceEndDate = new Date('2099-12-31');
    }

    // Limit the search to the requested range
    const searchEndDate = endDate < recurrenceEndDate ? endDate : recurrenceEndDate;

    let currentDate = new Date(eventStartDate);
    let occurrenceCount = 0;
    const maxOccurrences = pattern.endAfterOccurrences || 1000; // Safety limit

    while (currentDate <= searchEndDate && occurrenceCount < maxOccurrences) {
      // Check if current date is within the requested range
      if (currentDate >= startDate && currentDate <= endDate) {
        occurrences.push({
          ...event,
          id: `${event.id}_${this.formatDate(currentDate)}`,
          date: this.formatDate(currentDate),
          recurrenceId: event.id
        });
      }

      occurrenceCount++;
      
      // Calculate next occurrence
      currentDate = this.calculateNextOccurrence(currentDate, pattern);
      
      // Break if we've exceeded the recurrence end date
      if (currentDate > recurrenceEndDate) {
        break;
      }
    }

    return occurrences;
  }

  /**
   * Calculate the next occurrence date based on the recurrence pattern
   */
  private calculateNextOccurrence(currentDate: Date, pattern: RecurrencePattern): Date {
    const nextDate = new Date(currentDate);

    switch (pattern.type) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + pattern.interval);
        break;

      case 'weekly':
        nextDate.setDate(nextDate.getDate() + (7 * pattern.interval));
        break;

      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + pattern.interval);
        // Handle day of month adjustment
        if (pattern.dayOfMonth) {
          nextDate.setDate(pattern.dayOfMonth);
          // Handle cases where the day doesn't exist in the month (e.g., Feb 30)
          if (nextDate.getDate() !== pattern.dayOfMonth) {
            // Move to the last day of the month
            nextDate.setDate(0);
          }
        }
        break;

      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + pattern.interval);
        if (pattern.monthOfYear && pattern.dayOfMonth) {
          nextDate.setMonth(pattern.monthOfYear - 1); // Month is 0-indexed
          nextDate.setDate(pattern.dayOfMonth);
          // Handle leap year edge case for Feb 29
          if (nextDate.getDate() !== pattern.dayOfMonth) {
            nextDate.setDate(0); // Move to last day of previous month
          }
        }
        break;
    }

    return nextDate;
  }

  /**
   * Generate occurrences for weekly recurrence with specific days of week
   */
  generateWeeklyOccurrences(
    event: CalendarEvent,
    startDate: Date,
    endDate: Date
  ): CalendarEvent[] {
    if (!event.recurrencePattern || event.recurrencePattern.type !== 'weekly') {
      return [];
    }

    const pattern = event.recurrencePattern;
    const daysOfWeek = pattern.daysOfWeek || [];
    const occurrences: CalendarEvent[] = [];
    
    // Start from the event's original date
    const eventStartDate = new Date(event.date);
    let currentWeekStart = new Date(eventStartDate);
    
    // Move to the start of the week (Sunday)
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
    
    const recurrenceEndDate = pattern.endDate ? new Date(pattern.endDate) : new Date('2099-12-31');
    const searchEndDate = endDate < recurrenceEndDate ? endDate : recurrenceEndDate;
    
    let weekCount = 0;
    const maxOccurrences = pattern.endAfterOccurrences || 1000;
    let totalOccurrences = 0;

    while (currentWeekStart <= searchEndDate && totalOccurrences < maxOccurrences) {
      // Only process weeks that match the interval
      if (weekCount % pattern.interval === 0) {
        for (const dayOfWeek of daysOfWeek) {
          const occurrenceDate = new Date(currentWeekStart);
          occurrenceDate.setDate(occurrenceDate.getDate() + dayOfWeek);
          
          // Check if this occurrence is within the requested range and after the original event
          if (occurrenceDate >= startDate && 
              occurrenceDate <= endDate && 
              occurrenceDate >= eventStartDate) {
            
            occurrences.push({
              ...event,
              id: `${event.id}_${this.formatDate(occurrenceDate)}`,
              date: this.formatDate(occurrenceDate),
              recurrenceId: event.id
            });
            
            totalOccurrences++;
            if (totalOccurrences >= maxOccurrences) break;
          }
        }
      }
      
      // Move to next week
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      weekCount++;
    }

    return occurrences;
  }

  /**
   * Create an exception to a recurring event
   */
  createException(
    recurringEvent: CalendarEvent,
    date: Date,
    changes: Partial<CalendarEvent>
  ): CalendarEvent {
    return {
      ...recurringEvent,
      ...changes,
      id: `${recurringEvent.id}_exception_${this.formatDate(date)}`,
      date: this.formatDate(date),
      recurrenceId: recurringEvent.id,
      isException: true
    };
  }

  /**
   * Check if a date matches a recurrence pattern
   */
  matchesPattern(date: Date, originalDate: Date, pattern: RecurrencePattern): boolean {
    const daysDiff = Math.floor((date.getTime() - originalDate.getTime()) / (1000 * 60 * 60 * 24));
    
    switch (pattern.type) {
      case 'daily':
        return daysDiff >= 0 && daysDiff % pattern.interval === 0;
        
      case 'weekly':
        const weeksDiff = Math.floor(daysDiff / 7);
        const dayOfWeek = date.getDay();
        return weeksDiff >= 0 && 
               weeksDiff % pattern.interval === 0 && 
               pattern.daysOfWeek?.includes(dayOfWeek);
               
      case 'monthly':
        const monthsDiff = (date.getFullYear() - originalDate.getFullYear()) * 12 + 
                          (date.getMonth() - originalDate.getMonth());
        return monthsDiff >= 0 && 
               monthsDiff % pattern.interval === 0 && 
               date.getDate() === (pattern.dayOfMonth || originalDate.getDate());
               
      case 'yearly':
        const yearsDiff = date.getFullYear() - originalDate.getFullYear();
        return yearsDiff >= 0 && 
               yearsDiff % pattern.interval === 0 && 
               date.getMonth() === (pattern.monthOfYear ? pattern.monthOfYear - 1 : originalDate.getMonth()) &&
               date.getDate() === (pattern.dayOfMonth || originalDate.getDate());
               
      default:
        return false;
    }
  }

  /**
   * Get the next occurrence date for a recurring event
   */
  getNextOccurrence(event: CalendarEvent, fromDate?: Date): Date | null {
    if (!event.recurrencePattern) {
      return null;
    }

    const startDate = fromDate || new Date();
    const eventDate = new Date(event.date);
    
    // If the event hasn't started yet, return the original date
    if (eventDate > startDate) {
      return eventDate;
    }

    const pattern = event.recurrencePattern;
    const endDate = pattern.endDate ? new Date(pattern.endDate) : new Date('2099-12-31');
    
    let currentDate = new Date(eventDate);
    let occurrenceCount = 0;
    const maxOccurrences = pattern.endAfterOccurrences || 1000;

    while (currentDate <= endDate && occurrenceCount < maxOccurrences) {
      if (currentDate > startDate) {
        return currentDate;
      }
      
      currentDate = this.calculateNextOccurrence(currentDate, pattern);
      occurrenceCount++;
    }

    return null;
  }

  /**
   * Get all future occurrences of a recurring event
   */
  getFutureOccurrences(event: CalendarEvent, limit: number = 10): CalendarEvent[] {
    if (!event.recurrencePattern) {
      return [];
    }

    const now = new Date();
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 2); // Look 2 years ahead
    
    const occurrences = this.generateOccurrences(event, now, futureDate);
    
    // Filter to only future occurrences (after now)
    const futureOccurrences = occurrences.filter(occurrence => {
      const occurrenceDate = new Date(occurrence.date);
      return occurrenceDate > now;
    });
    
    return futureOccurrences.slice(0, limit);
  }

  /**
   * Format date as YYYY-MM-DD string
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Validate recurrence pattern
   */
  validatePattern(pattern: RecurrencePattern): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields based on type
    switch (pattern.type) {
      case 'weekly':
        if (!pattern.daysOfWeek || pattern.daysOfWeek.length === 0) {
          errors.push('Weekly recurrence must specify days of week');
        }
        break;
        
      case 'monthly':
        if (pattern.dayOfMonth === undefined) {
          errors.push('Monthly recurrence must specify day of month');
        } else if (pattern.dayOfMonth < 1 || pattern.dayOfMonth > 31) {
          errors.push('Day of month must be between 1 and 31');
        }
        break;
        
      case 'yearly':
        if (pattern.monthOfYear === undefined || pattern.dayOfMonth === undefined) {
          errors.push('Yearly recurrence must specify month and day');
        }
        break;
    }

    // Check interval
    if (pattern.interval < 1) {
      errors.push('Interval must be at least 1');
    }

    // Check end conditions
    if (!pattern.endDate && !pattern.endAfterOccurrences) {
      errors.push('Must specify either end date or number of occurrences');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate future occurrences from a specific date with a new pattern
   */
  generateFutureOccurrencesFromDate(
    event: CalendarEvent,
    newPattern: RecurrencePattern,
    fromDate: Date,
    endDate: Date
  ): CalendarEvent[] {
    const occurrences: CalendarEvent[] = [];
    const eventWithNewPattern = { ...event, recurrencePattern: newPattern };
    
    // Start generating from the fromDate
    let currentDate = new Date(fromDate);
    let occurrenceCount = 0;
    const maxOccurrences = newPattern.endAfterOccurrences || 1000;
    
    // Determine the end date for recurrence
    let recurrenceEndDate: Date;
    if (newPattern.endDate) {
      recurrenceEndDate = new Date(newPattern.endDate);
    } else {
      recurrenceEndDate = endDate;
    }

    const searchEndDate = endDate < recurrenceEndDate ? endDate : recurrenceEndDate;

    // Find the first occurrence on or after fromDate
    const originalEventDate = new Date(event.date);
    
    // If fromDate is before the original event date, start from original event date
    if (currentDate < originalEventDate) {
      currentDate = new Date(originalEventDate);
    } else {
      // Find the next occurrence on or after fromDate
      currentDate = this.findNextOccurrenceOnOrAfter(originalEventDate, newPattern, fromDate);
    }

    while (currentDate <= searchEndDate && occurrenceCount < maxOccurrences) {
      // Check if current date is within the requested range
      if (currentDate >= fromDate && currentDate <= endDate) {
        occurrences.push({
          ...eventWithNewPattern,
          id: `${event.id}_${this.formatDate(currentDate)}`,
          date: this.formatDate(currentDate),
          recurrenceId: event.id
        });
      }

      occurrenceCount++;
      
      // Calculate next occurrence
      currentDate = this.calculateNextOccurrence(currentDate, newPattern);
      
      // Break if we've exceeded the recurrence end date
      if (currentDate > recurrenceEndDate) {
        break;
      }
    }

    return occurrences;
  }

  /**
   * Find the next occurrence on or after a specific date
   */
  private findNextOccurrenceOnOrAfter(
    originalDate: Date,
    pattern: RecurrencePattern,
    targetDate: Date
  ): Date {
    let currentDate = new Date(originalDate);
    
    // If original date is already on or after target, return it
    if (currentDate >= targetDate) {
      return currentDate;
    }

    // Calculate how many intervals we need to skip to get to or past the target date
    const daysDiff = Math.floor((targetDate.getTime() - originalDate.getTime()) / (1000 * 60 * 60 * 24));
    
    switch (pattern.type) {
      case 'daily':
        const dailyIntervals = Math.floor(daysDiff / pattern.interval);
        currentDate.setDate(originalDate.getDate() + (dailyIntervals * pattern.interval));
        if (currentDate < targetDate) {
          currentDate = this.calculateNextOccurrence(currentDate, pattern);
        }
        break;
        
      case 'weekly':
        const weeklyIntervals = Math.floor(daysDiff / (7 * pattern.interval));
        currentDate.setDate(originalDate.getDate() + (weeklyIntervals * 7 * pattern.interval));
        
        // For weekly recurrence, we need to find the right day of the week
        if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
          while (currentDate < targetDate) {
            currentDate = this.calculateNextOccurrence(currentDate, pattern);
          }
        }
        break;
        
      case 'monthly':
        const monthlyIntervals = Math.floor(daysDiff / 30); // Rough estimate
        currentDate.setMonth(originalDate.getMonth() + (monthlyIntervals * pattern.interval));
        if (pattern.dayOfMonth) {
          currentDate.setDate(pattern.dayOfMonth);
        }
        while (currentDate < targetDate) {
          currentDate = this.calculateNextOccurrence(currentDate, pattern);
        }
        break;
        
      case 'yearly':
        const yearlyIntervals = Math.floor(daysDiff / 365); // Rough estimate
        currentDate.setFullYear(originalDate.getFullYear() + (yearlyIntervals * pattern.interval));
        if (pattern.monthOfYear && pattern.dayOfMonth) {
          currentDate.setMonth(pattern.monthOfYear - 1);
          currentDate.setDate(pattern.dayOfMonth);
        }
        while (currentDate < targetDate) {
          currentDate = this.calculateNextOccurrence(currentDate, pattern);
        }
        break;
    }

    return currentDate;
  }

  /**
   * Compare two recurrence patterns for equality
   */
  patternsEqual(pattern1: RecurrencePattern, pattern2: RecurrencePattern): boolean {
    // Basic type and interval comparison
    if (pattern1.type !== pattern2.type || pattern1.interval !== pattern2.interval) {
      return false;
    }

    // End condition comparison
    if (pattern1.endDate !== pattern2.endDate || pattern1.endAfterOccurrences !== pattern2.endAfterOccurrences) {
      return false;
    }

    // Compare type-specific fields
    switch (pattern1.type) {
      case 'weekly':
        const days1 = (pattern1.daysOfWeek || []).slice().sort();
        const days2 = (pattern2.daysOfWeek || []).slice().sort();
        return JSON.stringify(days1) === JSON.stringify(days2);
        
      case 'monthly':
        return pattern1.dayOfMonth === pattern2.dayOfMonth;
        
      case 'yearly':
        return pattern1.monthOfYear === pattern2.monthOfYear && pattern1.dayOfMonth === pattern2.dayOfMonth;
        
      case 'daily':
        return true; // Only type and interval matter for daily
        
      default:
        return true;
    }
  }

  /**
   * Get a detailed comparison of two recurrence patterns
   */
  comparePatterns(pattern1: RecurrencePattern, pattern2: RecurrencePattern): {
    equal: boolean;
    differences: string[];
  } {
    const differences: string[] = [];

    if (pattern1.type !== pattern2.type) {
      differences.push(`Type changed from ${pattern1.type} to ${pattern2.type}`);
    }

    if (pattern1.interval !== pattern2.interval) {
      differences.push(`Interval changed from ${pattern1.interval} to ${pattern2.interval}`);
    }

    if (pattern1.endDate !== pattern2.endDate) {
      differences.push(`End date changed from ${pattern1.endDate || 'none'} to ${pattern2.endDate || 'none'}`);
    }

    if (pattern1.endAfterOccurrences !== pattern2.endAfterOccurrences) {
      differences.push(`End after occurrences changed from ${pattern1.endAfterOccurrences || 'none'} to ${pattern2.endAfterOccurrences || 'none'}`);
    }

    // Type-specific comparisons
    if (pattern1.type === pattern2.type) {
      switch (pattern1.type) {
        case 'weekly':
          const days1 = (pattern1.daysOfWeek || []).slice().sort();
          const days2 = (pattern2.daysOfWeek || []).slice().sort();
          if (JSON.stringify(days1) !== JSON.stringify(days2)) {
            differences.push(`Days of week changed from [${days1.join(',')}] to [${days2.join(',')}]`);
          }
          break;
          
        case 'monthly':
          if (pattern1.dayOfMonth !== pattern2.dayOfMonth) {
            differences.push(`Day of month changed from ${pattern1.dayOfMonth} to ${pattern2.dayOfMonth}`);
          }
          break;
          
        case 'yearly':
          if (pattern1.monthOfYear !== pattern2.monthOfYear) {
            differences.push(`Month of year changed from ${pattern1.monthOfYear} to ${pattern2.monthOfYear}`);
          }
          if (pattern1.dayOfMonth !== pattern2.dayOfMonth) {
            differences.push(`Day of month changed from ${pattern1.dayOfMonth} to ${pattern2.dayOfMonth}`);
          }
          break;
      }
    }

    return {
      equal: differences.length === 0,
      differences
    };
  }
}

// Export a singleton instance
export const recurrenceEngine = new RecurrenceEngine();