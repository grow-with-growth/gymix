import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Icons } from '../../../icons';
import '../shared.css';
import StatCard from '../../../ui/StatCard';

const followerData = [
    { name: 'Jan', Facebook: 2200, Instagram: 1500, Twitter: 800 },
    { name: 'Feb', Facebook: 2250, Instagram: 1580, Twitter: 820 },
    { name: 'Mar', Facebook: 2300, Instagram: 1690, Twitter: 850 },
    { name: 'Apr', Facebook: 2380, Instagram: 1800, Twitter: 880 },
    { name: 'May', Facebook: 2450, Instagram: 1950, Twitter: 910 },
    { name: 'Jun', Facebook: 2500, Instagram: 2100, Twitter: 950 },
];

const SocialOverview: React.FC = () => {
  return (
    <div className="analytics-content-pane">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Facebook Followers" value="2.5k" icon={Icons.Facebook} trend="+50 this month" trendColor="text-green-400" />
            <StatCard title="Instagram Followers" value="2.1k" icon={Icons.Instagram} trend="+150 this month" trendColor="text-green-400" />
            <StatCard title="Twitter Followers" value="950" icon={Icons.Twitter} trend="+40 this month" trendColor="text-green-400" />
        </div>
        <div className="analytics-widget">
            <h3 className="analytics-widget-title"><Icons.TrendingUp size={20} /> Follower Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={followerData}>
                    <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                    <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(20, 20, 20, 0.8)', border: '1px solid #a855f7' }} />
                    <Legend />
                    <Line type="monotone" dataKey="Facebook" stroke="#3b82f6" />
                    <Line type="monotone" dataKey="Instagram" stroke="#ec4899" />
                    <Line type="monotone" dataKey="Twitter" stroke="#22d3ee" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
};

export default SocialOverview;
