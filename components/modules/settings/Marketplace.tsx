
import React from 'react';
import { Icons } from '../../icons';
import './shared.css';

const Marketplace: React.FC = () => {
  return (
    <div className="settings-pane-container">
        <div className="settings-header">
            <Icons.Store size={40} className="text-cyan-400"/>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">Marketplace</h2>
                <p className="text-gray-400">Configure settings for your school's marketplace.</p>
            </div>
        </div>
        
        <div className="settings-card">
             <div className="settings-form-row border-b border-white/10 pb-6">
                <div>
                    <label className="settings-label">Marketplace Status</label>
                    <p className="settings-label-description">Enable or disable the marketplace for all users.</p>
                </div>
                <div className="flex items-center gap-4">
                    <label className="toggle-switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label>
                    <span className="font-semibold text-green-400">Enabled</span>
                </div>
            </div>
             <div className="settings-form-row pt-6">
                <div>
                    <label className="settings-label">Commission Rate</label>
                    <p className="settings-label-description">Set the percentage your school takes from peer-to-peer sales.</p>
                </div>
                <div className="relative">
                    <input type="number" defaultValue="5" className="settings-input pl-8" />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                </div>
            </div>
             <div className="settings-card-footer">
                <button className="settings-save-button"><Icons.Save size={18}/> Save Changes</button>
            </div>
        </div>
    </div>
  );
};

export default Marketplace;
