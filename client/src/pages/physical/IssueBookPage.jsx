import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
  FiPlus, FiSearch, FiX, FiChevronLeft, FiChevronRight,
  FiBookOpen, FiUser, FiClock, FiRefreshCw,
  FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';

function IssueBookPage() {
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [activeIssues, setActiveIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ member_id: '', book_id: '' });
  const [message, setMessage] = useState(null);
  
  // Table states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadData = async () => {
    setLoading(true);
    try {
      const [memberRes, bookRes, issueRes] = await Promise.all([
        api.get('/physical/members'),
        api.get('/physical/books'),
        api.get('/physical/transactions/active')
      ]);
      setMembers(memberRes.data.filter((m) => m.status === 'APPROVED'));
      setBooks(bookRes.data.filter((b) => Number(b.copies_available) > 0));
      setActiveIssues(issueRes.data || []);
    } catch (error) {
      showMessage('error', 'Failed to load data');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!form.member_id || !form.book_id) {
      showMessage('error', 'Please select both member and book');
      return;
    }
    
    try {
      await api.post('/physical/transactions/issue', {
        member_id: Number(form.member_id),
        book_id: Number(form.book_id)
      });
      showMessage('success', 'Book issued successfully!');
      setForm({ member_id: '', book_id: '' });
      setShowModal(false);
      loadData();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to issue book');
    }
  };



  const getDaysLeft = (dueDate) => {
    const days = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const filteredIssues = activeIssues.filter(issue => {
    const searchLower = searchTerm.toLowerCase();
    return (
      issue.member_name?.toLowerCase().includes(searchLower) ||
      issue.book_title?.toLowerCase().includes(searchLower) ||
      issue.member_id_number?.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredIssues.length / rowsPerPage);
  const paginatedIssues = filteredIssues.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const stats = {
    totalBooks: books.length,
    totalMembers: members.length,
    totalIssues: activeIssues.length,
    overdueCount: activeIssues.filter(i => new Date(i.due_date) < new Date()).length
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #eef2f6 100%)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem' }}>
                Book Circulation
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                Issue books to members and manage active borrows
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '500',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <FiPlus size={18} />
              Issue New Book
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '1rem', border: '1px solid #eef2f6', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', background: '#e8f4ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiBookOpen size={24} color="#0096FF" />
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', color: '#64748b' }}>Available Books</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>{stats.totalBooks}</p>
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: '16px', padding: '1rem', border: '1px solid #eef2f6', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', background: '#e8faf0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiUser size={24} color="#10b981" />
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', color: '#64748b' }}>Active Members</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>{stats.totalMembers}</p>
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: '16px', padding: '1rem', border: '1px solid #eef2f6', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', background: '#fef3e8', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiClock size={24} color="#e67e22" />
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', color: '#64748b' }}>Active Issues</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>{stats.totalIssues}</p>
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: '16px', padding: '1rem', border: '1px solid #eef2f6', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', background: '#fee2e2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiAlertCircle size={24} color="#dc2626" />
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', color: '#64748b' }}>Overdue Books</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>{stats.overdueCount}</p>
            </div>
          </div>
        </div>

        {/* Message Toast */}
        {message && (
          <div style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            background: message.type === 'success' ? '#10b981' : '#ef4444',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            animation: 'slideIn 0.3s ease'
          }}>
            {message.text}
            <button onClick={() => setMessage(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
              <FiX size={16} />
            </button>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '350px' }}>
            <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by member name, book title, or ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: '100%',
                padding: '0.6rem 1rem 0.6rem 2.5rem',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '0.85rem',
                background: 'white'
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <FiX size={14} />
              </button>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Show</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{ padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.8rem' }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>entries</span>
            <button
              onClick={() => loadData()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.4rem 0.8rem',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
            >
              <FiRefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {/* Active Issues Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '20px' }}>
            <div style={{ width: '50px', height: '50px', border: '3px solid #eef2f6', borderTopColor: '#667eea', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }}></div>
            <p>Loading active issues...</p>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '20px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📖</div>
            <h3>No Active Issues</h3>
            <p style={{ color: '#64748b' }}>Click "Issue New Book" to borrow books to members.</p>
          </div>
        ) : (
          <>
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #eef2f6', overflowX: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #eef2f6' }}>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Member</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Book</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Issue Date</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Due Date</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedIssues.map((issue, index) => {
                    const isOverdue = new Date(issue.due_date) < new Date();
                    const daysLeft = getDaysLeft(issue.due_date);
                    const isEven = index % 2 === 0;
                    
                    return (
                      <tr key={issue.id} style={{ borderBottom: '1px solid #eef2f6', background: isEven ? 'white' : '#fafbfc' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '32px', height: '32px', background: '#e8f4ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FiUser size={14} color="#0096FF" />
                            </div>
                            <div>
                              <div style={{ fontWeight: '500', fontSize: '0.85rem' }}>{issue.member_name}</div>
                              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>ID: {issue.member_id_number}</div>
                            </div>
                          </div>
                          </td>
                         
                     
                        <td style={{ padding: '1rem' }}>
                          <div>
                            <div style={{ fontWeight: '500', fontSize: '0.85rem' }}>{issue.book_title}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{issue.book_author}</div>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                          {new Date(issue.issue_date).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: isOverdue ? '#dc2626' : '#1e293b', fontWeight: isOverdue ? '500' : 'normal' }}>
                          {new Date(issue.due_date).toLocaleDateString()}
                          {!isOverdue && daysLeft <= 3 && (
                            <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: '#e67e22' }}>({daysLeft} days left)</span>
                          )}
                          {isOverdue && (
                            <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: '#dc2626' }}>(Overdue)</span>
                          )}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.7rem',
                            fontWeight: '500',
                            background: isOverdue ? '#fee2e2' : '#d1fae5',
                            color: isOverdue ? '#dc2626' : '#10b981'
                          }}>
                            {isOverdue ? <FiAlertCircle size={12} /> : <FiCheckCircle size={12} />}
                            {isOverdue ? 'Overdue' : 'Active'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <button
                            onClick={() => handleReturn(issue.id)}
                            style={{
                              padding: '0.4rem 0.8rem',
                              background: '#f1f5f9',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
                          >
                            <FiRefreshCw size={12} /> Return
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                marginTop: '1.5rem'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filteredIssues.length)} of {filteredIssues.length} entries
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: '0.4rem 0.8rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      background: 'white',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      opacity: currentPage === 1 ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <FiChevronLeft size={14} /> Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        style={{
                          padding: '0.4rem 0.8rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          background: currentPage === pageNum ? '#667eea' : 'white',
                          color: currentPage === pageNum ? 'white' : '#1e293b',
                          cursor: 'pointer'
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '0.4rem 0.8rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      background: 'white',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      opacity: currentPage === totalPages ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    Next <FiChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Issue Book Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          backdropFilter: 'blur(4px)'
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto',
            animation: 'modalFadeIn 0.3s ease',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '1.25rem 1.5rem',
              color: 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiBookOpen size={20} />
                  Issue New Book
                </h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>
                  <FiX size={20} />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleIssue} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '500', color: '#1e293b', marginBottom: '0.5rem' }}>
                  <FiUser size={14} style={{ marginRight: '0.25rem' }} />
                  Select Member *
                </label>
                <select
                  value={form.member_id}
                  onChange={(e) => setForm({ ...form, member_id: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    background: 'white'
                  }}
                >
                  <option value="">Choose a member...</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.id_number}) - {m.email}
                    </option>
                  ))}
                </select>
                {members.length === 0 && (
                  <p style={{ fontSize: '0.7rem', color: '#e67e22', marginTop: '0.25rem' }}>
                    No approved members available. Please approve members first.
                  </p>
                )}
              </div>
              
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '500', color: '#1e293b', marginBottom: '0.5rem' }}>
                  <FiBookOpen size={14} style={{ marginRight: '0.25rem' }} />
                  Select Book *
                </label>
                <select
                  value={form.book_id}
                  onChange={(e) => setForm({ ...form, book_id: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    background: 'white'
                  }}
                >
                  <option value="">Choose a book...</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} by {b.author} ({b.copies_available} copies available)
                    </option>
                  ))}
                </select>
                {books.length === 0 && (
                  <p style={{ fontSize: '0.7rem', color: '#e67e22', marginTop: '0.25rem' }}>
                    No books available. Please add books to the catalog first.
                  </p>
                )}
              </div>
              
              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.25rem'
              }}>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                  <FiClock size={12} style={{ marginRight: '0.25rem' }} />
                  Borrowing Information
                </p>
                <ul style={{ fontSize: '0.7rem', color: '#64748b', paddingLeft: '1rem', margin: 0 }}>
                  <li>Loan period: 14 days</li>
                  <li>Late fine: $0.50 per day</li>
                  <li>Maximum borrow limit: 5 books</li>
                </ul>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!form.member_id || !form.book_id}
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    opacity: (!form.member_id || !form.book_id) ? 0.6 : 1
                  }}
                >
                  Issue Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default IssueBookPage;