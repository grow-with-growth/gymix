
import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { OVERLAY_APPS } from '../../constants';
import GlassmorphicContainer from '../ui/GlassmorphicContainer';
import './contextual-sidebar.css';
import '../ui/tooltip.css';

const ContextualSidebar: React.FC = () => {
  const { isContextualSidebarOpen, launchOverlay, toggleContextualSidebar } = useAppContext();

  const handleLaunch = (id: (typeof OVERLAY_APPS)[0]['id']) => {
    launchOverlay(id);
    toggleContextualSidebar();
  }

  return (
    <div
      className={`w-[72px] shrink-0 transition-all duration-500 ease-in-out flex flex-col justify-end pb-10 ${
        isContextualSidebarOpen ? 'ml-0' : '-ml-[72px]'
      }`}
    >
      <GlassmorphicContainer className="w-full flex flex-col items-center p-2 gap-4 contextual-sidebar-container-bordered rounded-full">
        {OVERLAY_APPS.map((app) => {
          const Icon = app.icon;
          return (
            <div key={app.id} className="relative group">
              <button
                onClick={() => handleLaunch(app.id)}
                className="w-14 h-14 flex items-center justify-center rounded-2xl text-gray-400 hover:bg-white/10 hover:text-white transition-colors duration-300"
                aria-label={app.name}
              >
                <Icon size={28} />
              </button>
              <div
                className="absolute left-full ml-4 nav-tooltip-bordered"
                style={{ top: '50%', transform: 'translateY(-50%)' }}
              >
                {app.name}
              </div>
            </div>
          );
        })}
      </GlassmorphicContainer>
    </div>
  );
};

export default ContextualSidebar;