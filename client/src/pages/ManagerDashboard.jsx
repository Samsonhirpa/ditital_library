import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { 
  FiCheckCircle, FiDollarSign, FiTrendingUp, FiBookOpen, 
  FiClock, FiCalendar, FiPackage, FiDownload, FiEdit2,
  FiBarChart2, FiShoppingCart, FiAward, FiUsers, FiEye
} from 'react-icons/fi';
import './ManagerDashboard.css';

// Safe number formatter helpers
const formatCurrency = (value) => {
  const num = typeof value === 'number' ? value : Number(value || 0);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

const formatNumber = (value) => {
  const num = typeof value === 'number' ? value : Number(value || 0);
  return isNaN(num) ? 0 : num;
};

function ManagerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('publish');
  const [readyToPublish, setReadyToPublish] = useState([]);
  const [salesData, setSalesData] = useState(null);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchReadyToPublish(),
      fetchSalesData(),
      fetchPendingPayments()
    ]);
    setLoading(false);
  };

  const fetchReadyToPublish = async () => {
    try {
      const response = await api.get('/manager/ready-to-publish');
      setReadyToPublish(response.data);
    } catch (error) {
      console.error('Failed to fetch content:', error);
    }
  };

  const fetchSalesData = async () => {
    try {
      const response = await api.get('/manager/dashboard/sales');
      setSalesData(response.data);
    } catch (error) {
      console.error('Failed to fetch sales data:', error);
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const response = await api.get('/payments/pending-payments');
      setPendingPayments(response.data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    }
  };

  const handlePublish = async (contentId, price) => {
    try {
      await api.put(`/manager/contents/${contentId}/publish`, { price });
      setMessage({ type: 'success', text: 'Content published successfully!' });
      fetchData();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Publishing failed' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleUpdatePrice = async (contentId, price) => {
    try {
      await api.put(`/manager/contents/${contentId}/price`, { price });
      setMessage({ type: 'success', text: 'Price updated successfully!' });
      fetchReadyToPublish();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Price update failed' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleApprovePayment = async (paymentId) => {
    try {
      await api.put(`/payments/approve-payment/${paymentId}`);
      setMessage({ type: 'success', text: 'Payment approved! User can now download the book.' });
      fetchData();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to approve payment' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleRejectPayment = async (paymentId) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      try {
        await api.put(`/payments/reject-payment/${paymentId}`, { reason });
        setMessage({ type: 'success', text: 'Payment rejected' });
        fetchData();
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to reject payment' });
        setTimeout(() => setMessage(null), 3000);
      }
    }
  };

  if (user?.role !== 'manager') {
    navigate('/catalog');
    return null;
  }

  return (
    <DashboardLayout>
      <div className="manager-dashboard">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Manager Dashboard</h1>
          <p className="page-subtitle">Manage Books, payments, and monitor sales</p>
        </div>

        {/* Welcome Card */}
        <div className="welcome-card">
          <div className="welcome-icon">📊</div>
          <div className="welcome-text">
            <h2>Welcome, {user?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}!</h2>
            <p><strong>{readyToPublish.length}</strong> items ready to be added to library | <strong>{pendingPayments.length}</strong> pending payments</p>
          </div>
          <div className="welcome-stats">
            <div className="welcome-stat">
              <FiDollarSign size={18} />
              <span>${formatCurrency(salesData?.total_revenue)} Revenue</span>
            </div>
            <div className="welcome-stat">
              <FiShoppingCart size={18} />
              <span>{formatNumber(salesData?.total_sales)} Sales</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === 'publish' ? 'active' : ''}`}
            onClick={() => setActiveTab('publish')}
          >
            <FiPackage size={16} />
            Add Content to Library
            {readyToPublish.length > 0 && <span className="tab-badge">{readyToPublish.length}</span>}
          </button>
          <button
            className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            <FiDollarSign size={16} />
            Payment Approval
            {pendingPayments.length > 0 && <span className="tab-badge pending">{pendingPayments.length}</span>}
          </button>
          <button
            className={`tab-btn ${activeTab === 'finance' ? 'active' : ''}`}
            onClick={() => setActiveTab('finance')}
          >
            <FiBarChart2 size={16} />
            Sales & Finance
          </button>
        </div>

        {/* Publish Tab */}
        {activeTab === 'publish' && (
          <div className="publish-section">
            {message && (
              <div className={`message ${message.type}`}>
                {message.type === 'success' ? '✅ ' : '❌ '}{message.text}
              </div>
            )}
            
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading content...</p>
              </div>
            ) : readyToPublish.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✅</div>
                <h3>No content ready for publishing</h3>
                <p>Content needs to be approved by admin first</p>
              </div>
            ) : (
              <div className="publish-grid">
                {readyToPublish.map((content) => (
                  <div key={content.id} className="publish-card">
                    <div className="card-header">
                      <div className="card-icon">📄</div>
                      <div className="card-title">
                        <h3>{content.title}</h3>
                        <p>by {content.author}</p>
                      </div>
                    </div>
                    
                    <div className="card-details">
                      <div className="detail-item">
                        <span className="detail-label">Subject:</span>
                        <span className="detail-value">{content.subject || 'General'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Year:</span>
                        <span className="detail-value">{content.publication_year || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Status:</span>
                        <span className="status-badge approved">Approved</span>
                      </div>
                    </div>

                    <div className="price-control">
                      <label>
                        <FiDollarSign size={14} />
                        Set Price ($)
                      </label>
                      <div className="price-input-group">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          defaultValue={content.price}
                          id={`price-${content.id}`}
                          placeholder="0.00"
                        />
                        <button 
                          className="update-price-btn"
                          onClick={() => {
                            const price = document.getElementById(`price-${content.id}`).value;
                            handleUpdatePrice(content.id, price);
                          }}
                        >
                          <FiEdit2 size={14} /> Update
                        </button>
                      </div>
                    </div>
                    
                    <button 
                      className="publish-btn"
                      onClick={() => {
                        const price = document.getElementById(`price-${content.id}`).value;
                        handlePublish(content.id, price);
                      }}
                    >
                      <FiCheckCircle size={16} /> Add to Library
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payment Approval Tab */}
        {activeTab === 'payments' && (
          <div className="payments-section">
            {message && (
              <div className={`message ${message.type}`}>
                {message.type === 'success' ? '✅ ' : '❌ '}{message.text}
              </div>
            )}
            
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading payments...</p>
              </div>
            ) : pendingPayments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✅</div>
                <h3>No pending payments</h3>
                <p>All receipts have been processed</p>
              </div>
            ) : (
              <div className="payments-list">
                {pendingPayments.map((payment) => (
                  <div key={payment.id} className="payment-card">
                    <div className="payment-header">
                      <div className="payment-user">
                        <div className="user-avatar-sm">
                          {payment.full_name?.charAt(0) || payment.email?.charAt(0)}
                        </div>
                        <div>
                          <strong>{payment.full_name || payment.email}</strong>
                          <span>{payment.email}</span>
                        </div>
                      </div>
                      <div className="payment-amount">${formatCurrency(payment.amount)}</div>
                    </div>
                    
                    <div className="payment-details">
                      <div className="detail-row">
                        <FiBookOpen size={14} />
                        <span><strong>Book:</strong> {payment.title}</span>
                      </div>
                      <div className="detail-row">
                        <FiUsers size={14} />
                        <span><strong>Author:</strong> {payment.author}</span>
                      </div>
                      <div className="detail-row">
                        <FiClock size={14} />
                        <span><strong>Submitted:</strong> {new Date(payment.submitted_at).toLocaleString()}</span>
                      </div>
                      {payment.transaction_id && (
                        <div className="detail-row">
                          <FiDollarSign size={14} />
                          <span><strong>Transaction ID:</strong> {payment.transaction_id}</span>
                        </div>
                      )}
                      {payment.notes && (
                        <div className="detail-row notes">
                          <strong>Notes:</strong> {payment.notes}
                        </div>
                      )}
                    </div>
                    
                    <div className="payment-receipt">
                      <a 
                        href={`http://localhost:5000${payment.receipt_url}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="view-receipt-btn"
                      >
                        <FiEye size={14} /> View Receipt
                      </a>
                    </div>
                    
                    <div className="payment-actions">
                      <button 
                        onClick={() => handleApprovePayment(payment.id)} 
                        className="approve-btn"
                      >
                        <FiCheckCircle size={16} /> Approve Payment
                      </button>
                      <button 
                        onClick={() => handleRejectPayment(payment.id)} 
                        className="reject-btn"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Finance Tab */}
        {activeTab === 'finance' && (
          <div className="finance-section">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading financial data...</p>
              </div>
            ) : !salesData ? (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <h3>No sales data available</h3>
                <p>Sales information will appear here once transactions occur</p>
              </div>
            ) : (
              <>
                <div className="finance-summary">
                  <div className="finance-card">
                    <div className="finance-icon blue">
                      <FiDollarSign size={28} />
                    </div>
                    <div className="finance-info">
                      <h3>Total Revenue</h3>
                      <p className="finance-number">${formatCurrency(salesData.total_revenue)}</p>
                      <span className="finance-trend positive">
                        <FiTrendingUp size={12} /> +18.5%
                      </span>
                    </div>
                  </div>
                  
                  <div className="finance-card">
                    <div className="finance-icon green">
                      <FiShoppingCart size={28} />
                    </div>
                    <div className="finance-info">
                      <h3>Total Sales</h3>
                      <p className="finance-number">{formatNumber(salesData.total_sales)}</p>
                      <span className="finance-trend positive">
                        <FiTrendingUp size={12} /> +12.3%
                      </span>
                    </div>
                  </div>
                  
                  <div className="finance-card">
                    <div className="finance-icon orange">
                      <FiAward size={28} />
                    </div>
                    <div className="finance-info">
                      <h3>Average Order Value</h3>
                      <p className="finance-number">
                        ${formatNumber(salesData.total_sales) > 0 
                          ? formatCurrency(Number(salesData.total_revenue || 0) / formatNumber(salesData.total_sales))
                          : '0.00'}
                      </p>
                      <span className="finance-trend">Per transaction</span>
                    </div>
                  </div>
                </div>

                <div className="top-content-section">
                  <h3>
                    <FiTrendingUp size={18} />
                    Top Selling Content
                  </h3>
                  {salesData.top_content?.length > 0 ? (
                    <div className="top-content-table">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Title</th>
                            <th>Sales</th>
                            <th>Revenue</th>
                            <th>Performance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {salesData.top_content.map((item, index) => (
                            <tr key={index}>
                              <td className="rank-cell">{index + 1}</td>
                              <td className="title-cell">
                                <FiBookOpen size={14} />
                                {item.title}
                              </td>
                              <td>{formatNumber(item.sales_count)} sales</td>
                              <td className="revenue-cell">${formatCurrency(item.revenue)}</td>
                              <td className="progress-cell">
                                <div className="progress-bar">
                                  <div 
                                    className="progress-fill"
                                    style={{ 
                                      width: `${(formatNumber(item.revenue) / formatNumber(salesData.top_content[0]?.revenue || 1)) * 100}%` 
                                    }}
                                  ></div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty-state small">
                      <p>No sales data available yet</p>
                    </div>
                  )}
                </div>

                <div className="daily-sales-section">
                  <h3>
                    <FiCalendar size={18} />
                    Daily Sales (Last 7 Days)
                  </h3>
                  {salesData.daily_sales?.length > 0 ? (
                    <div className="daily-sales-table">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Sales</th>
                            <th>Revenue</th>
                            <th>Trend</th>
                          </tr>
                        </thead>
                        <tbody>
                          {salesData.daily_sales.map((day, index) => (
                            <tr key={index}>
                              <td>
                                <div className="date-cell">
                                  <FiCalendar size={12} />
                                  {new Date(day.date).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </div>
                              </td>
                              <td>{formatNumber(day.sales)} orders</td>
                              <td className="revenue-cell">${formatCurrency(day.daily_revenue)}</td>
                              <td>
                                {formatNumber(day.sales) > 0 ? (
                                  <span className="trend-up">↑</span>
                                ) : (
                                  <span className="trend-down">→</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty-state small">
                      <p>No daily sales data available</p>
                    </div>
                  )}
                </div>

                <div className="quick-stats">
                  <div className="quick-stat">
                    <FiClock size={16} />
                    <span>Last updated: {new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="quick-stat">
                    <FiDownload size={16} />
                    <span>Total downloads: {formatNumber(salesData.total_sales)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ManagerDashboard;