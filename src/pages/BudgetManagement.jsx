import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { useBudget } from '../context/BudgetContext';
import { useCategory } from '../context/CategoryContext';
import editIcon from '../../assets/edit.png';
import removeIcon from '../../assets/remove.png';
import backIcon from '../../assets/back.png';

export default function BudgetManagement() {
  const navigate = useNavigate();
  const { t, lang, formatMoney, translateCategory, toUSD, fromUSD, currencySymbol } = useLang();
  const { budgets, addBudget, updateBudget, deleteBudget } = useBudget();
  const { expenseCategories } = useCategory();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    category: 'all',
    amount: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  const [error, setError] = useState('');

  const resetForm = () => {
    setForm({ category: 'all', amount: '', startDate: new Date().toISOString().split('T')[0], endDate: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const amt = toUSD(parseFloat(form.amount));
    if (!amt || amt <= 0 || !form.endDate) {
      setError(lang === 'vi' ? 'Vui lòng nhập số tiền hợp lệ và ngày kết thúc.' : 'Please enter a valid amount and end date.');
      return;
    }
    try {
      if (editingId) {
        await updateBudget(editingId, {
          category: form.category,
          amount: amt,
          startDate: form.startDate,
          endDate: form.endDate,
        });
      } else {
        await addBudget({
          category: form.category,
          amount: amt,
          startDate: form.startDate,
          endDate: form.endDate,
        });
      }
      resetForm();
    } catch (err) {
      setError(err.message || (lang === 'vi' ? 'Lưu thất bại.' : 'Failed to save.'));
    }
  };

  const handleEdit = (b) => {
    setEditingId(b.id);
    setForm({
      category: b.category,
      amount: String(fromUSD(b.amount)),
      startDate: b.startDate,
      endDate: b.endDate,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await deleteBudget(id);
  };

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/settings')}>
          <img src={backIcon} alt="" className="back-icon" />
        </button>
        <h2 className="page-title">{t('budgeting')}</h2>
      </div>

      {!showForm && (
        <button className="btn btn-primary" style={{ marginBottom: 16, width: '100%' }} onClick={() => { setEditingId(null); setShowForm(true); }}>
          + {t('addBudget')}
        </button>
      )}

      {showForm && (
        <div className="budget-form-card">
          <form onSubmit={handleSubmit}>
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
                step="1"
                min="1"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
                placeholder={lang === 'vi' ? 'VD: 500000' : 'e.g. 500000'}
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
              <button type="button" className="btn" onClick={resetForm}>{t('cancel')}</button>
              <button type="submit" className="btn btn-primary">{editingId ? t('update') : t('add')}</button>
            </div>
            {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: 8, textAlign: 'center' }}>{error}</p>}
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
              <div className="category-actions">
                <button className="btn-icon" onClick={() => handleEdit(b)}><img src={editIcon} alt="" className="action-icon" /></button>
                <button className="btn-icon" onClick={() => handleDelete(b.id)}><img src={removeIcon} alt="" className="action-icon" /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
