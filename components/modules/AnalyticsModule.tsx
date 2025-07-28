

import React, { useState, useMemo } from 'react';
import { Icons } from '../icons';
import GlassmorphicContainer from '../ui/GlassmorphicContainer';
import './analytics-module.css';

// Import all new components
import LiveUsers from './analytics/overview/LiveUsers';
import TrafficSources from './analytics/overview/TrafficSources';
import Events from './analytics/overview/Events';
import AllTraffic from './analytics/overview/AllTraffic';
import GoogleAds from './analytics/overview/GoogleAds';
import Referrals from './analytics/overview/Referrals';
import Demographics from './analytics/overview/Demographics';
import Geo from './analytics/overview/Geo';
import Behavior from './analytics/overview/Behavior';

import CampaignPerformance from './analytics/marketing/CampaignPerformance';
import SEOQueries from './analytics/marketing/SEOQueries';
import SocialOverview from './analytics/marketing/SocialOverview';

import RevenueSummary from './analytics/finance/RevenueSummary';
import ExpensesByCategory from './analytics/finance/ExpensesByCategory';
import PnLStatement from './analytics/finance/PnLStatement';


type L1Tab = 'Overview' | 'Marketing' | 'Finance';

interface ReportItem {
  id: string;
  name: string;
  icon: React.ElementType;
  component: React.ComponentType;
}

const analyticsData: Record<L1Tab, ReportItem[]> = {
  Overview: [
    { id: 'overview.real-time.live-users', name: 'Live Users', icon: Icons.Users, component: LiveUsers },
    { id: 'overview.real-time.traffic-sources', name: 'Traffic Sources', icon: Icons.Orders, component: TrafficSources },
    { id: 'overview.real-time.events', name: 'Events', icon: Icons.Office, component: Events },
    { id: 'overview.acquisition.all-traffic', name: 'All Traffic', icon: Icons.Overview, component: AllTraffic },
    { id: 'overview.acquisition.google-ads', name: 'Google Ads', icon: Icons.Marketing, component: GoogleAds },
    { id: 'overview.acquisition.referrals', name: 'Referrals', icon: Icons.Send, component: Referrals },
    { id: 'overview.demographics', name: 'Demographics', icon: Icons.User, component: Demographics },
    { id: 'overview.geo', name: 'Geo', icon: Icons.Cloud, component: Geo },
    { id: 'overview.behavior', name: 'Behavior', icon: Icons.UsageAnalytics, component: Behavior },
  ],
  Marketing: [
    { id: 'marketing.campaigns.performance', name: 'Campaign Performance', icon: Icons.Analytics, component: CampaignPerformance },
    { id: 'marketing.seo.queries', name: 'SEO Queries', icon: Icons.Search, component: SEOQueries },
    { id: 'marketing.social.overview', name: 'Social Overview', icon: Icons.Chat, component: SocialOverview },
  ],
  Finance: [
    { id: 'finance.revenue.summary', name: 'Revenue Summary', icon: Icons.Finance, component: RevenueSummary },
    { id: 'finance.expenses.by-category', name: 'Expenses by Category', icon: Icons.Storefront, component: ExpensesByCategory },
    { id: 'finance.pnl.statement', name: 'P&L Statement', icon: Icons.Curriculum, component: PnLStatement },
  ],
};

const L1_TABS: { id: L1Tab; name: string; icon: React.ReactNode }[] = [
  { id: 'Overview', name: 'Overview', icon: <Icons.Overview size={18} /> },
  { id: 'Marketing', name: 'Marketing', icon: <Icons.Marketing size={18} /> },
  { id: 'Finance', name: 'Finance', icon: <Icons.Finance size={18} /> },
];

const AnalyticsModule: React.FC = () => {
  const [activeL1, setActiveL1] = useState<L1Tab>('Overview');
  const [activeReportId, setActiveReportId] = useState<string>(analyticsData.Overview[0].id);

  const handleL1Click = (tabId: L1Tab) => {
    setActiveL1(tabId);
    setActiveReportId(analyticsData[tabId][0].id);
  };

  const l2Reports = useMemo(() => analyticsData[activeL1], [activeL1]);

  const ActiveComponent = useMemo(() => {
    return l2Reports.find(r => r.id === activeReportId)?.component || null;
  }, [l2Reports, activeReportId]);
  
  return (
    <GlassmorphicContainer className="analytics-module-bordered w-full h-full flex flex-col rounded-2xl overflow-hidden">
      {/* Level 1 Header Navigation */}
      <div className="flex items-center gap-2 p-2 shrink-0 analytics-header-bordered">
        {L1_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleL1Click(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${activeL1 === tab.id ? 'bg-purple-600/50 text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>

      <div className="analytics-body">
        {/* Level 2 Icon Sidebar */}
        <div className="analytics-l2-sidebar">
            {l2Reports.map(report => {
                const Icon = report.icon;
                return (
                    <div key={report.id} className="relative group">
                        <button
                            onClick={() => setActiveReportId(report.id)}
                            className={`analytics-l2-button ${activeReportId === report.id ? 'active' : ''}`}
                            aria-label={report.name}
                        >
                            <Icon size={24} />
                        </button>
                        <div className="analytics-tooltip-bordered absolute left-full ml-4 top-1/2 -translate-y-1/2">
                            {report.name}
                        </div>
                    </div>
                );
            })}
        </div>
        
        {/* Main Content Pane */}
        <main className="flex-1 overflow-y-auto">
          {ActiveComponent ? (
            <ActiveComponent />
          ) : (
            <div className="flex items-center justify-center h-full text-center text-gray-500">
                <p>Please select a report.</p>
            </div>
          )}
        </main>
      </div>
    </GlassmorphicContainer>
  );
};

export default AnalyticsModule;