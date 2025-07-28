
import React from 'react';
import { Icons } from '../../icons';
import './shared.css';

const PasswordPolicy: React.FC = () => {
  return (
    <div className="settings-pane-container">
        <div className="settings-header">
            <Icons.BookLock size={40} className="text-cyan-400"/>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">Password Policy</h2>
                <p className="text-gray-400">Define password requirements for all users.</p>
            </div>
        </div>
        <div className="settings-card">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <p className="font-medium text-white">Minimum 8 characters</p>
                    <label className="toggle-switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label>
                </div>
                 <div className="flex items-center justify-between">
                    <p className="font-medium text-white">Include one uppercase letter</p>
                    <label className="toggle-switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label>
                </div>
                 <div className="flex items-center justify-between">
                    <p className="font-medium text-white">Include one number</p>
                    <label className="toggle-switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label>
                </div>
                 <div className="flex items-center justify-between">
                    <p className="font-medium text-white">Include one special character</p>
                    <label className="toggle-switch"><input type="checkbox" /><span className="slider"></span></label>
                </div>
                <div className="settings-form-row border-t border-white/10 pt-6">
                     <div>
                        <label className="settings-label">Password Expiration</label>
                        <p className="settings-label-description">Force users to reset their passwords periodically.</p>
                    </div>
                    <div className="relative">
                        <input type="number" defaultValue="90" className="settings-input pr-16" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">days</span>
                    </div>
                </div>
            </div>
             <div className="settings-card-footer">
                <button className="settings-save-button"><Icons.Save size={18}/> Save Policy</button>
            </div>
        </div>
    </div>
  );
};

export default PasswordPolicy;
