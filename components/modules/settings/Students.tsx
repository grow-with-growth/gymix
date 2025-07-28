
import React from 'react';
import { Icons } from '../../icons';
import './shared.css';

const students = [
    { name: 'Jason Black', email: 'jason.black@student.edu', grade: '11th' },
    { name: 'Sophia Rodriguez', email: 'sophia.r@student.edu', grade: '9th' },
];

const Students: React.FC = () => {
  return (
    <div className="settings-pane-container">
        <div className="settings-header">
            <Icons.Students size={40} className="text-cyan-400"/>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">Student Accounts</h2>
                <p className="text-gray-400">Manage student user accounts.</p>
            </div>
        </div>
        <div className="settings-card">
             <div className="settings-card-header">
                <h3 className="settings-card-title">All Students</h3>
                <button className="settings-button"><Icons.UserPlus size={16}/> Invite Student</button>
            </div>
            <table className="settings-table">
                <thead><tr><th>Name</th><th>Email</th><th>Grade</th><th>Actions</th></tr></thead>
                <tbody>
                    {students.map(s => (
                        <tr key={s.email}>
                            <td>{s.name}</td>
                            <td>{s.email}</td>
                            <td>{s.grade}</td>
                            <td><button className="settings-button">Manage</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default Students;
