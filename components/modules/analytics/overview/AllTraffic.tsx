import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Icons } from '../../../icons';
import '../shared.css';

const trafficData = [
    { name: 'Jan', Direct: 400, Organic: 240, Referral: 120, Social: 80 },
    { name: 'Feb', Direct: 300, Organic: 200, Referral: 150, Social: 90 },
    { name: 'Mar', Direct: 500, Organic: 320, Referral: 180, Social: 110 },
    { name: 'Apr', Direct: 450, Organic: 350, Referral: 200, Social: 120 },
    { name: 'May', Direct: 480, Organic: 380, Referral: 210, Social: 130 },
    { name: 'Jun', Direct: 520, Organic: 410, Referral: 220, Social: 140 },
];

const trafficTableData = [
    { channel: 'Direct', users: 2650, sessions: 3100, bounce: '45.2%' },
    { channel: 'Organic Search', users: 1910, sessions: 2200, bounce: '32.1%' },
    { channel: 'Referral', users: 1080, sessions: 1250, bounce: '55.8%' },
    { channel: 'Social', users: 670, sessions: 800, bounce: '62.3%' },
];

const AllTraffic: React.FC = () => {
  return (
    <div className="analytics-content-pane">
        <div className="analytics-widget">
             <h3 className="analytics-widget-title"><Icons.TrendingUp size={20} /> Traffic Over Time by Channel</h3>
             <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trafficData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                    <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(20, 20, 20, 0.8)', border: '1px solid #a855f7' }} />
                    <Legend />
                    <Line type="monotone" dataKey="Direct" stroke="#8884d8" />
                    <Line type="monotone" dataKey="Organic" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="Referral" stroke="#ffc658" />
                    <Line type="monotone" dataKey="Social" stroke="#ff8042" />
                </LineChart>
            </ResponsiveContainer>
        </div>
        <div className="analytics-widget">
             <h3 className="analytics-widget-title"><Icons.List size={20} /> Traffic Channel Details</h3>
             <div className="analytics-table-container">
                <table className="analytics-table">
                    <thead>
                        <tr>
                            <th>Channel</th>
                            <th>Users</th>
                            <th>Sessions</th>
                            <th>Bounce Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trafficTableData.map(row => (
                            <tr key={row.channel}>
                                <td>{row.channel}</td>
                                <td>{row.users.toLocaleString()}</td>
                                <td>{row.sessions.toLocaleString()}</td>
                                <td>{row.bounce}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>
    </div>
  );
};

export default AllTraffic;
