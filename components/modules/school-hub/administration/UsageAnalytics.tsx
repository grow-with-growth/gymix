
import React from 'react';
import '../shared.css';
import './UsageAnalytics.css';
import { Icons } from '../../../icons';
import StatCard from '../../../ui/StatCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';

const dailyLogins = [
  { name: 'Mon', logins: 250 }, { name: 'Tue', logins: 310 }, { name: 'Wed', logins: 450 },
  { name: 'Thu', logins: 420 }, { name: 'Fri', logins: 380 }, { name: 'Sat', logins: 90 }, { name: 'Sun', logins: 120 },
];

const featureAdoption = [
  { name: 'AI Assistant', usage: 85 }, { name: 'Gradebook', usage: 95 }, { name: 'Assignments', usage: 92 },
  { name: 'Calendar', usage: 78 }, { name: 'Announcements', usage: 88 }, { name: 'Parent Comms', usage: 65 },
];


const UsageAnalytics: React.FC = () => {
  return (
    <div className="usage-analytics-container">
        <div className="usage-analytics-header">
            <Icons.UsageAnalytics size={40} className="text-cyan-400"/>
            <h2 className="font-orbitron text-3xl font-bold text-white">Platform Usage Analytics</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard title="Daily Active Users" value="482" icon={Icons.Users} trend="+5.2%" trendColor="text-green-400" />
            <StatCard title="Avg. Session Time" value="28 min" icon={Icons.Time} trend="-2 min" trendColor="text-red-400" />
            <StatCard title="Top Feature" value="AI Assistant" icon={Icons.AIHelper} trend="85% Adoption" trendColor="text-green-400" />
            <StatCard title="Mobile Usage" value="32%" icon={Icons.Smartphone} trend="vs 68% Desktop" trendColor="text-cyan-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="chart-wrapper">
                <h3 className="chart-title">Daily Logins (This Week)</h3>
                 <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyLogins} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                        <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.5)" tick={{ fill: '#9ca3af' }} />
                        <YAxis stroke="rgba(255, 255, 255, 0.5)" tick={{ fill: '#9ca3af' }} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(20, 20, 20, 0.8)', border: '1px solid #a855f7' }} />
                        <Line type="monotone" dataKey="logins" name="User Logins" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="chart-wrapper">
                <h3 className="chart-title">Feature Adoption Rate (%)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={featureAdoption} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                         <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                         <XAxis type="number" domain={[0, 100]} stroke="rgba(255, 255, 255, 0.5)" tick={{ fill: '#9ca3af' }} />
                         <YAxis type="category" dataKey="name" width={100} stroke="rgba(255, 255, 255, 0.5)" tick={{ fill: '#9ca3af' }} />
                         <Tooltip contentStyle={{ backgroundColor: 'rgba(20, 20, 20, 0.8)', border: '1px solid #22d3ee' }} />
                         <Bar dataKey="usage" name="Adoption Rate" fill="#22d3ee" barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );
};

export default UsageAnalytics;
