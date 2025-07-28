
import React from 'react';
import { Icons } from '../../icons';
import './shared.css';

const methods = [
    { id: 1, type: 'VISA', last4: '4242', expiry: '12/26' },
    { id: 2, type: 'MasterCard', last4: '5555', expiry: '08/25' },
];

const PaymentMethods: React.FC = () => {
  return (
    <div className="settings-pane-container">
        <div className="settings-header">
            <Icons.Wallet size={40} className="text-cyan-400"/>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">Payment Methods</h2>
                <p className="text-gray-400">Manage your saved payment methods for billing.</p>
            </div>
        </div>
        <div className="settings-card">
            <div className="settings-card-header">
                <h3 className="settings-card-title">Saved Cards</h3>
                <button className="settings-button"><Icons.Plus size={16}/> Add New Method</button>
            </div>
            <div className="space-y-4">
                {methods.map(method => (
                    <div key={method.id} className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                        <div className="flex items-center gap-4">
                            <Icons.CreditCard size={24} />
                            <div>
                                <p className="font-semibold text-white">{method.type} ending in {method.last4}</p>
                                <p className="text-sm text-gray-400">Expires {method.expiry}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <button className="settings-button">Edit</button>
                             <button className="settings-button text-red-400 hover:bg-red-500/20">Remove</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default PaymentMethods;
