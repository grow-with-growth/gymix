
import {
    CalendarEvent,
    CalendarEventType,
} from '../../types';
import { getData } from '../utils';

function generateRandomEventsForMonth(year: number, month: number): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const eventTemplates: { title: string; type: CalendarEventType; time?: string; description: string }[] = [
        { title: 'Faculty Meeting', type: 'meeting', time: '10:00 AM - 11:30 AM', description: 'Discussing quarterly curriculum updates.' },
        { title: 'Mid-term Exams: Math', type: 'exam', time: '9:00 AM - 12:00 PM', description: 'Math exams for grades 9-12.' },
        { title: 'Parent-Teacher Conference', type: 'meeting', time: '4:00 PM - 7:00 PM', description: 'Open sessions for parents.' },
        { title: 'Science Fair', type: 'task', time: 'All Day', description: 'Annual school-wide science fair.' },
        { title: 'Project Submission Deadline', type: 'task', time: '11:59 PM', description: 'Final project submissions for history class.' },
        { title: 'Guest Lecture: AI in Arts', type: 'reminder', time: '2:00 PM - 3:00 PM', description: 'Special lecture by Dr. Alan Turing.' },
        { title: 'School Holiday', type: 'holiday', description: 'School closed for national holiday.' },
    ];
    
    // Ensure some events are always present
    for (let i = 0; i < 7; i++) {
        const day = Math.floor(Math.random() * daysInMonth) + 1;
        const template = eventTemplates[i % eventTemplates.length];
        const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        events.push({
            id: `evt-${year}-${month}-${i}`,
            date,
            ...template
        });
    }

    return events;
}

export const dbCalendarEvents: { [key: string]: CalendarEvent[] } = {
    '2024-7': generateRandomEventsForMonth(2024, 7), // August 2024
    '2024-8': generateRandomEventsForMonth(2024, 8), // September 2024
    '2024-9': generateRandomEventsForMonth(2024, 9), // October 2024
};

export const fetchCalendarEvents = (year: number, month: number) => {
    const key = `${year}-${month}`;
    const events = dbCalendarEvents[key] || generateRandomEventsForMonth(year, month);
    dbCalendarEvents[key] = events; // Cache generated events
    return getData(events);
};

export const addCalendarEvent = async (eventData: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> => {
    const eventDate = new Date(eventData.date);
    const year = eventDate.getUTCFullYear();
    const month = eventDate.getUTCMonth();
    const key = `${year}-${month}`;

    const newEvent: CalendarEvent = {
        ...eventData,
        id: `evt-${Date.now()}-${Math.random()}`,
    };

    if (!dbCalendarEvents[key]) {
        dbCalendarEvents[key] = [];
    }
    
    dbCalendarEvents[key].push(newEvent);

    return getData(newEvent);
};
