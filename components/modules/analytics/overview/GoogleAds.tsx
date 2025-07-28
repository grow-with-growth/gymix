import React from 'react';
import { Icons } from '../../../icons';
import '../shared.css';
import StatCard from '../../../ui/StatCard';

const campaignsData = [
    { name: 'Fall 2024 Enrollment Drive', impressions: 150234, clicks: 8765, ctr: '5.83%', cpc: '$1.25', spend: '$10,956' },
    { name: 'Summer STEM Camp Promotion', impressions: 85678, clicks: 6123, ctr: '7.15%', cpc: '$0.98', spend: '$6,000' },
    { name: 'New Arts Program Awareness', impressions: 210987, clicks: 4567, ctr: '2.16%', cpc: '$0.75', spend: '$3,425' },
    { name: 'Virtual Open House Signups', impressions: 55432, clicks: 5012, ctr: '9.04%', cpc: '$1.50', spend: '$7,518' },
];

const GoogleAds: React.FC = () => {
  return (
    <div className="analytics-content-pane">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Impressions" value="502k" icon={Icons.Eye} trend="+15% this month" trendColor="text-green-400" />
            <StatCard title="Total Clicks" value="24.4k" icon={Icons.MousePointer2} trend="+12% this month" trendColor="text-green-400" />
            <StatCard title="Avg. CTR" value="4.86%" icon={Icons.TrendingUp} trend="-0.5% this month" trendColor="text-red-400" />
            <StatCard title="Avg. CPC" value="$1.12" icon={Icons.Finance} trend="+0.05 this month" trendColor="text-red-400" />
        </div>
        <div className="analytics-widget">
            <h3 className="analytics-widget-title"><Icons.Marketing size={20} /> Top Campaign Performance</h3>
            <div className="analytics-table-container">
                <table className="analytics-table">
                    <thead>
                        <tr>
                            <th>Campaign Name</th>
                            <th>Impressions</th>
                            <th>Clicks</th>
                            <th>CTR</th>
                            <th>Avg. CPC</th>
                            <th>Spend</th>
                        </tr>
                    </thead>
                    <tbody>
                        {campaignsData.map(c => (
                            <tr key={c.name}>
                                <td className="font-semibold">{c.name}</td>
                                <td>{c.impressions.toLocaleString()}</td>
                                <td>{c.clicks.toLocaleString()}</td>
                                <td>{c.ctr}</td>
                                <td>{c.cpc}</td>
                                <td>{c.spend}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default GoogleAds;
