import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function TopNavbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowDropdown(false);
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: '#ffffff',
      padding: '0 2rem',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 1000,
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      borderBottom: '1px solid #eaeaea'
    }}>
      {/* Left side - ORA Logo */}
      <Link to="/" style={{ 
        textDecoration: 'none',
        fontSize: '1.3rem',
        fontWeight: 'bold',
        color: '#2c5f8a',
        letterSpacing: '1px'
      }}>
        ORA
      </Link>

      {/* Right side - Menu items */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link to="/" style={{ 
          color: '#333', 
          textDecoration: 'none', 
          fontSize: '0.9rem',
          fontWeight: 500
        }}>Home</Link>
        
        {!isAuthenticated ? (
          <Link to="/login" style={{ 
            color: '#333', 
            textDecoration: 'none', 
            fontSize: '0.9rem',
            fontWeight: 500
          }}>Login</Link>
        ) : (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: '#2c5f8a',
                backgroundColor: '#f0f4f8'
              }}
            >
              <span>👤</span>
              {user?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}
              <span style={{ fontSize: '0.7rem' }}>▼</span>
            </button>
            
            {showDropdown && (
              <>
                <div 
                  onClick={() => setShowDropdown(false)}
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 998
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  background: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  minWidth: '160px',
                  zIndex: 999,
                  border: '1px solid #eaeaea',
                  overflow: 'hidden'
                }}>
                  <Link 
                    to="/my-account" 
                    onClick={() => setShowDropdown(false)}
                    style={{
                      display: 'block',
                      padding: '10px 16px',
                      textDecoration: 'none',
                      color: '#333',
                      fontSize: '0.85rem',
                      borderBottom: '1px solid #f0f0f0'
                    }}
                  >
                    📖 My Account
                  </Link>
                  <button 
                    onClick={handleLogout}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px 16px',
                      textDecoration: 'none',
                      color: '#dc2626',
                      fontSize: '0.85rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    🚪 Logout
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default TopNavbar;