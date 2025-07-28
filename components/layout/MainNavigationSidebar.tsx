import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { APP_MODULES } from '../../constants';
import GlassmorphicContainer from '../ui/GlassmorphicContainer';
import { AppModuleId } from '../../types';
import './main-navigation-sidebar.css';
import '../ui/tooltip.css';

// Define vibrant, iOS-like color gradients for each module icon
const iconColorStyles: Record<string, string> = {
  [AppModuleId.Dashboard]: 'from-sky-400 to-blue-600',
  [AppModuleId.Analytics]: 'from-lime-400 to-green-600',
  [AppModuleId.SchoolHub]: 'from-amber-400 to-orange-600',
  [AppModuleId.Communications]: 'from-violet-500 to-purple-700',
  [AppModuleId.KnowledgeBase]: 'from-teal-400 to-cyan-600',
  [AppModuleId.ConciergeAI]: 'from-fuchsia-500 to-pink-700',
  [AppModuleId.Marketplace]: 'from-rose-400 to-red-600',
  [AppModuleId.SystemSettings]: 'from-slate-500 to-slate-700',
};

const MainNavigationSidebar: React.FC = () => {
  const { activeModule, setActiveModule, isMainSidebarOpen } = useAppContext();

  return (
    <div className={`
      h-full flex items-center justify-center shrink-0
      transition-all duration-500 ease-in-out
      overflow-hidden
      ${isMainSidebarOpen ? 'w-[72px]' : 'w-0'}
    `}>
      <div className="w-[72px] h-full flex items-center justify-center">
        <GlassmorphicContainer className="flex flex-col items-center p-2 gap-4 rounded-full main-nav-sidebar-container-bordered">
          {APP_MODULES.map((module) => {
            const Icon = module.icon;
            const isActive = activeModule === module.id;
            const gradient = iconColorStyles[module.id] || 'from-gray-600 to-gray-800';

            return (
              <div key={module.id} className="relative group">
                <button
                  onClick={() => setActiveModule(module.id)}
                  className={`
                    w-14 h-14 flex items-center justify-center rounded-2xl
                    transition-all duration-300 ease-in-out
                    relative text-white
                    bg-gradient-to-br ${gradient}
                    shadow-md shadow-black/30
                    ${isActive
                      ? 'scale-110 shadow-lg shadow-black/50 ring-2 ring-white/50'
                      : 'scale-100 opacity-80 hover:opacity-100 hover:scale-105 hover:shadow-lg hover:shadow-black/40'
                    }
                  `}
                  aria-label={module.name}
                >
                  <Icon size={28} />
                </button>
                <div
                  className="absolute right-full mr-4 nav-tooltip-bordered"
                  style={{ top: '50%', transform: 'translateY(-50%)' }}
                >
                  {module.name}
                </div>
              </div>
            );
          })}
        </GlassmorphicContainer>
      </div>
    </div>
  );
};

export default MainNavigationSidebar;