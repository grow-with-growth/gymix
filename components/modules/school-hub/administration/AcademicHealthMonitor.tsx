
import React from 'react';
import '../shared.css';
import './AcademicHealthMonitor.css';
import { Icons } from '../../../icons';

const Gauge = ({ value, label, color }) => (
    <div className="gauge-container">
        <svg viewBox="0 0 120 70" className="gauge-svg">
            <path
                d="M10 60 A 50 50 0 0 1 110 60"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="10"
                strokeLinecap="round"
            />
            <path
                d="M10 60 A 50 50 0 0 1 110 60"
                fill="none"
                stroke={color}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(value / 100) * 157}, 157`}
            />
        </svg>
        <div className="gauge-value">{value}%</div>
        <div className="gauge-label">{label}</div>
    </div>
);

const AcademicHealthMonitor: React.FC = () => {
  return (
    <div className="academic-health-container">
        <div className="academic-health-header">
            <Icons.HealthMonitor size={40} className="text-cyan-400"/>
            <h2 className="font-orbitron text-3xl font-bold text-white">Academic Health Monitor</h2>
        </div>

        <div className="gauges-grid">
            <Gauge value={94} label="Overall Attendance" color="#22c55e" />
            <Gauge value={88} label="Assignment Completion" color="#3b82f6" />
            <Gauge value={82} label="Positive Wellness" color="#eab308" />
            <Gauge value={76} label="Students 'At-Risk'" color="#ef4444" />
        </div>

        <div className="details-grid">
            <div className="details-card">
                <h3 className="details-title"><Icons.TrendingDown size={20}/> Students to Watch</h3>
                <ul>
                    <li className="detail-item">
                        <span>John Smith (Grade 9)</span>
                        <span className="detail-reason">3 missed assignments</span>
                    </li>
                    <li className="detail-item">
                        <span>Maria Garcia (Grade 11)</span>
                        <span className="detail-reason">Attendance dropped 20%</span>
                    </li>
                    <li className="detail-item">
                        <span>Chen Wei (Grade 10)</span>
                         <span className="detail-reason">Negative wellness alert</span>
                    </li>
                </ul>
            </div>
             <div className="details-card">
                <h3 className="details-title"><Icons.TrendingUp size={20}/> Notable Improvements</h3>
                <ul>
                    <li className="detail-item">
                        <span>Samantha Bee (Grade 12)</span>
                        <span className="detail-reason-green">Perfect attendance this month</span>
                    </li>
                    <li className="detail-item">
                        <span>Kevin Durant (Grade 9)</span>
                        <span className="detail-reason-green">Grades up 15% in Math</span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
  );
};

export default AcademicHealthMonitor;
