
import React, { useState, useMemo } from 'react';
import { Icons } from '../icons';
import GlassmorphicContainer from '../ui/GlassmorphicContainer';
import './concierge-ai-module.css';
import '../ui/tooltip.css';

// Import all new Concierge AI components
import AuraConcierge from './concierge-ai/AuraConcierge';
import ChatHistory from './concierge-ai/ChatHistory';
import Summarizer from './concierge-ai/Summarizer';
import Translator from './concierge-ai/Translator';
import ContentGenerator from './concierge-ai/ContentGenerator';
import EducationPrompts from './concierge-ai/EducationPrompts';
import AdminPrompts from './concierge-ai/AdminPrompts';
import ProductivityPrompts from './concierge-ai/ProductivityPrompts';

// Import new Settings components
import AIPersona from './concierge-ai/settings/AIPersona';
import AIModel from './concierge-ai/settings/AIModel';
import AIDataPrivacy from './concierge-ai/settings/AIDataPrivacy';
import AIUsage from './concierge-ai/settings/AIUsage';


type L1Tab = 'Chat' | 'AI Tools' | 'Prompt Library' | 'Settings';

interface ContentItem {
  id: string;
  name: string;
  icon: React.ElementType;
  component: React.ComponentType;
}

const conciergeData: Record<L1Tab, ContentItem[]> = {
  Chat: [
    { id: 'chat.main', name: 'Aura Concierge', icon: Icons.ConciergeAI, component: AuraConcierge },
    { id: 'chat.history', name: 'Chat History', icon: Icons.History, component: ChatHistory },
  ],
  'AI Tools': [
    { id: 'tools.summarizer', name: 'Summarizer', icon: Icons.FileText, component: Summarizer },
    { id: 'tools.translator', name: 'Translator', icon: Icons.Globe, component: Translator },
    { id: 'tools.contentGen', name: 'Content Generator', icon: Icons.Wand2, component: ContentGenerator },
  ],
  'Prompt Library': [
    { id: 'prompts.education', name: 'Education', icon: Icons.GraduationCap, component: EducationPrompts },
    { id: 'prompts.admin', name: 'Administration', icon: Icons.Shield, component: AdminPrompts },
    { id: 'prompts.productivity', name: 'Productivity', icon: Icons.Sparkles, component: ProductivityPrompts },
  ],
  Settings: [
    { id: 'settings.persona', name: 'Persona & Behavior', icon: Icons.Smile, component: AIPersona },
    { id: 'settings.model', name: 'Model & Performance', icon: Icons.Cpu, component: AIModel },
    { id: 'settings.privacy', name: 'Data & Privacy', icon: Icons.Security, component: AIDataPrivacy },
    { id: 'settings.usage', name: 'Usage & Limits', icon: Icons.BarChart3, component: AIUsage },
  ],
};

const L1_TABS: { id: L1Tab; name: string; icon: React.ReactNode }[] = [
  { id: 'Chat', name: 'Chat', icon: <Icons.Chat size={18} /> },
  { id: 'AI Tools', name: 'AI Tools', icon: <Icons.Cpu size={18} /> },
  { id: 'Prompt Library', name: 'Prompt Library', icon: <Icons.Library size={18} /> },
  { id: 'Settings', name: 'Settings', icon: <Icons.Settings size={18} /> },
];

const ConciergeAIModule: React.FC = () => {
  const [activeL1, setActiveL1] = useState<L1Tab>('Chat');
  const [activeL2Id, setActiveL2Id] = useState<string>(conciergeData.Chat[0].id);

  const handleL1Click = (tabId: L1Tab) => {
    setActiveL1(tabId);
    setActiveL2Id(conciergeData[tabId][0].id);
  };

  const l2Items = useMemo(() => conciergeData[activeL1], [activeL1]);

  const ActiveComponent = useMemo(() => {
    return l2Items.find(r => r.id === activeL2Id)?.component || null;
  }, [l2Items, activeL2Id]);
  
  return (
    <GlassmorphicContainer className="concierge-ai-module-bordered w-full h-full flex flex-col rounded-2xl overflow-hidden">
      {/* Level 1 Header Navigation */}
      <div className="flex items-center gap-2 p-2 shrink-0 concierge-ai-header-bordered overflow-x-auto">
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

      <div className="concierge-ai-body">
        {/* Level 2 Icon Sidebar */}
        <div className="concierge-ai-l2-sidebar">
            {l2Items.map(item => {
                const Icon = item.icon;
                return (
                    <div key={item.id} className="relative group">
                        <button
                            onClick={() => setActiveL2Id(item.id)}
                            className={`concierge-ai-l2-button ${activeL2Id === item.id ? 'active' : ''}`}
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
        
        {/* Main Content Pane */}
        <main className="flex-1 overflow-hidden">
          {ActiveComponent ? (
            <ActiveComponent />
          ) : (
            <div className="flex items-center justify-center h-full text-center text-gray-500">
                <p>Please select a tool.</p>
            </div>
          )}
        </main>
      </div>
    </GlassmorphicContainer>
  );
};

export default ConciergeAIModule;
