
import React, { useState, useMemo } from 'react';
import { Icons } from '../icons';
import GlassmorphicContainer from '../ui/GlassmorphicContainer';
import './knowledge-base-module.css';
import '../ui/tooltip.css';

// Import new modular components
import Mathematics from './knowledge-base/subjects/Mathematics';
import Science from './knowledge-base/subjects/Science';
import Languages from './knowledge-base/subjects/Languages';
import History from './knowledge-base/subjects/History';
import ArtsMusic from './knowledge-base/subjects/ArtsMusic';
import ComputerScience from './knowledge-base/subjects/ComputerScience';

import AllCourses from './knowledge-base/courses/AllCourses';
import APCourses from './knowledge-base/courses/APCourses';

import ExamPrep from './knowledge-base/exams/ExamPrep';
import PastExams from './knowledge-base/exams/PastExams';

import EBooks from './knowledge-base/library/EBooks';
import Articles from './knowledge-base/library/Articles';
import Videos from './knowledge-base/library/Videos';

type L1Tab = 'Subjects' | 'Courses' | 'Exams' | 'Library';

interface ContentItem {
  id: string;
  name: string;
  icon: React.ElementType;
  component: React.ComponentType;
}

const knowledgeBaseData: Record<L1Tab, ContentItem[]> = {
  Subjects: [
    { id: 'subject.math', name: 'Mathematics', icon: Icons.Calculator, component: Mathematics },
    { id: 'subject.science', name: 'Science', icon: Icons.FlaskConical, component: Science },
    { id: 'subject.languages', name: 'Languages', icon: Icons.Globe, component: Languages },
    { id: 'subject.history', name: 'History', icon: Icons.News, component: History },
    { id: 'subject.arts', name: 'Arts & Music', icon: Icons.Music, component: ArtsMusic },
    { id: 'subject.cs', name: 'Computer Science', icon: Icons.Computer, component: ComputerScience },
  ],
  Courses: [
      { id: 'courses.all', name: 'All Courses', icon: Icons.BookCopy, component: AllCourses },
      { id: 'courses.ap', name: 'AP Courses', icon: Icons.Award, component: APCourses },
  ],
  Exams: [
      { id: 'exams.prep', name: 'Exam Prep', icon: Icons.ClipboardCheck, component: ExamPrep },
      { id: 'exams.archive', name: 'Past Exams', icon: Icons.History, component: PastExams },
  ],
  Library: [
      { id: 'library.ebooks', name: 'eBooks', icon: Icons.Book, component: EBooks },
      { id: 'library.articles', name: 'Articles', icon: Icons.FileText, component: Articles },
      { id: 'library.videos', name: 'Videos', icon: Icons.Video, component: Videos },
  ],
};

const L1_TABS: { id: L1Tab; name: string; icon: React.ReactNode }[] = [
  { id: 'Subjects', name: 'Subjects', icon: <Icons.BookOpen size={18} /> },
  { id: 'Courses', name: 'Courses', icon: <Icons.BookCopy size={18} /> },
  { id: 'Exams', name: 'Exams', icon: <Icons.ClipboardCheck size={18} /> },
  { id: 'Library', name: 'Library', icon: <Icons.Library size={18} /> },
];

const KnowledgeBaseModule: React.FC = () => {
  const [activeL1, setActiveL1] = useState<L1Tab>('Subjects');
  const [activeL2Id, setActiveL2Id] = useState<string>(knowledgeBaseData.Subjects[0].id);

  const handleL1Click = (tabId: L1Tab) => {
    setActiveL1(tabId);
    setActiveL2Id(knowledgeBaseData[tabId][0].id);
  };

  const l2Items = useMemo(() => knowledgeBaseData[activeL1], [activeL1]);

  const ActiveComponent = useMemo(() => {
    return l2Items.find(r => r.id === activeL2Id)?.component || null;
  }, [l2Items, activeL2Id]);
  
  return (
    <GlassmorphicContainer className="knowledge-base-module-bordered w-full h-full flex flex-col rounded-2xl overflow-hidden">
      {/* Level 1 Header Navigation */}
      <div className="flex items-center gap-2 p-2 shrink-0 knowledge-base-header-bordered overflow-x-auto">
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

      <div className="knowledge-base-body">
        {/* Level 2 Icon Sidebar */}
        <div className="knowledge-base-l2-sidebar">
            {l2Items.map(item => {
                const Icon = item.icon;
                return (
                    <div key={item.id} className="relative group">
                        <button
                            onClick={() => setActiveL2Id(item.id)}
                            className={`knowledge-base-l2-button ${activeL2Id === item.id ? 'active' : ''}`}
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
                <p>Please select a category.</p>
            </div>
          )}
        </main>
      </div>
    </GlassmorphicContainer>
  );
};

export default KnowledgeBaseModule;
