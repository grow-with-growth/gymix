
import React from 'react';
import './Spreadsheet.css';

const Spreadsheet: React.FC = () => {
    const cols = Array.from({ length: 10 }, (_, i) => String.fromCharCode(65 + i));
    const rows = Array.from({ length: 25 }, (_, i) => i + 1);

  return (
    <div className="spreadsheet-container">
      <div className="spreadsheet-formula-bar">
        <div className="cell-name">A1</div>
        <input type="text" className="formula-input" />
      </div>
      <div className="spreadsheet-grid-area">
        <div className="spreadsheet-grid">
            <div className="corner"></div>
            {cols.map(c => <div key={c} className="col-header">{c}</div>)}
            {rows.map(r => (
                <React.Fragment key={r}>
                    <div className="row-header">{r}</div>
                    {cols.map(c => <div key={`${c}${r}`} className="cell" contentEditable></div>)}
                </React.Fragment>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Spreadsheet;