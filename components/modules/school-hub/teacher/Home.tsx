import React from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Icons } from '../../../icons';
import './Home.css';

// Mock Data
const productivityData = [
  { name: 'Jan', value: 20 }, { name: 'Feb', value: 35 }, { name: 'Mar', value: 28 },
  { name: 'Apr', value: 42 }, { name: 'May', value: 38 }, { name: 'June', value: 45 },
];

const pointsData = [
    { name: 'Mar', value: 12 }, { name: 'Apr', value: 25 },
    { name: 'May', value: 50 }, { name: 'June', value: 21 },
];

const Home: React.FC = () => {
    return (
        <div className="teacher-home-container">
            <div className="teacher-home-grid">

                {/* AI Assistant */}
                <div className="th-widget ai-assistant">
                    <div className="th-widget-header">
                        <h3>AI assistant</h3>
                        <div className="th-header-controls">
                            <button className="th-btn-secondary"><Icons.Time size={16}/> Today</button>
                            <button className="th-btn-icon"><Icons.MoreVertical size={18}/></button>
                        </div>
                    </div>
                    <div className="ai-chat-area">
                        <div className="ai-avatar-msg">
                            <div className="ai-avatar"></div>
                            <div className="ai-msg">Good morning, are you</div>
                        </div>
                         <div className="ai-input-wrapper">
                            <input type="text" placeholder="Write your answer..." />
                            <button><Icons.Send size={18} /></button>
                        </div>
                    </div>
                </div>
                
                {/* Productivity */}
                <div className="th-widget productivity">
                     <div className="th-widget-header">
                        <h3>Productivity</h3>
                        <div className="th-header-controls">
                            <button className="th-btn-secondary"><Icons.Dashboard size={16}/> Projects</button>
                            <button className="th-btn-icon"><Icons.MoreVertical size={18}/></button>
                        </div>
                    </div>
                    <div className="productivity-stats">
                        <span>Tasks <strong>24/ <Icons.Plus size={12}/></strong></span>
                        <span>Hours <strong>12h 54m <Icons.Plus size={12}/></strong></span>
                        <span>Rate <strong>8 <Icons.Plus size={12}/></strong></span>
                    </div>
                    <div className="productivity-chart">
                        <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={productivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="productivityGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <YAxis tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 25, 53, 0.8)', border: '1px solid #a855f7', borderRadius: '0.5rem' }} />
                                <Area type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={2} fill="url(#productivityGradient)" activeDot={{ r: 6, fill: '#a855f7', stroke: '#fff' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Progress */}
                <div className="th-widget progress">
                    <div className="th-widget-header">
                        <h3>Progress</h3>
                         <div className="th-header-controls">
                            <button className="th-btn-secondary"><Icons.BookOpen size={16}/> Lessons</button>
                            <button className="th-btn-icon"><Icons.MoreVertical size={18}/></button>
                        </div>
                    </div>
                    <div className="progress-main">
                        <p className="progress-percent">72%</p>
                        <p className="progress-label">Total study projects</p>
                    </div>
                    <div className="progress-tabs">
                        <button className="active">In progress</button>
                        <button>Upcoming</button>
                        <button>Completed</button>
                    </div>
                    <div className="progress-stats">
                        <div className="progress-stat-item">
                            <div className="stat-icon-wrapper"><Icons.Time size={20}/></div>
                            <p className="stat-value">11</p><p className="stat-label">In progress</p>
                        </div>
                        <div className="progress-stat-item">
                            <div className="stat-icon-wrapper"><Icons.CalendarDays size={20}/></div>
                            <p className="stat-value">6</p><p className="stat-label">Upcoming</p>
                        </div>
                        <div className="progress-stat-item completed">
                             <div className="stat-icon-wrapper"><Icons.Check size={20}/></div>
                            <p className="stat-value">15</p><p className="stat-label">Completed</p>
                        </div>
                    </div>
                </div>

                {/* Upgrade to Pro */}
                <div className="th-widget upgrade-pro">
                    <div>
                        <h3>Upgrade to PRO <span>PRO</span></h3>
                        <p>Enjoy unlimited access to all courses, support, and more</p>
                    </div>
                    <button><Icons.ArrowRight size={20}/></button>
                </div>

                {/* Classes and Projects */}
                <div className="th-widget classes-projects">
                    <div className="th-widget-header">
                        <h3>Classes & projects</h3>
                         <div className="th-header-controls">
                             <button className="th-btn-secondary"><Icons.Filter size={16}/> Filter</button>
                            <button className="th-btn-group active">Week</button>
                             <button className="th-btn-group">Month</button>
                        </div>
                    </div>
                    <div className="schedule-container">
                        <div className="schedule-timeline">
                            {['08:00', '09:00', '10:00', '11:00', '12:00'].map(t => <div key={t} className="timeline-time">{t}</div>)}
                        </div>
                        <div className="schedule-grid">
                            {['MON 15', 'TUE 16', 'WED 17', 'THU 18', 'FRI 19'].map(day => (
                                <div key={day} className="schedule-day">
                                    <p className="schedule-day-header">{day}</p>
                                    <div className="schedule-events-column">
                                        {/* Simplified static content for visual representation */}
                                        {day === 'MON 15' && <div className="schedule-event done" style={{height: '120px'}}><h4>English</h4></div>}
                                        {day === 'TUE 16' && <><div className="schedule-event break" style={{height: '40px'}}>Break</div><div className="schedule-event high" style={{height: '100px'}}><h4>Leadership</h4></div></>}
                                        {day === 'WED 17' && <div className="schedule-event done" style={{height: '150px'}}><h4>Data structures</h4></div>}
                                        {day === 'THU 18' && <><div className="schedule-event low" style={{height: '80px'}}><h4>E-Business</h4></div><div className="schedule-event done" style={{height: '100px'}}><h4>Marketing</h4></div></>}
                                        {day === 'FRI 19' && <div className="schedule-event high" style={{height: '160px'}}><h4>Leadership</h4></div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Side column */}
                <div className="th-side-column">
                    <div className="th-widget group-tasks">
                         <div className="th-widget-header">
                            <h3>Group tasks</h3>
                            <span className="task-code">BF6</span>
                        </div>
                        <div className="task-item">
                            <div className="task-time">09:30 <small>AM</small></div>
                            <div className="task-details">
                                <p className="task-priority low">Low</p>
                                <p className="task-title">English: To make a project about new IT services and their features.</p>
                            </div>
                            <button className="task-action"><Icons.ArrowRight size={18}/></button>
                        </div>
                         <div className="task-item">
                            <div className="task-time">02:45 <small>PM</small></div>
                            <div className="task-details">
                                <p className="task-priority high">High</p>
                                <p className="task-title">Leadership: Develop a comprehensive plan to improve team communication</p>
                            </div>
                            <button className="task-action"><Icons.ArrowRight size={18}/></button>
                        </div>
                    </div>
                    <div className="th-widget points">
                         <div className="th-widget-header">
                            <h3>Points</h3>
                            <span className="points-total">112/180</span>
                        </div>
                        <div className="points-chart">
                             {pointsData.map((p, i) => (
                                <div key={p.name} className="point-bar-wrapper">
                                    {p.name === "May" && <span className="point-bar-badge">-16%</span>}
                                    <div className="point-bar-container">
                                        <div className="point-bar" style={{ height: `${p.value}%`}}>
                                            <span className="point-bar-value">{p.value}%</span>
                                        </div>
                                    </div>
                                    <span className="point-bar-label">{p.name}</span>
                                </div>
                             ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
