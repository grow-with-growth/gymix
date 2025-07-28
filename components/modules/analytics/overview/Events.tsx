import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Icons } from '../../../icons';
import '../shared.css';

const eventsData = [
  { name: 'course_start', count: 1250, users: 420 },
  { name: 'video_play', count: 980, users: 350 },
  { name: 'assignment_submit', count: 750, users: 280 },
  { name: 'login', count: 680, users: 510 },
  { name: 'file_download', count: 420, users: 150 },
  { name: 'message_sent', count: 310, users: 95 },
];

const Events: React.FC = () => {
  return (
    <div className="analytics-content-pane">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 analytics-widget">
                <h3 className="analytics-widget-title"><Icons.List size={20} /> All Events</h3>
                <div className="analytics-table-container">
                    <table className="analytics-table">
                        <thead>
                            <tr>
                                <th>Event Name</th>
                                <th>Total Count</th>
                                <th>Total Users</th>
                            </tr>
                        </thead>
                        <tbody>
                            {eventsData.map(event => (
                                <tr key={event.name}>
                                    <td className="font-mono">{event.name}</td>
                                    <td>{event.count.toLocaleString()}</td>
                                    <td>{event.users.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="lg:col-span-2 analytics-widget">
                <h3 className="analytics-widget-title"><Icons.BarChart2 size={20} /> Top Events by Count</h3>
                 <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={eventsData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <XAxis type="number" stroke="#9ca3af" tick={{ fill: '#9ca3af' }}/>
                        <YAxis type="category" dataKey="name" width={120} stroke="#9ca3af" tick={{ fill: '#9ca3af' }} fontSize={12} />
                        <Tooltip 
                            cursor={{fill: 'rgba(168, 85, 247, 0.1)'}}
                            contentStyle={{ backgroundColor: 'rgba(20, 20, 20, 0.8)', border: '1px solid #a855f7' }}
                        />
                        <Bar dataKey="count" fill="#82ca9d" name="Count" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );
};

export default Events;
