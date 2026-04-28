import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX, FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi';
import './TopNavbar.css';

function TopNavbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  const closeMenus = () => {
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  return (
    <nav className="top-navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo" onClick={closeMenus}>
          <span className="logo-mark">ORA</span>
          <span className="logo-text">Digital Library</span>
        </Link>
      </div>

      <div className={`navbar-center ${showMobileMenu ? 'open' : ''}`}>
        <div className="nav-menu">
          <Link to="/" className="nav-link" onClick={closeMenus}>Home</Link>
          <Link to="/catalog" className="nav-link" onClick={closeMenus}>Digital Library</Link>
          <Link to="/physical-library" className="nav-link" onClick={closeMenus}>Physical Library</Link>
          {isAuthenticated && (
            <Link to={`/${user?.role}`} className="nav-link" onClick={closeMenus}>Dashboard</Link>
          )}
        </div>
      </div>

      <div className="navbar-right">
        {isAuthenticated ? (
          <div className="user-menu-container">
            <button className="user-menu-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
              <div className="user-avatar">
                {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <span className="user-name">{user?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}</span>
              <FiChevronDown size={16} className="dropdown-arrow" />
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-avatar">
                    {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                  <div className="dropdown-info">
                    <strong>{user?.full_name || 'User'}</strong>
                    <span>{user?.email}</span>
                    <span className="dropdown-role">{user?.role?.toUpperCase()}</span>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <Link to="/my-account" className="dropdown-item" onClick={closeMenus}>
                  <FiUser /> My Account
                </Link>
                <button onClick={handleLogout} className="dropdown-item logout-item">
                  <FiLogOut /> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="btn-login" onClick={closeMenus}>Sign In</Link>
            <Link to="/register" className="btn-register" onClick={closeMenus}>Get Started</Link>
          </div>
        )}

        <button
          className="mobile-menu-toggle"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          aria-label="Toggle navigation"
        >
          {showMobileMenu ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>
    </nav>
  );
}

export default TopNavbar;
