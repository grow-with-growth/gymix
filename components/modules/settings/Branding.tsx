
import React from 'react';
import { Icons } from '../../icons';
import './shared.css';

const Branding: React.FC = () => {
  return (
    <div className="settings-pane-container">
        <div className="settings-header">
            <Icons.Branding size={40} className="text-cyan-400"/>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">Branding</h2>
                <p className="text-gray-400">Customize your school's look and feel.</p>
            </div>
        </div>

        <div className="settings-card">
            <h3 className="settings-card-title mb-6">School Logo</h3>
            <div className="flex items-center gap-6">
                <div className="w-48 h-24 bg-black/20 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
                     <Icons.Image size={40} className="text-gray-500"/>
                </div>
                <div>
                    <p className="text-gray-400 mb-2">Upload a PNG or JPG. Max size: 5MB.</p>
                    <button className="settings-button"><Icons.Upload size={16}/> Upload Logo</button>
                </div>
            </div>
        </div>

        <div className="settings-card">
             <h3 className="settings-card-title mb-6">Color Scheme</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <label className="settings-label">Primary Color</label>
                    <div className="flex items-center gap-2 settings-input">
                        <input type="color" defaultValue="#8b5cf6" className="w-8 h-8"/>
                        <span>#8B5CF6</span>
                    </div>
                </div>
                 <div className="flex flex-col gap-2">
                    <label className="settings-label">Accent Color</label>
                    <div className="flex items-center gap-2 settings-input">
                        <input type="color" defaultValue="#22d3ee" className="w-8 h-8"/>
                        <span>#22D3EE</span>
                    </div>
                </div>
             </div>
        </div>

         <div className="flex justify-end">
            <button className="settings-save-button"><Icons.Save size={18}/> Save Changes</button>
        </div>
    </div>
  );
};

export default Branding;
