import React from 'react';

export enum AppModuleId {
  Dashboard = 'DASHBOARD',
  Analytics = 'ANALYTICS',
  SchoolHub = 'SCHOOL_HUB',
  Communications = 'COMMUNICATIONS',
  KnowledgeBase = 'KNOWLEDGE_BASE',
  ConciergeAI = 'CONCIERGE_AI',
  SystemSettings = 'SYSTEM_SETTINGS',
  Marketplace = 'MARKETPLACE',
}

export enum OverlayId {
  Lifestyle = 'LIFESTYLE',
  Gamification = 'GAMIFICATION',
  Hobbies = 'HOBBIES',
  Media = 'MEDIA',
  Studio = 'STUDIO',
  Marketplace = 'MARKETPLACE',
}

export interface AppModule {
  id: AppModuleId;
  name: string;
  icon: React.ElementType;
  component: React.ComponentType;
}

export interface OverlayApp {
  id: OverlayId;
  name: string;
  icon: React.ElementType;
  component: React.ComponentType<{ onClose: () => void; onMinimize: () => void; }>;
}

export interface Product {
  id: string | number;
  title: string;
  category: string;
  price: string;
  image: string;
}

export interface CartItem extends Product {
  quantity: number;
}