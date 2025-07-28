
import React from 'react';
import { Icons } from '../../../icons';
import '../content-styles.css';

const mockContent = [
    { id: 1, title: 'School Hoodie', category: 'Apparel', price: '45.00', image: 'https://images.unsplash.com/photo-1556156649-7c4d5a1a3a3a33?q=80&w=800&auto=format&fit=crop' },
];

const MyOrders: React.FC = () => {
  return (
    <div className="mp-placeholder-container">
        <div className="mp-header">
            <div className="mp-header-icon"><Icons.MyOrders size={48} /></div>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">My Orders</h2>
                <p className="text-gray-400">My Marketplace / My Orders</p>
            </div>
        </div>
        
        <div className="mp-filter-bar">
            <div className="mp-search-wrapper">
                <Icons.Search size={18} className="mp-search-icon" />
                <input type="text" placeholder={`Search in My Orders...`} className="mp-search-input" />
            </div>
            <div className="mp-filters">
                <select className="mp-filter-select">
                    <option>All Statuses</option>
                </select>
                <select className="mp-filter-select">
                    <option>Past 30 Days</option>
                </select>
            </div>
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
                        <p className="mp-card-price">${item.price}</p>
                    </div>
                    <button className="mp-card-add-btn">
                        <Icons.View size={16}/> View Details
                    </button>
                </div>
            ))}
        </div>
    </div>
  );
};

export default MyOrders;
