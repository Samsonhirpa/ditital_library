import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

function Sidebar({ isOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;
  const dashboardPathMap = {
    super_admin: '/super-admin',
    library_admin: '/library-admin'
  };
  const dashboardPath = dashboardPathMap[role] || `/${role}`;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getMenuItems = () => {
    const commonMenus = [
      { id: 'dashboard', label: 'Dashboard', icon: '📊', path: dashboardPath },
      { id: 'catalog', label: 'Catalog', icon: '📚', path: '/catalog' },
      { id: 'myaccount', label: 'My Account', icon: '👤', path: '/my-account' },
    ];

    const roleMenus = {
      super_admin: [
        { id: 'libraries', label: 'Libraries', icon: '🏢', path: '/super-admin/libraries' },
        { id: 'users', label: 'Global Users', icon: '👥', path: '/super-admin/libraries' },
      ],
      admin: [
        { id: 'users', label: 'User Management', icon: '👥', path: '/admin/users' },
        { id: 'approvals', label: 'Content Approvals', icon: '✓', path: '/admin/approvals' },
        { id: 'reports', label: 'Reports & Analytics', icon: '📈', path: '/reports' },
        { id: 'settings', label: 'System Settings', icon: '⚙️', path: '/admin/settings' },
      ],
      librarian: [
        { id: 'upload', label: 'Upload Content', icon: '📤', path: '/librarian/upload' },
        { id: 'myuploads', label: 'My Uploads', icon: '📋', path: '/librarian/my-uploads' },
        { id: 'stats', label: 'Usage Statistics', icon: '📊', path: '/librarian/stats' },
      ],
      library_admin: [
        { id: 'staff', label: 'Staff Management', icon: '👥', path: '/library-admin' },
      ],
      manager: [
        { id: 'published', label: 'Published Content', icon: '📚', path: '/manager/published' },
        { id: 'publish', label: 'Ready to Publish', icon: '✓', path: '/manager/publish' },
        { id: 'payments', label: 'Payment Approval', icon: '💰', path: '/manager/payments' },
        { id: 'sales', label: 'Sales & Finance', icon: '📈', path: '/manager/sales' },
        { id: 'reports', label: 'Reports', icon: '📊', path: '/reports' },
      ],
      member: [
        { id: 'borrowed', label: 'My Borrows', icon: '📖', path: '/my-account/borrowed' },
        { id: 'my-purchases', label: 'My Purchases', icon: '🛒', path: '/my-purchases' },
       
        { id: 'history', label: 'Reading History', icon: '📜', path: '/my-account/history' },
      ]
    };

    return [...commonMenus, ...(roleMenus[role] || [])];
  };

  const menuItems = getMenuItems();

  return (
    <aside className={`main-sidebar ${!isOpen ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar">
        {/* LMS Title */}
        <div className="sidebar-lms-title">
          <h3>LMS</h3>
          <p>Library Management</p>
        </div>

        {/* User Panel */}
        <div className="user-panel">
          <div className="image">
            <img 
              src={`https://ui-avatars.com/api/?name=${user?.full_name || user?.email}&background=0096FF&color=fff&rounded=true&size=50`} 
              alt="User Avatar"
            />
          </div>
          <div className="info">
            <p>{user?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}</p>
            <a href="#" onClick={(e) => e.preventDefault()}>
              {user?.role?.toUpperCase()}
            </a>
          </div>
        </div>

        {/* Sidebar Menu */}
        <ul className="sidebar-menu">
          <li className="header">MAIN NAVIGATION</li>
          {menuItems.map((item) => (
            <li key={item.id}>
              <NavLink to={item.path} end={item.path === dashboardPath}>
                <i>{item.icon}</i>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
          
          <li className="header">ACCOUNT</li>
          <li>
            <NavLink to="/my-account">
              <i>👤</i>
              <span>Profile Settings</span>
            </NavLink>
          </li>
          <li>
            <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
              <i>🚪</i>
              <span>Logout</span>
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
}

export default Sidebar;
