import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
  FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiUserPlus, 
  FiMapPin, FiMail, FiPhone, FiHash, FiHome, FiUsers,
  FiSearch, FiEye, FiEyeOff, FiRefreshCw, FiFilter,
  FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp
} from 'react-icons/fi';

const emptyLibrary = {
  name: '',
  code: '',
  address: '',
  contact_email: '',
  contact_phone: '',
  admin_full_name: '',
  admin_email: '',
  admin_password: ''
};

function SuperAdminLibraries() {
  const [libraries, setLibraries] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState(emptyLibrary);
  const [editingLibrary, setEditingLibrary] = useState(null);
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Table states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [libraryRes, usersRes] = await Promise.all([
        api.get('/super-admin/libraries'),
        api.get('/super-admin/users')
      ]);
      setLibraries(libraryRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      showMessage('error', 'Failed to load library data');
    }
    setLoading(false);
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleCreateLibrary = async (e) => {
    e.preventDefault();
    try {
      await api.post('/super-admin/libraries', formData);
      setFormData(emptyLibrary);
      setShowCreateForm(false);
      fetchData();
      showMessage('success', 'Library created successfully!');
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to create library');
    }
  };

  const handleUpdateLibrary = async (library) => {
    try {
      await api.put(`/super-admin/libraries/${library.id}`, {
        name: library.name,
        code: library.code,
        address: library.address,
        contact_email: library.contact_email,
        contact_phone: library.contact_phone,
        is_active: library.is_active
      });
      setEditingLibrary(null);
      fetchData();
      showMessage('success', 'Library updated successfully!');
    } catch (error) {
      showMessage('error', 'Failed to update library');
    }
  };

  const handleDeleteLibrary = async (libraryId, libraryName) => {
    if (!window.confirm(`Delete "${libraryName}"? This will unassign all users from this library.`)) {
      return;
    }

    try {
      await api.delete(`/super-admin/libraries/${libraryId}`);
      fetchData();
      showMessage('success', 'Library deleted successfully');
    } catch (error) {
      showMessage('error', 'Failed to delete library');
    }
  };

  const handleAssignAdmin = async (libraryId) => {
    const userId = assignments[libraryId];
    if (!userId) {
      showMessage('error', 'Please select a user to assign');
      return;
    }

    try {
      await api.post(`/super-admin/libraries/${libraryId}/assign-admin`, { user_id: Number(userId) });
      setAssignments({ ...assignments, [libraryId]: '' });
      fetchData();
      showMessage('success', 'Library admin assigned successfully!');
    } catch (error) {
      showMessage('error', 'Failed to assign library admin');
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return { color: '#10b981', bg: '#d1fae5', text: 'Active', icon: <FiEye size={12} /> };
    }
    return { color: '#ef4444', bg: '#fee2e2', text: 'Inactive', icon: <FiEyeOff size={12} /> };
  };

  // Filter and sort libraries
  const filteredLibraries = libraries.filter(library => {
    const searchLower = searchTerm.toLowerCase();
    return (
      library.name?.toLowerCase().includes(searchLower) ||
      library.code?.toLowerCase().includes(searchLower) ||
      library.address?.toLowerCase().includes(searchLower) ||
      library.contact_email?.toLowerCase().includes(searchLower) ||
      (library.admin_email || '').toLowerCase().includes(searchLower)
    );
  });

  const sortedLibraries = [...filteredLibraries].sort((a, b) => {
    let aVal = a[sortField] || '';
    let bVal = b[sortField] || '';
    if (sortField === 'is_active') {
      aVal = a.is_active ? 1 : 0;
      bVal = b.is_active ? 1 : 0;
    }
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedLibraries.length / rowsPerPage);
  const paginatedLibraries = sortedLibraries.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const stats = {
    total: libraries.length,
    active: libraries.filter(l => l.is_active).length,
    inactive: libraries.filter(l => !l.is_active).length
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <FiChevronDown size={14} style={{ opacity: 0.3 }} />;
    return sortDirection === 'asc' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #eef2f6 100%)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem' }}>
                Physical Library Management
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                Create and manage multiple libraries independently under Super Admin control
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
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
              {showCreateForm ? 'Cancel' : 'Create New Library'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '1rem', border: '1px solid #eef2f6', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiHome size={24} color="white" />
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', color: '#64748b' }}>Total Libraries</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>{stats.total}</p>
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: '16px', padding: '1rem', border: '1px solid #eef2f6', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', background: '#d1fae5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiEye size={24} color="#10b981" />
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', color: '#64748b' }}>Active Libraries</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>{stats.active}</p>
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: '16px', padding: '1rem', border: '1px solid #eef2f6', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', background: '#fee2e2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiEyeOff size={24} color="#ef4444" />
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', color: '#64748b' }}>Inactive Libraries</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>{stats.inactive}</p>
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: '16px', padding: '1rem', border: '1px solid #eef2f6', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', background: '#fef3e8', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiUsers size={24} color="#e67e22" />
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', color: '#64748b' }}>Total Users</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>{users.length}</p>
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

        {/* Create Library Form */}
        {showCreateForm && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            border: '1px solid #eef2f6',
            marginBottom: '2rem',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '1rem 1.5rem',
              color: 'white'
            }}>
              <h3 style={{ fontSize: '1rem', margin: 0 }}>➕ Create New Library</h3>
            </div>
            <form onSubmit={handleCreateLibrary} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '500', marginBottom: '0.25rem', color: '#1e293b' }}>Library Name *</label>
                  <input 
                    placeholder="e.g., Main City Library"
                    required 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '500', marginBottom: '0.25rem', color: '#1e293b' }}>Library Code</label>
                  <input 
                    placeholder="e.g., MAIN001"
                    value={formData.code} 
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '500', marginBottom: '0.25rem', color: '#1e293b' }}>Address</label>
                  <input 
                    placeholder="Street, City, Country"
                    value={formData.address} 
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '500', marginBottom: '0.25rem', color: '#1e293b' }}>Contact Email</label>
                  <input 
                    type="email"
                    placeholder="library@example.com"
                    value={formData.contact_email} 
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '500', marginBottom: '0.25rem', color: '#1e293b' }}>Contact Phone</label>
                  <input 
                    placeholder="+1-555-0123"
                    value={formData.contact_phone} 
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  />
                </div>
              </div>
              
              <div style={{ borderTop: '1px solid #eef2f6', margin: '1rem 0', paddingTop: '1rem' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
                  <FiUserPlus size={14} style={{ marginRight: '0.25rem' }} />
                  Optional: Create Library Admin User
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '500', marginBottom: '0.25rem', color: '#1e293b' }}>Admin Full Name</label>
                    <input 
                      placeholder="John Doe"
                      value={formData.admin_full_name} 
                      onChange={(e) => setFormData({ ...formData, admin_full_name: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '500', marginBottom: '0.25rem', color: '#1e293b' }}>Admin Email</label>
                    <input 
                      type="email"
                      placeholder="admin@example.com"
                      value={formData.admin_email} 
                      onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '500', marginBottom: '0.25rem', color: '#1e293b' }}>Admin Password</label>
                    <input 
                      type="password"
                      placeholder="••••••••"
                      value={formData.admin_password} 
                      onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    />
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowCreateForm(false)} style={{ padding: '0.6rem 1.25rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '0.6rem 1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
                  Create Library
                </button>
              </div>
            </form>
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
              placeholder="Search libraries by name, code, address, email..."
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
          </div>
        </div>

        {/* Libraries Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '20px' }}>
            <div style={{ width: '50px', height: '50px', border: '3px solid #eef2f6', borderTopColor: '#667eea', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }}></div>
            <p>Loading libraries...</p>
          </div>
        ) : filteredLibraries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '20px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏛️</div>
            <h3>No Libraries Found</h3>
            <p style={{ color: '#64748b' }}>Try adjusting your search or create a new library.</p>
          </div>
        ) : (
          <>
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #eef2f6', overflowX: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #eef2f6' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('name')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        Library Name <SortIcon field="name" />
                      </div>
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('code')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        Code <SortIcon field="code" />
                      </div>
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Address</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Contact</th>
                    <th style={{ padding: '1rem', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('is_active')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        Status <SortIcon field="is_active" />
                      </div>
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Library Admin</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLibraries.map((library, index) => {
                    const isEditing = editingLibrary?.id === library.id;
                    const status = getStatusBadge(library.is_active);
                    const isEven = index % 2 === 0;
                    
                    return (
                      <tr key={library.id} style={{ borderBottom: '1px solid #eef2f6', background: isEven ? 'white' : '#fafbfc' }}>
                        <td style={{ padding: '1rem' }}>
                          {isEditing ? (
                            <input 
                              value={editingLibrary.name || ''} 
                              onChange={(e) => setEditingLibrary({ ...editingLibrary, name: e.target.value })}
                              style={{ width: '100%', padding: '0.4rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                            />
                          ) : (
                            <span style={{ fontWeight: '500' }}>{library.name}</span>
                          )}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {isEditing ? (
                            <input 
                              value={editingLibrary.code || ''} 
                              onChange={(e) => setEditingLibrary({ ...editingLibrary, code: e.target.value })}
                              style={{ width: '100%', padding: '0.4rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                            />
                          ) : (
                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{library.code || '-'}</span>
                          )}
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {isEditing ? (
                            <input 
                              value={editingLibrary.address || ''} 
                              onChange={(e) => setEditingLibrary({ ...editingLibrary, address: e.target.value })}
                              style={{ width: '100%', padding: '0.4rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                            />
                          ) : (
                            library.address || '-'
                          )}
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.8rem' }}>
                          {isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              <input 
                                value={editingLibrary.contact_email || ''} 
                                onChange={(e) => setEditingLibrary({ ...editingLibrary, contact_email: e.target.value })}
                                placeholder="Email"
                                style={{ padding: '0.4rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                              />
                              <input 
                                value={editingLibrary.contact_phone || ''} 
                                onChange={(e) => setEditingLibrary({ ...editingLibrary, contact_phone: e.target.value })}
                                placeholder="Phone"
                                style={{ padding: '0.4rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                              />
                            </div>
                          ) : (
                            <div>
                              {library.contact_email && <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.2rem' }}><FiMail size={12} color="#94a3b8" /> {library.contact_email}</div>}
                              {library.contact_phone && <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><FiPhone size={12} color="#94a3b8" /> {library.contact_phone}</div>}
                              {!library.contact_email && !library.contact_phone && '-'}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {isEditing ? (
                            <select 
                              value={editingLibrary.is_active ? 'true' : 'false'} 
                              onChange={(e) => setEditingLibrary({ ...editingLibrary, is_active: e.target.value === 'true' })}
                              style={{ padding: '0.4rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                            >
                              <option value="true">Active</option>
                              <option value="false">Inactive</option>
                            </select>
                          ) : (
                            <span style={{ background: status.bg, color: status.color, padding: '4px 8px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              {status.icon}
                              {status.text}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.8rem' }}>
                          <div>
                            {library.admin_full_name && <div style={{ fontWeight: '500' }}>{library.admin_full_name}</div>}
                            {library.admin_email && <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{library.admin_email}</div>}
                            {!library.admin_full_name && !library.admin_email && <span style={{ color: '#94a3b8' }}>Not assigned</span>}
                          </div>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {isEditing ? (
                              <>
                                <button 
                                  onClick={() => handleUpdateLibrary(editingLibrary)} 
                                  style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.75rem' }}
                                >
                                  <FiSave size={14} /> Save
                                </button>
                                <button 
                                  onClick={() => setEditingLibrary(null)} 
                                  style={{ background: '#64748b', color: 'white', border: 'none', borderRadius: '6px', padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.75rem' }}
                                >
                                  <FiX size={14} /> Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  onClick={() => setEditingLibrary(library)} 
                                  style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.75rem' }}
                                  title="Edit"
                                >
                                  <FiEdit2 size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteLibrary(library.id, library.name)} 
                                  style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.75rem' }}
                                  title="Delete"
                                >
                                  <FiTrash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                          
                          {/* Assign Admin Dropdown */}
                          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                            <select
                              value={assignments[library.id] || ''}
                              onChange={(e) => setAssignments({ ...assignments, [library.id]: e.target.value })}
                              style={{ flex: 1, padding: '0.3rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.7rem' }}
                            >
                              <option value="">Assign Admin</option>
                              {users.filter(u => !u.library_id || u.library_id === library.id).map((user) => (
                                <option key={user.id} value={user.id}>{user.full_name || user.email}</option>
                              ))}
                            </select>
                            <button 
                              onClick={() => handleAssignAdmin(library.id)} 
                              style={{ background: '#0f766e', color: 'white', border: 'none', borderRadius: '6px', padding: '0.3rem 0.5rem', cursor: 'pointer', fontSize: '0.7rem' }}
                              title="Assign Admin"
                            >
                              <FiUserPlus size={12} />
                            </button>
                          </div>
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
                  Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filteredLibraries.length)} of {filteredLibraries.length} entries
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
                      opacity: currentPage === 1 ? 0.5 : 1
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
                      opacity: currentPage === totalPages ? 0.5 : 1
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
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default SuperAdminLibraries;