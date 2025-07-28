
import React from 'react';
import './Presentation.css';

const Presentation: React.FC = () => {
  return (
    <div className="presentation-container">
      <div className="presentation-thumbnails-bar">
        <div className="thumbnail active">
            <span>1</span>
            <div className="thumb-preview"></div>
        </div>
        <div className="thumbnail">
            <span>2</span>
            <div className="thumb-preview"></div>
        </div>
      </div>
      <div className="presentation-main-area">
        <div className="presentation-slide">
            <h1 contentEditable>Click to add title</h1>
            <p contentEditable>Click to add subtitle</p>
        </div>
      </div>
    </div>
  );
};

export default Presentation;