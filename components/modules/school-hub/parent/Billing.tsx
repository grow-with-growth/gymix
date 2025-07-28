import React from 'react';
import '../shared.css';
import './Billing.css';
import { Icons } from '../../../icons';

const billingData = {
    currentBalance: 1575.50,
    dueDate: 'November 1, 2024',
    paymentHistory: [
        { id: 'pay_1', date: '2024-10-01', description: 'October Tuition Payment', amount: 1500.00, status: 'Paid' },
        { id: 'pay_2', date: '2024-09-15', description: 'Technology Fee', amount: 75.50, status: 'Paid' },
        { id: 'pay_3', date: '2024-09-01', description: 'September Tuition Payment', amount: 1500.00, status: 'Paid' },
    ]
};

const statusColors = {
    Paid: 'bg-green-500/20 text-green-400',
    Due: 'bg-blue-500/20 text-blue-400',
    Overdue: 'bg-red-500/20 text-red-400',
};

const Billing: React.FC = () => {
  return (
    <div className="billing-container">
        <div className="billing-header">
            <Icons.Finance size={40} className="text-cyan-400"/>
            <h2 className="font-orbitron text-3xl font-bold text-white">Billing & Payments</h2>
        </div>

        <div className="billing-main-grid">
            <div className="balance-card">
                <p className="balance-label">Current Balance</p>
                <p className="balance-amount">${billingData.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                <p className="balance-due-date">Due Date: {billingData.dueDate}</p>
                <button className="make-payment-btn">
                    <Icons.Finance size={20}/>
                    Make a Payment
                </button>
            </div>
            <div className="autopsy-card">
                <h3 className="widget-title">Auto-Pay</h3>
                <div className="autopsy-status">
                    <Icons.CheckCircle size={24} className="text-green-400"/>
                    <div>
                        <p className="autopsy-status-text">Auto-Pay is Active</p>
                        <p className="autopsy-status-subtext">Next payment of $1500.00 on Nov 1</p>
                    </div>
                </div>
                <button className="manage-autopsy-btn">Manage Settings</button>
            </div>
        </div>

        <div className="payment-history-widget">
            <h3 className="widget-title">Payment History</h3>
            <div className="table-wrapper">
                <table className="payment-history-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Receipt</th>
                        </tr>
                    </thead>
                    <tbody>
                        {billingData.paymentHistory.map(item => (
                            <tr key={item.id}>
                                <td>{item.date}</td>
                                <td>{item.description}</td>
                                <td>${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                <td><span className={`status-badge ${statusColors[item.status]}`}>{item.status}</span></td>
                                <td><button className="receipt-btn"><Icons.Download size={16}/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default Billing;