import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import TransactionModal from '../components/TransactionModal';

export default function Expenses() {
  const { user } = useAuth();
  const { t, formatMoney, translateCategory } = useLang();
  const [expenses, setExpenses] = useState([]);
  const [filterMonth, setFilterMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [filterDay, setFilterDay] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    if (user) fetchExpenses();
  }, [user, filterMonth, filterDay]);

  const getColRef = () => collection(db, 'users', user.uid, 'expenses');

  const fetchExpenses = async () => {
    try {
      const q = query(getColRef(), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Filter by month first
      if (filterMonth) {
        items = items.filter((e) => e.date.slice(0, 7) === filterMonth);
      }
      // Then filter by specific day if selected
      if (filterDay) {
        items = items.filter((e) => e.date === filterDay);
      }
      setExpenses(items);
    } catch (err) {
      console.error('Failed to fetch expenses', err);
    }
  };

  const handleSave = async (data) => {
    try {
      if (editItem) {
        await updateDoc(doc(db, 'users', user.uid, 'expenses', editItem.id), {
          title: data.title,
          category: data.category,
          amount: data.amount,
          date: data.date,
        });
      } else {
        await addDoc(getColRef(), {
          ...data,
          createdAt: Timestamp.now(),
        });
      }
      setShowModal(false);
      setEditItem(null);
      fetchExpenses();
    } catch (err) {
      alert(t('failedToSave'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('deleteExpenseConfirm'))) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'expenses', id));
        setShowModal(false);
        setEditItem(null);
        fetchExpenses();
      } catch (err) {
        alert(t('failedToDelete'));
      }
    }
  };

  return (
    <div className="page">
      <h2 className="page-title">{t('expenses')}</h2>

      <div className="filter-bar">
        <div className="filter-group">
          <label className="filter-label">{t('month')}</label>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => { setFilterMonth(e.target.value); setFilterDay(''); }}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <label className="filter-label">{t('day')}</label>
          <input
            type="date"
            value={filterDay}
            onChange={(e) => setFilterDay(e.target.value)}
            className="filter-input"
          />
        </div>
      </div>

      <div className="transaction-list">
        {expenses.length === 0 ? (
          <p className="empty-text">{t('noExpensesFound')}</p>
        ) : (
          expenses.map((exp) => (
            <div
              key={exp.id}
              className="transaction-card"
              onClick={() => {
                setEditItem(exp);
                setShowModal(true);
              }}
            >
              <div className="transaction-info">
                <span className="transaction-title">{exp.title}</span>
                <span className="transaction-category">{translateCategory(exp.category)}</span>
              </div>
              <div className="transaction-right">
                <span className="transaction-amount expense">
                  -{formatMoney(exp.amount)}
                </span>
                <span className="transaction-date">{exp.date}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        className="fab"
        onClick={() => {
          setEditItem(null);
          setShowModal(true);
        }}
        aria-label="Add expense"
      >
        +
      </button>

      {showModal && (
        <TransactionModal
          type="expense"
          transaction={editItem}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditItem(null);
          }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
