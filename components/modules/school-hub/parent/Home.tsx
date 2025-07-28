
import React, { useState } from 'react';
import './Home.css';
import { Icons } from '../../../icons';

const examResultsData = [
    { id: 'mat21', student: 'Jason Black', subject: 'Maths', class: '5th', status: 'Active', date: '21 Jul 2022', checked: true },
    { id: 'eng12', student: 'Gerald Ferrell', subject: 'English', class: '7th', status: 'Opened', date: '14 Jun 2022', checked: false },
    { id: 'phy09', student: 'Delbert Barna', subject: 'Physics', class: '6th', status: 'Completed', date: '10 Mar 2022', checked: false },
];

const kidsData = [
    { name: 'Jessia', class: '2nd', img: 'https://i.pravatar.cc/40?u=jessia' },
    { name: 'Jack', class: '6th', img: 'https://i.pravatar.cc/40?u=jack' },
    { name: 'Jason', class: '11th', img: 'https://i.pravatar.cc/40?u=jason' },
];

const communityData = [
    { title: 'Parents Union', description: 'March 2023' },
    { title: 'Transportation', description: 'March 2023' },
    { title: 'Marathon', description: '2023' },
];

const expensesData = [
    { name: 'Exam Fees', amount: 150.00, date: '22/02/2019', status: 'Paid' },
    { name: 'Semester Fees', amount: 350.00, date: '22/02/2019', status: 'Due' },
    { name: 'External Exam Fees', amount: 150.00, date: '22/02/2019', status: 'Paid' },
    { name: 'Project Fees', amount: 400.00, date: '02/02/2019', status: 'Paid' },
];

const Calendar = () => {
    const [date, setDate] = useState(new Date(2023, 1, 1)); // Feb 2023

    const renderCalendarDays = () => {
        const days = [];
        // This is a simplified representation to match the image
        const dayValues = [
            '','','','', '01','02','03',
            '04','05','06','07','08','09','10',
            '11','12','13','14','15','16','17',
            '18','19','20','21','22','23','24',
            '25','26','27','28','','',''
        ];
        dayValues.forEach((day, i) => {
            days.push(<div key={i} className={`pd-calendar-day ${day === '16' ? 'active' : ''} ${!day ? 'empty' : ''}`}>{day}</div>)
        });
        return days;
    }

    return (
        <div className="pd-widget pd-calendar-widget">
            <div className="pd-widget-header">
                <h3>Event Calendar</h3>
                <button className="pd-widget-more-btn"><Icons.MoreVertical size={18}/></button>
            </div>
            <div className="pd-calendar-controls">
                <div className="pd-calendar-tabs">
                    <button className="pd-calendar-tab active">Day to day</button>
                    <button className="pd-calendar-tab">Events</button>
                </div>
            </div>
             <div className="pd-calendar-nav">
                <span>{date.toLocaleString('default', { month: 'long' })} {date.getFullYear()}</span>
                 <div className="pd-calendar-nav-btns">
                    <button><Icons.ChevronLeft size={16}/></button>
                    <button><Icons.ChevronRight size={16}/></button>
                </div>
            </div>
            <div className="pd-calendar-grid">
                <div className="pd-calendar-header">MO</div>
                <div className="pd-calendar-header">TU</div>
                <div className="pd-calendar-header">WE</div>
                <div className="pd-calendar-header">TH</div>
                <div className="pd-calendar-header">FR</div>
                <div className="pd-calendar-header">SA</div>
                <div className="pd-calendar-header">SU</div>
                {renderCalendarDays()}
            </div>
        </div>
    );
}

