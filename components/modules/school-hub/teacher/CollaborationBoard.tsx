
import React from 'react';
import '../shared.css';
import './CollaborationBoard.css';
import { Icons } from '../../../icons';

const CollaborationBoard: React.FC = () => {
  return (
    <div className="collab-container">
        <div className="collab-toolbar">
            <div className="tool-group">
                <button className="tool-btn active"><Icons.MousePointer2 size={20}/></button>
                <button className="tool-btn"><Icons.PenSquare size={20}/></button>
                <button className="tool-btn"><Icons.Type size={20}/></button>
                <button className="tool-btn"><Icons.StickyNote size={20}/></button>
            </div>
            <div className="tool-group">
                 <button className="tool-btn"><Icons.Undo size={20}/></button>
                 <button className="tool-btn"><Icons.Redo size={20}/></button>
            </div>
            <div className="collab-avatars">
                <div className="avatar" style={{backgroundColor: '#ef4444'}}>JD</div>
                <div className="avatar" style={{backgroundColor: '#3b82f6'}}>AS</div>
                <div className="avatar" style={{backgroundColor: '#22c55e'}}>MW</div>
                <span className="avatar">+5</span>
            </div>
        </div>
        <div className="collab-canvas">
            {/* Mock Content */}
            <div className="sticky-note yellow" style={{top: '10%', left: '15%'}}>
                What are the main causes of the Civil War?
            </div>
             <div className="sticky-note blue" style={{top: '30%', left: '5%'}}>
                Economic Differences
            </div>
            <div className="sticky-note pink" style={{top: '40%', left: '25%'}}>
                Slavery
            </div>
            <div className="sticky-note green" style={{top: '25%', left: '40%'}}>
                States' Rights
            </div>
            
            <svg className="drawing" style={{top: '20%', left: '10%'}}>
                <path d="M 120 10 C 150 10, 150 60, 180, 60" stroke="#f87171" strokeWidth="3" fill="none" />
            </svg>

            <div className="cursor" style={{top: '50%', left: '50%'}}>
                <Icons.MousePointer2 size={20} className="text-blue-400"/>
                <span className="cursor-label">A. Smith</span>
            </div>
        </div>
    </div>
  );
};

export default CollaborationBoard;
