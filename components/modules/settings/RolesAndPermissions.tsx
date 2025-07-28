
import React, { useState } from 'react';
import { Icons } from '../../icons';
import './shared.css';

const permissions = {
    Admin: ['Manage Users', 'Manage Billing', 'Edit Site Content', 'View All Analytics'],
    Teacher: ['Manage Courses', 'Grade Assignments', 'View Student Analytics'],
    Parent: ['View Child\'s Grades', 'Communicate with Teachers', 'Pay Invoices'],
    Student: ['View Courses', 'Submit Assignments', 'View Own Grades'],
};

const allPermissions = [
    'Manage Users', 'Manage Billing', 'Edit Site Content', 'View All Analytics',
    'Manage Courses', 'Grade Assignments', 'View Student Analytics',
    'View Child\'s Grades', 'Communicate with Teachers', 'Pay Invoices',
    'View Courses', 'Submit Assignments', 'View Own Grades'
];


const RolesAndPermissions: React.FC = () => {
    const [selectedRole, setSelectedRole] = useState('Admin');
    const rolePermissions = permissions[selectedRole] || [];

  return (
    <div className="settings-pane-container">
        <div className="settings-header">
            <Icons.UserCog size={40} className="text-cyan-400"/>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">Roles & Permissions</h2>
                <p className="text-gray-400">Define what users can see and do.</p>
            </div>
        </div>
        <div className="settings-card flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3 flex flex-col gap-2">
                {Object.keys(permissions).map(role => (
                    <button 
                        key={role}
                        onClick={() => setSelectedRole(role)}
                        className={`p-4 rounded-lg text-left ${selectedRole === role ? 'bg-purple-600/50' : 'bg-black/20 hover:bg-black/40'}`}
                    >
                        <p className="font-semibold text-white">{role}</p>
                        <p className="text-sm text-gray-400">{permissions[role].length} permissions</p>
                    </button>
                ))}
            </div>
            <div className="md:w-2/3">
                 <h3 className="settings-card-title mb-4">Permissions for {selectedRole}</h3>
                 <div className="space-y-4">
                    {allPermissions.map(perm => (
                        <div key={perm} className="flex items-center gap-4 p-3 bg-black/10 rounded-md">
                            <input type="checkbox" readOnly checked={rolePermissions.includes(perm)} className="w-5 h-5"/>
                            <span>{perm}</span>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    </div>
  );
};

export default RolesAndPermissions;
