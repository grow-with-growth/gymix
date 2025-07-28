import React from 'react';
import { Icons } from '../../../icons';
import { Product } from '../../../../types';
import ProductCard from '../ProductCard';
import '../content-styles.css';

const mockContent: Product[] = [
    { id: 'prod-1', title: 'School Hoodie', category: 'Apparel', price: '45.00', image: 'https://images.unsplash.com/photo-1556156649-7c4d5a1a3a3a33?q=80&w=800&auto=format&fit=crop' },
    { id: 'prod-5', title: 'Spirit Week T-Shirt', category: 'Apparel', price: '18.00', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop' },
];

const Apparel: React.FC = () => {
  return (
    <div className="mp-placeholder-container">
        <div className="mp-header">
            <div className="mp-header-icon"><Icons.Apparel size={48} /></div>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">Apparel</h2>
                <p className="text-gray-400">Store / Apparel</p>
            </div>
        </div>
        
        <div className="mp-filter-bar">
            <div className="mp-search-wrapper">
                <Icons.Search size={18} className="mp-search-icon" />
                <input type="text" placeholder={`Search in Apparel...`} className="mp-search-input" />
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

export default Apparel;