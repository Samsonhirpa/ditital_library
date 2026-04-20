import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiLogOut, FiUser, FiChevronDown, FiMenu } from 'react-icons/fi';
import './TopMenu.css';

function TopMenu({ toggleSidebar, sidebarOpen }) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowDropdown(false);
  };

  return (
    <nav className={`top-menu ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      <div className="top-menu-container">
        <div className="top-menu-left">
          <button className="menu-toggle-btn" onClick={toggleSidebar}>
            <FiMenu size={20} />
          </button>
          <Link to="/" className="logo">
            <span className="logo-icon">📚</span>
            <span className="logo-text">ORA Library</span>
          </Link>
        </div>

        <div className="top-menu-right">
          {isAuthenticated && (
            <div className="user-menu" ref={dropdownRef}>
              <button
                className="user-menu-btn"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="user-avatar">
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0)}
                </div>
                <span className="user-name">
                  {user?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}
                </span>
                <FiChevronDown size={14} className="dropdown-icon" />
              </button>

              {showDropdown && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">
                      {user?.full_name?.charAt(0) || user?.email?.charAt(0)}
                    </div>
                    <div className="dropdown-info">
                      <div className="dropdown-name">{user?.full_name}</div>
                      <div className="dropdown-email">{user?.email}</div>
                      <div className="dropdown-role">{user?.role?.toUpperCase()}</div>
                    </div>
                  </div>
                  <Link
                    to="/my-account"
                    onClick={() => setShowDropdown(false)}
                    className="dropdown-item"
                  >
                    <FiUser size={14} /> My Account
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="dropdown-item logout-item"
                  >
                    <FiLogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {!isAuthenticated && (
            <div className="auth-buttons">
              <Link to="/login" className="auth-btn login">Login</Link>
              <Link to="/register" className="auth-btn register">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default TopMenu;