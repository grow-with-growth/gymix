
import React from 'react';
import { Icons } from '../../icons';
import './shared.css';

const TwoFactorAuth: React.FC = () => {
  return (
    <div className="settings-pane-container">
        <div className="settings-header">
            <Icons.Smartphone size={40} className="text-cyan-400"/>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">Two-Factor Authentication</h2>
                <p className="text-gray-400">Add an extra layer of security to user accounts.</p>
            </div>
        </div>

        <div className="settings-card">
            <div className="settings-form-row border-b border-white/10 pb-6">
                <div>
                    <label className="settings-label">Enforce 2FA</label>
                    <p className="settings-label-description">Require all users to set up two-factor authentication.</p>
                </div>
                <div className="flex items-center gap-4">
                    <label className="toggle-switch"><input type="checkbox" /><span className="slider"></span></label>
                    <span className="font-semibold text-gray-400">Disabled</span>
                </div>
            </div>
             <div className="settings-form-row pt-6">
                <div>
                    <label className="settings-label">Authentication Methods</label>
                    <p className="settings-label-description">Choose which methods users can use for 2FA.</p>
                </div>
                 <div className="space-y-4">
                    <label className="flex items-center gap-3">
                        <input type="radio" name="2fa" className="w-5 h-5" defaultChecked />
                        Authenticator App (Recommended)
                    </label>
                     <label className="flex items-center gap-3">
                        <input type="radio" name="2fa" className="w-5 h-5" />
                        SMS Text Message
                    </label>
                 </div>
            </div>
             <div className="settings-card-footer">
                <button className="settings-save-button"><Icons.Save size={18}/> Save Settings</button>
            </div>
        </div>
    </div>
  );
};

export default TwoFactorAuth;
