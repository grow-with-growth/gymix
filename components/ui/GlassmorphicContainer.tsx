import React from 'react';

interface GlassmorphicContainerProps {
  children: React.ReactNode;
  className?: string;
}

const GlassmorphicContainer: React.FC<GlassmorphicContainerProps> = ({ children, className = '' }) => {
  return (
    <div 
      className={`bg-white/10 backdrop-blur-2xl ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassmorphicContainer;