import React from 'react';
import '../shared.css';
import './SchoolEvents.css';
import { Icons } from '../../../icons';

const eventsData = [
  { id: 1, title: "Parent-Teacher Conferences", date: "Nov 4-5, 2024", time: "8:00 AM - 4:00 PM", location: "Virtual & In-Person", description: "Discuss your child's progress with their teachers. Sign-up sheets available now.", category: "Academic" },
  { id: 2, title: "Annual Book Fair", date: "Nov 12, 2024", time: "9:00 AM - 3:00 PM", location: "School Library", description: "Find new books and support our library. All proceeds go to new book purchases.", category: "Fundraiser" },
  { id: 3, title: "Thanksgiving Break", date: "Nov 25-29, 2024", time: "All Day", location: "School Closed", description: "The school will be closed for the Thanksgiving holiday.", category: "Holiday" },
  { id: 4, title: "Winter Concert", date: "Dec 12, 2024", time: "7:00 PM", location: "Auditorium", description: "Join us for a festive evening of music from our talented students.", category: "Arts" },
];

const categoryColors = {
    Academic: 'border-blue-500',
    Fundraiser: 'border-green-500',
    Holiday: 'border-gray-500',
    Arts: 'border-purple-500',
};

const SchoolEvents: React.FC = () => {
  return (
    <div className="school-events-container">
        <div className="school-events-header">
            <Icons.CalendarDays size={40} className="text-cyan-400"/>
            <h2 className="font-orbitron text-3xl font-bold text-white">Upcoming School Events</h2>
        </div>

        <div className="events-list">
            {eventsData.map(event => (
                <div key={event.id} className={`event-card ${categoryColors[event.category]}`}>
                    <div className="event-date">
                        <p className="event-month">{new Date(event.date).toLocaleString('default', { month: 'short' })}</p>
                        <p className="event-day">{new Date(event.date).getDate()}</p>
                    </div>
                    <div className="event-details">
                        <p className="event-category">{event.category}</p>
                        <h3 className="event-title">{event.title}</h3>
                        <div className="event-meta">
                            <span><Icons.Time size={14}/> {event.time}</span>
                            <span><Icons.User size={14}/> {event.location}</span>
                        </div>
                        <p className="event-description">{event.description}</p>
                    </div>
                    <div className="event-actions">
                        <button className="add-to-calendar-btn">
                            <Icons.Plus size={16}/> Add to Calendar
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default SchoolEvents;
