
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import StatCard from '../ui/StatCard';
import { Icons } from '../icons';
import './dashboard-module.css';
import '../ui/chart-tooltip.css';

const data = [
  { name: 'Jan', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Feb', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Mar', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Apr', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'May', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Jun', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'Jul', uv: 3490, pv: 4300, amt: 2100 },
];

const DashboardModule: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Top row of stats */}
      <div className="grid grid-cols-4 gap-4 h-1/3">
        <StatCard title="Total Students" value="1,284" icon={Icons.Students} trend="+12% this month" trendColor="text-green-400" />
        <StatCard title="Revenue" value="$48.k" icon={Icons.Finance} trend="+8.5% this month" trendColor="text-green-400" />
        <StatCard title="New Enrollments" value="97" icon={Icons.School} trend="-5% this week" trendColor="text-red-400" />
        <StatCard title="Active Courses" value="42" icon={Icons.KnowledgeBase} trend="+2 this month" trendColor="text-green-400" />
      </div>
      {/* Bottom section with chart */}
      <div className="chart-container-bordered flex-1 bg-white/5 backdrop-blur-2xl rounded-3xl p-4 shadow-2xl shadow-black/40 flex flex-col">
        <h3 className="font-orbitron text-lg text-white mb-4 shrink-0">Engagement Overview</h3>
        <div className="flex-grow min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.5)" tick={{ fill: '#9ca3af' }} />
              <YAxis stroke="rgba(255, 255, 255, 0.5)" tick={{ fill: '#9ca3af' }} />
              <Tooltip
                wrapperClassName="chart-tooltip-wrapper"
                contentStyle={{
                  backgroundColor: 'rgba(20, 20, 20, 0.8)',
                  backdropFilter: 'blur(4px)',
                }}
                labelStyle={{ color: '#f5f5f5', fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{paddingTop: '20px'}}/>
              <Line type="monotone" dataKey="pv" name="Page Views" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="uv" name="Unique Visitors" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardModule;