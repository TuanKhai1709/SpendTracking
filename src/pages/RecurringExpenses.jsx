import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { useRecurring } from '../context/RecurringContext';
import editIcon from '../../assets/edit.png';
import removeIcon from '../../assets/remove.png';
import backIcon from '../../assets/back.png';

export default function RecurringExpenses() {
  const navigate = useNavigate();
  const { t, formatMoney, toUSD, fromUSD, currencySymbol } = useLang();
  const { recurringItems, addRecurring, updateRecurring, deleteRecurring } = useRecurring();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', amount: '', dayOfMonth: 1 });

  const resetForm = () => {
    setForm({ title: '', amount: '', dayOfMonth: 1 });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedTitle = form.title.trim();
    const amt = toUSD(parseFloat(form.amount));
    if (!trimmedTitle || !amt || !form.dayOfMonth) return;
    if (editingId) {
      await updateRecurring(editingId, {
        title: trimmedTitle,
        amount: amt,
        dayOfMonth: parseInt(form.dayOfMonth),
      });
    } else {
      await addRecurring({
        title: trimmedTitle,
        amount: amt,
        dayOfMonth: parseInt(form.dayOfMonth),
      });
    }
    resetForm();
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      amount: String(fromUSD(item.amount)),
      dayOfMonth: item.dayOfMonth,
    });
    setShowForm(true);
  };

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/settings')}>
          <img src={backIcon} alt="" className="back-icon" />
        </button>
        <h2 className="page-title">{t('recurringExpenses')}</h2>
      </div>

      {!showForm && (
        <button className="btn btn-primary" style={{ marginBottom: 16, width: '100%' }} onClick={() => { setEditingId(null); setShowForm(true); }}>
          + {t('addRecurring')}
        </button>
      )}

      {showForm && (
        <div className="budget-form-card">
          <form onSubmit={handleSubmit}>
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
              <label>{t('dayOfMonth')}</label>
              <input
                type="number"
                min="1"
                max="28"
                value={form.dayOfMonth}
                onChange={(e) => setForm({ ...form, dayOfMonth: e.target.value })}
                required
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={resetForm}>{t('cancel')}</button>
              <button type="submit" className="btn btn-primary">{editingId ? t('update') : t('add')}</button>
            </div>
          </form>
        </div>
      )}

      <div className="budget-manage-list">
        {recurringItems.length === 0 ? (
          <p className="empty-text">{t('noRecurring')}</p>
        ) : (
          recurringItems.map((item) => (
            <div key={item.id} className="budget-manage-item">
              <div className="budget-manage-info">
                <span className="budget-manage-name">{item.title}</span>
                <span className="budget-manage-detail">
                  {formatMoney(item.amount)} | {t('dayOfMonth')}: {item.dayOfMonth}
                </span>
              </div>
              <div className="category-actions">
                <button className="btn-icon" onClick={() => handleEdit(item)}>
                  <img src={editIcon} alt="" className="action-icon" />
                </button>
                <button className="btn-icon" onClick={() => deleteRecurring(item.id)}>
                  <img src={removeIcon} alt="" className="action-icon" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
