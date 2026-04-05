import { useState, useEffect } from 'react';
import { useLang } from '../context/LangContext';

const EXPENSE_CATEGORIES = ['Food & Dining', 'Coffee', 'Transportation', 'Shopping', 'Bills', 'Recurring Expenses', 'Recurring Investments', 'Entertainment', 'Healthcare', 'Education', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Bonus', 'Tip', 'Investment', 'Other'];

export default function TransactionModal({ type, transaction, onSave, onClose, onDelete }) {
  const { t, translateCategory, toUSD, fromUSD, currencySymbol } = useLang();
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
        amount: String(fromUSD(transaction.amount)),
        date: transaction.date,
      });
    }
  }, [transaction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ ...form, amount: toUSD(parseFloat(form.amount)) });
    } finally {
      setSaving(false);
    }
  };

  const typeLabel = type === 'expense' ? t('expense') : t('income');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{transaction ? t('edit') : t('new')} {typeLabel}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>{t('title')}</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              placeholder={t('enterTitle')}
              maxLength={100}
            />
          </div>
          <div className="form-group">
            <label>{t('category')}</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{translateCategory(c)}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>{t('amount')} ({currencySymbol})</label>
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
            <label>{t('date')}</label>
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
                {t('delete')}
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? t('saving') : transaction ? t('update') : t('add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
