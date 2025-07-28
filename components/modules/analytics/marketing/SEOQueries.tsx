import React from 'react';
import { Icons } from '../../../icons';
import '../shared.css';

const queriesData = [
    { query: 'best private school near me', impressions: 12500, clicks: 850, position: 2.5 },
    { query: 'school with strong arts program', impressions: 9800, clicks: 620, position: 4.1 },
    { query: 'k-12 school tuition', impressions: 15200, clicks: 580, position: 1.8 },
    { query: '[school name]', impressions: 25000, clicks: 2500, position: 1.1 },
    { query: 'high school STEM curriculum', impressions: 7500, clicks: 410, position: 5.6 },
];

const SEOQueries: React.FC = () => {
  return (
    <div className="analytics-content-pane">
        <div className="analytics-widget">
            <h3 className="analytics-widget-title"><Icons.Search size={20} /> Top SEO Queries</h3>
            <div className="analytics-table-container">
                <table className="analytics-table">
                    <thead>
                        <tr>
                            <th>Query</th>
                            <th>Impressions</th>
                            <th>Clicks</th>
                            <th>Avg. Position</th>
                        </tr>
                    </thead>
                    <tbody>
                        {queriesData.map(q => (
                            <tr key={q.query}>
                                <td className="font-semibold">{q.query}</td>
                                <td>{q.impressions.toLocaleString()}</td>
                                <td>{q.clicks.toLocaleString()}</td>
                                <td>{q.position.toFixed(1)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default SEOQueries;
