import React from 'react';
import './ChildsProgress.css';
import '../shared.css';
import { Icons } from '../../../icons';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

// --- MOCK DATA ---
const progressData = {
    childName: "Alex",
    overallGrade: "A-",
    attendance: 98,
    missingAssignments: 1,
    recentGrades: [
        { id: 1, assignment: "Algebra Homework 5.2", grade: 95, subject: "Math" },
        { id: 2, assignment: "The Great Gatsby Ch. 3 Quiz", grade: 88, subject: "English" },
        { id: 3, assignment: "Photosynthesis Lab Report", grade: 92, subject: "Science" },
        { id: 4, assignment: "Civil War Essay Outline", grade: 100, subject: "History" },
    ],
    attendanceHistory: [
        { week: 'This Week', Present: 5, Absent: 0 },
        { week: 'Last Week', Present: 4, Absent: 1 },
        { week: '2 Weeks Ago', Present: 5, Absent: 0 },
        { week: '3 Weeks Ago', Present: 5, Absent: 0 },
    ],
    teacherFeedback: "Alex did an exceptional job on the latest lab report, showing a deep understanding of the material. Keep up the great work!",
};

const getGradeColor = (grade) => {
    if (grade >= 90) return 'text-green-400';
    if (grade >= 80) return 'text-yellow-400';
    if (grade >= 70) return 'text-orange-400';
    return 'text-red-400';
}

const StatCard = ({ icon, label, value, valueColor = 'text-white' }) => {
    const Icon = icon;
    return (
        <div className="progress-stat-card">
            <div className="stat-card-icon-wrapper"><Icon size={24} /></div>
            <div>
                <p className="stat-card-label">{label}</p>
                <p className={`stat-card-value ${valueColor}`}>{value}</p>
            </div>
        </div>
    );
};
// --- END MOCK DATA ---


const ChildsProgress: React.FC = () => {
  return (
    <div className="child-progress-container">
        <div className="child-progress-header">
            <Icons.User size={32} className="text-cyan-400"/>
            <h2 className="font-orbitron text-3xl font-bold text-white">{progressData.childName}'s Progress</h2>
        </div>
        
        <div className="progress-stats-grid">
            <StatCard icon={Icons.Students} label="Overall Grade" value={progressData.overallGrade} valueColor={getGradeColor(92)} />
            <StatCard icon={Icons.CheckCircle} label="Attendance" value={`${progressData.attendance}%`} />
            <StatCard icon={Icons.AlertTriangle} label="Missing Assignments" value={progressData.missingAssignments} valueColor={progressData.missingAssignments > 0 ? 'text-red-400' : 'text-white'} />
            <StatCard icon={Icons.AIHelper} label="Latest Feedback" value="Positive" valueColor="text-cyan-400" />
        </div>

        <div className="progress-details-grid">
            <div className="progress-widget">
                <h3 className="widget-title">Recent Grades</h3>
                <div className="grades-list">
                    {progressData.recentGrades.map(item => (
                        <div key={item.id} className="grade-item">
                            <div>
                                <p className="grade-item-title">{item.assignment}</p>
                                <p className="grade-item-subject">{item.subject}</p>
                            </div>
                            <p className={`grade-item-score ${getGradeColor(item.grade)}`}>{item.grade}%</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="progress-widget">
                <h3 className="widget-title">Attendance Overview (Last 4 Weeks)</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={progressData.attendanceHistory} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="week" hide />
                        <Bar dataKey="Present" stackId="a" fill="#8884d8" radius={[8, 0, 0, 8]}>
                            {progressData.attendanceHistory.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.Absent > 0 ? '#f59e0b' : '#22c55e'} />
                            ))}
                        </Bar>
                         <Bar dataKey="Absent" stackId="a" fill="#ef4444" radius={[0, 8, 8, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="progress-widget full-span">
                <h3 className="widget-title">Teacher Comments</h3>
                <div className="feedback-item">
                    <Icons.Chat size={20} className="text-purple-400 shrink-0"/>
                    <p className="feedback-text">"{progressData.teacherFeedback}"</p>
                </div>
            </div>

        </div>

    </div>
  );
};

export default ChildsProgress;