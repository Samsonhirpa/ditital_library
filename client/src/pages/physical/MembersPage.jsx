import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { FiPlus, FiSearch, FiUserPlus, FiCheck, FiX } from 'react-icons/fi';
import './physical.css';

const EMPTY = { name: '', phone: '', address: '', id_number: '' };

function MembersPage() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const load = async () => {
    const res = await api.get('/physical/members');
    setMembers(res.data || []);
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

  const filteredMembers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return members.filter((member) => (
      member.name?.toLowerCase().includes(term)
      || member.phone?.toLowerCase().includes(term)
      || member.id_number?.toLowerCase().includes(term)
      || member.status?.toLowerCase().includes(term)
    ));
  }, [members, searchTerm]);

  return (
    <section className="physical-panel">
      <div className="physical-page-header">
        <div>
          <h2>Members</h2>
          <p>Register members and manage approvals from one clean screen.</p>
        </div>
        <button type="button" className="physical-primary-btn" onClick={() => setShowModal(true)}>
          <FiPlus /> Add Member
        </button>
      </div>

      <div className="physical-table-toolbar">
        <div className="physical-search-wrap">
          <FiSearch />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search member name, phone, ID, status"
          />
        </div>
      </div>

      <div className="physical-table-wrap">
        <table className="physical-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>ID Number</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length === 0 && (
              <tr>
                <td colSpan={5} className="physical-empty">No members found.</td>
              </tr>
            )}
            {filteredMembers.map((member) => (
              <tr key={member.id}>
                <td>{member.name}</td>
                <td>{member.phone}</td>
                <td>{member.id_number}</td>
                <td>
                  <span className={`physical-badge physical-badge-${member.status?.toLowerCase() || 'default'}`}>
                    {member.status}
                  </span>
                </td>
                <td>
                  {member.status === 'PENDING_MANAGER' ? (
                    <div className="physical-row-actions">
                      <button type="button" className="physical-ghost-btn success" onClick={() => approve(member.id)}>
                        <FiCheck /> Approve
                      </button>
                      <button type="button" className="physical-ghost-btn danger" onClick={() => reject(member.id)}>
                        <FiX /> Reject
                      </button>
                    </div>
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="physical-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="physical-modal" onClick={(e) => e.stopPropagation()}>
            <h3><FiUserPlus /> Add New Member</h3>
            <form className="physical-grid" onSubmit={createMember}>
              <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
              <input placeholder="ID Number" value={form.id_number} onChange={(e) => setForm({ ...form, id_number: e.target.value })} required />
              <button type="submit" className="physical-primary-btn">Save Member</button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default MembersPage;
