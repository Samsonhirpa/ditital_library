import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './physical.css';

const EMPTY = { name: '', phone: '', address: '', id_number: '' };

function MembersPage() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(EMPTY);

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
      <h2>Add Member & Manage</h2>
      <form className="physical-grid" onSubmit={createMember}>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
        <input placeholder="ID Number" value={form.id_number} onChange={(e) => setForm({ ...form, id_number: e.target.value })} required />
        <button type="submit">Add Member</button>
      </form>

      <div className="physical-list">
        {members.map((m) => (
          <article className="physical-card" key={m.id}>
            <strong>{m.name}</strong> — {m.phone} — {m.id_number}
            <p>Status: <b>{m.status}</b></p>
            {m.status === 'PENDING_MANAGER' && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" onClick={() => approve(m.id)}>Approve</button>
                <button type="button" onClick={() => reject(m.id)} style={{ background: '#dc2626' }}>Reject</button>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export default MembersPage;
