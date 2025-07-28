import React from 'react';
import '../shared.css';
import './Invoicing.css';
import { Icons } from '../../../icons';

const invoices = [
    { id: 'INV-001', student: 'John Smith', amount: 12000, issued: '2024-08-01', due: '2024-09-01', status: 'Paid' },
    { id: 'INV-002', student: 'Jane Doe', amount: 350, issued: '2024-08-01', due: '2024-09-01', status: 'Paid' },
    { id: 'INV-003', student: 'Peter Jones', amount: 12000, issued: '2024-08-01', due: '2024-09-01', status: 'Overdue' },
    { id: 'INV-004', student: 'Mary Lee', amount: 1500, issued: '2024-10-01', due: '2024-11-01', status: 'Due' },
];

const statusColors = {
    Paid: 'bg-green-500/20 text-green-400',
    Due: 'bg-blue-500/20 text-blue-400',
    Overdue: 'bg-red-500/20 text-red-400',
};

const Invoicing: React.FC = () => {
  return (
    <div className="invoicing-container">
        <div className="invoicing-header">
            <h2 className="font-orbitron text-3xl font-bold text-white">Invoicing</h2>
            <button className="create-invoice-btn"><Icons.Plus/> New Invoice</button>
        </div>
        <div className="table-wrapper">
            <table className="invoicing-table">
                <thead>
                    <tr>
                        <th>Invoice ID</th>
                        <th>Student</th>
                        <th>Amount</th>
                        <th>Issued Date</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.map(inv => (
                        <tr key={inv.id}>
                            <td>{inv.id}</td>
                            <td>{inv.student}</td>
                            <td>${inv.amount.toLocaleString()}</td>
                            <td>{inv.issued}</td>
                            <td>{inv.due}</td>
                            <td><span className={`status-badge ${statusColors[inv.status]}`}>{inv.status}</span></td>
                            <td>
                                <div className="action-buttons">
                                    <button className="action-icon-btn" title="View"><Icons.Eye size={16}/></button>
                                    <button className="action-icon-btn" title="Download PDF"><Icons.Download size={16}/></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default Invoicing;
