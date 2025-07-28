
import React from 'react';
import '../shared.css';
import './Branding.css';
import { Icons } from '../../../icons';

const Branding: React.FC = () => {
  return (
    <div className="branding-container">
        <div className="branding-header">
            <Icons.Branding size={48} className="text-cyan-400"/>
            <h2 className="font-orbitron text-3xl font-bold text-white">School Branding</h2>
            <p className="text-gray-400">Customize the look and feel of your school's public pages and communications.</p>
        </div>
        <div className="branding-content">
            {/* Logo Upload */}
            <div className="branding-section">
                <h3 className="section-title">School Logo</h3>
                <div className="logo-upload-area">
                    <div className="logo-preview">
                        <Icons.Image size={48} className="text-gray-500"/>
                        <p>Current Logo</p>
                    </div>
                    <div className="logo-actions">
                        <p className="text-gray-300 mb-2">Upload a new logo. Recommended size: 400x100px.</p>
                        <button className="upload-btn">
                            <Icons.Upload size={16} />
                            Upload New Logo
                        </button>
                    </div>
                </div>
            </div>

            {/* Color Scheme */}
            <div className="branding-section">
                <h3 className="section-title">Color Scheme</h3>
                <div className="color-grid">
                    <div className="color-picker-wrapper">
                        <label className="color-label">Primary Color</label>
                        <div className="color-input-group">
                            <input type="color" defaultValue="#8b5cf6" className="color-picker-input"/>
                            <span>#8B5CF6</span>
                        </div>
                    </div>
                    <div className="color-picker-wrapper">
                        <label className="color-label">Accent Color</label>
                        <div className="color-input-group">
                            <input type="color" defaultValue="#22d3ee" className="color-picker-input"/>
                             <span>#22D3EE</span>
                        </div>
                    </div>
                </div>
            </div>
             <div className="branding-section">
                <button className="save-changes-btn">
                    <Icons.Save size={18}/>
                    Save Changes
                </button>
             </div>
        </div>
    </div>
  );
};

export default Branding;
