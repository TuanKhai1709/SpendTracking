import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { useCategory } from '../context/CategoryContext';
import editIcon from '../../assets/edit.png';
import removeIcon from '../../assets/remove.png';
import backIcon from '../../assets/back.png';

export default function CategoryManagement() {
  const navigate = useNavigate();
  const { t, translateCategory } = useLang();
  const { expenseCategories, incomeCategories, loaded, initializeDefaults, addCategory, updateCategory, deleteCategory } = useCategory();
  const [tab, setTab] = useState('expense');
  const [newName, setNewName] = useState('');
  const [editingName, setEditingName] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    if (loaded && expenseCategories.length === 0 && incomeCategories.length === 0) {
      initializeDefaults();
    }
  }, [loaded]);

  const categories = tab === 'expense' ? expenseCategories : incomeCategories;

  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) return;
    await addCategory(trimmed, tab);
    setNewName('');
  };

  const handleUpdate = async (oldName) => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === oldName) {
      setEditingName(null);
      return;
    }
    await updateCategory(oldName, trimmed, tab);
    setEditingName(null);
    setEditValue('');
  };

  const handleDelete = async (name) => {
    await deleteCategory(name, tab);
  };

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/settings')}>
          <img src={backIcon} alt="" className="back-icon" />
        </button>
        <h2 className="page-title">{t('categoryManagement')}</h2>
      </div>

      <div className="tab-bar">
        <button className={`tab-btn ${tab === 'expense' ? 'active' : ''}`} onClick={() => setTab('expense')}>
          {t('expenses')}
        </button>
        <button className={`tab-btn ${tab === 'income' ? 'active' : ''}`} onClick={() => setTab('income')}>
          {t('income')}
        </button>
      </div>

      <div className="category-add-row">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={t('enterCategoryName')}
          className="category-input"
          maxLength={50}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button className="btn btn-primary btn-sm" onClick={handleAdd}>{t('add')}</button>
      </div>

      <div className="category-list">
        {categories.map((name) => (
          <div key={name} className="category-item">
            {editingName === name ? (
              <div className="category-edit-row">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="category-input"
                  maxLength={50}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdate(name)}
                />
                <button className="btn btn-primary btn-sm" onClick={() => handleUpdate(name)}>
                  {t('update')}
                </button>
                <button className="btn btn-sm" onClick={() => setEditingName(null)}>✕</button>
              </div>
            ) : (
              <>
                <span className="category-name">{translateCategory(name)}</span>
                <div className="category-actions">
                  <button
                    className="btn-icon"
                    onClick={() => { setEditingName(name); setEditValue(translateCategory(name)); }}
                    title={t('edit')}
                  ><img src={editIcon} alt="" className="action-icon" /></button>
                  <button
                    className="btn-icon"
                    onClick={() => handleDelete(name)}
                    title={t('delete')}
                  ><img src={removeIcon} alt="" className="action-icon" /></button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
