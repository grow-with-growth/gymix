import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Icons } from '../../../icons';
import { Product } from '../../../../types';
import ProductCard from '../ProductCard';
import '../content-styles.css';

const Workshops: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/marketplace-products?category=Workshops');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching workshop products:', error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className=\"mp-placeholder-container\">
        <div className=\"mp-header\">
            <div className=\"mp-header-icon\"><Icons.ClipboardCheck size={48} /></div>
            <div>
                <h2 className=\"font-orbitron text-3xl font-bold text-white\">Workshops</h2>
                <p className=\"text-gray-400\">Services / Workshops</p>
            </div>
        </div>
        
        <div className=\"mp-filter-bar\">
            <div className=\"mp-search-wrapper\">
                <Icons.Search size={18} className=\"mp-search-icon\" />
                <input type=\"text\" placeholder={`Search in Workshops...`} className=\"mp-search-input\" />
            </div>
            <div className=\"mp-filters\">
                <select className=\"mp-filter-select\">
                    <option>All Categories</option>
                </select>
                <select className=\"mp-filter-select\">
                    <option>Sort by Price</option>
                </select>
            </div>
        </div>

        <div className=\"mp-content-grid\">
            {products.map(item => (
                <ProductCard 
                    key={item.id}
                    product={item}
                    actionText=\"Book Now\" 
                    actionIcon={Icons.CalendarDays}
                />
            ))}
        </div>
    </div>
  );
};

export default Workshops;