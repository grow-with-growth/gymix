import { Router, Request, Response } from 'express';
import { calendar } from '../lib/backend-integration';

const router = Router();

// GET /api/calendar - Get calendar events
router.get('/', async (req: Request, res: Response) => {
    try {
        const { year, month } = req.query;
        
        const yearNum = year ? parseInt(year as string, 10) : undefined;
        const monthNum = month ? parseInt(month as string, 10) : undefined;

        if (year && month && (isNaN(yearNum!) || isNaN(monthNum!))) {
            return res.status(400).json({ error: 'Invalid year or month format' });
        }

        const events = await calendar.getEvents(yearNum, monthNum);
        res.json(events);
    } catch (error) {
        console.error('Failed to fetch calendar events', error);
        res.status(500).json({ error: 'Failed to fetch calendar events' });
    }
});

// POST /api/calendar - Create new calendar event
router.post('/', async (req: Request, res: Response) => {
    try {
        const { title, date, type } = req.body;
        
        if (!title || !date || !type) {
            return res.status(400).json({ error: 'Missing required event fields: title, date, type' });
        }
        
        const newEvent = await calendar.createEvent(req.body);
        res.status(201).json(newEvent);
    } catch (error) {
        console.error('Failed to create calendar event', error);
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        res.status(500).json({ error: 'Failed to create calendar event', details: message });
    }
});

// GET /api/calendar/:id - Get specific calendar event
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const event = await calendar.getEventById(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        console.error('Failed to fetch calendar event', error);
        res.status(500).json({ error: 'Failed to fetch calendar event' });
    }
});

// PUT /api/calendar/:id - Update calendar event
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const updatedEvent = await calendar.updateEvent(req.params.id, req.body);
        res.json(updatedEvent);
    } catch (error) {
        console.error('Failed to update calendar event', error);
        res.status(500).json({ error: 'Failed to update calendar event' });
    }
});

// DELETE /api/calendar/:id - Delete calendar event
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        await calendar.deleteEvent(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error('Failed to delete calendar event', error);
        res.status(500).json({ error: 'Failed to delete calendar event' });
    }
});

// GET /api/calendar/recurrence-pattern - Get recurrence patterns
router.get('/recurrence-pattern', async (req: Request, res: Response) => {
    try {
        // Implement recurrence pattern logic
        res.json({ patterns: [] });
    } catch (error) {
        console.error('Failed to fetch recurrence patterns', error);
        res.status(500).json({ error: 'Failed to fetch recurrence patterns' });
    }
});

// POST /api/calendar/recurrence-pattern/bulk - Create bulk recurrence patterns
router.post('/recurrence-pattern/bulk', async (req: Request, res: Response) => {
    try {
        // Implement bulk recurrence pattern creation
        res.json({ success: true });
    } catch (error) {
        console.error('Failed to create bulk recurrence patterns', error);
        res.status(500).json({ error: 'Failed to create bulk recurrence patterns' });
    }
});

// Routes for series
router.get('/series/:seriesId', async (req: Request, res: Response) => {
    try {
        // Implement series logic
        res.json({ series: [] });
    } catch (error) {
        console.error('Failed to fetch series', error);
        res.status(500).json({ error: 'Failed to fetch series' });
    }
});

export default router;

