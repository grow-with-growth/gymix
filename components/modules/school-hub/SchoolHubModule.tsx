import React, { useState, useMemo } from 'react';
import { Icons } from '../../../icons';
import GlassmorphicContainer from '../../../ui/GlassmorphicContainer';
import './school-hub-module.css';
import '../ui/tooltip.css';

// Import all existing components
// School
import SchoolOverview from './school-hub/school/Overview';
import Announcements from './school-hub/school/Announcements';
import Calendar from './school-hub/school/Calendar';
import Branding from './school-hub/school/Branding';
// Administration
import StaffManagement from './school-hub/administration/StaffManagement';
import Admissions from './school-hub/administration/Admissions';
import SystemPrompts from './school-hub/administration/SystemPrompts';
import UsageAnalytics from './school-hub/administration/UsageAnalytics';
// Teacher
import TeacherHome from './teacher/Home'; // NEW
import MyClasses from './school-hub/teacher/MyClasses';
import Gradebook from './school-hub/teacher/Gradebook';
import Assignments from './school-hub/teacher/Assignments';
import Attendance from './school-hub/teacher/Attendance';
// Finance
import TuitionAndFees from './school-hub/finance/TuitionAndFees';
import Invoicing from './school-hub/finance/Invoicing';
import Payroll from './school-hub/finance/Payroll';
import Budgeting from './school-hub/finance/Budgeting';
// Marketing
import Campaigns from './school-hub/marketing/Campaigns';
import LeadManagement from './school-hub/marketing/LeadManagement';
import WebsiteAnalytics from './school-hub/marketing/WebsiteAnalytics';
// Student
import StudentHome from './school-hub/student/Home'; 
import MyProfile from './school-hub/student/MyProfile';
import MyGrades from './school-hub/student/MyGrades';
import MySchedule from './school-hub/student/MySchedule';
import LibraryAccess from './school-hub/student/LibraryAccess';
// Parent
import ParentHome from './school-hub/parent/Home'; 
import ChildsProgress from './school-hub/parent/ChildsProgress';
import ParentCommunication from './school-hub/parent/Communication';
import Billing from './school-hub/parent/Billing';
import SchoolEvents from './school-hub/parent/SchoolEvents';

// Import all NEW feature components
// School
import PolicyGenerator from './school-hub/school/PolicyGenerator';
import CommunityFeedbackAI from './school-hub/school/CommunityFeedbackAI';
// Administration
import AcademicHealthMonitor from './school-hub/administration/AcademicHealthMonitor';
import StaffLoadBalancer from './school-hub/administration/StaffLoadBalancer';
import PredictiveAnalytics from './school-hub/administration/PredictiveAnalytics';
import CrisisManagementHub from './school-hub/administration/CrisisManagementHub';
// Teacher
import AIGrading from './school-hub/teacher/AIGrading';
import SmartGapDetector from './school-hub/teacher/SmartGapDetector';
import ContentGenerator from './school-hub/teacher/ContentGenerator';
import CollaborationBoard from './school-hub/teacher/CollaborationBoard';
// Finance
import PredictiveBudgeting from './school-hub/finance/PredictiveBudgeting';
import GrantManagement from './school-hub/finance/GrantManagement';
// Marketing
import SocialMediaAI from './school-hub/marketing/SocialMediaAI';
import EnrollmentForecasting from './school-hub/marketing/EnrollmentForecasting';
// Student
import PersonalizedLearning from './school-hub/student/PersonalizedLearning';
import AIStudyAssistant from './school-hub/student/AIStudyAssistant';
import GrowthJournal from './school-hub/student/GrowthJournal';
import GoalTracking from './school-hub/student/GoalTracking';
import CommunityHubs from './school-hub/student/CommunityHubs';
// Parent
import DailyDigest from './school-hub/parent/DailyDigest';
import WellnessAlerts from './school-hub/parent/WellnessAlerts';
import HomeworkSupport from './school-hub/parent/HomeworkSupport';


type L1Tab = 'School' | 'Administration' | 'Teacher' | 'Finance' | 'Marketing' | 'Student' | 'Parent';

interface ReportItem {
  id: string;
  name: string;
  icon: React.ElementType;
  component: React.ComponentType;
}

