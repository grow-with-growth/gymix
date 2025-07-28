
import React from 'react';
import '../shared.css';
import './Gradebook.css';
import { Icons } from '../../../icons';

const gradeData = {
    "algebra-ii": [
        { student: 'John Smith', grades: { 'HW1': 95, 'Quiz1': 88, 'HW2': 92, 'Test1': 85 } },
        { student: 'Jane Doe', grades: { 'HW1': 100, 'Quiz1': 92, 'HW2': 98, 'Test1': 95 } },
        { student: 'Peter Jones', grades: { 'HW1': 80, 'Quiz1': 75, 'HW2': null, 'Test1': 68 } },
        { student: 'Mary Lee', grades: { 'HW1': 88, 'Quiz1': 90, 'HW2': 91, 'Test1': 93 } },
    ]
};
const assignments = ['HW1', 'Quiz1', 'HW2', 'Test1'];

const getGradeColor = (grade) => {
    if (grade === null) return 'text-gray-500';
    if (grade >= 90) return 'text-green-400';
    if (grade >= 80) return 'text-blue-400';
    if (grade >= 70) return 'text-yellow-400';
    return 'text-red-400';
};

const Gradebook: React.FC = () => {
  return (
    <div className="gradebook-container">
        <div className="gradebook-header">
            <h2 className="font-orbitron text-3xl font-bold text-white">Gradebook</h2>
            <div className="class-selector">
                <label>Class:</label>
                <select>
                    <option>Algebra II - 1st Period</option>
                    <option>Geometry - 2nd Period</option>
                </select>
            </div>
        </div>
        <div className="table-wrapper">
            <table className="gradebook-table">
                <thead>
                    <tr>
                        <th>Student Name</th>
                        {assignments.map(a => <th key={a}>{a}</th>)}
                        <th>Overall</th>
                    </tr>
                </thead>
                <tbody>
                    {gradeData["algebra-ii"].map(row => {
                        const validGrades = Object.values(row.grades).filter(g => g !== null);
                        const overall = validGrades.length ? (validGrades.reduce((a,b) => a+b, 0) / validGrades.length).toFixed(1) : 'N/A';
                        return (
                            <tr key={row.student}>
                                <td>{row.student}</td>
                                {assignments.map(a => (
                                    <td key={a} className={getGradeColor(row.grades[a])}>
                                        {row.grades[a] ?? '-'}
                                    </td>
                                ))}
                                <td className={`font-bold ${getGradeColor(parseFloat(overall))}`}>{overall}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default Gradebook;
