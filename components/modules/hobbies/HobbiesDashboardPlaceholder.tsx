
import React from 'react';
import { Icons } from '../../icons';
import './hobbies-dashboard-placeholder.css';

interface HobbiesDashboardPlaceholderProps {
    title: string;
    breadcrumbs: string;
    icon: React.ReactNode;
}

const HobbiesDashboardPlaceholder: React.FC<HobbiesDashboardPlaceholderProps> = ({ title, breadcrumbs, icon }) => {
  return (
    <div className="hobbies-placeholder-container">
        <div className="hobbies-header">
            <div className="hobbies-header-icon">{icon}</div>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">{title}</h2>
                <p className="text-gray-400">{breadcrumbs}</p>
            </div>
        </div>
        
        <div className="hobbies-content-area">
            <p className="text-gray-500">Content for {title} will be displayed here.</p>
        </div>
    </div>
  );
};

export default HobbiesDashboardPlaceholder;
