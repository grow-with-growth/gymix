import React from 'react';
import { Icons } from '../../../icons';
import { Product } from '../../../../types';
import ProductCard from '../ProductCard';
import '../content-styles.css';

const mockContent: Product[] = [
     { id: 'event-1', title: 'Fall Gala Ticket', category: 'Events', price: '25.00', image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=800&auto=format&fit=crop' },
];

const UpcomingEvents: React.FC = () => {
  return (
    <div className="mp-placeholder-container">
        <div className="mp-header">
            <div className="mp-header-icon"><Icons.CalendarDays size={48} /></div>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">Upcoming Events</h2>
                <p className="text-gray-400">Events / Upcoming Events</p>
            </div>
        </div>
        
        <div className="mp-filter-bar">
            <div className="mp-search-wrapper">
                <Icons.Search size={18} className="mp-search-icon" />
                <input type="text" placeholder={`Search in Upcoming Events...`} className="mp-search-input" />
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
                <ProductCard key={item.id} product={item} actionText="Book Now" actionIcon={Icons.Ticket} />
            ))}
        </div>
    </div>
  );
};

export default UpcomingEvents;