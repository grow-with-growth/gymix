import React from 'react';
import { Icons } from '../../../icons';
import { Product } from '../../../../types';
import ProductCard from '../ProductCard';
import '../content-styles.css';

const mockContent: Product[] = [
    { id: 'prod-7', title: 'School Branded Mug', category: 'Gifts', price: '15.00', image: 'https://images.unsplash.com/photo-1514962615302-99925b44a49a?q=80&w=800&auto=format&fit=crop' },
    { id: 'prod-8', title: 'School Pennant', category: 'Gifts', price: '12.50', image: 'https://images.unsplash.com/photo-1629651532185-3214a1f6a8e3?q=80&w=800&auto=format&fit=crop' },
];

const GiftShop: React.FC = () => {
  return (
    <div className="mp-placeholder-container">
        <div className="mp-header">
            <div className="mp-header-icon"><Icons.GiftShop size={48} /></div>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">Gift Shop</h2>
                <p className="text-gray-400">Store / Gift Shop</p>
            </div>
        </div>
        
        <div className="mp-filter-bar">
            <div className="mp-search-wrapper">
                <Icons.Search size={18} className="mp-search-icon" />
                <input type="text" placeholder={`Search in Gift Shop...`} className="mp-search-input" />
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

export default GiftShop;