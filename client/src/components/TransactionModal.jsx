import { useState, useEffect } from 'react';

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];

export default function TransactionModal({ type, transaction, onSave, onClose, onDelete }) {
  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const [form, setForm] = useState({
    title: '',
    category: categories[0],
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (transaction) {
      setForm({
        title: transaction.title,
        category: transaction.category,
        amount: String(transaction.amount),
        date: transaction.date,
      });
    }
  }, [transaction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ ...form, amount: parseFloat(form.amount) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{transaction ? 'Edit' : 'New'} {type === 'expense' ? 'Expense' : 'Income'}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              placeholder="Enter title"
              maxLength={100}
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
              placeholder="0.00"
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>
          <div className="modal-actions">
            {transaction && onDelete && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => onDelete(transaction.id)}
              >
                Delete
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : transaction ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
