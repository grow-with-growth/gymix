import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Icons } from '../../../icons';
import '../shared.css';

const geoTableData = [
    { country: 'United States', users: 8500, sessions: 10200 },
    { country: 'Canada', users: 1200, sessions: 1500 },
    { country: 'United Kingdom', users: 850, sessions: 1000 },
    { country: 'India', users: 600, sessions: 750 },
    { country: 'Australia', users: 450, sessions: 550 },
    { country: 'Germany', users: 300, sessions: 350 },
];

const geoChartData = geoTableData.slice(0, 5);

const Geo: React.FC = () => {
  return (
    <div className="analytics-content-pane">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 analytics-widget">
                <h3 className="analytics-widget-title"><Icons.List size={20} /> Users by Country</h3>
                <div className="analytics-table-container">
                    <table className="analytics-table">
                        <thead>
                            <tr><th>Country</th><th>Users</th><th>Sessions</th></tr>
                        </thead>
                        <tbody>
                            {geoTableData.map(item => (
                                <tr key={item.country}>
                                    <td>{item.country}</td>
                                    <td>{item.users.toLocaleString()}</td>
                                    <td>{item.sessions.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="lg:col-span-2 analytics-widget">
                 <h3 className="analytics-widget-title"><Icons.BarChart size={20} /> Top 5 Countries</h3>
                 <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={geoChartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <XAxis type="number" stroke="#9ca3af" tick={{ fill: '#9ca3af' }}/>
                        <YAxis type="category" dataKey="country" width={100} stroke="#9ca3af" tick={{ fill: '#9ca3af' }} fontSize={12}/>
                        <Tooltip cursor={{fill: 'rgba(168, 85, 247, 0.1)'}} contentStyle={{ backgroundColor: 'rgba(20, 20, 20, 0.8)', border: '1px solid #a855f7' }}/>
                        <Bar dataKey="users" fill="#22d3ee" name="Users" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );
};

export default Geo;
