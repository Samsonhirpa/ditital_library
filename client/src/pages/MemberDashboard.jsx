import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { 
  FiBook, FiDownload, FiClock, FiCheckCircle, FiXCircle,
  FiTrendingUp, FiShoppingBag, FiBell, FiRefreshCw
} from 'react-icons/fi';
import './MemberDashboard.css';

function MemberDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('purchased');
  const [purchasedBooks, setPurchasedBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAllData();
    // Refresh every 10 seconds to catch approvals
    const interval = setInterval(() => {
      fetchPurchasedBooks(); // Refresh purchases
      fetchNotifications(); // Check for new notifications
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchPurchasedBooks(),
      fetchBorrowedBooks(),
      fetchRecommendedBooks(),
      fetchNotifications()
    ]);
    setLoading(false);
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const fetchPurchasedBooks = async () => {
    try {
      const response = await api.get('/purchases/my/history');
      console.log('Purchased books:', response.data);
      setPurchasedBooks(response.data || []);
    } catch (error) {
      console.error('Failed to fetch purchased books:', error);
      setPurchasedBooks([]);
    }
  };

  const fetchBorrowedBooks = async () => {
    try {
      const response = await api.get('/borrow/my/history');
      setBorrowedBooks(response.data || []);
    } catch (error) {
      console.error('Failed to fetch borrowed books:', error);
      setBorrowedBooks([]);
    }
  };

  const fetchRecommendedBooks = async () => {
    try {
      const response = await api.get('/contents/search');
      const allBooks = response.data || [];
      
      const purchasedIds = new Set(purchasedBooks.map(b => b.content_id));
      const borrowedIds = new Set(borrowedBooks.map(b => b.content_id));
      
      const recommendations = allBooks.filter(book => 
        !purchasedIds.has(book.id) && !borrowedIds.has(book.id)
      ).slice(0, 6);
      
      setRecommendedBooks(recommendations);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      setRecommendedBooks([]);
    }
  };

  const fetchNotifications = async () => {
    try {
      // Only get receipts that are approved/rejected (not pending)
      const response = await api.get('/payments/my-receipts');
      const receipts = response.data || [];
      
      // Filter only approved or rejected (not pending)
      const processedReceipts = receipts.filter(r => r.status !== 'pending');
      
      const newNotifications = processedReceipts.map(receipt => ({
        id: `receipt-${receipt.id}`,
        title: receipt.title,
        status: receipt.status,
        message: receipt.status === 'approved' 
          ? `✅ Your purchase of "${receipt.title}" has been approved! You can now download the book.`
          : `❌ Your purchase of "${receipt.title}" was rejected. Reason: ${receipt.rejection_reason || 'Please contact support'}`,
        date: receipt.reviewed_at || receipt.submitted_at,
        read: false
      }));
      
      setNotifications(newNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    }
  };

const handleDownload = async (contentId) => {
    try {
        console.log('Downloading purchased book:', contentId);
        const response = await api.get(`/contents/download/${contentId}`);
        
        if (response.data.downloadUrl) {
            const downloadUrl = `http://localhost:5000${response.data.downloadUrl}`;
            window.open(downloadUrl, '_blank');
        } else {
            alert('Download URL not available');
        }
    } catch (error) {
        console.error('Download error:', error);
        alert('Download failed: ' + (error.response?.data?.message || 'You may not have purchased this book'));
    }
  };

  const getDaysLeft = (expiresAt) => {
    if (!expiresAt) return 0;
    const daysLeft = Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DashboardLayout>
      <div className="member-dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-title">
            <h1 className="page-title">My Dashboard</h1>
            <p className="page-subtitle">Welcome back, {user?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}!</p>
          </div>
          <div className="header-actions">
            <button className="refresh-btn" onClick={refreshData} disabled={refreshing}>
              <FiRefreshCw size={16} className={refreshing ? 'spinning' : ''} />
            </button>
            <div className="notification-wrapper">
              <button 
                className={`notification-bell ${unreadCount > 0 ? 'has-notifications' : ''}`}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <FiBell size={20} />
                {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
              </button>
              
              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h3>Notifications</h3>
                    {unreadCount > 0 && (
                      <button 
                        className="mark-all-read"
                        onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="notification-list">
                    {notifications.length === 0 ? (
                      <div className="no-notifications">
                        <FiBell size={24} />
                        <p>No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`notification-item ${!notification.read ? 'unread' : ''}`}
                          onClick={() => setNotifications(prev => 
                            prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
                          )}
                        >
                          <div className={`notification-icon ${notification.status}`}>
                            {notification.status === 'approved' ? <FiCheckCircle /> : <FiXCircle />}
                          </div>
                          <div className="notification-content">
                            <p>{notification.message}</p>
                            <span className="notification-date">
                              {new Date(notification.date).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon purchased">
              <FiShoppingBag size={24} />
            </div>
            <div className="stat-info">
              <h3>Purchased Books</h3>
              <p className="stat-number">{purchasedBooks.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon borrowed">
              <FiBook size={24} />
            </div>
            <div className="stat-info">
              <h3>Active Borrows</h3>
              <p className="stat-number">{borrowedBooks.filter(b => b.status === 'active').length}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === 'purchased' ? 'active' : ''}`}
            onClick={() => setActiveTab('purchased')}
          >
            <FiShoppingBag size={16} />
            My Purchases
            {purchasedBooks.length > 0 && <span className="tab-badge">{purchasedBooks.length}</span>}
          </button>
          <button
            className={`tab-btn ${activeTab === 'borrowed' ? 'active' : ''}`}
            onClick={() => setActiveTab('borrowed')}
          >
            <FiBook size={16} />
            Borrowed Books
            {borrowedBooks.filter(b => b.status === 'active').length > 0 && (
              <span className="tab-badge">{borrowedBooks.filter(b => b.status === 'active').length}</span>
            )}
          </button>
          <button
            className={`tab-btn ${activeTab === 'recommended' ? 'active' : ''}`}
            onClick={() => setActiveTab('recommended')}
          >
            <FiTrendingUp size={16} />
            Recommended For You
          </button>
        </div>

        {/* Content Area */}
        <div className="dashboard-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your dashboard...</p>
            </div>
          ) : activeTab === 'purchased' ? (
            purchasedBooks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🛒</div>
                <h3>No purchases yet</h3>
                <p>When you purchase books, they will appear here</p>
                <button className="browse-btn" onClick={() => navigate('/catalog')}>
                  Browse Catalog
                </button>
              </div>
            ) : (
              <div className="books-grid">
                {purchasedBooks.map((book) => (
                  <div key={book.id} className="book-card purchased">
                    <div className="book-cover">✅</div>
                    <div className="book-info">
                      <h3>{book.title}</h3>
                      <p className="book-author">by {book.author}</p>
                      <div className="book-meta">
                        <span className="price paid">${parseFloat(book.amount || 0).toFixed(2)}</span>
                        <span className="purchase-date">
                          Purchased: {new Date(book.purchased_at).toLocaleDateString()}
                        </span>
                      </div>
                      <button 
                        className="download-btn"
                        onClick={() => handleDownload(book.content_id)}
                      >
                        <FiDownload size={14} /> Download Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : activeTab === 'borrowed' ? (
            borrowedBooks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📖</div>
                <h3>No borrowed books</h3>
                <p>Borrow free books from our catalog</p>
                <button className="browse-btn" onClick={() => navigate('/catalog')}>
                  Browse Free Books
                </button>
              </div>
            ) : (
              <div className="books-grid">
                {borrowedBooks.map((book) => (
                  <div key={book.id} className="book-card borrowed">
                    <div className="book-cover">📖</div>
                    <div className="book-info">
                      <h3>{book.title}</h3>
                      <p className="book-author">by {book.author}</p>
                      <div className="book-meta">
                        <span className="status-badge active">Active</span>
                        <span className={`expiry ${getDaysLeft(book.expires_at) <= 3 ? 'urgent' : ''}`}>
                          {getDaysLeft(book.expires_at)} days left
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            recommendedBooks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <h3>No recommendations available</h3>
                <p>Check back later for personalized recommendations</p>
              </div>
            ) : (
              <div className="books-grid">
                {recommendedBooks.map((book) => (
                  <div key={book.id} className="book-card recommended">
                    <div className="book-cover">📘</div>
                    <div className="book-info">
                      <h3>{book.title}</h3>
                      <p className="book-author">by {book.author}</p>
                      <div className="book-meta">
                        <span className={`price ${book.price > 0 ? 'paid' : 'free'}`}>
                          {book.price > 0 ? `$${book.price}` : 'Free'}
                        </span>
                      </div>
                      <button 
                        className="purchase-btn"
                        onClick={() => navigate('/catalog')}
                      >
                        {book.price > 0 ? 'Purchase Now' : 'Borrow Free'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default MemberDashboard;