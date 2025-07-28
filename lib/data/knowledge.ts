import {
    KnowledgeArticle,
} from '../../types';
import { getData } from '../utils';

export const dbKnowledgeArticles: KnowledgeArticle[] = [
    {
        title: "Student Attendance Policy",
        content: "All students are expected to attend classes regularly. An absence is considered excused for medical reasons (with a doctor's note), family emergencies, or pre-approved educational activities. Unexcused absences may affect grades. For remote learning days, attendance is marked by logging into the school portal and completing the daily check-in assignment by 10 AM."
    },
    {
        title: "Grading System and GPA",
        content: "Our grading system uses a standard A-F letter scale. 'A' corresponds to 90-100%, 'B' to 80-89%, 'C' to 70-79%, 'D' to 60-69%, and 'F' below 60%. GPA is calculated on a 4.0 scale. Advanced Placement (AP) courses are weighted, with an 'A' earning 5.0 points."
    },
    {
        title: "Extracurricular Activities",
        content: "We offer a wide range of extracurricular activities, including Debate Club, Robotics Team, and various sports. A full list is available in the Student Life section of the portal. Students must maintain a minimum 2.5 GPA to be eligible for participation."
    },
    {
        title: "IT Support and Device Policy",
        content: "For technical issues, please contact the IT helpdesk at support@saasschool.com. Students are responsible for their own devices. The school provides secure Wi-Fi access. Any attempt to bypass school network filters is a violation of the acceptable use policy."
    },
];

export const fetchKnowledgeBase = () => getData(dbKnowledgeArticles);
