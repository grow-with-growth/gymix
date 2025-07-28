
import React from 'react';
import { Icons } from '../../icons';
import './shared.css';

const webhooks = [
    { url: 'https://api.example.com/enrollments', status: 'Active' },
    { url: 'https://api.example.com/payments', status: 'Active' },
    { url: 'https://api.thirdparty.com/sync', status: 'Error' },
];
const statusColors = { Active: 'text-green-400', Error: 'text-red-400' };

const Webhooks: React.FC = () => {
  return (
    <div className="settings-pane-container">
        <div className="settings-header">
            <Icons.Webhook size={40} className="text-cyan-400"/>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">Webhooks</h2>
                <p className="text-gray-400">Send event data to external URLs.</p>
            </div>
        </div>
        <div className="settings-card">
             <div className="settings-card-header">
                <h3 className="settings-card-title">Configured Webhooks</h3>
                <button className="settings-button"><Icons.Plus size={16}/> Add Webhook</button>
            </div>
            <table className="settings-table">
                <thead>
                    <tr><th>URL Endpoint</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                    {webhooks.map(hook => (
                        <tr key={hook.url}>
                            <td className="font-mono">{hook.url}</td>
                            <td><span className={statusColors[hook.status]}>{hook.status}</span></td>
                            <td>
                                <div className="flex gap-2">
                                    <button className="settings-button"><Icons.Edit size={16}/></button>
                                     <button className="settings-button text-red-400 hover:bg-red-500/20"><Icons.Trash2 size={16}/></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default Webhooks;
