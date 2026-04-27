import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './physical.css';

function OverdueReturnsPage() {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    const res = await api.get('/physical/transactions/overdue');
    setRows(res.data);
  };

  useEffect(() => {
    load().catch(() => alert('Failed to load overdue returns'));
  }, []);

  return (
    <section className="physical-panel">
      <div className="physical-head">
        <div>
          <h2>Overdue Return List</h2>
          <p className="physical-subtle">Track all overdue items with estimated fees.</p>
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
              <th>Overdue Days</th>
              <th>Estimated Fine</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan="7">No overdue transactions 🎉</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id}>
                <td>#{r.id}</td>
                <td>{r.member_name}</td>
                <td>{r.book_title}</td>
                <td>{new Date(r.due_date).toLocaleDateString()}</td>
                <td><span className="badge overdue">{r.overdue_days} days</span></td>
                <td>${Number(r.estimated_fine || 0).toFixed(2)}</td>
                <td><button type="button" onClick={() => setSelected(r)}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Overdue Details</h3>
            <p><b>Transaction:</b> #{selected.id}</p>
            <p><b>Member:</b> {selected.member_name}</p>
            <p><b>Book:</b> {selected.book_title}</p>
            <p><b>Due Date:</b> {new Date(selected.due_date).toLocaleDateString()}</p>
            <p><b>Overdue Days:</b> {selected.overdue_days}</p>
            <p><b>Estimated Fine:</b> ${Number(selected.estimated_fine || 0).toFixed(2)}</p>
            <div className="form-actions">
              <button type="button" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default OverdueReturnsPage;
