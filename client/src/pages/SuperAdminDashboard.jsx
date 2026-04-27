import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import SuperAdminLibraries from './super-admin/SuperAdminLibraries';

function SuperAdminDashboard() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<SuperAdminLibraries />} />
        <Route path="/libraries" element={<SuperAdminLibraries />} />
      </Routes>
    </DashboardLayout>
  );
}

export default SuperAdminDashboard;
