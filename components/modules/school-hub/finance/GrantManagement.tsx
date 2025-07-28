
import React from 'react';
import '../shared.css';
import './GrantManagement.css';
import { Icons } from '../../../icons';

const grants = [
    { id: 1, name: "STEM Education Grant", status: "Submitted", deadline: "2024-11-15", amount: 50000 },
    { id: 2, name: "Arts & Culture Fund", status: "Awarded", deadline: "2024-09-01", amount: 25000 },
    { id: 3, name: "Technology Upgrade Initiative", status: "Drafting", deadline: "2024-12-01", amount: 100000 },
    { id: 4, name: "Community Garden Project", status: "Rejected", deadline: "2024-10-10", amount: 5000 },
];

const statusColors = {
    Drafting: 'bg-yellow-500/20 text-yellow-400',
    Submitted: 'bg-blue-500/20 text-blue-400',
    Awarded: 'bg-green-500/20 text-green-400',
    Rejected: 'bg-red-500/20 text-red-400',
};


const GrantManagement: React.FC = () => {
  return (
    <div className="grant-mgmt-container">
        <div className="grant-mgmt-header">
            <h2 className="font-orbitron text-3xl font-bold text-white">Grant Management</h2>
            <button className="new-grant-btn"><Icons.Plus/> New Application</button>
        </div>
        <div className="table-wrapper">
            <table className="grant-table">
                <thead>
                    <tr><th>Grant Name</th><th>Status</th><th>Deadline</th><th>Amount</th><th>Actions</th></tr>
                </thead>
                <tbody>
                    {grants.map(g => (
                        <tr key={g.id}>
                            <td>{g.name}</td>
                            <td><span className={`status-badge ${statusColors[g.status]}`}>{g.status}</span></td>
                            <td>{g.deadline}</td>
                            <td>${g.amount.toLocaleString()}</td>
                            <td>
                                <button className="action-btn"><Icons.Edit size={16}/> Edit</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default GrantManagement;
