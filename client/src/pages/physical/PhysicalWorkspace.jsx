import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import './physical.css';

function PhysicalWorkspace() {
  return (
    <DashboardLayout>
      <div className="physical-workspace physical-workspace-full">
        <Outlet />
      </div>
    </DashboardLayout>
  );
}

export default PhysicalWorkspace;
