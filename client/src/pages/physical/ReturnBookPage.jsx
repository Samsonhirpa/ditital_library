import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { FiCheckCircle, FiPlus, FiSearch } from 'react-icons/fi';
import './physical.css';

function ReturnBookPage() {
  const [transactions, setTransactions] = useState([]);
  const [selected, setSelected] = useState('');
  const [form, setForm] = useState({ damage_level: '', is_lost: false, notes: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    const res = await api.get('/physical/transactions/active');
    setTransactions(res.data || []);
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
      setShowModal(false);
      load();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to return book');
    }
  };

  const filteredRows = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return transactions.filter((row) => (
      row.book_title?.toLowerCase().includes(term)
      || row.member_name?.toLowerCase().includes(term)
      || String(row.id).includes(term)
    ));
  }, [transactions, searchTerm]);

  return (
    <section className="physical-panel">
      <div className="physical-page-header">
        <div>
          <h2>Return Books</h2>
          <p>Complete returns and review active borrow transactions.</p>
        </div>
        <button type="button" className="physical-primary-btn" onClick={() => setShowModal(true)}>
          <FiPlus /> Add Return
        </button>
      </div>

      <div className="physical-table-toolbar">
        <div className="physical-search-wrap">
          <FiSearch />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by transaction ID, book, member"
          />
        </div>
      </div>

      <div className="physical-table-wrap">
        <table className="physical-table">
          <thead>
            <tr>
              <th>Transaction</th>
              <th>Book</th>
              <th>Member</th>
              <th>Issue Date</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={5} className="physical-empty">No active transactions found.</td>
              </tr>
            )}
            {filteredRows.map((row) => (
              <tr key={row.id}>
                <td>#{row.id}</td>
                <td>{row.book_title}</td>
                <td>{row.member_name}</td>
                <td>{new Date(row.issue_date).toLocaleDateString()}</td>
                <td>{new Date(row.due_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="physical-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="physical-modal" onClick={(e) => e.stopPropagation()}>
            <h3><FiCheckCircle /> Register Book Return</h3>
            <form className="physical-grid" onSubmit={submitReturn}>
              <select value={selected} onChange={(e) => setSelected(e.target.value)} required>
                <option value="">Select Active Transaction</option>
                {transactions.map((transaction) => (
                  <option key={transaction.id} value={transaction.id}>
                    #{transaction.id} - {transaction.book_title} / {transaction.member_name}
                  </option>
                ))}
              </select>

              <select value={form.damage_level} onChange={(e) => setForm({ ...form, damage_level: e.target.value })}>
                <option value="">Damage Level (optional)</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <label className="physical-checkbox-row">
                <input
                  type="checkbox"
                  checked={form.is_lost}
                  onChange={(e) => setForm({ ...form, is_lost: e.target.checked })}
                />
                Mark as Lost
              </label>

              <textarea
                placeholder="Return notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
              <button type="submit" className="physical-primary-btn">Complete Return</button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default ReturnBookPage;
