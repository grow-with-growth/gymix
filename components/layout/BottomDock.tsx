

import React, { useState, useEffect } from 'react';
import { Icons } from '../icons';
import GlassmorphicContainer from '../ui/GlassmorphicContainer';
import './bottom-dock.css';
import { useAppContext } from '../../hooks/useAppContext';
import { OVERLAY_APPS } from '../../constants';
import { OverlayApp } from '../../types';

const BottomDock: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const { 
    openOverlays, 
    activeOverlay, 
    restoreOverlay, 
    toggleContextualSidebar, 
    isContextualSidebarOpen,
    isMainSidebarOpen,
    toggleMainSidebar 
  } = useAppContext();

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);
  
  const minimizedApps = openOverlays
    .map(id => OVERLAY_APPS.find(app => app.id === id))
    .filter((app): app is OverlayApp => !!app && app.id !== activeOverlay);

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const dockButtons = [
    { name: 'Mail', icon: <Icons.Communications size={20} /> },
    { name: 'News', icon: <Icons.News size={20} /> },
    { name: 'Chat', icon: <Icons.Chat size={20} /> },
    { name: 'Cloud', icon: <Icons.Cloud size={20} /> },
  ];

  return (
    <GlassmorphicContainer className="h-12 px-4 flex items-center justify-between w-full shrink-0 bottom-dock-container-bordered">
      <div className="flex items-center gap-2">
        <Icons.Time size={20} className="text-cyan-400" />
        <span className="font-orbitron font-medium text-lg text-gray-200 tracking-widest">{formattedTime}</span>
        <div className="divider"></div>
        <button 
          onClick={toggleContextualSidebar} 
          className={`p-2 rounded-full transition-colors duration-300 ${isContextualSidebarOpen ? 'bg-purple-500/50 text-white' : 'hover:bg-white/10'}`}
          aria-label="Toggle Contextual Sidebar"
        >
          <Icons.ToggleSidebar size={20} />
        </button>
      </div>
      <div className="flex items-center gap-2">
        {minimizedApps.map(app => {
            const Icon = app.icon;
            return (
                <button
                    key={app.id}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-300 minimized-app-btn"
                    onClick={() => restoreOverlay(app.id)}
                    aria-label={`Restore ${app.name}`}
                >
                    <Icon size={24} />
                </button>
            )
        })}
        {dockButtons.map(button => (
          <button key={button.name} className="p-2 rounded-full hover:bg-white/10 transition-colors duration-300" aria-label={button.name}>
            {button.icon}
          </button>
        ))}
         <div className="divider"></div>
        <button 
          onClick={toggleMainSidebar}
          className={`p-2 rounded-full transition-colors duration-300 ${isMainSidebarOpen ? 'bg-purple-500/50 text-white' : 'hover:bg-white/10'}`}
          aria-label="Toggle Main Sidebar"
        >
          <Icons.ToggleSidebarRight size={20} />
        </button>
      </div>
    </GlassmorphicContainer>
  );
};

export default BottomDock;