import { NextRequest, NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import { CalendarService } from '../../../../backend/services/calendarService';
import { PocketBaseCalendarRepository } from '../../../../backend/repositories/pocketbase/calendarRepository';

/**
 * API endpoint for bulk updating recurrence patterns
 */

// Initialize PocketBase connection
function initializePocketBase(): PocketBase {
  const pocketbaseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
  return new PocketBase(pocketbaseUrl);
}

/**
 * POST /api/calendar/recurrence-pattern/bulk
 * Bulk update recurrence patterns for multiple events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { updates } = body;

    // Validate input
    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Updates array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Validate each update
    for (const update of updates) {
      if (!update.eventId || !update.newPattern) {
        return NextResponse.json(
          { error: 'Each update must have eventId and newPattern' },
          { status: 400 }
        );
      }
    }

    // Initialize services
    const pb = initializePocketBase();
    const calendarRepository = new PocketBaseCalendarRepository(pb);
    const calendarService = new CalendarService(calendarRepository);

    // Perform bulk update
    const result = await calendarService.bulkUpdateRecurrencePatterns(updates);

    return NextResponse.json({
      success: true,
      result,
      message: `Bulk update completed: ${result.successful.length} successful, ${result.failed.length} failed`
    });

  } catch (error) {
    console.error('Error in bulk recurrence pattern update:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { 
        error: 'Failed to perform bulk update',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

