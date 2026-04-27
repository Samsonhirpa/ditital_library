import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './physical.css';

function IssueBookPage() {
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({ member_id: '', book_id: '' });

  const load = async () => {
    const [memberRes, bookRes] = await Promise.all([
      api.get('/physical/members'),
      api.get('/physical/books')
    ]);
    setMembers(memberRes.data.filter((m) => m.status === 'APPROVED'));
    setBooks(bookRes.data.filter((b) => Number(b.copies_available) > 0));
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
      load();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to issue book');
    }
  };

  return (
    <section className="physical-panel">
      <h2>Issue Book</h2>
      <form className="physical-grid" onSubmit={handleIssue}>
        <select value={form.member_id} onChange={(e) => setForm({ ...form, member_id: e.target.value })} required>
          <option value="">Select Approved Member</option>
          {members.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.id_number})</option>)}
        </select>
        <select value={form.book_id} onChange={(e) => setForm({ ...form, book_id: e.target.value })} required>
          <option value="">Select Available Book</option>
          {books.map((b) => <option key={b.id} value={b.id}>{b.title} ({b.copies_available} available)</option>)}
        </select>
        <button type="submit">Issue Now</button>
      </form>
    </section>
  );
}

export default IssueBookPage;
