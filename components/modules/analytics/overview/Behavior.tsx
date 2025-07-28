import React from 'react';
import { Icons } from '../../../icons';
import '../shared.css';
import StatCard from '../../../ui/StatCard';

const landingPages = [
    { page: '/', sessions: 5200, bounce: '42.1%' },
    { page: '/admissions', sessions: 2100, bounce: '55.6%' },
    { page: '/academics/programs', sessions: 1850, bounce: '35.2%' },
    { page: '/blog/top-10-reasons', sessions: 1500, bounce: '75.8%' },
];
const exitPages = [
    { page: '/apply/step-3', exits: 1200, exitRate: '65.2%' },
    { page: '/', exits: 950, exitRate: '18.3%' },
    { page: '/contact-us', exits: 800, exitRate: '80.1%' },
    { page: '/tuition-and-fees', exits: 720, exitRate: '45.7%' },
];

const Behavior: React.FC = () => {
  return (
    <div className="analytics-content-pane">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <StatCard title="Bounce Rate" value="48.2%" icon={Icons.TrendingDown} trend="-2.5% this month" trendColor="text-green-400" />
             <StatCard title="Pages / Session" value="4.6" icon={Icons.BookCopy} trend="+0.2 this month" trendColor="text-green-400" />
             <StatCard title="Avg. Session Duration" value="3m 12s" icon={Icons.Time} trend="+15s this month" trendColor="text-green-400" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="analytics-widget">
                <h3 className="analytics-widget-title"><Icons.LogIn size={20}/> Top Landing Pages</h3>
                <div className="analytics-table-container">
                    <table className="analytics-table">
                        <thead><tr><th>Page</th><th>Sessions</th><th>Bounce Rate</th></tr></thead>
                        <tbody>
                            {landingPages.map(p => <tr key={p.page}><td>{p.page}</td><td>{p.sessions}</td><td>{p.bounce}</td></tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="analytics-widget">
                 <h3 className="analytics-widget-title"><Icons.LogOut size={20}/> Top Exit Pages</h3>
                 <div className="analytics-table-container">
                    <table className="analytics-table">
                        <thead><tr><th>Page</th><th>Exits</th><th>Exit Rate</th></tr></thead>
                        <tbody>
                            {exitPages.map(p => <tr key={p.page}><td>{p.page}</td><td>{p.exits}</td><td>{p.exitRate}</td></tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Behavior;
