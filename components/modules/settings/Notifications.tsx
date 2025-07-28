
import React from 'react';
import { Icons } from '../../icons';
import './shared.css';

const Notifications: React.FC = () => {
  return (
    <div className="settings-pane-container">
        <div className="settings-header">
            <Icons.Bell size={40} className="text-cyan-400"/>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">Notifications</h2>
                <p className="text-gray-400">Manage how you receive notifications.</p>
            </div>
        </div>
        <div className="settings-card">
            <div className="space-y-6">
                <h3 className="settings-card-title text-lg">Email Notifications</h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-white">New Enrollments</p>
                        <p className="text-sm text-gray-400">Get notified when a new student enrolls.</p>
                    </div>
                    <label className="toggle-switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label>
                </div>
                 <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-white">Parent Messages</p>
                        <p className="text-sm text-gray-400">Receive an email when you get a new message.</p>
                    </div>
                    <label className="toggle-switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label>
                </div>
                 <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-white">System Updates</p>
                        <p className="text-sm text-gray-400">Receive news and updates about the platform.</p>
                    </div>
                    <label className="toggle-switch"><input type="checkbox" /><span className="slider"></span></label>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Notifications;
