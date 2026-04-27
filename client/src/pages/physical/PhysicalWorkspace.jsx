import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import './physical.css';

function PhysicalWorkspace() {
  return (
    <DashboardLayout>
      <div className="physical-workspace">
        <nav className="physical-side">
          <NavLink to="/physical-librarian/issue">1. Issue Book</NavLink>
          <NavLink to="/physical-librarian/return">2. Return Book</NavLink>
          <NavLink to="/physical-librarian/members">3. Add/Manage Members</NavLink>
          <NavLink to="/physical-librarian/overdue">4. Overdue Returns</NavLink>
          <NavLink to="/physical-librarian/settings">5. Fee Settings</NavLink>
        </nav>
        <Outlet />
      </div>
    </DashboardLayout>
  );
}

export default PhysicalWorkspace;
