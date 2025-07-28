
import React from 'react';
import { Icons } from '../../../icons';
import '../content-styles.css';

const mockContent = [
    { id: 1, title: 'Used Algebra Textbook', category: 'Books', price: '35.00', image: 'https://images.unsplash.com/photo-1592933610196-51de685781a7?q=80&w=800&auto=format&fit=crop' },
];

const MyListings: React.FC = () => {
  return (
    <div className="mp-placeholder-container">
        <div className="mp-header">
            <div className="mp-header-icon"><Icons.MyListings size={48} /></div>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">My Listings</h2>
                <p className="text-gray-400">My Marketplace / My Listings</p>
            </div>
        </div>
        
        <div className="mp-filter-bar">
            <div className="mp-search-wrapper">
                <Icons.Search size={18} className="mp-search-icon" />
                <input type="text" placeholder={`Search in My Listings...`} className="mp-search-input" />
            </div>
            <div className="mp-filters">
                 <button className="mp-card-add-btn !w-auto">
                    <Icons.Plus size={16}/> New Listing
                </button>
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
                        <Icons.Edit size={16}/> Manage Listing
                    </button>
                </div>
            ))}
        </div>
    </div>
  );
};

export default MyListings;
