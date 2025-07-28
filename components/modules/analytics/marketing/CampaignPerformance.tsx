import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Icons } from '../../../icons';
import '../shared.css';

const campaignsData = [
  { name: 'Fall Enrollment', channel: 'Email', spend: 500, conversions: 50, cpa: 10 },
  { name: 'STEM Camp', channel: 'Google Ads', spend: 3000, conversions: 70, cpa: 42.8 },
  { name: 'Arts Program', channel: 'Facebook', spend: 1500, conversions: 60, cpa: 25 },
  { name: 'Open House', channel: 'Multi-channel', spend: 2000, conversions: 120, cpa: 16.6 },
];

const CampaignPerformance: React.FC = () => {
  return (
    <div className="analytics-content-pane">
        <div className="analytics-widget">
            <h3 className="analytics-widget-title"><Icons.BarChart size={20} /> Campaign Performance Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={campaignsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af' }}/>
                    <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }}/>
                    <Tooltip cursor={{fill: 'rgba(168, 85, 247, 0.1)'}} contentStyle={{ backgroundColor: 'rgba(20, 20, 20, 0.8)', border: '1px solid #a855f7' }}/>
                    <Legend />
                    <Bar dataKey="conversions" fill="#8884d8" name="Conversions" />
                    <Bar dataKey="cpa" fill="#82ca9d" name="Cost Per Acquisition ($)" />
                </BarChart>
            </ResponsiveContainer>
        </div>
        <div className="analytics-widget">
            <h3 className="analytics-widget-title"><Icons.List size={20} /> All Campaigns</h3>
            <div className="analytics-table-container">
                <table className="analytics-table">
                    <thead><tr><th>Name</th><th>Channel</th><th>Spend</th><th>Conversions</th><th>CPA</th></tr></thead>
                    <tbody>
                        {campaignsData.map(c => (
                            <tr key={c.name}>
                                <td className="font-semibold">{c.name}</td>
                                <td>{c.channel}</td>
                                <td>${c.spend.toLocaleString()}</td>
                                <td>{c.conversions}</td>
                                <td>${c.cpa.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default CampaignPerformance;
