
import React, { useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { Icons } from '../../../icons';
import './Overview.css';

// --- MOCK DATA ---
const topStats = [
    { title: 'Students', value: '1260', Icon: Icons.Users },
    { title: 'Teachers', value: '224', Icon: Icons.Users },
    { title: 'Parents', value: '840', Icon: Icons.Users },
    { title: 'Earnings', value: '$54000', Icon: Icons.Finance }
];

const earningsData = [
  { name: 'Jan', Earnings: 40000, Expense: 24000 },
  { name: 'Feb', Earnings: 30000, Expense: 13980 },
  { name: 'Mar', Earnings: 42000, Expense: 38000 },
  { name: 'Apr', Earnings: 20000, Expense: 15000 },
  { name: 'May', Earnings: 31000, Expense: 28000 },
  { name: 'Jun', Earnings: 18000, Expense: 15000 },
  { name: 'Jul', Earnings: 22000, Expense: 19000 },
  { name: 'Aug', Earnings: 35000, Expense: 29000 },
  { name: 'Sep', Earnings: 45000, Expense: 24000 },
  { name: 'Oct', Earnings: 25000, Expense: 20000 },
  { name: 'Nov', Earnings: 41000, Expense: 38000 },
  { name: 'Dec', Earnings: 22000, Expense: 19000 },
];

const studentGenderData = [{ name: 'Male', value: 55, fill: '#3b82f6' }]; // RadialBarChart takes one value

const noticeBoardData = [
    { id: 1, title: 'Inter-school competition (sports/singing/drawing/drama)', date: '10 Feb, 2023', views: '7k', image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80' },
    { id: 2, title: 'Disciplinary action if school discipline is not followed', date: '6 Feb, 2023', views: '7k', image: 'https://images.unsplash.com/photo-1588782547935-1d6363558a3d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80' },
    { id: 3, title: 'School Annual function celebration 2023-24', date: '2 Feb, 2023', views: '7k', image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4e87205?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80' },
    { id: 4, title: 'Returning library books timely (Usually pinned on notice...)', date: '31 Jan, 2023', views: '7k', image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80' },
];

const StatCard = ({ title, value, Icon }) => (
    <div className="overview-widget stat-card">
        <div>
            <p className="stat-title">{title}</p>
            <p className="stat-value">{value}</p>
        </div>
        <button className="stat-button">
            <Icons.ChevronRight size={18} />
        </button>
    </div>
);


const SchoolOverview = () => {
    const [date, setDate] = useState(new Date(2023, 1, 1)); // Feb 2023

    const renderCalendarDays = () => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];
        for(let i=0; i<firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
        }
        for(let i=1; i<=daysInMonth; i++) {
            days.push(<div key={i} className={`calendar-day ${i === 16 ? 'active' : ''}`}>{i.toString().padStart(2, '0')}</div>)
        }
        return days;
    }

    const changeMonth = (amount) => {
        setDate(currentDate => {
            const newDate = new Date(currentDate);
            newDate.setMonth(newDate.getMonth() + amount);
            return newDate;
        })
    }

    return (
        <div className="overview-dashboard">
            <div className="overview-stats-grid">
                {topStats.map(stat => <StatCard key={stat.title} {...stat} />)}
            </div>
            <div className="overview-main-grid">
                
                {/* Earnings */}
                <div className="overview-widget earnings-card">
                    <div className="widget-header">
                        <h3>Earnings</h3>
                        <div className="widget-controls">2023 <Icons.ChevronLeft/></div>
                    </div>
                     <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={earningsData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.6)' }} fontSize={12} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.6)' }} fontSize={12} />
                            <Tooltip
                                wrapperClassName="chart-tooltip-wrapper"
                                contentStyle={{ backgroundColor: 'rgba(20, 20, 20, 0.8)', border: '1px solid #a855f7' }}
                            />
                            <Legend iconType="circle" />
                            <Bar dataKey="Earnings" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Expense" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Students */}
                <div className="overview-widget students-card">
                     <div className="widget-header">
                        <h3>Students</h3>
                        <button className="widget-more-btn"><Icons.MoreVertical size={18}/></button>
                    </div>
                    <div className="student-chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart 
                                innerRadius="70%" 
                                outerRadius="100%" 
                                data={studentGenderData} 
                                startAngle={90} 
                                endAngle={-270}
                            >
                                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                <RadialBar background={{ fill: 'rgba(255,255,255,0.1)' }} dataKey="value" cornerRadius={10} />
                            </RadialBarChart>
                        </ResponsiveContainer>
                        <div className="student-chart-center">
                            <Icons.Users size={32} className="text-orange-400" />
                        </div>
                    </div>
                    <div className="student-chart-legend">
                        <div>
                            <span className="legend-dot male"></span> Male: <strong>55%</strong>
                        </div>
                        <div>
                            <span className="legend-dot female"></span> Female: <strong>45%</strong>
                        </div>
                    </div>
                </div>

                {/* Calendar */}
                <div className="overview-widget calendar-card">
                    <div className="widget-header">
                        <h3>Event Calendar</h3>
                    </div>
                    <div className="calendar-controls">
                        <div className="calendar-tabs">
                            <button className="calendar-tab active">Day to day</button>
                            <button className="calendar-tab">Social Media</button>
                        </div>
                         <div className="calendar-nav">
                            <button onClick={() => changeMonth(-1)}><Icons.ChevronLeft size={16}/></button>
                            <span>{date.toLocaleString('default', { month: 'short' })} {date.getFullYear()}</span>
                            <button onClick={() => changeMonth(1)}><Icons.ChevronRight size={16}/></button>
                        </div>
                    </div>
                    <div className="calendar-grid">
                        <div className="calendar-header">MO</div>
                        <div className="calendar-header">TU</div>
                        <div className="calendar-header">WE</div>
                        <div className="calendar-header">TH</div>
                        <div className="calendar-header">FR</div>
                        <div className="calendar-header">SA</div>
                        <div className="calendar-header">SU</div>
                        {renderCalendarDays()}
                    </div>
                </div>
                
                {/* Notice Board */}
                <div className="overview-widget notice-board-card">
                     <div className="widget-header">
                        <h3>Notice Board</h3>
                        <p className="notice-sub">Create a notice or find a messages for you!</p>
                        <button className="widget-more-btn ml-auto"><Icons.MoreVertical size={18}/></button>
                    </div>
                    <div className="notice-list">
                        {noticeBoardData.map(item => (
                            <div className="notice-item" key={item.id}>
                                <img src={item.image} alt={item.title} className="notice-image" />
                                <p className="notice-title">{item.title}</p>
                                <p className="notice-date">{item.date}</p>
                                <div className="notice-actions">
                                    <Icons.Communications size={16} />
                                    <Icons.Facebook size={16} />
                                    <Icons.Twitter size={16} />
                                </div>
                                <div className="notice-views">
                                    <Icons.Eye size={16} /> {item.views}
                                </div>
                                <button className="widget-more-btn"><Icons.MoreVertical size={18}/></button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Community */}
                <div className="overview-widget community-card">
                    <div className="community-content">
                        <h3>Join the community and find out more</h3>
                        <p>Join different community and keep updated with the live notices and messages.</p>
                        <button className="explore-btn">Explore now</button>
                    </div>
                    <div className="community-bg-shape"></div>
                </div>
            </div>
        </div>
    );
}

export default SchoolOverview;
