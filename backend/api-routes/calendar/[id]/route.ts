import { NextRequest, NextResponse } from 'next/server';
import { getServiceContainer } from '@/backend/db';

/**
 * GET /api/calendar/[id] - Get calendar event by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    const event = await calendarService.getEventById(params.id);

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error getting event:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to retrieve event' },
      { status: 400 }
    );
  }
}

/**
 * PUT /api/calendar/[id] - Update calendar event by ID
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serviceContainer = getServiceContainer();
    if (!serviceContainer) {
      return NextResponse.json(
        { error: 'Service container not available' },
        { status: 500 }
      );
    }

    const eventData = await request.json();
    const { updateType = 'single', ...updateData } = eventData;

    const calendarService = serviceContainer.getCalendarService();
    
    // Check if this is a recurring event update
    if (updateType === 'all' || updateType === 'single') {
      const updatedEvent = await calendarService.updateRecurringEvent(
        params.id,
        updateData,
        updateType
      );
      return NextResponse.json(updatedEvent);
    } else {
      // Regular update
      const updatedEvent = await calendarService.updateEvent(params.id, updateData);
      return NextResponse.json(updatedEvent);
    }
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update event' },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/calendar/[id] - Delete calendar event by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serviceContainer = getServiceContainer();
    if (!serviceContainer) {
      return NextResponse.json(
        { error: 'Service container not available' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const deleteType = searchParams.get('deleteType') as 'single' | 'all' || 'single';

    const calendarService = serviceContainer.getCalendarService();
    
    // Check if this is a recurring event deletion
    const event = await calendarService.getEventById(params.id);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.recurrencePattern || event.recurrenceId) {
      // This is a recurring event, use the recurring deletion method
      await calendarService.deleteRecurringEvent(params.id, deleteType);
    } else {
      // Regular event deletion
      await calendarService.deleteEvent(params.id);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Event ${deleteType === 'all' ? 'series' : ''} deleted successfully` 
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete event' },
      { status: 400 }
    );
  }
}