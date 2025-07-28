
import React from 'react';
import { Icons } from '../../icons';
import './shared.css';

const staff = [
    { name: 'Admin User', email: 'admin@school.edu', role: 'Admin' },
    { name: 'Jane Doe', email: 'jane.doe@school.edu', role: 'Teacher' },
];

const Staff: React.FC = () => {
  return (
    <div className="settings-pane-container">
        <div className="settings-header">
            <Icons.Users size={40} className="text-cyan-400"/>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">Staff Accounts</h2>
                <p className="text-gray-400">Manage staff user accounts and permissions.</p>
            </div>
        </div>
        <div className="settings-card">
             <div className="settings-card-header">
                <h3 className="settings-card-title">All Staff</h3>
                <button className="settings-button"><Icons.UserPlus size={16}/> Invite Staff</button>
            </div>
            <table className="settings-table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
                <tbody>
                    {staff.map(s => (
                        <tr key={s.email}>
                            <td>{s.name}</td>
                            <td>{s.email}</td>
                            <td>{s.role}</td>
                            <td><button className="settings-button">Manage</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default Staff;
