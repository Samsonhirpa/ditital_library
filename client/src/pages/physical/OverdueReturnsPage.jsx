import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { FiAlertCircle, FiSearch } from 'react-icons/fi';
import './physical.css';

function OverdueReturnsPage() {
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const load = async () => {
    const res = await api.get('/physical/transactions/overdue');
    setRows(res.data || []);
  };

  useEffect(() => {
    load().catch(() => alert('Failed to load overdue returns'));
  }, []);

  const filteredRows = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return rows.filter((row) => (
      row.book_title?.toLowerCase().includes(term)
      || row.member_name?.toLowerCase().includes(term)
    ));
  }, [rows, searchTerm]);

  return (
    <section className="physical-panel">
      <div className="physical-page-header">
        <div>
          <h2>Overdue Returns</h2>
          <p>Track overdue loans and estimated fines quickly.</p>
        </div>
        <div className="physical-overdue-pill">
          <FiAlertCircle /> {rows.length} overdue
        </div>
      </div>

      <div className="physical-table-toolbar">
        <div className="physical-search-wrap">
          <FiSearch />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by book title or member"
          />
        </div>
      </div>

      <div className="physical-table-wrap">
        <table className="physical-table">
          <thead>
            <tr>
              <th>Book</th>
              <th>Member</th>
              <th>Due Date</th>
              <th>Overdue Days</th>
              <th>Estimated Fine</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={5} className="physical-empty">No overdue transactions 🎉</td>
              </tr>
            )}
            {filteredRows.map((row) => (
              <tr key={row.id}>
                <td>{row.book_title}</td>
                <td>{row.member_name}</td>
                <td>{new Date(row.due_date).toLocaleDateString()}</td>
                <td>{row.overdue_days}</td>
                <td>${Number(row.estimated_fine || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default OverdueReturnsPage;
