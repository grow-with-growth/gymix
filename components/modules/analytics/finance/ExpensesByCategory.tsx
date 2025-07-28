import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Icons } from '../../../icons';
import '../shared.css';

const data = [
  { name: 'Salaries & Benefits', value: 950000, color: '#0088FE' },
  { name: 'Operations & Maintenance', value: 300000, color: '#00C49F' },
  { name: 'Instructional Supplies', value: 150000, color: '#FFBB28' },
  { name: 'Technology & Software', value: 120000, color: '#FF8042' },
  { name: 'Marketing & Admissions', value: 80000, color: '#AF19FF' },
];

const ExpensesByCategory: React.FC = () => {
  return (
    <div className="analytics-content-pane">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="analytics-widget">
                 <h3 className="analytics-widget-title"><Icons.PieChart size={20}/> Expense Distribution</h3>
                 <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={150}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            nameKey="name"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                         <Tooltip contentStyle={{ backgroundColor: 'rgba(20, 20, 20, 0.8)', border: '1px solid #a855f7' }}/>
                         <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
             <div className="analytics-widget">
                <h3 className="analytics-widget-title"><Icons.BarChart3 size={20}/> Expense Details</h3>
                <div className="analytics-table-container">
                    <table className="analytics-table">
                        <thead><tr><th>Category</th><th>Amount</th></tr></thead>
                        <tbody>
                            {data.map(item => (
                                <tr key={item.name}>
                                    <td className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></span>
                                        {item.name}
                                    </td>
                                    <td>${item.value.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ExpensesByCategory;