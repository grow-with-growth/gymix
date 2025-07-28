import { NextRequest, NextResponse } from 'next/server';
import { getServiceContainer } from '@/backend/db';

/**
 * GET /api/calendar/series/[seriesId] - Get all events in a recurring series
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { seriesId: string } }
) {
  try {
    const serviceContainer = getServiceContainer();
    if (!serviceContainer) {
      return NextResponse.json(
        { error: 'Service container not available' },
        { status: 500 }
      );
    }

    const calendarService = serviceContainer.getCalendarService();
    const seriesEvents = await calendarService.getEventSeries(params.seriesId);

    return NextResponse.json(seriesEvents);
  } catch (error) {
    console.error('Error getting event series:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to retrieve event series' },
      { status: 400 }
    );
  }
}