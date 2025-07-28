import {
    SchoolUser,
    SchoolHubDashboardData
} from '../../types';
import { getData } from '../utils';

export const dbSchoolUsers: SchoolUser[] = Array.from({ length: 16 }, (_, i) => ({
    id: `user_${i + 1}`,
    name: ['John Doe', 'Jane Smith', 'Peter Jones', 'Mary Williams', 'Chris Brown', 'Patricia Miller', 'Robert Davis', 'Jennifer Garcia'][i % 8],
    role: i % 3 === 0 ? 'Student' : i % 3 === 1 ? 'Teacher' : 'Admin',
    department: ['Administration', 'Teacher', 'Student', 'Parent'][i % 4],
    avatarUrl: `https://i.pravatar.cc/150?u=user${i+1}`,
    email: `user${i+1}@saasschool.com`,
}));

const defaultDashboardData: SchoolHubDashboardData = {
    metrics: [
        { label: 'Total Members', value: '1,234', icon: 'Users' },
        { label: 'Overall Attendance', value: '94.5%', icon: 'UserCheck' },
        { label: 'Open Issues', value: '12', icon: 'AlertTriangle' },
    ],
    events: [
        { date: 'Oct 26', title: 'Parent-Teacher Conferences', time: '4:00 PM' },
        { date: 'Nov 03', title: 'Professional Development Day', time: 'All Day' },
        { date: 'Nov 10', title: 'School Board Meeting', time: '7:00 PM' },
    ],
    announcement: {
        title: 'Welcome to the School Hub!',
        content: 'This is the central place for all school-related information. Select a department to see a tailored overview.',
    },
};

export const dbSchoolHubDashboardData: Record<string, SchoolHubDashboardData> = {
    'Student': {
        metrics: [
            { label: 'Enrolled Students', value: '8,720', icon: 'Users' },
            { label: 'Avg. Attendance', value: '96.2%', icon: 'UserCheck' },
            { label: 'Avg. GPA', value: '3.41', icon: 'GraduationCap' },
        ],
        events: [
            { date: 'Oct 31', title: 'Mid-term Exams Begin', time: 'All Day' },
            { date: 'Nov 15', title: 'Guest Speaker: Dr. Eva Rostova', time: '1:00 PM' },
            { date: 'Nov 22', title: 'Fall Break Begins', time: '3:00 PM' },
        ],
        announcement: {
            title: 'Library Hours Extended',
            content: 'For the upcoming mid-term exams, the main library will be open until midnight starting next week.',
        },
    },
    'Teacher': {
        metrics: [
            { label: 'Active Teachers', value: '412', icon: 'Users' },
            { label: 'Avg. Class Size', value: '21', icon: 'Users' },
            { label: 'Curriculums Published', value: '89', icon: 'BookOpen' },
        ],
        events: [
            { date: 'Oct 26', title: 'Parent-Teacher Conferences', time: '4:00 PM' },
            { date: 'Nov 03', title: 'Professional Development Day', time: 'All Day' },
            { date: 'Dec 01', title: 'Q2 Grades Due', time: '5:00 PM' },
        ],
        announcement: {
            title: 'New Gradebook Software',
            content: 'A mandatory training session for the new "GradeMaster 3.0" software will be held on Nov 3rd.',
        },
    },
    // Add other departments as needed...
};


export const fetchSchoolUsers = (department: string) => {
    if (department === 'School') {
         return getData(dbSchoolUsers);
    }
    const filtered = dbSchoolUsers.filter(u => u.department === department);
    return getData(filtered.length > 0 ? filtered : dbSchoolUsers.slice(0, 4));
};

export const fetchSchoolHubDashboardData = (department: string) => {
    const data = dbSchoolHubDashboardData[department] || defaultDashboardData;
    return getData(data);
};
