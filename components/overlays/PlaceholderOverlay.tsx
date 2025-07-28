
import React from 'react';
import GlassmorphicContainer from '../ui/GlassmorphicContainer';
import { Icons } from '../icons';
import './placeholder-overlay.css';

interface PlaceholderOverlayProps {
  onClose: () => void;
  onMinimize: () => void;
  appName: string;
  icon: React.ReactNode;
}

const PlaceholderOverlay: React.FC<PlaceholderOverlayProps> = ({ onClose, onMinimize, appName, icon }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-8 animate-fade-in"
      // This animation would be handled by Framer Motion: initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <GlassmorphicContainer className="placeholder-overlay-bordered relative w-full h-full rounded-2xl flex flex-col items-center justify-center text-center p-8">
        <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={onMinimize} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors" aria-label="Minimize">
                <Icons.Minimize size={24} />
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors" aria-label="Close">
                <Icons.Close size={24} />
            </button>
        </div>
        <div className="text-purple-400 mb-4 opacity-60">
            {icon}
        </div>
        <h2 className="font-orbitron text-5xl font-bold text-white mb-2">{appName}</h2>
        <p className="text-gray-400 max-w-md">
            The full-screen {appName} experience will be launched here.
        </p>
      </GlassmorphicContainer>
    </div>
  );
};

export default PlaceholderOverlay;