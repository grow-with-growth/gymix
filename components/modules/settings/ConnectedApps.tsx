
import React from 'react';
import { Icons } from '../../icons';
import './shared.css';

const apps = [
    { name: 'Google Drive', icon: Icons.Upload, connected: true },
    { name: 'Slack', icon: Icons.Send, connected: false },
    { name: 'Zoom', icon: Icons.Video, connected: true },
    { name: 'Canvas', icon: Icons.GraduationCap, connected: false },
];

const ConnectedApps: React.FC = () => {
  return (
    <div className="settings-pane-container">
        <div className="settings-header">
            <Icons.Puzzle size={40} className="text-cyan-400"/>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">Connected Apps</h2>
                <p className="text-gray-400">Integrate with your favorite third-party services.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {apps.map(app => {
                const AppIcon = app.icon;
                return (
                    <div key={app.name} className="settings-card flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-black/20 rounded-lg flex items-center justify-center">
                                <AppIcon size={24} className="text-cyan-400" />
                            </div>
                            <span className="font-semibold text-lg">{app.name}</span>
                        </div>
                        {app.connected ? (
                            <button className="settings-button bg-red-500/20 text-red-400 hover:bg-red-500/30">Disconnect</button>
                        ) : (
                            <button className="settings-button">Connect</button>
                        )}
                    </div>
                )
            })}
        </div>
    </div>
  );
};

export default ConnectedApps;
