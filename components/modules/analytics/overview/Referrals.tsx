import React from 'react';
import { Icons } from '../../../icons';
import '../shared.css';

const referralsData = [
  { source: 'greatschools.org', users: 280, sessions: 350 },
  { source: 'niche.com', users: 210, sessions: 250 },
  { source: 'facebook.com', users: 150, sessions: 180 },
  { source: 'twitter.com', users: 95, sessions: 110 },
  { source: 'localparentblog.com', users: 75, sessions: 85 },
  { source: 'linkedin.com', users: 40, sessions: 45 },
];

const Referrals: React.FC = () => {
  return (
    <div className="analytics-content-pane">
        <div className="analytics-widget">
             <h3 className="analytics-widget-title"><Icons.Send size={20} /> Top Referral Sources</h3>
             <div className="analytics-table-container">
                <table className="analytics-table">
                    <thead>
                        <tr>
                            <th>Source</th>
                            <th>Users</th>
                            <th>Sessions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {referralsData.map(r => (
                            <tr key={r.source}>
                                <td className="font-semibold">{r.source}</td>
                                <td>{r.users.toLocaleString()}</td>
                                <td>{r.sessions.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>
    </div>
  );
};

export default Referrals;
