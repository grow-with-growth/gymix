import React from 'react';
import { Icons } from '../../../icons';
import { Product } from '../../../../types';
import ProductCard from '../ProductCard';
import '../content-styles.css';

const mockContent: Product[] = [
    { id: 'prod-9', title: 'Graphing Calculator', category: 'Tech', price: '120.00', image: 'https://images.unsplash.com/photo-1596131397999-90610f3c5554?q=80&w=800&auto=format&fit=crop' },
    { id: 'prod-10', title: 'eBook: Intro to Physics', category: 'Digital', price: '22.50', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop' },
];

const TechAndDigital: React.FC = () => {
  return (
    <div className="mp-placeholder-container">
        <div className="mp-header">
            <div className="mp-header-icon"><Icons.Tech size={48} /></div>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">Tech & Digital</h2>
                <p className="text-gray-400">Store / Tech & Digital</p>
            </div>
        </div>
        
        <div className="mp-filter-bar">
            <div className="mp-search-wrapper">
                <Icons.Search size={18} className="mp-search-icon" />
                <input type="text" placeholder={`Search in Tech & Digital...`} className="mp-search-input" />
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
                <ProductCard key={item.id} product={item} />
            ))}
        </div>
    </div>
  );
};

export default TechAndDigital;