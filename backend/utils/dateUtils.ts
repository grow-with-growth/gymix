/**
 * Date calculation utilities for recurring events
 */

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add weeks to a date
 */
export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

/**
 * Add months to a date
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Add years to a date
 */
export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/**
 * Get the start of week (Sunday) for a given date
 */
export function getStartOfWeek(date: Date): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - result.getDay());
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the end of week (Saturday) for a given date
 */
export function getEndOfWeek(date: Date): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + (6 - result.getDay()));
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Get the start of month for a given date
 */
export function getStartOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the end of month for a given date
 */
export function getEndOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1, 0);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Get the start of year for a given date
 */
export function getStartOfYear(date: Date): Date {
  const result = new Date(date);
  result.setMonth(0, 1);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the end of year for a given date
 */
export function getEndOfYear(date: Date): Date {
  const result = new Date(date);
  result.setMonth(11, 31);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Check if a date is a leap year
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Get the number of days in a month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Parse YYYY-MM-DD string to Date
 */
export function parseDateISO(dateString: string): Date {
  return new Date(dateString + 'T00:00:00.000Z');
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return formatDateISO(date1) === formatDateISO(date2);
}

/**
 * Check if a date is between two other dates (inclusive)
 */
export function isDateBetween(date: Date, startDate: Date, endDate: Date): boolean {
  return date >= startDate && date <= endDate;
}

/**
 * Get the difference in days between two dates
 */
export function getDaysDifference(date1: Date, date2: Date): number {
  const timeDiff = date2.getTime() - date1.getTime();
  return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
}

/**
 * Get the difference in weeks between two dates
 */
export function getWeeksDifference(date1: Date, date2: Date): number {
  return Math.floor(getDaysDifference(date1, date2) / 7);
}

/**
 * Get the difference in months between two dates
 */
export function getMonthsDifference(date1: Date, date2: Date): number {
  return (date2.getFullYear() - date1.getFullYear()) * 12 + 
         (date2.getMonth() - date1.getMonth());
}

/**
 * Get the difference in years between two dates
 */
export function getYearsDifference(date1: Date, date2: Date): number {
  return date2.getFullYear() - date1.getFullYear();
}

/**
 * Get the day of week name
 */
export function getDayOfWeekName(dayOfWeek: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek] || 'Unknown';
}

/**
 * Get the month name
 */
export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month] || 'Unknown';
}

/**
 * Get the ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 */
export function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  
  if (j === 1 && k !== 11) return num + 'st';
  if (j === 2 && k !== 12) return num + 'nd';
  if (j === 3 && k !== 13) return num + 'rd';
  return num + 'th';
}

/**
 * Validate that a date string is in YYYY-MM-DD format
 */
export function isValidDateString(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && formatDateISO(date) === dateString;
}

/**
 * Get the next occurrence of a specific day of week
 */
export function getNextDayOfWeek(fromDate: Date, targetDayOfWeek: number): Date {
  const result = new Date(fromDate);
  const currentDayOfWeek = result.getDay();
  const daysUntilTarget = (targetDayOfWeek - currentDayOfWeek + 7) % 7;
  
  if (daysUntilTarget === 0) {
    // If it's the same day, move to next week
    result.setDate(result.getDate() + 7);
  } else {
    result.setDate(result.getDate() + daysUntilTarget);
  }
  
  return result;
}

/**
 * Get all dates for a specific day of week within a date range
 */
export function getDatesForDayOfWeek(
  startDate: Date, 
  endDate: Date, 
  dayOfWeek: number
): Date[] {
  const dates: Date[] = [];
  let currentDate = getNextDayOfWeek(new Date(startDate.getTime() - 24 * 60 * 60 * 1000), dayOfWeek);
  
  while (currentDate <= endDate) {
    if (currentDate >= startDate) {
      dates.push(new Date(currentDate));
    }
    currentDate = addWeeks(currentDate, 1);
  }
  
  return dates;
}

/**
 * Adjust date to handle month overflow (e.g., Jan 31 + 1 month = Feb 28/29)
 */
export function adjustDateForMonthOverflow(date: Date, targetDay: number): Date {
  const result = new Date(date);
  const daysInMonth = getDaysInMonth(result.getFullYear(), result.getMonth());
  
  if (targetDay > daysInMonth) {
    // Set to last day of month
    result.setDate(daysInMonth);
  } else {
    result.setDate(targetDay);
  }
  
  return result;
}

/**
 * Get a human-readable description of a recurrence pattern
 */
export function getRecurrenceDescription(pattern: {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  monthOfYear?: number;
  endDate?: string;
  endAfterOccurrences?: number;
}): string {
  let description = '';
  
  // Base frequency
  switch (pattern.type) {
    case 'daily':
      description = pattern.interval === 1 ? 'Daily' : `Every ${pattern.interval} days`;
      break;
    case 'weekly':
      if (pattern.interval === 1) {
        description = 'Weekly';
      } else {
        description = `Every ${pattern.interval} weeks`;
      }
      if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
        const dayNames = pattern.daysOfWeek.map(day => getDayOfWeekName(day));
        description += ` on ${dayNames.join(', ')}`;
      }
      break;
    case 'monthly':
      description = pattern.interval === 1 ? 'Monthly' : `Every ${pattern.interval} months`;
      if (pattern.dayOfMonth) {
        description += ` on the ${getOrdinalSuffix(pattern.dayOfMonth)}`;
      }
      break;
    case 'yearly':
      description = pattern.interval === 1 ? 'Yearly' : `Every ${pattern.interval} years`;
      if (pattern.monthOfYear && pattern.dayOfMonth) {
        description += ` on ${getMonthName(pattern.monthOfYear - 1)} ${getOrdinalSuffix(pattern.dayOfMonth)}`;
      }
      break;
  }
  
  // End condition
  if (pattern.endDate) {
    description += ` until ${pattern.endDate}`;
  } else if (pattern.endAfterOccurrences) {
    description += ` for ${pattern.endAfterOccurrences} occurrences`;
  }
  
  return description;
}