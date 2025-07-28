import React from 'react';
import { Icons } from '../../icons';
import { Product } from '../../../types';
import { useAppContext } from '../../../hooks/useAppContext';
import './ProductCard.css';

interface ProductCardProps {
    product: Product;
    actionText?: string;
    actionIcon?: React.ElementType;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
    product, 
    actionText = 'Add to Cart',
    actionIcon: ActionIcon = Icons.ShoppingCart 
}) => {
    const { addToCart } = useAppContext();

    return (
        <div className="mp-content-card">
            <div className="mp-card-image-wrapper">
                <img src={product.image} alt={product.title} className="mp-card-image" />
                <div className="mp-card-category">{product.category}</div>
            </div>
            <div className="mp-card-details">
                <h4 className="mp-card-title">{product.title}</h4>
                <p className="mp-card-price">${product.price}</p>
            </div>
            <button className="mp-card-add-btn" onClick={() => addToCart(product)}>
                <ActionIcon size={16}/> {actionText}
            </button>
        </div>
    );
};

export default ProductCard;