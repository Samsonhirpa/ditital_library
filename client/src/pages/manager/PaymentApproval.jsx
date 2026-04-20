import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { FiCheckCircle, FiXCircle, FiEye, FiClock, FiDollarSign, FiUser, FiBookOpen } from 'react-icons/fi';
import './PaymentApproval.css';

function PaymentApproval() {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/payments/pending-payments');
      setPendingPayments(response.data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    }
    setLoading(false);
  };

  const handleApprove = async (paymentId) => {
    try {
      await api.put(`/payments/approve-payment/${paymentId}`);
      setMessage({ type: 'success', text: 'Payment approved! User can now download the book.' });
      fetchPendingPayments();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to approve payment' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleReject = async (paymentId) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      try {
        await api.put(`/payments/reject-payment/${paymentId}`, { reason });
        setMessage({ type: 'success', text: 'Payment rejected' });
        fetchPendingPayments();
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to reject payment' });
        setTimeout(() => setMessage(null), 3000);
      }
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="status-badge pending">⏳ Pending</span>;
      case 'approved':
        return <span className="status-badge approved">✅ Approved</span>;
      case 'rejected':
        return <span className="status-badge rejected">❌ Rejected</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <DashboardLayout>
      <div className="payment-approval-page">
        <div className="page-header">
          <h1 className="page-title">Payment Approval</h1>
          <p className="page-subtitle">Review and process user payment receipts</p>
        </div>

        {message && (
          <div className={`message ${message.type}`}>
            {message.type === 'success' ? '✅ ' : '❌ '}{message.text}
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading payment requests...</p>
          </div>
        ) : pendingPayments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h3>No pending payments</h3>
            <p>All payment receipts have been processed</p>
          </div>
        ) : (
          <div className="payments-list">
            {pendingPayments.map((payment) => (
              <div key={payment.id} className="payment-card">
                <div className="payment-header">
                  <div className="payment-user">
                    <div className="user-avatar">
                      {payment.full_name?.charAt(0) || payment.email?.charAt(0)}
                    </div>
                    <div className="user-info">
                      <strong>{payment.full_name || payment.email}</strong>
                      <span>{payment.email}</span>
                    </div>
                  </div>
                  <div className="payment-amount">
                    <FiDollarSign size={16} />
                    ${payment.amount}
                  </div>
                  {getStatusBadge(payment.status)}
                </div>

                <div className="payment-details">
                  <div className="detail-row">
                    <FiBookOpen size={14} />
                    <span><strong>Book:</strong> {payment.title}</span>
                  </div>
                  <div className="detail-row">
                    <FiUser size={14} />
                    <span><strong>Author:</strong> {payment.author}</span>
                  </div>
                  <div className="detail-row">
                    <FiClock size={14} />
                    <span><strong>Submitted:</strong> {new Date(payment.submitted_at).toLocaleString()}</span>
                  </div>
                  {payment.transaction_id && (
                    <div className="detail-row">
                      <strong>Transaction ID:</strong> {payment.transaction_id}
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
                    onClick={() => handleApprove(payment.id)} 
                    className="approve-btn"
                  >
                    <FiCheckCircle size={16} /> Approve Payment
                  </button>
                  <button 
                    onClick={() => handleReject(payment.id)} 
                    className="reject-btn"
                  >
                    <FiXCircle size={16} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default PaymentApproval;