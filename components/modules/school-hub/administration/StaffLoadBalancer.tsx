
import React from 'react';
import '../shared.css';
import './StaffLoadBalancer.css';
import { Icons } from '../../../icons';

const staffLoadData = [
  { id: 1, name: 'B. Williams', classes: 5, students: 110, load: 95 },
  { id: 2, name: 'C. Brown', classes: 4, students: 95, load: 80 },
  { id: 3, name: 'F. Davis', classes: 6, students: 125, load: 110 },
  { id: 4, name: 'G. Taylor', classes: 3, students: 65, load: 60 },
  { id: 5, name: 'H. Lee', classes: 5, students: 105, load: 90 },
  { id: 6, name: 'J. Martinez', classes: 2, students: 40, load: 45 },
];

const LoadBar = ({ value }) => {
    let colorClass = 'bg-green-500';
    if (value > 85) colorClass = 'bg-yellow-500';
    if (value > 100) colorClass = 'bg-red-500';

    return (
        <div className="load-bar-background">
            <div 
                className={`load-bar-foreground ${colorClass}`} 
                style={{ width: `${Math.min(value, 120)}%`}}
            ></div>
        </div>
    );
};

const StaffLoadBalancer: React.FC = () => {
  return (
    <div className="load-balancer-container">
        <div className="load-balancer-header">
            <Icons.LoadBalancer size={40} className="text-cyan-400"/>
            <h2 className="font-orbitron text-3xl font-bold text-white">Staff Load Balancer</h2>
        </div>
        <div className="table-container">
            <table className="load-balancer-table">
                <thead>
                    <tr>
                        <th>Teacher</th>
                        <th>Classes</th>
                        <th>Students</th>
                        <th>Workload Index</th>
                    </tr>
                </thead>
                <tbody>
                    {staffLoadData.map(staff => (
                        <tr key={staff.id}>
                            <td>{staff.name}</td>
                            <td>{staff.classes}</td>
                            <td>{staff.students}</td>
                            <td>
                                <div className="load-cell">
                                    <LoadBar value={staff.load} />
                                    <span>{staff.load}%</span>
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

export default StaffLoadBalancer;
