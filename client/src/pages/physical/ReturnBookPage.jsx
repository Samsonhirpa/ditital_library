import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './physical.css';

function ReturnBookPage() {
  const [transactions, setTransactions] = useState([]);
  const [selected, setSelected] = useState(null);
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
    if (!selected?.id) return;

    try {
      await api.post(`/physical/transactions/${selected.id}/return`, form);
      alert('Book returned successfully');
      setSelected(null);
      setForm({ damage_level: '', is_lost: false, notes: '' });
      load();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to return book');
    }
  };

  return (
    <section className="physical-panel">
      <div className="physical-head">
        <div>
          <h2>Return Book</h2>
          <p className="physical-subtle">Select an active issue and complete return with fine/damage details.</p>
        </div>
      </div>

      <div className="physical-table-wrap">
        <table className="physical-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Member</th>
              <th>Book</th>
              <th>Due Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr><td colSpan="5">No active returns pending.</td></tr>
            ) : transactions.map((t) => (
              <tr key={t.id}>
                <td>#{t.id}</td>
                <td>{t.member_name}</td>
                <td>{t.book_title}</td>
                <td>{new Date(t.due_date).toLocaleDateString()}</td>
                <td><button type="button" onClick={() => setSelected(t)}>Return</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Return Transaction #{selected.id}</h3>
            <p className="physical-subtle">{selected.book_title} • {selected.member_name}</p>
            <form className="physical-grid" onSubmit={submitReturn}>
              <div className="form-group">
                <label>Damage Level (optional)</label>
                <select value={form.damage_level} onChange={(e) => setForm({ ...form, damage_level: e.target.value })}>
                  <option value="">None</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={form.is_lost}
                    onChange={(e) => setForm({ ...form, is_lost: e.target.checked })}
                    style={{ width: 'auto' }}
                  />
                  Mark as Lost
                </label>
              </div>

              <div className="form-group">
                <label>Return Notes</label>
                <textarea
                  placeholder="Any notes for this return"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setSelected(null)}>Cancel</button>
                <button type="submit">Complete Return</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default ReturnBookPage;
