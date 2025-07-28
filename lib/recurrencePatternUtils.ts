import { RecurrencePattern, CalendarEvent } from '../types';

/**
 * Utility functions for handling recurrence pattern changes
 */

/**
 * Update a recurrence pattern for an event
 */
export async function updateRecurrencePattern(
  eventId: string,
  newPattern: RecurrencePattern,
  effectiveDate?: string
): Promise<{ success: boolean; event?: CalendarEvent; error?: string }> {
  try {
    const response = await fetch('/api/calendar/recurrence-pattern', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventId,
        newPattern,
        effectiveDate,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.details || data.error || 'Failed to update recurrence pattern',
      };
    }

    return {
      success: true,
      event: data.event,
    };
  } catch (error) {
    console.error('Error updating recurrence pattern:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

/**
 * Bulk update recurrence patterns for multiple events
 */
export async function bulkUpdateRecurrencePatterns(
  updates: Array<{
    eventId: string;
    newPattern: RecurrencePattern;
    effectiveDate?: string;
  }>
): Promise<{
  success: boolean;
  result?: { successful: string[]; failed: Array<{ eventId: string; error: string }> };
  error?: string;
}> {
  try {
    const response = await fetch('/api/calendar/recurrence-pattern/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ updates }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.details || data.error || 'Failed to perform bulk update',
      };
    }

    return {
      success: true,
      result: data.result,
    };
  } catch (error) {
    console.error('Error in bulk update:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

/**
 * Validate a recurrence pattern
 */
export function validateRecurrencePattern(pattern: RecurrencePattern): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required fields based on type
  switch (pattern.type) {
    case 'weekly':
      if (!pattern.daysOfWeek || pattern.daysOfWeek.length === 0) {
        errors.push('Weekly recurrence must specify days of week');
      } else if (pattern.daysOfWeek.some(day => day < 0 || day > 6)) {
        errors.push('Days of week must be between 0 (Sunday) and 6 (Saturday)');
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
      } else {
        if (pattern.monthOfYear < 1 || pattern.monthOfYear > 12) {
          errors.push('Month must be between 1 and 12');
        }
        if (pattern.dayOfMonth < 1 || pattern.dayOfMonth > 31) {
          errors.push('Day of month must be between 1 and 31');
        }
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

  if (pattern.endDate) {
    const endDate = new Date(pattern.endDate);
    if (isNaN(endDate.getTime())) {
      errors.push('End date must be a valid date');
    }
  }

  if (pattern.endAfterOccurrences !== undefined && pattern.endAfterOccurrences < 1) {
    errors.push('End after occurrences must be at least 1');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Compare two recurrence patterns and return differences
 */
export function compareRecurrencePatterns(
  pattern1: RecurrencePattern,
  pattern2: RecurrencePattern
): {
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
    differences,
  };
}

/**
 * Format a recurrence pattern for display
 */
export function formatRecurrencePattern(pattern: RecurrencePattern): string {
  const { type, interval } = pattern;
  
  let baseText = '';
  switch (type) {
    case 'daily':
      baseText = interval === 1 ? 'Daily' : `Every ${interval} days`;
      break;
    case 'weekly':
      baseText = interval === 1 ? 'Weekly' : `Every ${interval} weeks`;
      if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const selectedDays = pattern.daysOfWeek.map(day => dayNames[day]).join(', ');
        baseText += ` on ${selectedDays}`;
      }
      break;
    case 'monthly':
      baseText = interval === 1 ? 'Monthly' : `Every ${interval} months`;
      if (pattern.dayOfMonth) {
        baseText += ` on day ${pattern.dayOfMonth}`;
      }
      break;
    case 'yearly':
      baseText = interval === 1 ? 'Yearly' : `Every ${interval} years`;
      if (pattern.monthOfYear && pattern.dayOfMonth) {
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        baseText += ` on ${monthNames[pattern.monthOfYear - 1]} ${pattern.dayOfMonth}`;
      }
      break;
    default:
      baseText = 'Recurring';
  }

  // Add end condition
  if (pattern.endDate) {
    baseText += ` until ${new Date(pattern.endDate).toLocaleDateString()}`;
  } else if (pattern.endAfterOccurrences) {
    baseText += ` for ${pattern.endAfterOccurrences} occurrences`;
  }

  return baseText;
}

/**
 * Create a default recurrence pattern
 */
export function createDefaultRecurrencePattern(type: RecurrencePattern['type']): RecurrencePattern {
  const basePattern: RecurrencePattern = {
    type,
    interval: 1,
    endAfterOccurrences: 10, // Default to 10 occurrences
  };

  switch (type) {
    case 'weekly':
      return {
        ...basePattern,
        daysOfWeek: [new Date().getDay()], // Default to current day of week
      };
      
    case 'monthly':
      return {
        ...basePattern,
        dayOfMonth: new Date().getDate(), // Default to current day of month
      };
      
    case 'yearly':
      const now = new Date();
      return {
        ...basePattern,
        monthOfYear: now.getMonth() + 1, // Default to current month
        dayOfMonth: now.getDate(), // Default to current day
      };
      
    default:
      return basePattern;
  }
}