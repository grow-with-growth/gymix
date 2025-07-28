
import React from 'react';
import { Icons } from '../../icons';
import './marketplace-content-placeholder.css';

interface MarketplaceContentPlaceholderProps {
    title: string;
    breadcrumbs: string;
    icon: React.ReactNode;
}

const mockContent = [
    { id: 1, title: 'School Hoodie', category: 'Apparel', price: '45.00', image: 'https://images.unsplash.com/photo-1556156649-7c4d5a1a3a33?q=80&w=800&auto=format&fit=crop' },
    { id: 2, title: 'Algebra II Textbook', category: 'Books', price: '75.50', image: 'https://images.unsplash.com/photo-1544716278-e513176f20b5?q=80&w=800&auto=format&fit=crop' },
    { id: 3, title: 'Fall Gala Ticket', category: 'Events', price: '25.00', image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=800&auto=format&fit=crop' },
    { id: 4, title: 'Math Tutoring Session', category: 'Services', price: '50.00', image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=800&auto=format&fit=crop' },
    { id: 5, title: 'Spirit Week T-Shirt', category: 'Apparel', price: '18.00', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop' },
    { id: 6, title: 'Science Lab Kit', category: 'Supplies', price: '32.00', image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=800&auto=format&fit=crop' },
];

const MarketplaceContentPlaceholder: React.FC<MarketplaceContentPlaceholderProps> = ({ title, breadcrumbs, icon }) => {
  return (
    <div className="mp-placeholder-container">
        <div className="mp-header">
            <div className="mp-header-icon">{icon}</div>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">{title}</h2>
                <p className="text-gray-400">{breadcrumbs}</p>
            </div>
        </div>
        
        <div className="mp-filter-bar">
            <div className="mp-search-wrapper">
                <Icons.Search size={18} className="mp-search-icon" />
                <input type="text" placeholder={`Search in ${title}...`} className="mp-search-input" />
            </div>
            <div className="mp-filters">
                <select className="mp-filter-select">
                    <option>All Categories</option>
                    <option>Apparel</option>
                    <option>Books</option>
                    <option>Events</option>
                </select>
                <select className="mp-filter-select">
                    <option>Sort by Price</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
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
                        <Icons.ShoppingCart size={16}/> Add to Cart
                    </button>
                </div>
            ))}
        </div>
    </div>
  );
};

export default MarketplaceContentPlaceholder;