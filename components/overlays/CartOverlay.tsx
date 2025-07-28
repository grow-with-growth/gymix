import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Icons } from '../icons';
import './CartOverlay.css';

const CartOverlay: React.FC = () => {
    const { isCartOpen, toggleCart, cart, removeFromCart, updateCartItemQuantity, clearCart } = useAppContext();
    const subtotal = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

    return (
        <div className={`cart-overlay-backdrop ${isCartOpen ? 'open' : ''}`} onClick={toggleCart}>
            <div className={`cart-overlay-panel ${isCartOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
                <div className="cart-header">
                    <h3 className="font-orbitron text-xl text-white">Your Cart</h3>
                    <button onClick={toggleCart} className="cart-close-btn"><Icons.Close size={24} /></button>
                </div>
                
                {cart.length === 0 ? (
                    <div className="cart-empty-state">
                        <Icons.ShoppingCart size={48} className="text-gray-600"/>
                        <p>Your cart is empty.</p>
                    </div>
                ) : (
                    <>
                        <div className="cart-items-list">
                            {cart.map(item => (
                                <div key={item.id} className="cart-item">
                                    <img src={item.image} alt={item.title} className="cart-item-image" />
                                    <div className="cart-item-details">
                                        <p className="cart-item-title">{item.title}</p>
                                        <p className="cart-item-price">${parseFloat(item.price).toFixed(2)}</p>
                                    </div>
                                    <div className="cart-item-actions">
                                        <div className="quantity-control">
                                            <button onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}><Icons.MinusCircle size={20} /></button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}><Icons.PlusCircle size={20} /></button>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} className="remove-item-btn"><Icons.Trash2 size={16}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-footer">
                            <div className="cart-summary">
                                <div className="subtotal-row">
                                    <span>Subtotal</span>
                                    <span className="font-orbitron font-bold text-lg">${subtotal.toFixed(2)}</span>
                                </div>
                                 <button className="clear-cart-btn" onClick={clearCart}>Clear Cart</button>
                            </div>
                            <button className="checkout-btn">Proceed to Checkout</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CartOverlay;