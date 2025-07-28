
import React from 'react';
import { Icons } from '../../icons';
import './shared.css';

const apiKeys = [
    { id: 1, name: 'Main Website Integration', key: 'sk_live_...aBcDe', created: '2024-08-15' },
    { id: 2, name: 'Mobile App API', key: 'sk_live_...fGhIj', created: '2024-09-01' },
];

const ApiKeys: React.FC = () => {
  return (
    <div className="settings-pane-container">
        <div className="settings-header">
            <Icons.KeyRound size={40} className="text-cyan-400"/>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">API Keys</h2>
                <p className="text-gray-400">Manage API keys for external integrations.</p>
            </div>
        </div>

        <div className="settings-card">
            <div className="settings-card-header">
                <div>
                    <h3 className="settings-card-title">Active Keys</h3>
                    <p className="settings-card-description">These keys have access to your school's API.</p>
                </div>
                <button className="settings-save-button">
                    <Icons.Plus size={18}/> Generate New Key
                </button>
            </div>
            
            <table className="settings-table">
                <thead>
                    <tr><th>Name</th><th>Key</th><th>Created</th><th>Actions</th></tr>
                </thead>
                <tbody>
                    {apiKeys.map(key => (
                        <tr key={key.id}>
                            <td>{key.name}</td>
                            <td className="font-mono">{key.key}</td>
                            <td>{key.created}</td>
                            <td>
                                <div className="flex gap-2">
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

export default ApiKeys;
