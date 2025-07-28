import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Icons } from '../icons';
import { APP_MODULES } from '../../constants';
import GlassmorphicContainer from '../ui/GlassmorphicContainer';
import './global-header.css';
import '../ui/search-input.css';

const GlobalHeader: React.FC = () => {
  const { activeModule, cart, toggleCart } = useAppContext();
  const currentModule = APP_MODULES.find(m => m.id === activeModule);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <GlassmorphicContainer className="h-16 px-4 flex items-center justify-between w-full shrink-0 global-header-container-bordered">
      <div className="flex items-center gap-4">
        <h1 className="font-orbitron text-xl font-bold text-gray-100 tracking-wider ml-2">
          {currentModule?.name || 'Dashboard'}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative w-64">
          <Icons.Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Global Search..."
            className="search-input-bordered"
          />
        </div>
        <button onClick={toggleCart} className="cart-button">
          <Icons.ShoppingCart size={22} />
          {itemCount > 0 && (
            <span className="cart-badge">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </GlassmorphicContainer>
  );
};

export default GlobalHeader;