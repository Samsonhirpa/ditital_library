import React, { useEffect, useState } from 'react';
import api from '../../services/api';

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
      alert('Failed to load library data');
    }
    setLoading(false);
  };

  const handleCreateLibrary = async (e) => {
    e.preventDefault();
    try {
      await api.post('/super-admin/libraries', formData);
      setFormData(emptyLibrary);
      fetchData();
      alert('Library created successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create library');
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
      alert('Library updated successfully');
    } catch (error) {
      alert('Failed to update library');
    }
  };

  const handleDeleteLibrary = async (libraryId) => {
    if (!window.confirm('Delete this library? This will unassign users from it.')) {
      return;
    }

    try {
      await api.delete(`/super-admin/libraries/${libraryId}`);
      fetchData();
      alert('Library deleted successfully');
    } catch (error) {
      alert('Failed to delete library');
    }
  };

  const handleAssignAdmin = async (libraryId) => {
    const userId = assignments[libraryId];
    if (!userId) {
      alert('Please select a user to assign');
      return;
    }

    try {
      await api.post(`/super-admin/libraries/${libraryId}/assign-admin`, { user_id: Number(userId) });
      fetchData();
      alert('Library admin assigned successfully');
    } catch (error) {
      alert('Failed to assign library admin');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2 style={{ marginBottom: '1rem', color: '#1e293b' }}>Physical Library Management</h2>
      <p style={{ marginBottom: '1.5rem', color: '#475569' }}>
        Create and manage multiple libraries independently under Super Admin control.
      </p>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Create Library + Optional Library Admin</h3>
        <form onSubmit={handleCreateLibrary} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          <input placeholder="Library name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <input placeholder="Library code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
          <input placeholder="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          <input placeholder="Contact email" type="email" value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} />
          <input placeholder="Contact phone" value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} />
          <input placeholder="Admin full name" value={formData.admin_full_name} onChange={(e) => setFormData({ ...formData, admin_full_name: e.target.value })} />
          <input placeholder="Admin email" type="email" value={formData.admin_email} onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })} />
          <input placeholder="Admin password" type="password" value={formData.admin_password} onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })} />
          <button type="submit" style={{ background: '#0f766e', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.55rem' }}>Create Library</button>
        </form>
      </div>

      {loading ? (
        <div>Loading libraries...</div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {libraries.map((library) => {
            const draft = editingLibrary?.id === library.id ? editingLibrary : library;
            return (
              <div key={library.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.6rem' }}>
                  <input value={draft.name || ''} onChange={(e) => setEditingLibrary({ ...draft, name: e.target.value })} />
                  <input value={draft.code || ''} onChange={(e) => setEditingLibrary({ ...draft, code: e.target.value })} />
                  <input value={draft.address || ''} onChange={(e) => setEditingLibrary({ ...draft, address: e.target.value })} />
                  <input value={draft.contact_email || ''} onChange={(e) => setEditingLibrary({ ...draft, contact_email: e.target.value })} />
                  <input value={draft.contact_phone || ''} onChange={(e) => setEditingLibrary({ ...draft, contact_phone: e.target.value })} />
                  <select value={draft.is_active ? 'true' : 'false'} onChange={(e) => setEditingLibrary({ ...draft, is_active: e.target.value === 'true' })}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>

                <div style={{ marginTop: '0.8rem', fontSize: '0.85rem', color: '#475569' }}>
                  Current library admin: <strong>{library.admin_full_name || library.admin_email || 'Not assigned'}</strong>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.8rem' }}>
                  <button onClick={() => handleUpdateLibrary(draft)} style={{ background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.45rem 0.65rem' }}>
                    Save
                  </button>
                  <button onClick={() => handleDeleteLibrary(library.id)} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.45rem 0.65rem' }}>
                    Delete
                  </button>

                  <select
                    value={assignments[library.id] || ''}
                    onChange={(e) => setAssignments({ ...assignments, [library.id]: e.target.value })}
                    style={{ minWidth: '220px' }}
                  >
                    <option value="">Select user to assign as Library Admin</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>{user.full_name || user.email} ({user.email})</option>
                    ))}
                  </select>
                  <button onClick={() => handleAssignAdmin(library.id)} style={{ background: '#0f766e', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.45rem 0.65rem' }}>
                    Assign Library Admin
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SuperAdminLibraries;
