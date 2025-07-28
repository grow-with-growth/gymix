
import React from 'react';
import { Icons } from '../../icons';
import './shared.css';

const Localization: React.FC = () => {
  return (
    <div className="settings-pane-container">
        <div className="settings-header">
            <Icons.Globe size={40} className="text-cyan-400"/>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">Localization</h2>
                <p className="text-gray-400">Set your school's language, timezone, and currency.</p>
            </div>
        </div>
        
        <div className="settings-card">
            <div className="space-y-6">
                <div className="settings-form-row">
                    <div>
                        <label className="settings-label">Language</label>
                        <p className="settings-label-description">The primary language for the application.</p>
                    </div>
                    <select className="settings-select">
                        <option>English (United States)</option>
                        <option>Spanish (Spain)</option>
                        <option>French (France)</option>
                    </select>
                </div>
                 <div className="settings-form-row">
                    <div>
                        <label className="settings-label">Timezone</label>
                        <p className="settings-label-description">Used for scheduling and timestamps.</p>
                    </div>
                    <select className="settings-select">
                        <option>(GMT-05:00) Eastern Time</option>
                        <option>(GMT-06:00) Central Time</option>
                        <option>(GMT-07:00) Mountain Time</option>
                        <option>(GMT-08:00) Pacific Time</option>
                    </select>
                </div>
                 <div className="settings-form-row">
                    <div>
                        <label className="settings-label">Currency</label>
                        <p className="settings-label-description">Used for billing and marketplace transactions.</p>
                    </div>
                    <select className="settings-select">
                        <option>USD ($)</option>
                        <option>EUR (€)</option>
                        <option>GBP (£)</option>
                    </select>
                </div>
            </div>
             <div className="settings-card-footer">
                <button className="settings-save-button"><Icons.Save size={18}/> Save Changes</button>
            </div>
        </div>
    </div>
  );
};

export default Localization;
