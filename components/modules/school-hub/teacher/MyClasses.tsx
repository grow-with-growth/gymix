
import React from 'react';
import '../shared.css';
import './MyClasses.css';
import { Icons } from '../../../icons';

const classesData = [
    { id: 1, subject: 'Algebra II', period: '1st Period', time: '8:00 - 8:50 AM', students: 28, color: 'from-blue-500 to-sky-500' },
    { id: 2, subject: 'Geometry', period: '2nd Period', time: '8:55 - 9:45 AM', students: 31, color: 'from-green-500 to-emerald-500' },
    { id: 3, subject: 'Algebra II', period: '4th Period', time: '10:45 - 11:35 AM', students: 25, color: 'from-blue-500 to-sky-500' },
    { id: 4, subject: 'Calculus AB', period: '5th Period', time: '12:15 - 1:05 PM', students: 18, color: 'from-purple-500 to-violet-500' },
    { id: 5, subject: 'Statistics', period: '6th Period', time: '1:10 - 2:00 PM', students: 22, color: 'from-orange-500 to-amber-500' },
];

const MyClasses: React.FC = () => {
  return (
    <div className="my-classes-container">
        <div className="my-classes-header">
            <Icons.Curriculum size={40} className="text-cyan-400"/>
            <h2 className="font-orbitron text-3xl font-bold text-white">My Classes</h2>
        </div>
        <div className="classes-grid">
            {classesData.map(c => (
                <div key={c.id} className={`class-card ${c.color}`}>
                    <div className="class-card-header">
                        <h3 className="class-subject">{c.subject}</h3>
                        <div className="class-students">
                            <Icons.Users size={16}/> {c.students}
                        </div>
                    </div>
                    <div className="class-card-body">
                        <p>{c.period}</p>
                        <p>{c.time}</p>
                    </div>
                    <div className="class-card-footer">
                        <button>View Class <Icons.ChevronRight size={16}/></button>
                    </div>
                </div>
            ))}
             <button className="add-class-card">
                <Icons.PlusCircle size={48} className="text-gray-500"/>
                <span>Add New Class</span>
            </button>
        </div>
    </div>
  );
};

export default MyClasses;
