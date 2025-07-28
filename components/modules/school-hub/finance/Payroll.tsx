import React from 'react';
import '../shared.css';
import './Payroll.css';
import { Icons } from '../../../icons';

const payrollHistory = [
    { id: 'PAY-10-2024', date: '2024-10-15', amount: 85250.75, employees: 86, status: 'Paid' },
    { id: 'PAY-09-2024', date: '2024-09-15', amount: 84980.50, employees: 85, status: 'Paid' },
    { id: 'PAY-08-2024', date: '2024-08-15', amount: 84900.00, employees: 85, status: 'Paid' },
];

const Payroll: React.FC = () => {
  return (
    <div className="payroll-container">
        <div className="payroll-header">
            <Icons.Finance size={40} className="text-cyan-400"/>
            <h2 className="font-orbitron text-3xl font-bold text-white">Payroll</h2>
        </div>

        <div className="next-payroll-card">
            <div>
                <p className="next-payroll-label">Next Payroll Run</p>
                <p className="next-payroll-date">November 15, 2024</p>
            </div>
            <div className="text-right">
                 <p className="next-payroll-label">Estimated Total</p>
                 <p className="next-payroll-amount">$85,500.00</p>
            </div>
            <button className="run-payroll-btn"><Icons.PlayCircle size={20}/> Run Payroll</button>
        </div>

        <h3 className="history-title">Payroll History</h3>
        <div className="table-wrapper">
            <table className="payroll-table">
                <thead>
                    <tr>
                        <th>Run ID</th>
                        <th>Pay Date</th>
                        <th>Total Amount</th>
                        <th>Employees Paid</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {payrollHistory.map(p => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.date}</td>
                            <td>${p.amount.toLocaleString()}</td>
                            <td>{p.employees}</td>
                            <td>
                                <button className="view-details-btn"><Icons.Eye size={16}/> View Details</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default Payroll;
