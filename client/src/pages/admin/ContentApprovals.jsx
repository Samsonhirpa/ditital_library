import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiCheckCircle, FiXCircle, FiEye } from 'react-icons/fi';

function ContentApprovals() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/approvals');
      setApprovals(response.data);
    } catch (error) {
      console.error('Failed to fetch approvals:', error);
    }
    setLoading(false);
  };

  const handleApprove = async (approvalId) => {
    try {
      await api.put(`/admin/approvals/${approvalId}/approve`);
      fetchApprovals();
      alert('Content approved successfully!');
    } catch (error) {
      alert('Failed to approve content');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#2c5f8a' }}>Content Approvals</h2>
        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
          Review and approve content submitted by librarians
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading approvals...</div>
      ) : approvals.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: 'white',
          borderRadius: '10px',
          border: '1px solid #eaeaea'
        }}>
          <p style={{ color: '#666' }}>No pending approvals</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {approvals.map((approval) => (
            <div key={approval.id} style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '10px',
              border: '1px solid #eaeaea',
              transition: 'box-shadow 0.2s'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#2c5f8a' }}>{approval.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                    <strong>Author:</strong> {approval.author}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.25rem' }}>
                    <strong>Submitted by:</strong> {approval.submitted_by_email}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#999' }}>
                    <strong>Submitted on:</strong> {new Date(approval.submitted_at).toLocaleString()}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleApprove(approval.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '8px 16px',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    <FiCheckCircle size={14} /> Approve
                  </button>
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '8px 16px',
                      background: '#f0f0f0',
                      color: '#666',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    <FiEye size={14} /> Preview
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ContentApprovals;