import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Icons } from '../../../icons';
import '../shared.css';

const revenueData = [
    { month: 'Jan', revenue: 150000 }, { month: 'Feb', revenue: 145000 }, { month: 'Mar', revenue: 160000 },
    { month: 'Apr', revenue: 155000 }, { month: 'May', revenue: 170000 }, { month: 'Jun', revenue: 180000 },
    { month: 'Jul', revenue: 175000 }, { month: 'Aug', revenue: 190000 }, { month: 'Sep', revenue: 210000 },
    { month: 'Oct', revenue: 205000 }, { month: 'Nov', revenue: 200000 }, { month: 'Dec', revenue: 220000 },
];

const revenueSources = [
    { source: 'Tuition & Fees', amount: 1850000, percentage: '88.1%' },
    { source: 'Marketplace Sales', amount: 125000, percentage: '5.9%' },
    { source: 'Donations & Grants', amount: 75000, percentage: '3.6%' },
    { source: 'Event Tickets', amount: 50000, percentage: '2.4%' },
];

const RevenueSummary: React.FC = () => {
    const totalRevenue = revenueSources.reduce((sum, s) => sum + s.amount, 0);
  return (
    <div className="analytics-content-pane">
        <div className="analytics-widget text-center">
            <p className="text-gray-400">Total Revenue (YTD)</p>
            <p className="font-orbitron text-5xl font-bold text-white my-2">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 analytics-widget">
                <h3 className="analytics-widget-title"><Icons.TrendingUp size={20} /> Monthly Revenue</h3>
                 <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="month" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                        <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} tickFormatter={(val) => `$${(val/1000)}k`} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(20, 20, 20, 0.8)', border: '1px solid #a855f7' }}/>
                        <Area type="monotone" dataKey="revenue" stroke="#8884d8" fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
             <div className="lg:col-span-2 analytics-widget">
                 <h3 className="analytics-widget-title"><Icons.List size={20} /> Revenue by Source</h3>
                 <div className="analytics-table-container">
                    <table className="analytics-table">
                        <thead><tr><th>Source</th><th>Amount</th><th>% of Total</th></tr></thead>
                        <tbody>
                            {revenueSources.map(s => (
                                <tr key={s.source}>
                                    <td>{s.source}</td>
                                    <td>${s.amount.toLocaleString()}</td>
                                    <td>{s.percentage}</td>
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

export default RevenueSummary;
