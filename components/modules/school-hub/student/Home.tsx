import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Icons } from '../../../icons';
import './Home.css';

// MOCK DATA
const studentData = {
    name: "Jason Black",
    id: "1406",
    email: "jasonblack@gmail.com",
    phone: "+88 9856418",
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    personalDetails: {
        Gender: 'Male',
        "Father's Name": 'Alex Black',
        "Mother's Name": 'Jesica Black',
        "Date of Birth": '14, June 2006',
        Religion: 'Christian',
        "Father Occupation": 'Banker',
        "Admission Date": '05, June 2012',
        Address: 'House 10, Road 6, Australia.',
        Class: '11th',
        Section: 'Pink',
    }
};

const attendanceData = [
  { name: 'Present', value: 75, color: '#4338ca' },
  { name: 'Half Day Present', value: 10, color: '#f97316' },
  { name: 'Late Coming', value: 10, color: '#a3e635' },
  { name: 'Absent', value: 5, color: '#6b7280' },
];

const examResultsData = [
    { id: 'mat21', type: 'Class Test', subject: 'Maths', grade: 'A', percentage: 89, date: '21 Jul 2022', checked: true },
    { id: 'mat22', type: 'Quarterly Test', subject: 'English', grade: 'A+', percentage: 93, date: '14 Jun 2022', checked: false },
    { id: 'mat23', type: 'Oral Test', subject: 'Physics', grade: 'B', percentage: 78, date: '10 Mar 2022', checked: false },
    { id: 'mat24', type: 'Class Test', subject: 'Chemistry', grade: 'A', percentage: 88, date: '06 Jan 2022', checked: false },
];

const Calendar = () => {
    const [date] = useState(new Date(2023, 1, 1)); // Feb 2023
    const renderCalendarDays = () => {
        const days = [];
        const dayValues = [
            '','','','', '01','02','03', '04','05','06','07','08','09','10',
            '11','12','13','14','15','16','17', '18','19','20','21','22','23','24',
            '25','26','27','28'
        ];
        dayValues.forEach((day, i) => {
            days.push(<div key={i} className={`sh-calendar-day ${day === '16' ? 'active' : ''} ${!day ? 'empty' : ''}`}>{day}</div>)
        });
        return days;
    }
    return (
        <div className="sh-widget sh-calendar-widget">
            <div className="sh-widget-header">
                <h3>Event Calendar</h3>
                <button className="sh-widget-more-btn"><Icons.MoreVertical size={18}/></button>
            </div>
            <div className="sh-calendar-tabs">
                <button className="sh-calendar-tab active">Day to day</button>
                <button className="sh-calendar-tab">Events</button>
            </div>
            <div className="sh-calendar-nav">
                <span>{date.toLocaleString('default', { month: 'long' })} {date.getFullYear()}</span>
                <div className="sh-calendar-nav-btns">
                    <button><Icons.ChevronLeft size={16}/></button>
                    <button><Icons.ChevronRight size={16}/></button>
                </div>
            </div>
            <div className="sh-calendar-grid">
                <div className="sh-calendar-header">MO</div>
                <div className="sh-calendar-header">TU</div>
                <div className="sh-calendar-header">WE</div>
                <div className="sh-calendar-header">TH</div>
                <div className="sh-calendar-header">FR</div>
                <div className="sh-calendar-header">SA</div>
                <div className="sh-calendar-header">SU</div>
                {renderCalendarDays()}
            </div>
        </div>
    )
}

const StudentHome: React.FC = () => {
    const [detailsOpen, setDetailsOpen] = useState(true);

    return (
        <div className="student-home-container">
            <div className="student-home-bio-col">
                <div className="sh-widget sh-bio-widget">
                    <div className="sh-widget-header">
                        <h3 className="text-xl">Bio</h3>
                        <button className="sh-widget-more-btn"><Icons.MoreVertical size={18}/></button>
                    </div>
                    <div className="sh-bio-profile">
                        <div className="sh-bio-avatar-wrapper">
                            <img src={studentData.avatar} alt={studentData.name} />
                        </div>
                        <h4>{studentData.name} ({studentData.id})</h4>
                        <p>{studentData.email}</p>
                        <p>{studentData.phone}</p>
                    </div>
                    <div className="sh-personal-details">
                        <button className="sh-details-header" onClick={() => setDetailsOpen(!detailsOpen)}>
                            <span>Personal Details</span>
                            <Icons.ChevronRight size={18} className={`transition-transform ${detailsOpen ? 'rotate-90' : ''}`} />
                        </button>
                        {detailsOpen && (
                            <div className="sh-details-content">
                                {Object.entries(studentData.personalDetails).map(([key, value]) => (
                                    <div key={key} className="sh-detail-row">
                                        <span>{key}:</span>
                                        <span>{value}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                     <div className="sh-bio-socials">
                        <button><Icons.Printer size={20}/></button>
                        <button><Icons.Facebook size={20}/></button>
                        <button><Icons.Twitter size={20}/></button>
                        <button><Icons.Instagram size={20}/></button>
                    </div>
                </div>
            </div>

            <div className="student-home-main-col">
                <div className="sh-top-row">
                    <div className="sh-widget sh-stat-widget">
                        <p>Events</p>
                        <div className="flex items-end justify-between">
                            <span className="sh-stat-value">6</span>
                            <button className="sh-stat-btn"><Icons.ChevronRight/></button>
                        </div>
                    </div>
                    <div className="sh-widget sh-stat-widget">
                        <p>Growth</p>
                         <div className="flex items-end justify-between">
                            <span className="sh-stat-value">72%</span>
                             <button className="sh-stat-btn"><Icons.ChevronRight/></button>
                        </div>
                    </div>
                    <div className="sh-widget sh-attendance-widget">
                        <div className="sh-widget-header mb-0">
                            <h3>Attendance</h3>
                             <button className="sh-widget-more-btn"><Icons.MoreVertical size={18}/></button>
                        </div>
                        <p className="text-sm text-gray-400 -mt-2 mb-2">Feb 2023</p>
                        <div className="sh-attendance-body">
                            <div className="sh-attendance-chart">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={attendanceData} dataKey="value" innerRadius="70%" outerRadius="100%" startAngle={90} endAngle={450} paddingAngle={2}>
                                        {attendanceData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke={'none'} />)}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                             <div className="sh-attendance-legend">
                                {attendanceData.map(item => (
                                    <div key={item.name} className="legend-item">
                                        <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                                        {item.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="sh-bottom-row">
                    <Calendar />

                    <div className="sh-widget sh-exams-widget">
                         <div className="sh-widget-header">
                            <h3>All Exam Results</h3>
                            <button className="sh-widget-more-btn"><Icons.MoreVertical size={18}/></button>
                        </div>
                        <table className="sh-exams-table">
                            <thead>
                                <tr>
                                    <th><input type="checkbox"/></th><th>Exam Id</th><th>Type</th><th>Subject</th><th>Grade</th><th>%</th><th>Date</th><th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {examResultsData.map(row => (
                                     <tr key={row.id}>
                                        <td><input type="checkbox" defaultChecked={row.checked}/></td>
                                        <td>#{row.id}</td>
                                        <td>{row.type}</td>
                                        <td>{row.subject}</td>
                                        <td>{row.grade}</td>
                                        <td>{row.percentage}</td>
                                        <td>{row.date}</td>
                                        <td><button className="sh-widget-more-btn"><Icons.MoreVertical size={16}/></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StudentHome;