
import { NextResponse } from 'next/server';
import { fetchCalendarEvents, addCalendarEvent } from '@/lib/backend-integration';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (year === null || month === null) {
        return NextResponse.json({ error: 'Year and month parameters are required' }, { status: 400 });
    }
    
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);

    if (isNaN(yearNum) || isNaN(monthNum)) {
        return NextResponse.json({ error: 'Invalid year or month format' }, { status: 400 });
    }

    try {
        // Use the real backend integration
        const events = await fetchCalendarEvents(yearNum, monthNum);
        return NextResponse.json(events);
    } catch (error) {
        console.error(`Failed to fetch calendar events for ${year}-${month}`, error);
        return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        if (!body.title || !body.date || !body.type) {
             return NextResponse.json({ error: 'Missing required event fields: title, date, type' }, { status: 400 });
        }
        
        // Use the real backend integration
        const newEvent = await addCalendarEvent(body);
        
        return NextResponse.json(newEvent, { status: 201 });

    } catch (error) {
        console.error('Failed to create calendar event', error);
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        return NextResponse.json({ error: 'Failed to create calendar event', details: message }, { status: 500 });
    }
}
