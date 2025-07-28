
import React, { useState, useMemo } from 'react';
import '../shared.css';
import './StaffManagement.css';
import { Icons } from '../../../icons';

const staffData = [
  { id: 1, name: 'Alice Johnson', role: 'Principal', department: 'Administration', email: 'a.johnson@school.edu', status: 'Full-time', hireDate: '2015-07-20' },
  { id: 2, name: 'Bob Williams', role: 'Math Teacher', department: 'Academics', email: 'b.williams@school.edu', status: 'Full-time', hireDate: '2018-08-15' },
  { id: 3, name: 'Charlie Brown', role: 'History Teacher', department: 'Academics', email: 'c.brown@school.edu', status: 'Full-time', hireDate: '2020-01-10' },
  { id: 4, name: 'Diana Miller', role: 'School Counselor', department: 'Student Services', email: 'd.miller@school.edu', status: 'Full-time', hireDate: '2019-09-01' },
  { id: 5, name: 'Ethan Garcia', role: 'IT Support', department: 'Operations', email: 'e.garcia@school.edu', status: 'Part-time', hireDate: '2022-03-01' },
  { id: 6, name: 'Fiona Davis', role: 'Librarian', department: 'Academics', email: 'f.davis@school.edu', status: 'Full-time', hireDate: '2017-11-20' },
  { id: 7, name: 'George Clark', role: 'Janitor', department: 'Operations', email: 'g.clark@school.edu', status: 'Full-time', hireDate: '2016-05-30' },
  { id: 8, name: 'Hannah Lewis', role: 'Art Teacher', department: 'Academics', email: 'h.lewis@school.edu', status: 'Part-time', hireDate: '2023-08-21' },
];

const statusColors = {
    'Full-time': 'bg-green-500',
    'Part-time': 'bg-yellow-500',
};

const StaffManagement: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [roleFilter, setRoleFilter] = useState('All');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const departments = useMemo(() => ['All', ...new Set(staffData.map(s => s.department))], []);
    const roles = useMemo(() => ['All', ...new Set(staffData.map(s => s.role))], []);

    const filteredStaff = useMemo(() => staffData.filter(staff => 
        (staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (departmentFilter === 'All' || staff.department === departmentFilter) &&
        (roleFilter === 'All' || staff.role === roleFilter)
    ), [searchTerm, departmentFilter, roleFilter]);

  return (
    <div className="staff-mgmt-container">
        <div className="staff-mgmt-header">
            <h2 className="font-orbitron text-3xl font-bold text-white">Staff Directory</h2>
            <p className="header-count">{filteredStaff.length} Members</p>
        </div>
        
        <div className="staff-mgmt-controls">
            <div className="search-wrapper">
                <Icons.Search size={18} className="search-icon" />
                <input 
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>
            <div className="filters-wrapper">
                <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="filter-select">
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="filter-select">
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>
            <button className="add-staff-btn" onClick={() => setIsAddModalOpen(true)}>
                <Icons.UserPlus size={18}/>
                Add New Staff
            </button>
        </div>

        <div className="table-container">
            <table className="staff-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Department</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredStaff.map(staff => (
                        <tr key={staff.id}>
                            <td>
                                <div className="name-cell">
                                    <div className="avatar">{staff.name.charAt(0)}</div>
                                    <div>
                                        <p className="font-semibold">{staff.name}</p>
                                        <p className="text-sm text-gray-400">{staff.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td>{staff.role}</td>
                            <td>{staff.department}</td>
                            <td>
                                <div className="status-cell">
                                    <span className={`status-dot ${statusColors[staff.status]}`}></span>
                                    {staff.status}
                                </div>
                            </td>
                            <td>
                                <div className="action-buttons">
                                    <button className="action-btn view-btn" title="View Profile"><Icons.View size={16}/></button>
                                    <button className="action-btn edit-btn" title="Edit"><Icons.PenSquare size={16}/></button>
                                    <button className="action-btn delete-btn" title="Delete"><Icons.Trash2 size={16}/></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {isAddModalOpen && (
            <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <h3 className="modal-header">Add New Staff Member</h3>
                    <p className="text-gray-400 text-center mb-4">This is a mock form for demonstration.</p>
                    <button onClick={() => setIsAddModalOpen(false)} className="modal-close-btn"><Icons.Close/></button>
                    {/* A real form would go here */}
                    <button className="add-staff-btn mt-4 w-full justify-center" onClick={() => setIsAddModalOpen(false)}>Add Staff</button>
                </div>
            </div>
        )}
    </div>
  );
};

export default StaffManagement;
