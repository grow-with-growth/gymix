
import React from 'react';
import { Icons } from '../../icons';
import './shared.css';

const SubscriptionPlan: React.FC = () => {
  return (
    <div className="settings-pane-container">
        <div className="settings-header">
            <Icons.CreditCard size={40} className="text-cyan-400"/>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">Subscription Plan</h2>
                <p className="text-gray-400">Manage your subscription and view usage.</p>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 settings-card">
                 <div className="settings-card-header">
                    <div>
                        <h3 className="settings-card-title">Current Plan</h3>
                        <p className="settings-card-description">Your school is on the Enterprise plan.</p>
                    </div>
                    <span className="px-4 py-1 bg-purple-500/30 text-purple-300 rounded-full font-bold">Enterprise</span>
                </div>
                <div className="flex gap-4">
                    <button className="settings-save-button">Change Plan</button>
                    <button className="settings-button">Contact Sales</button>
                </div>
            </div>
            <div className="settings-card">
                <h3 className="settings-card-title mb-4">Usage</h3>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-1"><span className="text-gray-300">Active Students</span><span>1,284 / 2,000</span></div>
                        <div className="w-full bg-black/20 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{width: '64%'}}></div></div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1"><span className="text-gray-300">Storage</span><span>340GB / 1TB</span></div>
                        <div className="w-full bg-black/20 rounded-full h-2"><div className="bg-cyan-500 h-2 rounded-full" style={{width: '34%'}}></div></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default SubscriptionPlan;
