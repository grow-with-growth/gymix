
import React, { useState } from 'react';
import '../shared.css';
import './Calendar.css';
import { Icons } from '../../../icons';

type EventCategory = 'Holiday' | 'Exam' | 'Sports' | 'Meeting' | 'Other' | 'Events';
interface CalendarEvent {
    id: number;
    date: Date;
    title: string;
    time?: string;
    category: EventCategory;
    description?: string;
}

// Mock Events
const initialEvents: CalendarEvent[] = [
    { id: 1, date: new Date(2024, 9, 21), title: 'Parent-Teacher Conf.', category: 'Meeting', time: '9:00 AM - 4:00 PM' },
    { id: 2, date: new Date(2024, 9, 25), title: 'Mid-term Exams Start', category: 'Exam', time: 'All Day' },
    { id: 3, date: new Date(2024, 9, 31), title: 'Halloween Parade', category: 'Events', time: '1:00 PM' },
    { id: 4, date: new Date(2024, 10, 11), title: 'Veterans Day', category: 'Holiday', time: 'All Day' },
    { id: 5, date: new Date(2024, 10, 15), title: 'Soccer Championship', category: 'Sports', time: '4:00 PM' },
];

const categoryColors: Record<EventCategory, string> = {
    Holiday: 'bg-green-500',
    Exam: 'bg-red-500',
    Sports: 'bg-orange-500',
    Meeting: 'bg-blue-500',
    Other: 'bg-gray-500',
    Events: 'bg-purple-500' // Added for Halloween
};

const Calendar: React.FC = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date(2024, 9, 1));
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);

    // Form state
    const [isAddingEvent, setIsAddingEvent] = useState(false);
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventTime, setNewEventTime] = useState('');
    const [newEventCategory, setNewEventCategory] = useState<EventCategory>('Other');

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startOfMonth.getDay());
    const endDate = new Date(endOfMonth);
    if(endDate.getDay() !== 6) {
        endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    }


    const dates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const changeMonth = (offset: number) => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const handleAddEvent = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newEventTitle) return;
        const newEvent: CalendarEvent = {
            id: Date.now(),
            date: selectedDate,
            title: newEventTitle,
            time: newEventTime,
            category: newEventCategory,
        };
        setEvents([...events, newEvent]);
        // Reset form
        setNewEventTitle('');
        setNewEventTime('');
        setNewEventCategory('Other');
        setIsAddingEvent(false);
    };

  return (
    <div className="calendar-container">
        {/* Main Calendar Grid */}
        <div className="calendar-main">
            <div className="calendar-main-header">
                <h2 className="font-orbitron text-3xl font-bold text-white">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="calendar-nav">
                    <button onClick={() => changeMonth(-1)} className="nav-btn"><Icons.ChevronLeft size={20}/></button>
                    <button onClick={() => setCurrentMonth(new Date())} className="today-btn">Today</button>
                    <button onClick={() => changeMonth(1)} className="nav-btn"><Icons.ChevronRight size={20}/></button>
                </div>
            </div>

            <div className="calendar-grid">
                {daysOfWeek.map(day => <div key={day} className="day-of-week">{day}</div>)}
                {dates.map((date, index) => {
                    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                    const isSelected = date.toDateString() === selectedDate.toDateString();
                    const dayEvents = events.filter(e => e.date.toDateString() === date.toDateString());

                    return (
                        <div key={index} className={`calendar-day ${isCurrentMonth ? '' : 'other-month'}`} onClick={() => setSelectedDate(date)}>
                            <span className={`day-number ${isSelected ? 'selected' : ''}`}>{date.getDate()}</span>
                            <div className="events-container">
                                {dayEvents.map(event => (
                                    <div key={event.id} className={`event-pill ${categoryColors[event.category]}`}>{event.title}</div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>

        {/* Sidebar */}
        <div className="calendar-sidebar">
             <div className="sidebar-header">
                <h3 className="font-orbitron text-xl font-bold text-white">
                    {selectedDate.toLocaleString('default', { weekday: 'long' })}
                </h3>
                <p className="text-gray-400">{selectedDate.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
             </div>
             <div className="sidebar-events-list">
                {events.filter(e => e.date.toDateString() === selectedDate.toDateString()).map(event => (
                    <div key={event.id} className="sidebar-event-item">
                        <div className={`event-color-dot ${categoryColors[event.category]}`}></div>
                        <div>
                            <p className="sidebar-event-title">{event.title}</p>
                            <p className="sidebar-event-time">{event.time} &middot; {event.category}</p>
                        </div>
                    </div>
                ))}
             </div>
             <div className="sidebar-add-event">
                 {isAddingEvent ? (
                     <form onSubmit={handleAddEvent}>
                        <h4 className="add-event-title">Add New Event</h4>
                        <input type="text" placeholder="Event Title" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} className="add-event-input" />
                        <input type="text" placeholder="Time (e.g. 10:00 AM)" value={newEventTime} onChange={e => setNewEventTime(e.target.value)} className="add-event-input" />
                        <select value={newEventCategory} onChange={e => setNewEventCategory(e.target.value as EventCategory)} className="add-event-input">
                            {Object.keys(categoryColors).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <div className="add-event-actions">
                             <button type="button" onClick={() => setIsAddingEvent(false)} className="cancel-btn">Cancel</button>
                             <button type="submit" className="save-btn">Save</button>
                        </div>
                     </form>
                 ) : (
                    <button onClick={() => setIsAddingEvent(true)} className="add-event-btn"><Icons.Plus size={16}/> Add Event</button>
                 )}
             </div>
        </div>
    </div>
  );
};

export default Calendar;
