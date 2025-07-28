
import React from 'react';
import { Icons } from '../../icons';
import './shared.css';

const auditLogs = [
    { user: 'Admin', action: 'Updated branding colors', ip: '192.168.1.1', time: '2 hours ago' },
    { user: 'jane.doe@school.edu', action: 'Logged in', ip: '203.0.113.25', time: '5 hours ago' },
    { user: 'Admin', action: 'Revoked API key "Mobile App API"', ip: '192.168.1.1', time: '1 day ago' },
    { user: 'john.smith@school.edu', action: 'Failed login attempt', ip: '104.28.212.2', time: '2 days ago' },
];

const AuditLog: React.FC = () => {
  return (
    <div className="settings-pane-container">
        <div className="settings-header">
            <Icons.History size={40} className="text-cyan-400"/>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">Audit Log</h2>
                <p className="text-gray-400">Track important activities within your account.</p>
            </div>
        </div>
        <div className="settings-card">
            <table className="settings-table">
                <thead>
                    <tr><th>User</th><th>Action</th><th>IP Address</th><th>Time</th></tr>
                </thead>
                <tbody>
                    {auditLogs.map((log, index) => (
                        <tr key={index}>
                            <td>{log.user}</td>
                            <td>{log.action}</td>
                            <td>{log.ip}</td>
                            <td>{log.time}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default AuditLog;
