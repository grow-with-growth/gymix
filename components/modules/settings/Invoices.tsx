
import React from 'react';
import { Icons } from '../../icons';
import './shared.css';

const invoices = [
    { id: 'INV-2024-10', date: '2024-10-01', amount: '500.00', status: 'Paid' },
    { id: 'INV-2024-09', date: '2024-09-01', amount: '500.00', status: 'Paid' },
    { id: 'INV-2024-08', date: '2024-08-01', amount: '500.00', status: 'Paid' },
];
const statusColors = { Paid: 'text-green-400', Due: 'text-yellow-400' };

const Invoices: React.FC = () => {
  return (
    <div className="settings-pane-container">
        <div className="settings-header">
            <Icons.FileText size={40} className="text-cyan-400"/>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">Invoices</h2>
                <p className="text-gray-400">View and download your billing history.</p>
            </div>
        </div>
        <div className="settings-card">
            <table className="settings-table">
                <thead>
                    <tr><th>Invoice ID</th><th>Date</th><th>Amount</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                    {invoices.map(inv => (
                        <tr key={inv.id}>
                            <td>{inv.id}</td>
                            <td>{inv.date}</td>
                            <td>${inv.amount}</td>
                            <td><span className={statusColors[inv.status]}>{inv.status}</span></td>
                            <td>
                                <button className="settings-button"><Icons.Download size={16}/> Download</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default Invoices;
