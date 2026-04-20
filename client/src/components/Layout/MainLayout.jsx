import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import TopNavbar from './TopNavbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import './Layout.css';

function MainLayout({ children, title }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Don't show sidebar for non-authenticated users
  const showSidebar = user && window.location.pathname !== '/';

  return (
    <div className="main-layout">
      <TopNavbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      <div className="layout-container">
        {showSidebar && <Sidebar isOpen={sidebarOpen} />}
        <main className={`main-content ${!showSidebar ? 'full-width' : ''} ${!sidebarOpen ? 'sidebar-collapsed' : ''}`}>
          <div className="content-header">
            <h1>{title}</h1>
          </div>
          <div className="content-body">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default MainLayout;