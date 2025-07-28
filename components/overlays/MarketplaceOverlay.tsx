import React from 'react';
import GlassmorphicContainer from '../ui/GlassmorphicContainer';
import { Icons } from '../icons';
import MarketplaceModule from '../modules/MarketplaceModule';
import './MarketplaceOverlay.css';

interface MarketplaceOverlayProps {
  onClose: () => void;
  onMinimize: () => void;
}

const MarketplaceOverlay: React.FC<MarketplaceOverlayProps> = ({ onClose, onMinimize }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
    >
      <GlassmorphicContainer className="marketplace-overlay-container w-full h-full rounded-2xl flex flex-col overflow-hidden">
        <header className="marketplace-overlay-header">
          <div className="flex items-center gap-2">
            <Icons.Marketplace size={20} className="text-purple-400" />
            <h2 className="font-orbitron text-lg text-white">Marketplace</h2>
          </div>
          <div className="flex gap-2">
              <button onClick={onMinimize} className="control-btn" aria-label="Minimize">
                  <Icons.Minimize size={20} />
              </button>
              <button onClick={onClose} className="control-btn close" aria-label="Close">
                  <Icons.Close size={20} />
              </button>
          </div>
        </header>
        <div className="flex-grow overflow-hidden p-4">
             <MarketplaceModule />
        </div>
      </GlassmorphicContainer>
    </div>
  );
};

export default MarketplaceOverlay;