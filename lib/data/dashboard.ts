import {
    StatCardData,
    EngagementChartDataPoint,
} from '../../types';
import { getData } from '../utils';

// --- Dashboard Data ---
export const dbDashboardStats: StatCardData[] = [
    { title: "Total Students", value: "12,450", change: "+12.5% this month", icon: 'Users' },
    { title: "Revenue", value: "$450,231", change: "+8.2% this month", icon: 'DollarSign' },
    { title: "New Enrollments", value: "852", change: "-2.1% this month", icon: 'ShoppingCart' },
    { title: "Platform Activity", value: "78.9%", change: "+1.7% today", icon: 'Activity' },
];

export const dbEngagementChartData: EngagementChartDataPoint[] = [
  { name: 'Jan', uv: 4000, pv: 2400 },
  { name: 'Feb', uv: 3000, pv: 1398 },
  { name: 'Mar', uv: 2000, pv: 9800 },
  { name: 'Apr', uv: 2780, pv: 3908 },
  { name: 'May', uv: 1890, pv: 4800 },
  { name: 'Jun', uv: 2390, pv: 3800 },
  { name: 'Jul', uv: 3490, pv: 4300 },
];

export const dbRecentActivity = [
    { type: 'enrollment', change: -5, details: 'New student enrollments are down 5% week-over-week compared to the previous period.' },
    { type: 'revenue', category: 'Software', change: 15, details: 'Marketplace revenue from the "Software" category is up 15% this month.' },
    { type: 'engagement', user: 'Jane Smith', role: 'Teacher', details: 'Teacher Jane Smith has not logged in for 5 consecutive days.' },
    { type: 'communications', status: 'unread', count: 28, details: 'There are 28 unread emails in the main support inbox that are older than 3 days.' },
];


export const fetchDashboardStats = () => getData(dbDashboardStats);
export const fetchEngagementChartData = () => getData(dbEngagementChartData);
