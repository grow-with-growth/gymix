import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Icons } from '../../../icons';
import '../shared.css';

const data = [
  { name: 'Direct', users: 450, color: '#8884d8' },
  { name: 'Organic Search', users: 320, color: '#82ca9d' },
  { name: 'Referral', users: 180, color: '#ffc658' },
  { name: 'Social', users: 110, color: '#ff8042' },
];

const TrafficSources: React.FC = () => {
  return (
    <div className="analytics-content-pane">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="analytics-widget">
                 <h3 className="analytics-widget-title"><Icons.PieChart size={20}/> Traffic by Source</h3>
                 <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="users"
                            nameKey="name"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(20, 20, 20, 0.8)', border: '1px solid #a855f7' }}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
             <div className="analytics-widget">
                <h3 className="analytics-widget-title"><Icons.BarChart3 size={20}/> Source Breakdown</h3>
                <div className="analytics-table-container">
                    <table className="analytics-table">
                        <thead>
                            <tr>
                                <th>Source</th>
                                <th>Users</th>
                                <th>% of Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(item => (
                                <tr key={item.name}>
                                    <td className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></span>
                                        {item.name}
                                    </td>
                                    <td>{item.users}</td>
                                    <td>{((item.users / data.reduce((acc, i) => acc + i.users, 0)) * 100).toFixed(1)}%</td>
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

export default TrafficSources;