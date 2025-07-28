
import React, { useState, useMemo } from 'react';
import { Icons } from '../icons';
import GlassmorphicContainer from '../ui/GlassmorphicContainer';
import './marketplace-module.css';
import '../ui/tooltip.css';

// Import new modular components
import BrowseAll from './marketplace/store/BrowseAll';
import Apparel from './marketplace/store/Apparel';
import BooksAndSupplies from './marketplace/store/BooksAndSupplies';
import TechAndDigital from './marketplace/store/TechAndDigital';
import GiftShop from './marketplace/store/GiftShop';

import UpcomingEvents from './marketplace/events/UpcomingEvents';
import MyTickets from './marketplace/events/MyTickets';

import Tutoring from './marketplace/services/Tutoring';
import Counseling from './marketplace/services/Counseling';
import Workshops from './marketplace/services/Workshops';

import FeaturedDeals from './marketplace/deals/FeaturedDeals';
import Bundles from './marketplace/deals/Bundles';

import MyOrders from './marketplace/my-marketplace/MyOrders';
import MyListings from './marketplace/my-marketplace/MyListings';
import PaymentSettings from './marketplace/my-marketplace/PaymentSettings';


type L1Tab = 'Store' | 'Events' | 'Services' | 'Packages & Deals' | 'My Marketplace';

interface ContentItem {
  id: string;
  name: string;
  icon: React.ElementType;
  component: React.ComponentType;
}

const marketplaceData: Record<L1Tab, ContentItem[]> = {
  Store: [
    { id: 'store.all', name: 'Browse All', icon: Icons.ShoppingCart, component: BrowseAll },
    { id: 'store.apparel', name: 'Apparel', icon: Icons.Apparel, component: Apparel },
    { id: 'store.books', name: 'Books & Supplies', icon: Icons.Books, component: BooksAndSupplies },
    { id: 'store.tech', name: 'Tech & Digital', icon: Icons.Tech, component: TechAndDigital },
    { id: 'store.gifts', name: 'Gift Shop', icon: Icons.GiftShop, component: GiftShop },
  ],
  Events: [
    { id: 'events.upcoming', name: 'Upcoming Events', icon: Icons.CalendarDays, component: UpcomingEvents },
    { id: 'events.tickets', name: 'My Tickets', icon: Icons.Ticket, component: MyTickets },
  ],
  Services: [
    { id: 'services.tutoring', name: 'Tutoring', icon: Icons.GraduationCap, component: Tutoring },
    { id: 'services.counseling', name: 'Counseling', icon: Icons.Heart, component: Counseling },
    { id: 'services.workshops', name: 'Workshops', icon: Icons.ClipboardCheck, component: Workshops },
  ],
  'Packages & Deals': [
    { id: 'deals.featured', name: 'Featured Deals', icon: Icons.Sparkles, component: FeaturedDeals },
    { id: 'deals.bundles', name: 'Bundles', icon: Icons.Package, component: Bundles },
  ],
  'My Marketplace': [
    { id: 'my.orders', name: 'My Orders', icon: Icons.MyOrders, component: MyOrders },
    { id: 'my.listings', name: 'My Listings', icon: Icons.MyListings, component: MyListings },
    { id: 'my.payment', name: 'Payment Settings', icon: Icons.PaymentSettings, component: PaymentSettings },
  ],
};

const L1_TABS: { id: L1Tab; name: string; icon: React.ReactNode }[] = [
  { id: 'Store', name: 'Store', icon: <Icons.Store size={18} /> },
  { id: 'Events', name: 'Events', icon: <Icons.Events size={18} /> },
  { id: 'Services', name: 'Services', icon: <Icons.Services size={18} /> },
  { id: 'Packages & Deals', name: 'Packages & Deals', icon: <Icons.Deals size={18} /> },
  { id: 'My Marketplace', name: 'My Marketplace', icon: <Icons.User size={18} /> },
];

const MarketplaceModule: React.FC = () => {
  const [activeL1, setActiveL1] = useState<L1Tab>('Store');
  const [activeL2Id, setActiveL2Id] = useState<string>(marketplaceData.Store[0].id);

  const handleL1Click = (tabId: L1Tab) => {
    setActiveL1(tabId);
    setActiveL2Id(marketplaceData[tabId][0].id);
  };

  const l2Items = useMemo(() => marketplaceData[activeL1], [activeL1]);

  const ActiveComponent = useMemo(() => {
    return l2Items.find(r => r.id === activeL2Id)?.component || null;
  }, [l2Items, activeL2Id]);
  
  return (
    <GlassmorphicContainer className="marketplace-module-bordered w-full h-full flex flex-col rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 p-2 shrink-0 marketplace-header-bordered overflow-x-auto">
        {L1_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleL1Click(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shrink-0 ${activeL1 === tab.id ? 'bg-purple-600/50 text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>

      <div className="marketplace-body">
        <div className="marketplace-l2-sidebar">
            {l2Items.map(item => {
                const Icon = item.icon;
                return (
                    <div key={item.id} className="relative group">
                        <button
                            onClick={() => setActiveL2Id(item.id)}
                            className={`marketplace-l2-button ${activeL2Id === item.id ? 'active' : ''}`}
                            aria-label={item.name}
                        >
                            <Icon size={24} />
                        </button>
                        <div className="nav-tooltip-bordered absolute left-full ml-4 top-1/2 -translate-y-1/2">
                            {item.name}
                        </div>
                    </div>
                );
            })}
        </div>
        
        <main className="flex-1 overflow-y-auto">
          {ActiveComponent ? (
            <ActiveComponent />
          ) : (
            <div className="flex items-center justify-center h-full text-center text-gray-500">
                <p>Please select a category.</p>
            </div>
          )}
        </main>
      </div>
    </GlassmorphicContainer>
  );
};

export default MarketplaceModule;
