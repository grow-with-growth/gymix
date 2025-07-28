
import React, { useState } from 'react';
import '../shared.css';
import './Admissions.css';
import { Icons } from '../../../icons';

const initialApplicants = {
  applied: [
    { id: 'app-1', name: 'Emily White', grade: 9, date: '2024-10-15', isNew: true },
    { id: 'app-2', name: 'James Green', grade: 10, date: '2024-10-14', isNew: true },
    { id: 'app-3', name: 'Ava Garcia', grade: 9, date: '2024-10-12', isNew: false },
  ],
  interviewing: [
    { id: 'app-4', name: 'Sophia Rodriguez', grade: 9, date: '2024-10-12', interviewDate: '2024-10-28 @ 10:00 AM' },
  ],
  accepted: [
    { id: 'app-5', name: 'Liam Wilson', grade: 11, date: '2024-10-05' },
  ],
  rejected: [
    { id: 'app-6', name: 'Noah Martinez', grade: 10, date: '2024-10-01' },
  ],
};

type Status = 'applied' | 'interviewing' | 'accepted' | 'rejected';

const columns: { id: Status, title: string }[] = [
    { id: 'applied', title: 'New Applicants' },
    { id: 'interviewing', title: 'Interviewing' },
    { id: 'accepted', title: 'Accepted' },
    { id: 'rejected', title: 'Rejected' },
];

const Admissions: React.FC = () => {
    const [applicants, setApplicants] = useState(initialApplicants);
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverCol, setDragOverCol] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleDragStart = (e, item, sourceCol) => {
        e.dataTransfer.effectAllowed = 'move';
        setDraggedItem({item, sourceCol});
    };
    
    const handleDrop = (e, targetCol) => {
        if (!draggedItem) return;
        const { item, sourceCol } = draggedItem;
        if (sourceCol === targetCol) return;

        const newSourceItems = applicants[sourceCol].filter(i => i.id !== item.id);
        const newTargetItems = [...applicants[targetCol], {...item, isNew: false}];

        setApplicants(prev => ({
            ...prev,
            [sourceCol]: newSourceItems,
            [targetCol]: newTargetItems,
        }));
        setDraggedItem(null);
        setDragOverCol(null);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        setDragOverCol(null);
    };

    const handleDragOver = (e, colId) => {
        e.preventDefault();
        setDragOverCol(colId);
    };

  return (
    <div className="admissions-container">
        <div className="admissions-header">
            <h2 className="font-orbitron text-3xl font-bold text-white">Admissions Pipeline</h2>
            <button className="add-applicant-btn" onClick={() => setIsAddModalOpen(true)}>
                <Icons.UserPlus size={18}/>
                Add Applicant
            </button>
        </div>
        <div className="kanban-board">
            {columns.map(col => (
                <div 
                    key={col.id} 
                    className={`kanban-column ${dragOverCol === col.id ? 'drag-over' : ''}`}
                    onDrop={(e) => handleDrop(e, col.id)}
                    onDragOver={(e) => handleDragOver(e, col.id)}
                    onDragLeave={() => setDragOverCol(null)}
                >
                    <h3 className="column-title">{col.title} <span className="column-count">{applicants[col.id].length}</span></h3>
                    <div className="card-list">
                        {applicants[col.id].map(applicant => (
                            <div 
                                key={applicant.id}
                                className={`applicant-card ${draggedItem?.item.id === applicant.id ? 'is-dragging' : ''}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, applicant, col.id)}
                                onDragEnd={handleDragEnd}
                            >
                                <div className="card-header">
                                    <div className="card-avatar">{applicant.name.charAt(0)}</div>
                                    <p className="card-name">{applicant.name}</p>
                                    {applicant.isNew && <span className="new-badge">New</span>}
                                </div>
                                <p className="card-details">Grade {applicant.grade}</p>
                                {applicant.interviewDate && (
                                     <p className="card-interview-date"><Icons.Time size={14}/> {applicant.interviewDate}</p>
                                )}
                                <p className="card-date">Applied: {applicant.date}</p>
                            </div>
                        ))}
                         {applicants[col.id].length === 0 && (
                            <div className="empty-column-placeholder">
                                Drag applicants here
                            </div>
                         )}
                    </div>
                </div>
            ))}
        </div>
        {isAddModalOpen && (
            <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <h3 className="modal-header">Add New Applicant</h3>
                     <p className="text-gray-400 text-center mb-4">This is a mock form for demonstration.</p>
                    <button onClick={() => setIsAddModalOpen(false)} className="modal-close-btn"><Icons.Close/></button>
                    <button className="add-applicant-btn mt-4 w-full justify-center" onClick={() => setIsAddModalOpen(false)}>Add Applicant</button>
                </div>
            </div>
        )}
    </div>
  );
};

export default Admissions;
