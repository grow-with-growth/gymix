import React, { useState } from 'react';
import '../shared.css';
import './Attendance.css';
import { Icons } from '../../../icons';

const students = [
  'John Smith', 'Jane Doe', 'Peter Jones', 'Mary Lee', 'David Chen',
  'Emily White', 'James Green', 'Sophia Rodriguez', 'Liam Wilson', 'Olivia Brown'
];

type Status = 'present' | 'absent' | 'tardy';

const Attendance: React.FC = () => {
    const [attendance, setAttendance] = useState<{ [key: string]: Status }>(
        students.reduce((acc, name) => ({ ...acc, [name]: 'present' }), {})
    );

    const setStatus = (student, status: Status) => {
        setAttendance(prev => ({...prev, [student]: status}));
    };

  return (
    <div className="attendance-container">
        <div className="attendance-header">
            <h2 className="font-orbitron text-3xl font-bold text-white">Attendance</h2>
            <div className="date-selector">
                <Icons.Time size={18}/>
                <span>October 28, 2024 - Algebra II</span>
            </div>
        </div>
        <div className="attendance-grid">
            {students.map(student => (
                <div key={student} className="student-row">
                    <span className="student-name">{student}</span>
                    <div className="status-buttons">
                        <button 
                            className={`status-btn present ${attendance[student] === 'present' ? 'active' : ''}`}
                            onClick={() => setStatus(student, 'present')}
                        >
                            <Icons.Check size={16}/> Present
                        </button>
                        <button 
                            className={`status-btn absent ${attendance[student] === 'absent' ? 'active' : ''}`}
                            onClick={() => setStatus(student, 'absent')}
                        >
                            <Icons.Close size={16}/> Absent
                        </button>
                        <button 
                            className={`status-btn tardy ${attendance[student] === 'tardy' ? 'active' : ''}`}
                            onClick={() => setStatus(student, 'tardy')}
                        >
                            <Icons.Time size={16}/> Tardy
                        </button>
                    </div>
                </div>
            ))}
        </div>
        <div className="attendance-footer">
            <button className="submit-attendance-btn"><Icons.ClipboardCheck size={18}/> Submit Attendance</button>
        </div>
    </div>
  );
};

export default Attendance;