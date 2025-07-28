
import React from 'react';
import { Icons } from '../../icons';
import './WordProcessor.css';

const WordProcessor: React.FC = () => {
  return (
    <div className="word-processor-container">
      <div className="word-toolbar">
        <button className="tool-btn"><Icons.Bold size={18}/></button>
        <button className="tool-btn"><Icons.Italic size={18}/></button>
        <button className="tool-btn"><Icons.Underline size={18}/></button>
        <div className="separator"></div>
        <button className="tool-btn"><Icons.AlignLeft size={18}/></button>
        <button className="tool-btn"><Icons.AlignCenter size={18}/></button>
        <button className="tool-btn"><Icons.AlignRight size={18}/></button>
      </div>
      <div className="word-document-area">
        <div className="word-page">
            <h1 contentEditable>Document Title</h1>
            <p contentEditable>
                This is a mock document editor. You can start typing here to see how it feels. The interface is designed to blend seamlessly with the futuristic aesthetic of the Aura OS, providing a clean and focused writing environment.
            </p>
        </div>
      </div>
    </div>
  );
};

export default WordProcessor;