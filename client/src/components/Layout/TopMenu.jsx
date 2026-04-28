import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiLogOut, FiUser, FiChevronDown, FiMenu, FiShield } from 'react-icons/fi';
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

  const displayName = user?.full_name || user?.email?.split('@')[0] || 'Account';
  const firstInitial = displayName?.charAt(0)?.toUpperCase() || 'A';
  const roleLabel = user?.role
    ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1).toLowerCase()}`
    : 'Member';

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
                  {firstInitial}
                </div>
                <span className="user-name">
                  {displayName}
                </span>
                <FiChevronDown size={14} className="dropdown-icon" />
              </button>

              {showDropdown && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">
                      {firstInitial}
                    </div>
                    <div className="dropdown-info">
                      <div className="dropdown-name">{displayName}</div>
                      <div className="dropdown-email">{user?.email}</div>
                      <div className="dropdown-role">
                        <FiShield size={12} /> {roleLabel}
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/my-account"
                    onClick={() => setShowDropdown(false)}
                    className="dropdown-item"
                  >
                    <FiUser size={14} /> Account Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="dropdown-item logout-item"
                  >
                    <FiLogOut size={14} /> Sign Out
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