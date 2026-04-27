import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './physical.css';

const EMPTY = { name: '', phone: '', address: '', id_number: '' };

function MembersPage() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    const res = await api.get('/physical/members');
    setMembers(res.data);
  };

  useEffect(() => {
    load().catch(() => alert('Failed to load members'));
  }, []);

  const createMember = async (e) => {
    e.preventDefault();
    try {
      await api.post('/physical/members', form);
      alert('Member submitted to manager approval');
      setForm(EMPTY);
      setShowModal(false);
      load();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add member');
    }
  };

  const approve = async (id) => {
    await api.put(`/physical/members/${id}/approve`);
    load();
  };

  const reject = async (id) => {
    const reason = window.prompt('Reason for rejection?') || '';
    await api.put(`/physical/members/${id}/reject`, { reason });
    load();
  };

  return (
    <section className="physical-panel">
      <div className="physical-head">
        <div>
          <h2>Add Member & Manage</h2>
          <p className="physical-subtle">Register physical members and process manager approvals.</p>
        </div>
        <button type="button" onClick={() => setShowModal(true)}>+ Add Member</button>
      </div>

      <div className="physical-table-wrap">
        <table className="physical-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>ID Number</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr><td colSpan="5">No members found.</td></tr>
            ) : members.map((m) => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td>{m.phone}</td>
                <td>{m.id_number}</td>
                <td>
                  <span className={`badge ${String(m.status || '').toLowerCase().replace('_manager', '')}`}>
                    {m.status}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: '0.4rem' }}>
                  {m.status === 'PENDING_MANAGER' && (
                    <>
                      <button type="button" onClick={() => approve(m.id)}>Approve</button>
                      <button type="button" className="btn-danger" onClick={() => reject(m.id)}>Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Member</h3>
            <form className="physical-grid" onSubmit={createMember}>
              <div className="form-group">
                <label>Name</label>
                <input placeholder="Member full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>ID Number</label>
                <input placeholder="National/Library ID" value={form.id_number} onChange={(e) => setForm({ ...form, id_number: e.target.value })} required />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit">Submit Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default MembersPage;
