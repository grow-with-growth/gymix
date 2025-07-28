
import React from 'react';
import { AppModule, OverlayApp, AppModuleId, OverlayId } from './types';
import { Icons } from './components/icons';
import DashboardModule from './components/modules/DashboardModule';
import AnalyticsModule from './components/modules/AnalyticsModule';
import SchoolHubModule from './components/modules/SchoolHubModule';
import PlaceholderModule from './components/modules/PlaceholderModule';
import PlaceholderOverlay from './components/overlays/PlaceholderOverlay';
import CommunicationsModule from './components/modules/CommunicationsModule';
import ConciergeAIModule from './components/modules/ConciergeAIModule';
import StudioOverlay from './components/overlays/StudioOverlay';
import SystemSettingsModule from './components/modules/SystemSettingsModule';
import KnowledgeBaseModule from './components/modules/KnowledgeBaseModule';
import MarketplaceModule from './components/modules/MarketplaceModule';
import MarketplaceOverlay from './components/overlays/MarketplaceOverlay';
import HobbiesOverlay from './components/overlays/HobbiesOverlay';

export const APP_MODULES: AppModule[] = [
  { id: AppModuleId.Dashboard, name: 'Dashboard', icon: Icons.Dashboard, component: DashboardModule },
  { id: AppModuleId.Analytics, name: 'Analytics', icon: Icons.Analytics, component: AnalyticsModule },
  { id: AppModuleId.SchoolHub, name: 'School Hub', icon: Icons.School, component: SchoolHubModule },
  { id: AppModuleId.Communications, name: 'Communications', icon: Icons.Communications, component: CommunicationsModule },
  { id: AppModuleId.KnowledgeBase, name: 'Knowledge Base', icon: Icons.KnowledgeBase, component: KnowledgeBaseModule },
  { id: AppModuleId.ConciergeAI, name: 'Concierge AI', icon: Icons.ConciergeAI, component: ConciergeAIModule },
  { id: AppModuleId.Marketplace, name: 'Marketplace', icon: Icons.Marketplace, component: MarketplaceModule },
  { id: AppModuleId.SystemSettings, name: 'System Settings', icon: Icons.SystemSettings, component: SystemSettingsModule },
];

export const OVERLAY_APPS: OverlayApp[] = [
  { id: OverlayId.Studio, name: 'Studio', icon: Icons.Studio, component: StudioOverlay },
  { id: OverlayId.Marketplace, name: 'Marketplace', icon: Icons.Marketplace, component: MarketplaceOverlay },
  { id: OverlayId.Media, name: 'Media', icon: Icons.Media, component: (props) => <PlaceholderOverlay {...props} appName="Media" icon={<Icons.Media size={64} />} /> },
  { id: OverlayId.Lifestyle, name: 'Lifestyle', icon: Icons.Lifestyle, component: (props) => <PlaceholderOverlay {...props} appName="Lifestyle" icon={<Icons.Lifestyle size={64} />} /> },
  { id: OverlayId.Hobbies, name: 'Hobbies', icon: Icons.Hobbies, component: HobbiesOverlay },
  { id: OverlayId.Gamification, name: 'Gamification', icon: Icons.Gamification, component: (props) => <PlaceholderOverlay {...props} appName="Gamification" icon={<Icons.Gamification size={64} />} /> },
];