const Home: React.FC = () => {
    return (
        <div className="parent-dashboard">
            {/* Main Content Area */}
            <div className="pd-main-content">
                <div className="pd-stats-row">
                    <div className="pd-stat-card">
                        <div>
                            <p className="pd-stat-title">Due Fees</p>
                            <p className="pd-stat-value">$4503</p>
                        </div>
                        <button className="pd-stat-btn"><Icons.ChevronRight /></button>
                    </div>
                     <div className="pd-stat-card">
                        <div>
                            <p className="pd-stat-title">Results</p>
                            <p className="pd-stat-value">24</p>
                        </div>
                        <button className="pd-stat-btn"><Icons.ChevronRight /></button>
                    </div>
                     <div className="pd-stat-card">
                        <div>
                            <p className="pd-stat-title">Complaints</p>
                            <p className="pd-stat-value">12</p>
                        </div>
                        <button className="pd-stat-btn"><Icons.ChevronRight /></button>
                    </div>
                     <div className="pd-stat-card">
                        <div>
                            <p className="pd-stat-title">Expenses</p>
                            <p className="pd-stat-value">$54000</p>
                        </div>
                        <button className="pd-stat-btn"><Icons.ChevronRight /></button>
                    </div>
                </div>
                
                <div className="pd-middle-row">
                    <div className="pd-widget pd-parent-profile-widget">
                        <div className="pd-widget-header">
                            <h3>Parents</h3>
                            <div>
                                <button className="pd-widget-icon-btn"><Icons.User size={16}/></button>
                                <button className="pd-widget-more-btn"><Icons.MoreVertical size={16}/></button>
                            </div>
                        </div>
                        <div className="pd-parent-profile-body">
                            <div className="pd-parent-avatar-wrapper">
                                 <img src="https://i.pravatar.cc/100?u=william" alt="William Balck" />
                            </div>
                            <h4>William Balck</h4>
                            <p>williamblack@gmail.com</p>
                            <p>+88 9856418</p>
                        </div>
                        <div className="pd-parent-socials">
                            <button><Icons.Printer size={20}/></button>
                            <button><Icons.MapPin size={20}/></button>
                            <button><Icons.Facebook size={20}/></button>
                            <button><Icons.Twitter size={20}/></button>
                            <button><Icons.Instagram size={20}/></button>
                        </div>
                    </div>
                    <div className="pd-middle-column">
                         <div className="pd-widget pd-kids-widget">
                             <div className="pd-widget-header">
                                <h3>Kids</h3>
                                <button className="pd-widget-more-btn"><Icons.MoreVertical size={18}/></button>
                            </div>
                            <div className="pd-kids-list">
                                {kidsData.map(kid => (
                                    <div key={kid.name} className="pd-kid-card">
                                        <img src={kid.img} alt={kid.name} />
                                        <p className="pd-kid-name">{kid.name}</p>
                                        <p className="pd-kid-class">Class: {kid.class}</p>
                                    </div>
                                ))}
                            </div>
                         </div>
                         <div className="pd-widget pd-community-widget">
                             <div className="pd-widget-header">
                                <h3>Joined Community</h3>
                            </div>
                            <div className="pd-community-list">
                                {communityData.map(item => (
                                    <div key={item.title} className="pd-community-item">
                                        <p className="pd-community-title">{item.title}</p>
                                        <p className="pd-community-desc">{item.description}</p>
                                        <button className="pd-community-remove-btn">Remove</button>
                                    </div>
                                ))}
                            </div>
                         </div>
                    </div>
                </div>
                
                <div className="pd-widget pd-exams-widget">
                    <div className="pd-widget-header">
                        <h3>Exam Results</h3>
                        <div>
                             <button className="pd-widget-icon-btn"><Icons.Printer size={16}/></button>
                             <button className="pd-widget-icon-btn"><Icons.Download size={16}/></button>
                        </div>
                    </div>
                    <table className="pd-exams-table">
                        <thead>
                            <tr>
                                <th><input type="checkbox"/></th>
                                <th>Exam Id</th>
                                <th>Student Name</th>
                                <th>Subject</th>
                                <th>Class</th>
                                <th>Status</th>
                                <th>Sub. Date</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {examResultsData.map(row => (
                                <tr key={row.id} className={row.checked ? 'checked' : ''}>
                                    <td><input type="checkbox" defaultChecked={row.checked}/></td>
                                    <td>#{row.id}</td>
                                    <td>{row.student}</td>
                                    <td>{row.subject}</td>
                                    <td>{row.class}</td>
                                    <td><span className={`pd-exam-status ${row.status.toLowerCase()}`}>{row.status}</span></td>
                                    <td>{row.date}</td>
                                    <td><button className="pd-widget-more-btn"><Icons.MoreVertical size={16}/></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sidebar */}
            <div className="pd-sidebar">
                <Calendar />
                <div className="pd-widget pd-expenses-widget">
                    <div className="pd-widget-header">
                        <h3>All Expenses</h3>
                    </div>
                    <div className="pd-expenses-list">
                        {expensesData.map((exp, i) => (
                            <div className="pd-expense-item" key={i}>
                                <div>
                                    <p className="pd-expense-name">{exp.name}</p>
                                    <p className="pd-expense-details">${exp.amount.toFixed(2)} - {exp.date}</p>
                                </div>
                                <div className="pd-expense-actions">
                                    <button className="pd-widget-icon-btn"><Icons.Bell size={18}/></button>
                                    <span className={`pd-expense-status ${exp.status.toLowerCase()}`}>{exp.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
