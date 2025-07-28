import React from 'react';
import { Icons } from '../../../icons';
import '../content-styles.css';
import '../ProductCard.css'; // Re-use styles

const mockContent = [
    { id: 3, title: 'Fall Gala Ticket', category: 'Events', price: '25.00', image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=800&auto=format&fit=crop' },
];

const MyTickets: React.FC = () => {
  return (
    <div className="mp-placeholder-container">
        <div className="mp-header">
            <div className="mp-header-icon"><Icons.Ticket size={48} /></div>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">My Tickets</h2>
                <p className="text-gray-400">Events / My Tickets</p>
            </div>
        </div>
        
        <div className="mp-filter-bar">
            <div className="mp-search-wrapper">
                <Icons.Search size={18} className="mp-search-icon" />
                <input type="text" placeholder={`Search in My Tickets...`} className="mp-search-input" />
            </div>
            <div className="mp-filters">
                <select className="mp-filter-select">
                    <option>All Categories</option>
                </select>
                <select className="mp-filter-select">
                    <option>Sort by Price</option>
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
                        <Icons.View size={16}/> View Ticket
                    </button>
                </div>
            ))}
        </div>
    </div>
  );
};

export default MyTickets;