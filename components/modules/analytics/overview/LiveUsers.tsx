import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Icons } from '../../../icons';
import '../shared.css';
import './LiveUsers.css';

const generateLiveUsersData = () => {
  const data = [];
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000);
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      users: Math.floor(Math.random() * 50) + 120,
    });
  }
  return data;
};

const deviceData = [
  { name: 'Desktop', value: 65, color: '#8884d8' },
  { name: 'Mobile', value: 25, color: '#82ca9d' },
  { name: 'Tablet', value: 10, color: '#ffc658' },
];

const topPagesData = [
    { page: '/dashboard', users: 45 },
    { page: '/courses/algebra-2', users: 28 },
    { page: '/school-hub/student/grades', users: 19 },
    { page: '/marketplace', users: 15 },
    { page: '/communications', users: 8 },
];

const LiveUsers: React.FC = () => {
    const [liveData, setLiveData] = useState(generateLiveUsersData());
    const [currentUserCount, setCurrentUserCount] = useState(158);

    useEffect(() => {
        const interval = setInterval(() => {
            setLiveData(prevData => {
                const newData = [...prevData.slice(1)];
                const now = new Date();
                const newCount = Math.floor(Math.random() * 50) + 120;
                newData.push({
                    time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    users: newCount,
                });
                setCurrentUserCount(newCount);
                return newData;
            });
        }, 5000);
        return () => clearInterval(interval);
    }, []);
    
  return (
    <div className="analytics-content-pane">
        <div className="live-users-grid">
            <div className="analytics-widget live-count-widget">
                <p className="live-count-label">Users right now</p>
                <p className="live-count-value">{currentUserCount}</p>
                <div className="live-indicator">
                    <span className="live-dot"></span>
                    LIVE
                </div>
            </div>

            <div className="analytics-widget device-widget">
                 <h4 className="analytics-widget-title">Device Breakdown</h4>
                 <div className="device-chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={deviceData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0}}>
                            <XAxis type="number" hide />
                            <YAxis type="category" width={70} dataKey="name" tickLine={false} axisLine={false} tick={{fill: '#9ca3af'}} />
                            <Bar dataKey="value" barSize={20} radius={[0, 8, 8, 0]}>
                                {deviceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                 </div>
            </div>

            <div className="analytics-widget live-chart-widget">
                <h4 className="analytics-widget-title">Users in last 30 minutes</h4>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={liveData}>
                        <XAxis dataKey="time" tick={{ fill: '#9ca3af' }} fontSize={12} />
                        <YAxis tick={{ fill: '#9ca3af' }} domain={['dataMin - 20', 'dataMax + 20']}/>
                        <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} dot={false} isAnimationActive={false}/>
                    </LineChart>
                </ResponsiveContainer>
            </div>
            
            <div className="analytics-widget top-pages-widget">
                 <h4 className="analytics-widget-title">Top Active Pages</h4>
                 <div className="analytics-table-container">
                    <table className="analytics-table">
                        <thead>
                            <tr>
                                <th>Page</th>
                                <th>Users</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topPagesData.map(page => (
                                <tr key={page.page}>
                                    <td>{page.page}</td>
                                    <td className="text-right font-semibold">{page.users}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default LiveUsers;
