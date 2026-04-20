import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { 
  FiBook, FiDownload, FiCalendar, FiUser, FiMail, FiShield, 
  FiClock, FiDollarSign, FiLogOut, FiShoppingCart, FiEye
} from 'react-icons/fi';
import './MyAccount.css';

function MyAccount() {
  const { user, logout } = useAuth();
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('borrowed');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchBorrowHistory(),
        fetchPurchaseHistory()
      ]);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load your account data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBorrowHistory = async () => {
    try {
      const response = await api.get('/borrow/my/history');
      setBorrowHistory(response.data || []);
    } catch (error) {
      console.error('Failed to fetch borrow history:', error);
      setBorrowHistory([]);
    }
  };

  const fetchPurchaseHistory = async () => {
    try {
      const response = await api.get('/purchases/my/history');
      setPurchaseHistory(response.data || []);
    } catch (error) {
      console.error('Failed to fetch purchase history:', error);
      setPurchaseHistory([]);
    }
  };

  const handleDownload = async (borrowId) => {
    try {
      const response = await api.get(`/borrow/${borrowId}/download`);
      if (response.data.downloadUrl) {
        window.open(response.data.downloadUrl, '_blank');
      } else {
        alert('Download URL not available');
      }
    } catch (error) {
      alert('Download failed: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <span className="status-badge active">✓ Active</span>;
      case 'expired':
        return <span className="status-badge expired">⌛ Expired</span>;
      case 'returned':
        return <span className="status-badge returned">↺ Returned</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const isExpiringSoon = (expiresAt) => {
    if (!expiresAt) return false;
    const daysLeft = Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 3 && daysLeft > 0;
  };

  const getUserInitial = () => {
    if (!user) return 'U';
    return user.full_name?.charAt(0) || user.email?.charAt(0) || 'U';
  };

  const getUserName = () => {
    if (!user) return 'User';
    return user.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'User';
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <DashboardLayout>
      <div className="myaccount-container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">My Account</h1>
          <p className="page-subtitle">Manage your profile and library activity</p>
        </div>

        {error && (
          <div className="error-message">
            ❌ {error}
            <button onClick={fetchData} className="retry-btn">Retry</button>
          </div>
        )}

        {/* Profile Overview Cards */}
        <div className="profile-overview">
          <div className="profile-card">
            <div className="profile-avatar">
              {getUserInitial()}
            </div>
            <div className="profile-info">
              <h2>{user?.full_name || 'User'}</h2>
              <p className="profile-role">{user?.role?.toUpperCase() || 'MEMBER'}</p>
            </div>
          </div>
          
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon blue">
                <FiBook size={20} />
              </div>
              <div className="stat-details">
                <span className="stat-value">{borrowHistory.filter(b => b.status === 'active').length}</span>
                <span className="stat-label">Active Borrows</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon green">
                <FiShoppingCart size={20} />
              </div>
              <div className="stat-details">
                <span className="stat-value">{purchaseHistory.length}</span>
                <span className="stat-label">Purchased Items</span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information Cards */}
        <div className="account-info-grid">
          <div className="info-card">
            <div className="info-card-header">
              <FiMail className="info-icon" />
              <h3>Email Address</h3>
            </div>
            <p>{user?.email || 'Not available'}</p>
          </div>
          <div className="info-card">
            <div className="info-card-header">
              <FiShield className="info-icon" />
              <h3>Account Type</h3>
            </div>
            <p className="role-badge">{user?.role?.toUpperCase() || 'MEMBER'}</p>
          </div>
          <div className="info-card">
            <div className="info-card-header">
              <FiUser className="info-icon" />
              <h3>Member Since</h3>
            </div>
            <p>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === 'borrowed' ? 'active' : ''}`}
            onClick={() => setActiveTab('borrowed')}
          >
            <FiBook size={16} />
            Borrowed Items
            {borrowHistory.filter(b => b.status === 'active').length > 0 && (
              <span className="tab-badge">{borrowHistory.filter(b => b.status === 'active').length}</span>
            )}
          </button>
          <button
            className={`tab-btn ${activeTab === 'purchased' ? 'active' : ''}`}
            onClick={() => setActiveTab('purchased')}
          >
            <FiDownload size={16} />
            Purchased Items
            {purchaseHistory.length > 0 && (
              <span className="tab-badge">{purchaseHistory.length}</span>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="tab-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your library...</p>
            </div>
          ) : activeTab === 'borrowed' ? (
            borrowHistory.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <h3>No borrowed items</h3>
                <p>You haven't borrowed any books yet. Browse the catalog to get started!</p>
              </div>
            ) : (
              <div className="items-grid">
                {borrowHistory.map((borrow) => (
                  <div key={borrow.id} className="item-card">
                    <div className="item-card-header">
                      <div className="item-icon">📖</div>
                      <div className="item-info">
                        <h3>{borrow.title || 'Untitled'}</h3>
                        <p className="item-author">{borrow.author || 'Unknown Author'}</p>
                      </div>
                    </div>
                    <div className="item-details">
                      <div className="detail-row">
                        <FiCalendar size={14} />
                        <span>Borrowed: {borrow.borrowed_at ? new Date(borrow.borrowed_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className={`detail-row ${isExpiringSoon(borrow.expires_at) ? 'expiring-soon' : ''}`}>
                        <FiClock size={14} />
                        <span>Expires: {borrow.expires_at ? new Date(borrow.expires_at).toLocaleDateString() : 'N/A'}</span>
                        {isExpiringSoon(borrow.expires_at) && (
                          <span className="expiry-warning">Expiring soon!</span>
                        )}
                      </div>
                      <div className="detail-row">
                        {getStatusBadge(borrow.status)}
                      </div>
                    </div>
                    {borrow.status === 'active' && (
                      <button
                        className="download-btn"
                        onClick={() => handleDownload(borrow.id)}
                      >
                        <FiDownload size={16} /> Download
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            purchaseHistory.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🛒</div>
                <h3>No purchases yet</h3>
                <p>You haven't purchased any books. Check out our collection!</p>
              </div>
            ) : (
              <div className="items-grid">
                {purchaseHistory.map((purchase) => (
                  <div key={purchase.id} className="item-card purchased">
                    <div className="item-card-header">
                      <div className="item-icon">💰</div>
                      <div className="item-info">
                        <h3>{purchase.title || 'Untitled'}</h3>
                        <p className="item-author">{purchase.author || 'Unknown Author'}</p>
                      </div>
                    </div>
                    <div className="item-details">
                      <div className="detail-row">
                        <FiCalendar size={14} />
                        <span>Purchased: {purchase.purchased_at ? new Date(purchase.purchased_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <FiDollarSign size={14} />
                        <span className="purchase-amount">Amount: ${purchase.amount || '0.00'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Logout Button */}
        <div className="logout-section">
          <button onClick={handleLogout} className="logout-btn">
            <FiLogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default MyAccount;