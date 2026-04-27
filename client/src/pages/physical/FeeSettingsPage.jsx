import React, { useEffect, useMemo, useState } from 'react';
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

const formatMoney = (amount) => `$${Number(amount || 0).toFixed(2)}`;

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

  const explanationItems = useMemo(() => {
    const items = [
      `Borrowers can keep items for ${form.loan_days} day(s) before overdue calculations start.`,
      `Overdue fines are charged at ${formatMoney(form.fine_per_day)} per day after the loan period.`,
      `Damage fees are tiered: low ${formatMoney(form.damage_fee_low)}, medium ${formatMoney(form.damage_fee_medium)}, and high ${formatMoney(form.damage_fee_high)}.`
    ];

    if (form.lost_fee_mode === 'custom') {
      items.push(`Lost books are charged a fixed fee of ${formatMoney(form.lost_fee_custom_amount)}.`);
    } else {
      items.push('Lost books are charged based on each book sale value (or $0.00 if no sale value is set).');
    }

    return items;
  }, [form]);

  return (
    <section className="physical-panel fee-settings-panel">
      <div className="fee-settings-header">
        <h2>Fee Management Settings</h2>
        <p>Set clear fee levels and a transparent charging concept for staff and borrowers.</p>
      </div>

      <form className="fee-settings-form" onSubmit={onSave}>
        <div className="fee-settings-grid">
          <div className="fee-settings-group">
            <h3>Loan & overdue</h3>

            <label htmlFor="loan_days">Loan duration (days)</label>
            <input
              id="loan_days"
              type="number"
              min="1"
              value={form.loan_days}
              onChange={(e) => setForm({ ...form, loan_days: Number(e.target.value) })}
              placeholder="Loan days"
            />

            <label htmlFor="fine_per_day">Overdue fee per day ($)</label>
            <input
              id="fine_per_day"
              type="number"
              min="0"
              step="0.01"
              value={form.fine_per_day}
              onChange={(e) => setForm({ ...form, fine_per_day: Number(e.target.value) })}
              placeholder="Overdue fee / day"
            />
          </div>

          <div className="fee-settings-group">
            <h3>Damage fee levels</h3>

            <label htmlFor="damage_fee_low">Low damage fee ($)</label>
            <input
              id="damage_fee_low"
              type="number"
              min="0"
              step="0.01"
              value={form.damage_fee_low}
              onChange={(e) => setForm({ ...form, damage_fee_low: Number(e.target.value) })}
              placeholder="Low damage fee"
            />

            <label htmlFor="damage_fee_medium">Medium damage fee ($)</label>
            <input
              id="damage_fee_medium"
              type="number"
              min="0"
              step="0.01"
              value={form.damage_fee_medium}
              onChange={(e) => setForm({ ...form, damage_fee_medium: Number(e.target.value) })}
              placeholder="Medium damage fee"
            />

            <label htmlFor="damage_fee_high">High damage fee ($)</label>
            <input
              id="damage_fee_high"
              type="number"
              min="0"
              step="0.01"
              value={form.damage_fee_high}
              onChange={(e) => setForm({ ...form, damage_fee_high: Number(e.target.value) })}
              placeholder="High damage fee"
            />
          </div>

          <div className="fee-settings-group">
            <h3>Lost book charging</h3>

            <label htmlFor="lost_fee_mode">Lost fee method</label>
            <select
              id="lost_fee_mode"
              value={form.lost_fee_mode}
              onChange={(e) => setForm({ ...form, lost_fee_mode: e.target.value })}
            >
              <option value="book_sale">Use book sale value</option>
              <option value="custom">Use fixed custom amount</option>
            </select>

            <label htmlFor="lost_fee_custom_amount">Custom lost fee amount ($)</label>
            <input
              id="lost_fee_custom_amount"
              type="number"
              min="0"
              step="0.01"
              value={form.lost_fee_custom_amount}
              onChange={(e) => setForm({ ...form, lost_fee_custom_amount: Number(e.target.value) })}
              placeholder="Lost fee custom amount"
              disabled={form.lost_fee_mode !== 'custom'}
            />

            <p className="fee-settings-note">
              {form.lost_fee_mode === 'custom'
                ? 'Custom mode is active. This fixed value is applied to every lost book.'
                : 'Book sale mode is active. The system uses each book\'s sale value for lost fees.'}
            </p>
          </div>
        </div>

        <aside className="fee-settings-explanation" aria-live="polite">
          <h3>Fee concept explanation</h3>
          <ul>
            {explanationItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </aside>

        <button type="submit" className="physical-primary-btn">Save Settings</button>
      </form>
    </section>
  );
}

export default FeeSettingsPage;
