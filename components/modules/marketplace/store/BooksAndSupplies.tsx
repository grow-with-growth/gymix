import React from 'react';
import { Icons } from '../../../icons';
import { Product } from '../../../../types';
import ProductCard from '../ProductCard';
import '../content-styles.css';

const mockContent: Product[] = [
    { id: 'prod-2', title: 'Algebra II Textbook', category: 'Books', price: '75.50', image: 'https://images.unsplash.com/photo-1544716278-e513176f20b5?q=80&w=800&auto=format&fit=crop' },
    { id: 'prod-6', title: 'Science Lab Kit', category: 'Supplies', price: '32.00', image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=800&auto=format&fit=crop' },
];

const BooksAndSupplies: React.FC = () => {
  return (
    <div className="mp-placeholder-container">
        <div className="mp-header">
            <div className="mp-header-icon"><Icons.Books size={48} /></div>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">Books & Supplies</h2>
                <p className="text-gray-400">Store / Books & Supplies</p>
            </div>
        </div>
        
        <div className="mp-filter-bar">
            <div className="mp-search-wrapper">
                <Icons.Search size={18} className="mp-search-icon" />
                <input type="text" placeholder={`Search in Books & Supplies...`} className="mp-search-input" />
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

export default BooksAndSupplies;