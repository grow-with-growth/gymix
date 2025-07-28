import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Icons } from '../../../icons';
import '../shared.css';

const ageData = [
    { name: '18-24', value: 15 },
    { name: '25-34', value: 25 },
    { name: '35-44', value: 35 },
    { name: '45-54', value: 20 },
    { name: '55+', value: 5 },
];
const genderData = [
    { name: 'Female', value: 62, color: '#8884d8' },
    { name: 'Male', value: 38, color: '#82ca9d' },
]

const Demographics: React.FC = () => {
  return (
    <div className="analytics-content-pane">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="analytics-widget">
                <h3 className="analytics-widget-title"><Icons.Users size={20} /> Users by Age</h3>
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ageData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af' }}/>
                        <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} tickFormatter={(value) => `${value}%`}/>
                        <Tooltip 
                            cursor={{fill: 'rgba(168, 85, 247, 0.1)'}}
                            contentStyle={{ backgroundColor: 'rgba(20, 20, 20, 0.8)', border: '1px solid #a855f7' }}
                        />
                        <Bar dataKey="value" name="Percentage" fill="#3b82f6" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
             <div className="analytics-widget">
                <h3 className="analytics-widget-title"><Icons.Users size={20} /> Users by Gender</h3>
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={genderData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af' }}/>
                        <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} tickFormatter={(value) => `${value}%`}/>
                        <Tooltip 
                            cursor={{fill: 'rgba(168, 85, 247, 0.1)'}}
                            contentStyle={{ backgroundColor: 'rgba(20, 20, 20, 0.8)', border: '1px solid #a855f7' }}
                        />
                        <Bar dataKey="value" name="Percentage">
                             {genderData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );
};

export default Demographics;
