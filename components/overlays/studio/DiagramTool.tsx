
import React from 'react';
import { Icons } from '../../icons';
import './DiagramTool.css';

const DiagramTool: React.FC = () => {
  return (
    <div className="diagram-tool-container">
      <div className="diagram-toolbar">
        <button className="tool-btn"><Icons.Rectangle size={24}/></button>
        <button className="tool-btn"><Icons.Circle size={24}/></button>
        <button className="tool-btn"><Icons.Diamond size={24}/></button>
        <button className="tool-btn"><Icons.ArrowRight size={24}/></button>
      </div>
      <div className="diagram-canvas">
        {/* Mock Content */}
        <div className="diagram-shape rect" style={{top: '20%', left: '30%'}}>Start</div>
        <div className="diagram-shape diamond" style={{top: '45%', left: '45%'}}>Decision?</div>
      </div>
    </div>
  );
};

export default DiagramTool;