const schoolHubData: Record<L1Tab, ReportItem[]> = {
  School: [
    { id: 'school.overview', name: 'Overview', icon: Icons.School, component: SchoolOverview },
    { id: 'school.announcements', name: 'Announcements', icon: Icons.News, component: Announcements },
    { id: 'school.calendar', name: 'Calendar', icon: Icons.Time, component: Calendar },
    { id: 'school.branding', name: 'Branding', icon: Icons.Branding, component: Branding },
    { id: 'school.policyGen', name: 'Policy Generator', icon: Icons.PolicyGenerator, component: PolicyGenerator },
    { id: 'school.feedback', name: 'Community Feedback AI', icon: Icons.FeedbackAI, component: CommunityFeedbackAI },
  ],
  Administration: [
    { id: 'admin.staff', name: 'Staff Management', icon: Icons.Users, component: StaffManagement },
    { id: 'admin.admissions', name: 'Admissions', icon: Icons.User, component: Admissions },
    { id: 'admin.prompts', name: 'System Prompts', icon: Icons.SystemPrompts, component: SystemPrompts },
    { id: 'admin.analytics', name: 'Usage Analytics', icon: Icons.UsageAnalytics, component: UsageAnalytics },
    { id: 'admin.healthMonitor', name: 'Academic Health Monitor', icon: Icons.HealthMonitor, component: AcademicHealthMonitor },
    { id: 'admin.loadBalancer', name: 'Staff Load Balancer', icon: Icons.LoadBalancer, component: StaffLoadBalancer },
    { id: 'admin.predictive', name: 'Predictive Analytics', icon: Icons.PredictiveAI, component: PredictiveAnalytics },
    { id: 'admin.crisisHub', name: 'Crisis Management Hub', icon: Icons.CrisisHub, component: CrisisManagementHub },
  ],
  Teacher: [
    { id: 'teacher.home', name: 'Home', icon: Icons.Home, component: TeacherHome },
    { id: 'teacher.classes', name: 'My Classes', icon: Icons.Curriculum, component: MyClasses },
    { id: 'teacher.gradebook', name: 'Gradebook', icon: Icons.Curriculum, component: Gradebook },
    { id: 'teacher.assignments', name: 'Assignments', icon: Icons.Office, component: Assignments },
    { id: 'teacher.attendance', name: 'Attendance', icon: Icons.ClipboardCheck, component: Attendance },
    { id: 'teacher.aiGrading', name: 'AI-Assisted Grading', icon: Icons.AIGrading, component: AIGrading },
    { id: 'teacher.gapDetector', name: 'Smart Gap Detector', icon: Icons.GapDetector, component: SmartGapDetector },
    { id: 'teacher.contentGen', name: 'Content Generator', icon: Icons.ContentGen, component: ContentGenerator },
    { id: 'teacher.collabBoard', name: 'Collaboration Board', icon: Icons.CollabBoard, component: CollaborationBoard },
  ],
  Finance: [
    { id: 'finance.tuition', name: 'Tuition & Fees', icon: Icons.Finance, component: TuitionAndFees },
    { id: 'finance.invoicing', name: 'Invoicing', icon: Icons.Office, component: Invoicing },
    { id: 'finance.payroll', name: 'Payroll', icon: Icons.Finance, component: Payroll },
    { id: 'finance.budgeting', name: 'Budgeting', icon: Icons.Marketing, component: Budgeting },
    { id: 'finance.predictiveBudgeting', name: 'Predictive Budgeting', icon: Icons.PredictiveBudgeting, component: PredictiveBudgeting },
    { id: 'finance.grants', name: 'Grant Management', icon: Icons.GrantManagement, component: GrantManagement },
  ],
  Marketing: [
    { id: 'marketing.campaigns', name: 'Campaigns', icon: Icons.Marketing, component: Campaigns },
    { id: 'marketing.leads', name: 'Lead Management', icon: Icons.Users, component: LeadManagement },
    { id: 'marketing.web', name: 'Website Analytics', icon: Icons.Analytics, component: WebsiteAnalytics },
    { id: 'marketing.social', name: 'Social Media AI', icon: Icons.SocialMediaAI, component: SocialMediaAI },
    { id: 'marketing.forecasting', name: 'Enrollment Forecasting', icon: Icons.EnrollmentForecasting, component: EnrollmentForecasting },
  ],
  Student: [
    { id: 'student.home', name: 'Home', icon: Icons.Home, component: StudentHome },
    { id: 'student.profile', name: 'My Profile', icon: Icons.User, component: MyProfile },
    { id: 'student.grades', name: 'My Grades', icon: Icons.Students, component: MyGrades },
    { id: 'student.schedule', name: 'My Schedule', icon: Icons.Time, component: MySchedule },
    { id: 'student.library', name: 'Library Access', icon: Icons.Library, component: LibraryAccess },
    { id: 'student.learningPath', name: 'Personalized Learning', icon: Icons.LearningPath, component: PersonalizedLearning },
    { id: 'student.aiAssistant', name: 'AI Study Assistant', icon: Icons.AIHelper, component: AIStudyAssistant },
    { id: 'student.journal', name: 'Growth Journal', icon: Icons.GrowthJournal, component: GrowthJournal },
    { id: 'student.goals', name: 'Goal Tracking', icon: Icons.Goal, component: GoalTracking },
    { id: 'student.hubs', name: 'Community Hubs', icon: Icons.CommunityHubs, component: CommunityHubs },
  ],
  Parent: [
    { id: 'parent.home', name: 'Home', icon: Icons.Home, component: ParentHome },
    { id: 'parent.progress', name: 'Child\'s Progress', icon: Icons.Overview, component: ChildsProgress },
    { id: 'parent.communication', name: 'Communication Hub', icon: Icons.ParentComms, component: ParentCommunication },
    { id: 'parent.billing', name: 'Billing', icon: Icons.Finance, component: Billing },
    { id: 'parent.events', name: 'School Events', icon: Icons.News, component: SchoolEvents },
    { id: 'parent.digest', name: 'Daily Digest', icon: Icons.DailyDigest, component: DailyDigest },
    { id: 'parent.wellness', name: 'Wellness Alerts', icon: Icons.WellnessAlerts, component: WellnessAlerts },
    { id: 'parent.homework', name: 'Homework Support', icon: Icons.HomeworkSupport, component: HomeworkSupport },
  ],
};

