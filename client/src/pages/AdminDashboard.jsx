import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import UserManagement from './admin/UserManagement';
import ContentApprovals from './admin/ContentApprovals';
import api from '../services/api';

// Dashboard Home Component
function DashboardHome() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const usersRes = await api.get('/admin/users');
      const approvalsRes = await api.get('/admin/approvals');
      setStats({
        totalUsers: usersRes.data.length,
        pendingApprovals: approvalsRes.data.length
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: '#1e293b' }}>Welcome back!</h2>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Here's what's happening with your library today.</p>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #eef2f6'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
          <h3 style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Users</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a3a4a' }}>{stats.totalUsers || 0}</p>
        </div>
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #eef2f6'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
          <h3 style={{ fontSize: '0.85rem', color: '#64748b' }}>Pending Approvals</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e67e22' }}>{stats.pendingApprovals || 0}</p>
        </div>
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #eef2f6'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
          <h3 style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Resources</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a3a4a' }}>2,847</p>
        </div>
      </div>
    </div>
  );
}

// Main Admin Dashboard with Routes
function AdminDashboard() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/approvals" element={<ContentApprovals />} />
      </Routes>
    </DashboardLayout>
  );
}

export default AdminDashboard;