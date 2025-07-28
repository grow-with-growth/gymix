
import React from 'react';
import { Icons } from '../../icons';
import './shared.css';

const parents = [
    { name: 'Alex Black', email: 'alex.black@example.com', student: 'Jason Black' },
    { name: 'Maria Rodriguez', email: 'maria.r@example.com', student: 'Sophia Rodriguez' },
];

const Parents: React.FC = () => {
  return (
    <div className="settings-pane-container">
        <div className="settings-header">
            <Icons.Users size={40} className="text-cyan-400"/>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">Parent Accounts</h2>
                <p className="text-gray-400">Manage parent user accounts.</p>
            </div>
        </div>
        <div className="settings-card">
             <div className="settings-card-header">
                <h3 className="settings-card-title">All Parents</h3>
                <button className="settings-button"><Icons.UserPlus size={16}/> Invite Parent</button>
            </div>
            <table className="settings-table">
                <thead><tr><th>Name</th><th>Email</th><th>Student</th><th>Actions</th></tr></thead>
                <tbody>
                    {parents.map(p => (
                        <tr key={p.email}>
                            <td>{p.name}</td>
                            <td>{p.email}</td>
                            <td>{p.student}</td>
                            <td><button className="settings-button">Manage</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default Parents;
