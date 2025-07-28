import React from 'react';
import '../shared.css';
import './Budgeting.css';
import { Icons } from '../../../icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';


const budgetData = [
    { name: 'Academics', budget: 400000, actual: 380000 },
    { name: 'Operations', budget: 150000, actual: 165000 },
    { name: 'Marketing', budget: 50000, actual: 45000 },
    { name: 'Student Services', budget: 75000, actual: 70000 },
    { name: 'Technology', budget: 120000, actual: 110000 },
];

const Budgeting: React.FC = () => {
  return (
    <div className="budgeting-container">
        <div className="budgeting-header">
            <Icons.Marketing size={40} className="text-cyan-400"/>
            <h2 className="font-orbitron text-3xl font-bold text-white">Departmental Budgeting</h2>
        </div>
        <div className="budgeting-chart-wrapper">
            <h3 className="chart-title">Budget vs. Actual Spending</h3>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={budgetData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af' }}/>
                    <YAxis stroke="#9ca3af" tickFormatter={(value) => `$${value/1000}k`} tick={{ fill: '#9ca3af' }}/>
                    <Tooltip 
                        cursor={{fill: 'rgba(168, 85, 247, 0.1)'}}
                        contentStyle={{ backgroundColor: 'rgba(20, 20, 20, 0.8)', border: '1px solid #a855f7' }}
                    />
                    <Legend />
                    <Bar dataKey="budget" fill="#3b82f6" name="Budgeted" />
                    <Bar dataKey="actual" fill="#22d3ee" name="Actual" />
                </BarChart>
            </ResponsiveContainer>
        </div>
        <div className="table-wrapper">
             <table className="budget-table">
                <thead>
                    <tr><th>Department</th><th>Budget</th><th>Actual</th><th>Variance</th></tr>
                </thead>
                <tbody>
                    {budgetData.map(d => {
                        const variance = d.actual - d.budget;
                        const varianceColor = variance > 0 ? 'text-red-400' : 'text-green-400';
                        return (
                            <tr key={d.name}>
                                <td>{d.name}</td>
                                <td>${d.budget.toLocaleString()}</td>
                                <td>${d.actual.toLocaleString()}</td>
                                <td className={`font-bold ${varianceColor}`}>${variance.toLocaleString()}</td>
                            </tr>
                        );
                    })}
                </tbody>
             </table>
        </div>
    </div>
  );
};

export default Budgeting;
