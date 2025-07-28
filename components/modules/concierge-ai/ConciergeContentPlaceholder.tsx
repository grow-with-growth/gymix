
import React from 'react';
import './ConciergeContentPlaceholder.css';

interface ConciergeContentPlaceholderProps {
    title: string;
    icon: React.ReactNode;
}

const ConciergeContentPlaceholder: React.FC<ConciergeContentPlaceholderProps> = ({ title, icon }) => {
  return (
    <div className="concierge-placeholder-container">
      <div className="placeholder-icon">
        {icon}
      </div>
      <h2 className="font-orbitron text-3xl font-bold text-white mb-2">{title}</h2>
      <p className="text-gray-400">
        The {title} tool is currently under development.
      </p>
       <div className="placeholder-content-box">
            <p className="text-gray-500">Full functionality will be available here soon.</p>
        </div>
    </div>
  );
};

export default ConciergeContentPlaceholder;