const L1_TABS: { id: L1Tab; name: string; icon: React.ReactNode }[] = [
  { id: 'School', name: 'School', icon: <Icons.School size={18} /> },
  { id: 'Administration', name: 'Administration', icon: <Icons.Administration size={18} /> },
  { id: 'Teacher', name: 'Teacher', icon: <Icons.Students size={18} /> },
  { id: 'Finance', name: 'Finance', icon: <Icons.Finance size={18} /> },
  { id: 'Marketing', name: 'Marketing', icon: <Icons.Marketing size={18} /> },
  { id: 'Student', name: 'Student', icon: <Icons.Students size={18} /> },
  { id: 'Parent', name: 'Parent', icon: <Icons.Users size={18} /> },
];

const SchoolHubModule: React.FC = () => {
  const [activeL1, setActiveL1] = useState<L1Tab>('Teacher');
  const [activeReportId, setActiveReportId] = useState<string>(schoolHubData.Teacher[0].id);

  const handleL1Click = (tabId: L1Tab) => {
    setActiveL1(tabId);
    setActiveReportId(schoolHubData[tabId][0].id);
  };

  const l2Reports = useMemo(() => schoolHubData[activeL1], [activeL1]);

  const ActiveComponent = useMemo(() => {
    return l2Reports.find(r => r.id === activeReportId)?.component || null;
  }, [l2Reports, activeReportId]);
  
  return (
    <GlassmorphicContainer className="school-hub-module-bordered w-full h-full flex flex-col rounded-2xl overflow-hidden">
      {/* Level 1 Header Navigation */}
      <div className="flex items-center gap-2 p-2 shrink-0 school-hub-header-bordered overflow-x-auto">
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

      <div className="school-hub-body">
        {/* Level 2 Icon Sidebar */}
        <div className="school-hub-l2-sidebar">
            {l2Reports.map(report => {
                const Icon = report.icon;
                return (
                    <div key={report.id} className="relative group">
                        <button
                            onClick={() => setActiveReportId(report.id)}
                            className={`school-hub-l2-button ${activeReportId === report.id ? 'active' : ''}`}
                            aria-label={report.name}
                        >
                            <Icon size={24} />
                        </button>
                        <div className="nav-tooltip-bordered absolute left-full ml-4 top-1/2 -translate-y-1/2">
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

export default SchoolHubModule;
