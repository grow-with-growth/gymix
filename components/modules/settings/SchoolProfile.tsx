
import React from 'react';
import { Icons } from '../../icons';
import './shared.css';

const SchoolProfile: React.FC = () => {
  return (
    <div className="settings-pane-container">
        <div className="settings-header">
            <Icons.School size={40} className="text-cyan-400"/>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">School Profile</h2>
                <p className="text-gray-400">Manage your school's public information.</p>
            </div>
        </div>
        
        <div className="settings-card">
            <div className="space-y-6">
                <div className="settings-form-row">
                    <label className="settings-label" htmlFor="school-name">School Name</label>
                    <input id="school-name" type="text" className="settings-input" defaultValue="Aura Academy" />
                </div>
                 <div className="settings-form-row">
                    <label className="settings-label" htmlFor="school-address">Address</label>
                    <input id="school-address" type="text" className="settings-input" defaultValue="123 Education Lane, Knowledge City, 12345" />
                </div>
                 <div className="settings-form-row">
                    <label className="settings-label" htmlFor="school-phone">Phone Number</label>
                    <input id="school-phone" type="tel" className="settings-input" defaultValue="+1 (555) 123-4567" />
                </div>
                 <div className="settings-form-row">
                    <label className="settings-label" htmlFor="school-email">Public Email</label>
                    <input id="school-email" type="email" className="settings-input" defaultValue="contact@aura.edu" />
                </div>
            </div>
            <div className="settings-card-footer">
                <button className="settings-save-button"><Icons.Save size={18}/> Save Changes</button>
            </div>
        </div>
    </div>
  );
};

export default SchoolProfile;
