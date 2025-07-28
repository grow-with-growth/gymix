import React from 'react';
import { Icons } from '../../../icons';
import '../content-styles.css';

const featuredProduct = {
    id: 'prod-1',
    title: 'School Hoodie',
    category: 'Apparel',
    price: '45.00',
    image: 'https://plus.unsplash.com/premium_photo-1683125642634-a1503c516558?q=80&w=800&auto=format&fit=crop'
};

const categories = [
    { name: 'Books', image: 'https://images.unsplash.com/photo-1544716278-e513176f20b5?q=80&w=800&auto=format&fit=crop' },
    { name: 'Events', image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=800&auto=format&fit=crop' },
    { name: 'Services', image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=800&auto=format&fit=crop' },
    { name: 'Apparel', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop' },
    { name: 'Supplies', image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=800&auto=format&fit=crop' },
];

const BrowseAll: React.FC = () => {
  return (
    <div className="mp-placeholder-container">
        <div className="mp-header">
            <div className="mp-header-icon"><Icons.ShoppingCart size={48} /></div>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">Browse All Products</h2>
                <p className="text-gray-400">Store / Browse All</p>
            </div>
        </div>
        
        <div className="mp-filter-bar">
            <div className="mp-search-wrapper">
                <Icons.Search size={18} className="mp-search-icon" />
                <input type="text" placeholder={`Search in All Products...`} className="mp-search-input" />
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

        <div className="mp-category-list">
            <a href="#" className="mp-featured-product-card">
                <img src={featuredProduct.image} alt={featuredProduct.title} />
                <div className="mp-featured-product-card-details">
                    <h4 className="mp-featured-product-card-title">{featuredProduct.title}</h4>
                    <p className="mp-featured-product-card-category">{featuredProduct.category}</p>
                </div>
                <Icons.ChevronRight size={24} className="text-gray-400" />
            </a>
            {categories.map(category => (
                <a href="#" key={category.name} className="mp-category-card">
                    <img src={category.image} alt={category.name} className="mp-category-card-img" />
                    <div className="mp-category-card-overlay"></div>
                    <span className="mp-category-card-label">{category.name}</span>
                </a>
            ))}
        </div>
    </div>
  );
};

export default BrowseAll;