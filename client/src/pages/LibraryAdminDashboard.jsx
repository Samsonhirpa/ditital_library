import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import api from '../services/api';

const EMPTY_FORM = {
  email: '',
  full_name: '',
  role: 'physical_librarian',
  password: ''
};

function LibraryAdminDashboard() {
  const [staff, setStaff] = useState([]);
  const [stats, setStats] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingStaff, setEditingStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [staffRes, statsRes] = await Promise.all([
        api.get('/library-admin/staff'),
        api.get('/library-admin/dashboard')
      ]);

      setStaff(staffRes.data);
      setStats(statsRes.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to load library admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/library-admin/staff', formData);
      setFormData(EMPTY_FORM);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create staff member');
    }
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/library-admin/staff/${editingStaff.id}`, {
        email: editingStaff.email,
        full_name: editingStaff.full_name,
        role: editingStaff.role
      });
      setEditingStaff(null);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update staff member');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this staff member?')) return;

    try {
      await api.delete(`/library-admin/staff/${id}`);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete staff member');
    }
  };

  return (
    <DashboardLayout>
      <div style={{ padding: '1.5rem' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>👑 Physical Library Admin Complete Guide</h1>
        <p style={{ color: '#64748b', marginBottom: '1.25rem' }}>
          Full control center for your physical library: staff operations + real-time dashboard management.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[{
            label: 'Staff Members',
            value: stats?.total_staff ?? 0
          }, {
            label: 'Library Members',
            value: stats?.total_members ?? 0
          }, {
            label: 'Catalog Items',
            value: stats?.total_contents ?? 0
          }, {
            label: 'Active Borrows',
            value: stats?.active_borrows ?? 0
          }, {
            label: 'Total Sales',
            value: stats?.total_sales ?? 0
          }, {
            label: 'Revenue',
            value: Number(stats?.total_revenue || 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' })
          }].map((card) => (
            <div key={card.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.9rem' }}>
              <p style={{ color: '#64748b', marginBottom: '0.35rem' }}>{card.label}</p>
              <h2 style={{ margin: 0 }}>{card.value}</h2>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
          <h3>1. Staff Management</h3>
          <p style={{ color: '#475569' }}>Create, edit, and delete Physical Librarians and Physical Managers for your library branch.</p>

          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem' }}>
            <input placeholder="Staff full name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
            <input placeholder="Staff email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
              <option value="physical_librarian">Physical Librarian</option>
              <option value="physical_manager">Physical Manager</option>
            </select>
            <input placeholder="Temporary password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
            <button type="submit" style={{ background: '#0f766e', color: 'white', border: 'none', borderRadius: '8px' }}>Create Staff</button>
          </form>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
          <h3>2. Staff Directory</h3>
          {loading ? (
            <p>Loading staff...</p>
          ) : staff.length === 0 ? (
            <p style={{ color: '#64748b' }}>No staff members found yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: '0.6rem' }}>
              {staff.map((person) => {
                const draft = editingStaff?.id === person.id ? editingStaff : person;
                return (
                  <div key={person.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr auto', gap: '0.6rem', alignItems: 'center' }}>
                      <input value={draft.full_name || ''} onChange={(e) => setEditingStaff({ ...draft, full_name: e.target.value })} onFocus={() => setEditingStaff(draft)} />
                      <input type="email" value={draft.email} onChange={(e) => setEditingStaff({ ...draft, email: e.target.value })} onFocus={() => setEditingStaff(draft)} />
                      <select value={draft.role} onChange={(e) => setEditingStaff({ ...draft, role: e.target.value })} onFocus={() => setEditingStaff(draft)}>
                        <option value="physical_librarian">Physical Librarian</option>
                        <option value="physical_manager">Physical Manager</option>
                      </select>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button type="button" onClick={handleUpdate} disabled={editingStaff?.id !== person.id}>Save</button>
                        <button type="button" onClick={() => handleDelete(person.id)} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px' }}>Delete</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default LibraryAdminDashboard;
