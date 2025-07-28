import React from 'react';
import '../shared.css';
import './Campaigns.css';
import { Icons } from '../../../icons';

const campaigns = [
  { name: "Fall Open House 2024", channel: "Email & Social", status: "Active", budget: 2000, spent: 1500, cpl: 25.50 },
  { name: "Summer STEM Camp", channel: "Google Ads", status: "Completed", budget: 3000, spent: 2950, cpl: 42.75 },
  { name: "New Arts Program", channel: "Facebook", status: "Draft", budget: 1500, spent: 0, cpl: 0 },
  { name: "2025 Enrollment Drive", channel: "Multi-channel", status: "Planning", budget: 10000, spent: 0, cpl: 0 },
];

const statusConfig = {
    Active: { color: 'text-green-400', icon: Icons.Activity },
    Completed: { color: 'text-blue-400', icon: Icons.CheckCircle },
    Draft: { color: 'text-yellow-400', icon: Icons.Edit },
    Planning: { color: 'text-gray-400', icon: Icons.ClipboardCheck },
};

const Campaigns: React.FC = () => {
  return (
    <div className="campaigns-container">
        <div className="campaigns-header">
            <Icons.Marketing size={40} className="text-cyan-400"/>
            <h2 className="font-orbitron text-3xl font-bold text-white">Marketing Campaigns</h2>
            <button className="new-campaign-btn"><Icons.Plus/> New Campaign</button>
        </div>
        <div className="campaigns-grid">
            {campaigns.map(c => {
                const StatusIcon = statusConfig[c.status].icon;
                return (
                    <div key={c.name} className="campaign-card">
                        <div className="card-header">
                            <h3 className="card-title">{c.name}</h3>
                            <div className={`card-status ${statusConfig[c.status].color}`}>
                                <StatusIcon size={16}/>
                                <span>{c.status}</span>
                            </div>
                        </div>
                        <p className="card-channel">{c.channel}</p>
                        <div className="card-stats">
                            <div>
                                <p className="stat-label">Spent</p>
                                <p className="stat-value">${c.spent.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="stat-label">Budget</p>
                                <p className="stat-value-secondary">${c.budget.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="stat-label">Cost / Lead</p>
                                <p className="stat-value">${c.cpl.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="progress-bar-wrapper">
                            <div className="progress-bar-bg">
                                <div className="progress-bar-fg" style={{width: `${(c.spent/c.budget)*100}%`}}></div>
                            </div>
                            <span className="progress-label">{Math.round((c.spent/c.budget)*100)}%</span>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};

export default Campaigns;
