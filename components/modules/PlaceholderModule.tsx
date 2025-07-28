import React from 'react';
import GlassmorphicContainer from '../ui/GlassmorphicContainer';
import './placeholder-module.css';

interface PlaceholderModuleProps {
    moduleName: string;
    icon: React.ReactNode;
}

const PlaceholderModule: React.FC<PlaceholderModuleProps> = ({ moduleName, icon }) => {
  return (
    <GlassmorphicContainer className="placeholder-module-bordered w-full h-full flex flex-col items-center justify-center text-center p-8 rounded-2xl">
      <div className="text-cyan-400 mb-4 opacity-50">
        {icon}
      </div>
      <h2 className="font-orbitron text-4xl font-bold text-white mb-2">{moduleName}</h2>
      <p className="text-gray-400 max-w-md">
        This module is under construction. Full functionality for the {moduleName} will be available in a future update.
      </p>
    </GlassmorphicContainer>
  );
};

export default PlaceholderModule;