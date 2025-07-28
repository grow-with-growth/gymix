import React from 'react';
import { AppContextProvider, useAppContext } from './hooks/useAppContext';
import GlobalHeader from './components/layout/GlobalHeader';
import MainNavigationSidebar from './components/layout/MainNavigationSidebar';
import ContextualSidebar from './components/layout/ContextualSidebar';
import BottomDock from './components/layout/BottomDock';
import { APP_MODULES, OVERLAY_APPS } from './constants';
import CartOverlay from './components/overlays/CartOverlay';

const AppContent: React.FC = () => {
  const { activeModule, activeOverlay, closeOverlay, minimizeOverlay, isCartOpen } = useAppContext();

  const ActiveModuleComponent = APP_MODULES.find(m => m.id === activeModule)?.component || (() => null);
  const ActiveOverlayComponent = OVERLAY_APPS.find(o => o.id === activeOverlay)?.component || null;
  
  return (
    <div className="h-screen w-screen main-background text-gray-200 font-sans overflow-hidden flex flex-col">
      
      <div className="relative z-10 flex flex-col h-full">
        <GlobalHeader />

        {/* This main row contains both sidebars and the content, sitting between header and footer */}
        <main className="flex-1 flex overflow-hidden">
          <ContextualSidebar />

          {/* Main Content Area */}
          <div className="flex-1 p-4 overflow-hidden">
            <ActiveModuleComponent />
          </div>

          <MainNavigationSidebar />
        </main>
        
        <BottomDock />
      </div>

      {/* Render overlay if active */}
      {ActiveOverlayComponent && activeOverlay && (
         <ActiveOverlayComponent 
            onClose={() => closeOverlay(activeOverlay)} 
            onMinimize={() => minimizeOverlay(activeOverlay)}
         />
      )}
      {isCartOpen && <CartOverlay />}
    </div>
  );
};

const App: React.FC = () => (
  <AppContextProvider>
    <AppContent />
  </AppContextProvider>
);

export default App;