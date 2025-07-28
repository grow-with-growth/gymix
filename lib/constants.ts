
import { ModuleDefinition, OverlayDefinition } from '../types';
import { 
    LayoutDashboard, BarChart2, School, Mail, Library, Bot, ShoppingCart, Settings, 
    PanelLeft, CookingPot, Gamepad2, Bike, Clapperboard, Brush, Calendar
} from 'lucide-react';

export const AppModules = [
    'Dashboard', 'Analytics', 'School Hub', 'Communications', 'Knowledge Base', 
    'Concierge AI', 'Marketplace', 'Calendar', 'System Settings'
] as const;

export const OverlayApps = [
    'Lifestyle', 'Gamification', 'Hobbies', 'Media', 'Studio'
] as const;

export type AppModuleName = typeof AppModules[number];
export type OverlayName = typeof OverlayApps[number];

type ModuleRecord = Record<AppModuleName, ModuleDefinition & { path: string }>;
type OverlayRecord = Record<OverlayName, OverlayDefinition>;

export const MODULES: ModuleRecord = {
    'Dashboard': { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    'Analytics': { name: 'Analytics', icon: BarChart2, path: '/analytics' },
    'School Hub': { name: 'School Hub', icon: School, path: '/school-hub' },
    'Communications': { name: 'Communications', icon: Mail, path: '/communications' },
    'Knowledge Base': { name: 'Knowledge Base', icon: Library, path: '/knowledge-base' },
    'Concierge AI': { name: 'Concierge AI', icon: Bot, path: '/concierge-ai' },
    'Marketplace': { name: 'Marketplace', icon: ShoppingCart, path: '/marketplace' },
    'Calendar': { name: 'Calendar', icon: Calendar, path: '/calendar' },
    'System Settings': { name: 'System Settings', icon: Settings, path: '/system-settings' },
};

export const OVERLAYS: OverlayRecord = {
    'Lifestyle': { name: 'Lifestyle', icon: CookingPot },
    'Gamification': { name: 'Gamification', icon: Gamepad2 },
    'Hobbies': { name: 'Hobbies', icon: Bike },
    'Media': { name: 'Media', icon: Clapperboard },
    'Studio': { name: 'Studio', icon: Brush },
};