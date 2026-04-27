import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TopNavbar from '../components/Layout/TopNavbar';
import Footer from '../components/Layout/Footer';

const STORAGE_KEY = 'registered_members_preview';

const loadRegistrations = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
};

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [registrations, setRegistrations] = useState(loadRegistrations);
  const [editingId, setEditingId] = useState(null);
  const { register } = useAuth();

  const saveRegistrations = (nextRows) => {
    setRegistrations(nextRows);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRows));
  };

  const resetForm = () => {
    setFormData({ email: '', password: '', confirmPassword: '', full_name: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const result = await register(formData.email, formData.password, formData.full_name);

    if (!result.success) {
      setError(result.error || 'Registration failed');
      setLoading(false);
      return;
    }

    const registeredUser = result.user || {
      id: Date.now(),
      full_name: formData.full_name,
      email: formData.email,
      role: 'member'
    };

    if (editingId) {
      const updatedRows = registrations.map((row) => (
        row.local_id === editingId
          ? {
              ...row,
              full_name: registeredUser.full_name,
              email: registeredUser.email,
              updated_at: new Date().toISOString()
            }
          : row
      ));
      saveRegistrations(updatedRows);
      setSuccess('Registration updated in the table view.');
    } else {
      const newRow = {
        local_id: Date.now(),
        full_name: registeredUser.full_name,
        email: registeredUser.email,
        role: registeredUser.role || 'member',
        created_at: new Date().toISOString()
      };
      saveRegistrations([newRow, ...registrations]);
      setSuccess('Account created successfully and added to the table.');
    }

    resetForm();
    setLoading(false);
  };

  const handleEdit = (row) => {
    setEditingId(row.local_id);
    setFormData({
      full_name: row.full_name,
      email: row.email,
      password: '',
      confirmPassword: ''
    });
    setSuccess('Editing selected row. Enter a new password and submit to update.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (localId) => {
    if (!window.confirm('Delete this registration row from the table?')) {
      return;
    }
    const nextRows = registrations.filter((row) => row.local_id !== localId);
    saveRegistrations(nextRows);
  };

  const handleView = (row) => {
    alert(`Name: ${row.full_name}\nEmail: ${row.email}\nRole: ${row.role}\nCreated: ${new Date(row.created_at).toLocaleString()}`);
  };

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return registrations;

    return registrations.filter((row) =>
      row.full_name?.toLowerCase().includes(term)
      || row.email?.toLowerCase().includes(term)
      || row.role?.toLowerCase().includes(term)
    );
  }, [registrations, search]);

  return (
    <>
      <TopNavbar />
      <div style={{
        minHeight: 'calc(100vh - 64px - 200px)',
        background: 'radial-gradient(circle at top left, #7c3aed, #1d4ed8 55%, #0f172a)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        marginTop: '64px'
      }}>
        <div style={{
          maxWidth: '1180px',
          width: '100%',
          background: '#ffffff',
          borderRadius: '22px',
          boxShadow: '0 25px 65px rgba(15, 23, 42, 0.25)',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(300px, 420px) 1fr'
          }}>
            <div style={{
              background: 'linear-gradient(150deg, #1e3a8a 0%, #312e81 50%, #111827 100%)',
              color: '#fff',
              padding: '2.2rem 1.8rem'
            }}>
              <h2 style={{ marginBottom: '0.4rem', fontSize: '1.45rem' }}>Create Your Library Account</h2>
              <p style={{ fontSize: '0.9rem', opacity: 0.92, marginBottom: '1.5rem' }}>
                Simple, clear registration with an instant member table for quick management.
              </p>

              <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '12px', padding: '0.9rem', marginBottom: '0.8rem' }}>
                <strong>✨ Clean form</strong>
                <p style={{ margin: '0.35rem 0 0', fontSize: '0.83rem' }}>Guided fields with inline feedback and secure password checks.</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '12px', padding: '0.9rem', marginBottom: '0.8rem' }}>
                <strong>🔎 Searchable table</strong>
                <p style={{ margin: '0.35rem 0 0', fontSize: '0.83rem' }}>Find members fast by name, email, or role.</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '12px', padding: '0.9rem' }}>
                <strong>⚙️ Quick actions</strong>
                <p style={{ margin: '0.35rem 0 0', fontSize: '0.83rem' }}>View, edit, and delete rows directly from the table.</p>
              </div>

              <p style={{ marginTop: '1.1rem', fontSize: '0.82rem' }}>
                Already a member? <Link to="/login" style={{ color: '#bfdbfe' }}>Sign in</Link>
              </p>
            </div>

            <div style={{ padding: '2rem 1.8rem' }}>
              <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>{editingId ? 'Edit Registration Row' : 'Registration Form'}</h3>

              {error && <div style={{ marginBottom: '1rem', background: '#fef2f2', color: '#b91c1c', padding: '0.7rem', borderRadius: '8px' }}>{error}</div>}
              {success && <div style={{ marginBottom: '1rem', background: '#ecfdf5', color: '#047857', padding: '0.7rem', borderRadius: '8px' }}>{success}</div>}

              <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Full name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  style={{ gridColumn: 'span 2', padding: '0.72rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                />
                <input
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={{ gridColumn: 'span 2', padding: '0.72rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                />
                <input
                  type="password"
                  placeholder="Password (min 6 chars)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  style={{ padding: '0.72rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                />
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  style={{ padding: '0.72rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                />

                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '0.65rem' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '10px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                      color: '#fff',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {loading ? 'Please wait...' : editingId ? 'Update + Re-register' : 'Create Account'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    style={{ padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                  >
                    Clear
                  </button>
                </div>
              </form>

              <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.7rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
                  <h4 style={{ margin: 0, color: '#1e293b' }}>Registered Members</h4>
                  <input
                    type="text"
                    placeholder="Search by name, email, role..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ minWidth: '250px', padding: '0.55rem 0.7rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                  />
                </div>

                <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '680px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ textAlign: 'left', padding: '0.75rem' }}>Name</th>
                        <th style={{ textAlign: 'left', padding: '0.75rem' }}>Email</th>
                        <th style={{ textAlign: 'left', padding: '0.75rem' }}>Role</th>
                        <th style={{ textAlign: 'left', padding: '0.75rem' }}>Created</th>
                        <th style={{ textAlign: 'left', padding: '0.75rem' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>
                            No registrations match your search.
                          </td>
                        </tr>
                      ) : (
                        filteredRows.map((row) => (
                          <tr key={row.local_id} style={{ borderTop: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '0.72rem' }}>{row.full_name}</td>
                            <td style={{ padding: '0.72rem' }}>{row.email}</td>
                            <td style={{ padding: '0.72rem' }}>{row.role}</td>
                            <td style={{ padding: '0.72rem' }}>{new Date(row.created_at).toLocaleString()}</td>
                            <td style={{ padding: '0.72rem', display: 'flex', gap: '0.45rem' }}>
                              <button type="button" onClick={() => handleView(row)} style={{ border: '1px solid #d1d5db', background: '#fff', borderRadius: '6px', padding: '0.35rem 0.5rem', cursor: 'pointer' }}>View</button>
                              <button type="button" onClick={() => handleEdit(row)} style={{ border: '1px solid #93c5fd', background: '#eff6ff', borderRadius: '6px', padding: '0.35rem 0.5rem', cursor: 'pointer', color: '#1d4ed8' }}>Edit</button>
                              <button type="button" onClick={() => handleDelete(row.local_id)} style={{ border: '1px solid #fecaca', background: '#fef2f2', borderRadius: '6px', padding: '0.35rem 0.5rem', cursor: 'pointer', color: '#b91c1c' }}>Delete</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Register;
