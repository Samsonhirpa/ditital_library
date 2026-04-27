import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './physical.css';

function OverdueReturnsPage() {
  const [rows, setRows] = useState([]);

  const load = async () => {
    const res = await api.get('/physical/transactions/overdue');
    setRows(res.data);
  };

  useEffect(() => {
    load().catch(() => alert('Failed to load overdue returns'));
  }, []);

  return (
    <section className="physical-panel">
      <h2>Overdue Return List</h2>
      <div className="physical-list">
        {rows.length === 0 && <p>No overdue transactions 🎉</p>}
        {rows.map((r) => (
          <article className="physical-card" key={r.id}>
            <strong>{r.book_title}</strong>
            <p>Member: {r.member_name}</p>
            <p>Due: {new Date(r.due_date).toLocaleDateString()}</p>
            <p>Overdue Days: {r.overdue_days}</p>
            <p>Estimated Fine: ${Number(r.estimated_fine || 0).toFixed(2)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default OverdueReturnsPage;
