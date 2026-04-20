import React, { useState } from 'react';
import TopMenu from './TopMenu';
import Sidebar from './Sidebar';
import Footer from './Footer';
import './DashboardLayout.css';

function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="dashboard-layout">
      <TopMenu toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      <Sidebar isOpen={sidebarOpen} />
      <div className={`content-wrapper ${!sidebarOpen ? 'sidebar-collapsed' : ''}`}>
        <div className="content">
          {children}
        </div>
      </div>
      <Footer sidebarOpen={sidebarOpen} />
    </div>
  );
}

export default DashboardLayout;