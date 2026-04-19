import { useState } from 'react';
import { useLang } from '../context/LangContext';
import { useBudget } from '../context/BudgetContext';
import { useCategory } from '../context/CategoryContext';

export default function BudgetManagement() {
  const { t, formatMoney, translateCategory, toUSD, fromUSD, currencySymbol } = useLang();
  const { budgets, addBudget, deleteBudget } = useBudget();
  const { expenseCategories } = useCategory();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    category: 'all',
    amount: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    const amt = toUSD(parseFloat(form.amount));
    if (!amt || !form.endDate) return;
    await addBudget({
      category: form.category,
      amount: amt,
      startDate: form.startDate,
      endDate: form.endDate,
    });
    setForm({ category: 'all', amount: '', startDate: new Date().toISOString().split('T')[0], endDate: '' });
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    await deleteBudget(id);
  };

  return (
    <div className="page">
      <h2 className="page-title">{t('budgeting')}</h2>

      {!showForm && (
        <button className="btn btn-primary" style={{ marginBottom: 16, width: '100%' }} onClick={() => setShowForm(true)}>
          + {t('addBudget')}
        </button>
      )}

      {showForm && (
        <div className="budget-form-card">
          <form onSubmit={handleAdd}>
            <div className="form-group">
              <label>{t('category')}</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="filter-select"
              >
                <option value="all">{t('allCategories')}</option>
                {expenseCategories.map((c) => (
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
              <label>{t('startDate')}</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>{t('endDate')}</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                required
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setShowForm(false)}>{t('cancel')}</button>
              <button type="submit" className="btn btn-primary">{t('add')}</button>
            </div>
          </form>
        </div>
      )}

      <div className="budget-manage-list">
        {budgets.length === 0 ? (
          <p className="empty-text">{t('noBudgets')}</p>
        ) : (
          budgets.map((b) => (
            <div key={b.id} className="budget-manage-item">
              <div className="budget-manage-info">
                <span className="budget-manage-name">
                  {b.category === 'all' ? t('allCategories') : translateCategory(b.category)}
                </span>
                <span className="budget-manage-detail">
                  {formatMoney(b.amount)} | {b.startDate} → {b.endDate}
                </span>
              </div>
              <button className="btn-icon" onClick={() => handleDelete(b.id)}>🗑️</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
