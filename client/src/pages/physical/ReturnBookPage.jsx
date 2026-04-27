import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './physical.css';

function ReturnBookPage() {
  const [transactions, setTransactions] = useState([]);
  const [selected, setSelected] = useState('');
  const [form, setForm] = useState({ damage_level: '', is_lost: false, notes: '' });

  const load = async () => {
    const res = await api.get('/physical/transactions/active');
    setTransactions(res.data);
  };

  useEffect(() => {
    load().catch(() => alert('Failed to load active transactions'));
  }, []);

  const submitReturn = async (e) => {
    e.preventDefault();
    if (!selected) return;

    try {
      await api.post(`/physical/transactions/${selected}/return`, form);
      alert('Book returned successfully');
      setSelected('');
      setForm({ damage_level: '', is_lost: false, notes: '' });
      load();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to return book');
    }
  };

  return (
    <section className="physical-panel">
      <h2>Return Book</h2>
      <form className="physical-grid" onSubmit={submitReturn}>
        <select value={selected} onChange={(e) => setSelected(e.target.value)} required>
          <option value="">Select Active Transaction</option>
          {transactions.map((t) => (
            <option key={t.id} value={t.id}>
              #{t.id} - {t.book_title} / {t.member_name}
            </option>
          ))}
        </select>

        <select value={form.damage_level} onChange={(e) => setForm({ ...form, damage_level: e.target.value })}>
          <option value="">Damage Level (optional)</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <label style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={form.is_lost}
            onChange={(e) => setForm({ ...form, is_lost: e.target.checked })}
            style={{ width: 'auto' }}
          />
          Mark as Lost
        </label>

        <textarea
          placeholder="Return notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <button type="submit">Complete Return</button>
      </form>
    </section>
  );
}

export default ReturnBookPage;
