
import React, { useState, useMemo } from 'react';
import GlassmorphicContainer from '../ui/GlassmorphicContainer';
import { Icons } from '../icons';
import './HobbiesOverlay.css';

// Import placeholder components
import ArtGallery from '../modules/hobbies/creative/ArtGallery';
import MusicStudio from '../modules/hobbies/creative/MusicStudio';
import WritingDesk from '../modules/hobbies/creative/WritingDesk';
import ActivityLog from '../modules/hobbies/sports/ActivityLog';
import GoalTracker from '../modules/hobbies/sports/GoalTracker';
import TeamHub from '../modules/hobbies/sports/TeamHub';
import GameLibrary from '../modules/hobbies/gaming/GameLibrary';
import SessionLogger from '../modules/hobbies/gaming/SessionLogger';
import BoardGameNights from '../modules/hobbies/gaming/BoardGameNights';
import CollectionManager from '../modules/hobbies/collecting/CollectionManager';
import Wishlist from '../modules/hobbies/collecting/Wishlist';
import TrailFinder from '../modules/hobbies/outdoors/TrailFinder';
import GardenPlanner from '../modules/hobbies/outdoors/GardenPlanner';

type L1Tab = 'Creative' | 'Sports' | 'Gaming' | 'Collecting' | 'Outdoors';
interface L2Item {
  id: string;
  name: string;
  icon: React.ElementType;
  component: React.ComponentType<any>;
}

const hobbiesData: Record<L1Tab, L2Item[]> = {
  Creative: [
    { id: 'creative.gallery', name: 'Art Gallery', icon: Icons.ArtGallery, component: ArtGallery },
    { id: 'creative.music', name: 'Music Studio', icon: Icons.MusicStudio, component: MusicStudio },
    { id: 'creative.writing', name: 'Writing Desk', icon: Icons.WritingDesk, component: WritingDesk },
  ],
  Sports: [
    { id: 'sports.log', name: 'Activity Log', icon: Icons.ActivityLog, component: ActivityLog },
    { id: 'sports.goals', name: 'Goal Tracker', icon: Icons.GoalTracker, component: GoalTracker },
    { id: 'sports.team', name: 'Team Hub', icon: Icons.TeamHub, component: TeamHub },
  ],
  Gaming: [
    { id: 'gaming.library', name: 'Game Library', icon: Icons.GameLibrary, component: GameLibrary },
    { id: 'gaming.logger', name: 'Session Logger', icon: Icons.SessionLogger, component: SessionLogger },
    { id: 'gaming.boardgames', name: 'Board Game Nights', icon: Icons.BoardGameNights, component: BoardGameNights },
  ],
  Collecting: [
    { id: 'collecting.manager', name: 'Collection Manager', icon: Icons.CollectionManager, component: CollectionManager },
    { id: 'collecting.wishlist', name: 'Wishlist', icon: Icons.Wishlist, component: Wishlist },
  ],
  Outdoors: [
    { id: 'outdoors.trails', name: 'Trail Finder', icon: Icons.TrailFinder, component: TrailFinder },
    { id: 'outdoors.garden', name: 'Garden Planner', icon: Icons.GardenPlanner, component: GardenPlanner },
  ]
};

const L1_TABS: { id: L1Tab; name: string; icon: React.ElementType }[] = [
  { id: 'Creative', name: 'Creative', icon: Icons.Creative },
  { id: 'Sports', name: 'Sports', icon: Icons.Sports },
  { id: 'Gaming', name: 'Gaming', icon: Icons.Gaming },
  { id: 'Collecting', name: 'Collecting', icon: Icons.Collecting },
  { id: 'Outdoors', name: 'Outdoors', icon: Icons.Outdoors },
];

interface HobbiesOverlayProps {
  onClose: () => void;
  onMinimize: () => void;
}

const HobbiesOverlay: React.FC<HobbiesOverlayProps> = ({ onClose, onMinimize }) => {
  const [activeL1, setActiveL1] = useState<L1Tab>('Creative');
  const [activeL2Id, setActiveL2Id] = useState<string>(hobbiesData.Creative[0].id);

  const handleL1Click = (tabId: L1Tab) => {
    setActiveL1(tabId);
    setActiveL2Id(hobbiesData[tabId][0].id);
  };
  
  const l2Items = useMemo(() => hobbiesData[activeL1], [activeL1]);

  const ActiveComponent = useMemo(() => {
    return l2Items.find(item => item.id === activeL2Id)?.component || null;
  }, [l2Items, activeL2Id]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <GlassmorphicContainer className="hobbies-overlay-bordered w-full h-full rounded-2xl flex flex-col overflow-hidden">
        <header className="hobbies-header">
          <div className="hobbies-l1-nav">
            {L1_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleL1Click(tab.id)}
                className={`hobbies-l1-btn ${activeL1 === tab.id ? 'active' : ''}`}
              >
                <tab.icon size={18} />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
          <div className="hobbies-window-controls">
            <button onClick={onMinimize} className="hobbies-control-btn" aria-label="Minimize">
                <Icons.Minimize size={20} />
            </button>
            <button onClick={onClose} className="hobbies-control-btn close" aria-label="Close">
                <Icons.Close size={20} />
            </button>
          </div>
        </header>
        <div className="hobbies-body">
            <div className="hobbies-l2-sidebar">
                {l2Items.map(item => {
                    const Icon = item.icon;
                    return (
                        <div key={item.id} className="relative group">
                            <button
                                onClick={() => setActiveL2Id(item.id)}
                                className={`hobbies-l2-button ${activeL2Id === item.id ? 'active' : ''}`}
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
            <main className="hobbies-content-pane">
                {ActiveComponent ? <ActiveComponent /> : null}
            </main>
        </div>
      </GlassmorphicContainer>
    </div>
  );
};

export default HobbiesOverlay;
