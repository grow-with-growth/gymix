
import React from 'react';
import '../shared.css';
import './TuitionAndFees.css';
import { Icons } from '../../../icons';

const tuitionPlans = [
    { name: "Full-Time K-8", price: "12,000", period: "year", features: ["Core Curriculum", "Arts & Music", "Physical Education"] },
    { name: "Full-Time 9-12", price: "15,000", period: "year", features: ["Core Curriculum", "AP Class Access", "College Counseling"] },
    { name: "Part-Time (per credit)", price: "800", period: "credit", features: ["Flexible Scheduling", "A La Carte Classes"] },
];

const fees = [
    { name: "Application Fee", amount: "75", description: "One-time, non-refundable" },
    { name: "Technology Fee", amount: "350", description: "Annual fee for device and software access" },
    { name: "Activity Fee", amount: "200", description: "Covers field trips and student activities" },
    { name: "Graduation Fee", amount: "150", description: "For graduating seniors only" },
];

const TuitionAndFees: React.FC = () => {
  return (
    <div className="tuition-fees-container">
        <div className="tuition-fees-header">
            <Icons.Finance size={48} className="text-cyan-400"/>
            <h2 className="font-orbitron text-3xl font-bold text-white">Tuition & Fees</h2>
            <p className="text-gray-400">2024-2025 Academic Year</p>
        </div>
        
        <h3 className="section-title">Tuition Plans</h3>
        <div className="plans-grid">
            {tuitionPlans.map(plan => (
                <div key={plan.name} className="plan-card">
                    <h4 className="plan-name">{plan.name}</h4>
                    <p className="plan-price"><span>${plan.price}</span> / {plan.period}</p>
                    <ul className="plan-features">
                        {plan.features.map(f => <li key={f}><Icons.Check size={16}/>{f}</li>)}
                    </ul>
                </div>
            ))}
        </div>

        <h3 className="section-title">Associated Fees</h3>
        <div className="fees-list">
            {fees.map(fee => (
                <div key={fee.name} className="fee-item">
                    <div>
                        <p className="fee-name">{fee.name}</p>
                        <p className="fee-description">{fee.description}</p>
                    </div>
                    <p className="fee-amount">${fee.amount}</p>
                </div>
            ))}
        </div>
    </div>
  );
};

export default TuitionAndFees;
