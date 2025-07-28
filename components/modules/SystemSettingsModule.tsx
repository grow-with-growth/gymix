
import React, { useState, useMemo } from 'react';
import { Icons } from '../icons';
import GlassmorphicContainer from '../ui/GlassmorphicContainer';
import './system-settings-module.css';
import '../ui/tooltip.css';

// Import all new settings components
import SchoolProfile from './settings/SchoolProfile';
import Branding from './settings/Branding';
import Localization from './settings/Localization';
import Notifications from './settings/Notifications';
import Staff from './settings/Staff';
import Students from './settings/Students';
import Parents from './settings/Parents';
import RolesAndPermissions from './settings/RolesAndPermissions';
import Marketplace from './settings/Marketplace';
import ConnectedApps from './settings/ConnectedApps';
import SubscriptionPlan from './settings/SubscriptionPlan';
import PaymentMethods from './settings/PaymentMethods';
import Invoices from './settings/Invoices';
import PasswordPolicy from './settings/PasswordPolicy';
import TwoFactorAuth from './settings/TwoFactorAuth';
import AuditLog from './settings/AuditLog';
import ApiKeys from './settings/ApiKeys';
import Webhooks from './settings/Webhooks';


type L1Tab = 'General' | 'Users & Roles' | 'Integrations' | 'Billing' | 'Security' | 'API';

interface SettingsItem {
  id: string;
  name: string;
  icon: React.ElementType;
  component: React.ComponentType;
}

const settingsData: Record<L1Tab, SettingsItem[]> = {
  General: [
    { id: 'general.profile', name: 'School Profile', icon: Icons.School, component: SchoolProfile },
    { id: 'general.branding', name: 'Branding', icon: Icons.Branding, component: Branding },
    { id: 'general.localization', name: 'Localization', icon: Icons.Globe, component: Localization },
    { id: 'general.notifications', name: 'Notifications', icon: Icons.Bell, component: Notifications },
  ],
  'Users & Roles': [
    { id: 'users.staff', name: 'Staff', icon: Icons.Users, component: Staff },
    { id: 'users.students', name: 'Students', icon: Icons.Students, component: Students },
    { id: 'users.parents', name: 'Parents', icon: Icons.Users, component: Parents },
    { id: 'users.roles', name: 'Roles & Permissions', icon: Icons.UserCog, component: RolesAndPermissions },
  ],
  Integrations: [
    { id: 'integrations.marketplace', name: 'Marketplace', icon: Icons.Store, component: Marketplace },
    { id: 'integrations.connected', name: 'Connected Apps', icon: Icons.Puzzle, component: ConnectedApps },
  ],
  Billing: [
    { id: 'billing.plan', name: 'Subscription Plan', icon: Icons.CreditCard, component: SubscriptionPlan },
    { id: 'billing.payment', name: 'Payment Methods', icon: Icons.Wallet, component: PaymentMethods },
    { id: 'billing.invoices', name: 'Invoices', icon: Icons.FileText, component: Invoices },
  ],
  Security: [
    { id: 'security.password', name: 'Password Policy', icon: Icons.BookLock, component: PasswordPolicy },
    { id: 'security.2fa', name: 'Two-Factor Auth', icon: Icons.Smartphone, component: TwoFactorAuth },
    { id: 'security.audit', name: 'Audit Log', icon: Icons.History, component: AuditLog },
  ],
  API: [
    { id: 'api.keys', name: 'API Keys', icon: Icons.KeyRound, component: ApiKeys },
    { id: 'api.webhooks', name: 'Webhooks', icon: Icons.Webhook, component: Webhooks },
  ],
};

const L1_TABS: { id: L1Tab; name: string; icon: React.ReactNode }[] = [
  { id: 'General', name: 'General', icon: <Icons.Settings size={18} /> },
  { id: 'Users & Roles', name: 'Users & Roles', icon: <Icons.Users size={18} /> },
  { id: 'Integrations', name: 'Integrations', icon: <Icons.Puzzle size={18} /> },
  { id: 'Billing', name: 'Billing', icon: <Icons.CreditCard size={18} /> },
  { id: 'Security', name: 'Security', icon: <Icons.Security size={18} /> },
  { id: 'API', name: 'API', icon: <Icons.Coder size={18} /> },
];

const SystemSettingsModule: React.FC = () => {
  const [activeL1, setActiveL1] = useState<L1Tab>('General');
  const [activeReportId, setActiveReportId] = useState<string>(settingsData.General[0].id);

  const handleL1Click = (tabId: L1Tab) => {
    setActiveL1(tabId);
    setActiveReportId(settingsData[tabId][0].id);
  };

  const l2Items = useMemo(() => settingsData[activeL1], [activeL1]);

  const ActiveComponent = useMemo(() => {
    return l2Items.find(r => r.id === activeReportId)?.component || null;
  }, [l2Items, activeReportId]);
  
  return (
    <GlassmorphicContainer className="system-settings-module-bordered w-full h-full flex flex-col rounded-2xl overflow-hidden">
      {/* Level 1 Header Navigation */}
      <div className="flex items-center gap-2 p-2 shrink-0 system-settings-header-bordered overflow-x-auto">
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

      <div className="system-settings-body">
        {/* Level 2 Icon Sidebar */}
        <div className="system-settings-l2-sidebar">
            {l2Items.map(item => {
                const Icon = item.icon;
                return (
                    <div key={item.id} className="relative group">
                        <button
                            onClick={() => setActiveReportId(item.id)}
                            className={`system-settings-l2-button ${activeReportId === item.id ? 'active' : ''}`}
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
        <main className="flex-1 overflow-y-auto">
          {ActiveComponent ? (
            <ActiveComponent />
          ) : (
            <div className="flex items-center justify-center h-full text-center text-gray-500">
                <p>Please select a setting.</p>
            </div>
          )}
        </main>
      </div>
    </GlassmorphicContainer>
  );
};

export default SystemSettingsModule;
