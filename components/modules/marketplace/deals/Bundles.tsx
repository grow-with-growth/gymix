import React from 'react';
import { Icons } from '../../../icons';
import { Product } from '../../../../types';
import ProductCard from '../ProductCard';
import '../content-styles.css';

const mockContent: Product[] = [
    { id: 'deal-1', title: 'New Student Welcome Pack', category: 'Bundle', price: '99.00', image: 'https://images.unsplash.com/photo-1594498822039-7a353a0f792b?q=80&w=800&auto=format&fit=crop' },
];

const Bundles: React.FC = () => {
  return (
    <div className="mp-placeholder-container">
        <div className="mp-header">
            <div className="mp-header-icon"><Icons.Package size={48} /></div>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">Bundles</h2>
                <p className="text-gray-400">Packages & Deals / Bundles</p>
            </div>
        </div>
        
        <div className="mp-filter-bar">
            <div className="mp-search-wrapper">
                <Icons.Search size={18} className="mp-search-icon" />
                <input type="text" placeholder={`Search in Bundles...`} className="mp-search-input" />
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

export default Bundles;