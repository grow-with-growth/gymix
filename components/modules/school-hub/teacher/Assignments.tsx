
import React from 'react';
import '../shared.css';
import './Assignments.css';
import { Icons } from '../../../icons';

const assignmentsData = [
  { id: 1, title: 'Algebra Homework 5.1', class: 'Algebra II', due: '2024-10-28', submitted: 25, total: 28 },
  { id: 2, title: 'The Great Gatsby Essay', class: 'English 11', due: '2024-10-29', submitted: 20, total: 30 },
  { id: 3, title: 'Lab Report: Photosynthesis', class: 'Biology', due: '2024-11-01', submitted: 15, total: 26 },
  { id: 4, title: 'Calculus Problem Set 3', class: 'Calculus AB', due: '2024-11-02', submitted: 10, total: 18, isDraft: true },
];

const Assignments: React.FC = () => {
  return (
    <div className="assignments-container">
        <div className="assignments-header">
            <h2 className="font-orbitron text-3xl font-bold text-white">Assignments</h2>
            <button className="create-assignment-btn">
                <Icons.Plus size={18}/> Create New Assignment
            </button>
        </div>
        <div className="assignments-list">
            {assignmentsData.map(a => (
                <div key={a.id} className="assignment-card">
                    <div className="card-main">
                        <div className={`status-indicator ${a.isDraft ? 'draft' : 'published'}`}></div>
                        <div>
                            <p className="card-title">{a.title}</p>
                            <p className="card-class">{a.class}</p>
                        </div>
                    </div>
                    <div className="card-due-date">
                        <Icons.Time size={16}/>
                        Due: {a.due}
                    </div>
                    <div className="card-submissions">
                        <p>
                            <span className="font-bold text-white">{a.submitted} / {a.total}</span> Submitted
                        </p>
                        <div className="progress-bar-bg">
                            <div className="progress-bar-fg" style={{width: `${(a.submitted/a.total)*100}%`}}></div>
                        </div>
                    </div>
                    <div className="card-actions">
                        <button><Icons.AIGrading size={16}/> Grade</button>
                        <button><Icons.Edit size={16}/> Edit</button>
                        <button><Icons.MoreVertical size={16}/></button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default Assignments;
