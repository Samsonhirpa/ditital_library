import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiBell, FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi';

function TopNavbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
  };

  return (
    <nav className="top-navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">📚 ORA Digital Library</span>
        </Link>
      </div>

      <div className="navbar-center">
        <div className="nav-menu">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/catalog" className="nav-link">Catalog</Link>
          {isAuthenticated && (
            <Link to={`/${user?.role}`} className="nav-link">Dashboard</Link>
          )}
        </div>
      </div>

      <div className="navbar-right">
        {isAuthenticated ? (
          <div className="user-menu-container">
            <button 
              className="user-menu-btn" 
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar">
                {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <span className="user-name">
                {user?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}
              </span>
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
                <Link to="/my-account" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
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
            <Link to="/login" className="btn-login">Sign In</Link>
            <Link to="/register" className="btn-register">Get Started</Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default TopNavbar;