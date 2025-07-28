
import React from 'react';
import { Icons } from '../../../icons';
import '../content-styles.css';

const mockContent = [
    { id: 1, title: 'Visa **** 4242', category: 'Credit Card', price: 'Expires 12/26', image: 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?q=80&w=800&auto=format&fit=crop' },
];

const PaymentSettings: React.FC = () => {
  return (
    <div className="mp-placeholder-container">
        <div className="mp-header">
            <div className="mp-header-icon"><Icons.PaymentSettings size={48} /></div>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">Payment Settings</h2>
                <p className="text-gray-400">My Marketplace / Payment Settings</p>
            </div>
        </div>
        
        <div className="mp-filter-bar">
            <p className="text-gray-300 font-semibold">Manage your saved payment methods.</p>
             <button className="mp-card-add-btn !w-auto">
                <Icons.Plus size={16}/> Add New Card
            </button>
        </div>

        <div className="mp-content-grid">
            {mockContent.map(item => (
                <div key={item.id} className="mp-content-card">
                    <div className="mp-card-image-wrapper">
                        <img src={item.image} alt={item.title} className="mp-card-image" />
                        <div className="mp-card-category">{item.category}</div>
                    </div>
                    <div className="mp-card-details">
                        <h4 className="mp-card-title">{item.title}</h4>
                        <p className="mp-card-price">{item.price}</p>
                    </div>
                    <button className="mp-card-add-btn">
                        <Icons.Edit size={16}/> Edit
                    </button>
                </div>
            ))}
        </div>
    </div>
  );
};

export default PaymentSettings;
