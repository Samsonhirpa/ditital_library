import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './physical.css';

function IssueBookPage() {
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [activeRows, setActiveRows] = useState([]);
  const [form, setForm] = useState({ member_id: '', book_id: '' });
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    const [memberRes, bookRes, activeRes] = await Promise.all([
      api.get('/physical/members'),
      api.get('/physical/books'),
      api.get('/physical/transactions/active')
    ]);
    setMembers(memberRes.data.filter((m) => m.status === 'APPROVED'));
    setBooks(bookRes.data.filter((b) => Number(b.copies_available) > 0));
    setActiveRows(activeRes.data);
  };

  useEffect(() => {
    load().catch(() => alert('Failed to load issue form data'));
  }, []);

  const handleIssue = async (e) => {
    e.preventDefault();
    try {
      await api.post('/physical/transactions/issue', {
        member_id: Number(form.member_id),
        book_id: Number(form.book_id)
      });
      alert('Book issued successfully');
      setForm({ member_id: '', book_id: '' });
      setShowModal(false);
      load();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to issue book');
    }
  };

  return (
    <section className="physical-panel">
      <div className="physical-head">
        <div>
          <h2>Issue Book</h2>
          <p className="physical-subtle">Create new issue transactions from approved members and available books.</p>
        </div>
        <button type="button" onClick={() => setShowModal(true)}>+ New Issue</button>
      </div>

      <div className="physical-table-wrap">
        <table className="physical-table">
          <thead>
            <tr>
              <th>Transaction</th>
              <th>Member</th>
              <th>Book</th>
              <th>Issue Date</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {activeRows.length === 0 ? (
              <tr><td colSpan="5">No active issues.</td></tr>
            ) : activeRows.map((row) => (
              <tr key={row.id}>
                <td>#{row.id}</td>
                <td>{row.member_name}</td>
                <td>{row.book_title}</td>
                <td>{new Date(row.issue_date).toLocaleDateString()}</td>
                <td>{new Date(row.due_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Issue New Book</h3>
            <form className="physical-grid" onSubmit={handleIssue}>
              <div className="form-group">
                <label>Approved Member</label>
                <select value={form.member_id} onChange={(e) => setForm({ ...form, member_id: e.target.value })} required>
                  <option value="">Select Approved Member</option>
                  {members.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.id_number})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Available Book</label>
                <select value={form.book_id} onChange={(e) => setForm({ ...form, book_id: e.target.value })} required>
                  <option value="">Select Available Book</option>
                  {books.map((b) => <option key={b.id} value={b.id}>{b.title} ({b.copies_available} available)</option>)}
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit">Issue Now</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default IssueBookPage;
