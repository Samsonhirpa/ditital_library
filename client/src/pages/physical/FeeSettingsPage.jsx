import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './physical.css';

const DEFAULTS = {
  loan_days: 14,
  fine_per_day: 1,
  damage_fee_low: 0,
  damage_fee_medium: 0,
  damage_fee_high: 0,
  lost_fee_mode: 'book_sale',
  lost_fee_custom_amount: 0
};

function FeeSettingsPage() {
  const [form, setForm] = useState(DEFAULTS);

  useEffect(() => {
    api.get('/physical/settings')
      .then((res) => setForm({ ...DEFAULTS, ...res.data }))
      .catch(() => alert('Failed to load fee settings'));
  }, []);

  const onSave = async (e) => {
    e.preventDefault();
    try {
      await api.put('/physical/settings', form);
      alert('Fee settings updated');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save fee settings');
    }
  };

  return (
    <section className="physical-panel">
      <div className="physical-head">
        <div>
          <h2>Fee Management Settings</h2>
          <p className="physical-subtle">Configure overdue, damage, and lost-book charges for your branch.</p>
        </div>
      </div>
      <form className="physical-grid" onSubmit={onSave}>
        <div className="form-group">
          <label>Loan Days</label>
          <input type="number" min="1" value={form.loan_days} onChange={(e) => setForm({ ...form, loan_days: Number(e.target.value) })} placeholder="Loan days" />
        </div>
        <div className="form-group">
          <label>Overdue Fee Per Day</label>
          <input type="number" min="0" step="0.01" value={form.fine_per_day} onChange={(e) => setForm({ ...form, fine_per_day: Number(e.target.value) })} placeholder="Overdue fee / day" />
        </div>

        <div className="form-group">
          <label>Low Damage Fee</label>
          <input type="number" min="0" step="0.01" value={form.damage_fee_low} onChange={(e) => setForm({ ...form, damage_fee_low: Number(e.target.value) })} placeholder="Low damage fee" />
        </div>
        <div className="form-group">
          <label>Medium Damage Fee</label>
          <input type="number" min="0" step="0.01" value={form.damage_fee_medium} onChange={(e) => setForm({ ...form, damage_fee_medium: Number(e.target.value) })} placeholder="Medium damage fee" />
        </div>
        <div className="form-group">
          <label>High Damage Fee</label>
          <input type="number" min="0" step="0.01" value={form.damage_fee_high} onChange={(e) => setForm({ ...form, damage_fee_high: Number(e.target.value) })} placeholder="High damage fee" />
        </div>

        <div className="form-group">
          <label>Lost Fee Mode</label>
          <select value={form.lost_fee_mode} onChange={(e) => setForm({ ...form, lost_fee_mode: e.target.value })}>
            <option value="book_sale">Book Sale Value (0 fallback)</option>
            <option value="custom">Custom Fixed Amount</option>
          </select>
        </div>

        <div className="form-group">
          <label>Lost Fee Custom Amount</label>
          <input type="number" min="0" step="0.01" value={form.lost_fee_custom_amount} onChange={(e) => setForm({ ...form, lost_fee_custom_amount: Number(e.target.value) })} placeholder="Lost fee custom amount" />
        </div>

        <div className="form-actions">
          <button type="submit">Save Settings</button>
        </div>
      </form>
    </section>
  );
}

export default FeeSettingsPage;
