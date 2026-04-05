import { useState, useEffect, useRef, useCallback } from 'react';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import TransactionModal, { EXPENSE_CATEGORIES } from '../components/TransactionModal';

export default function Expenses() {
  const { user } = useAuth();
  const { t, lang, formatMoney, translateCategory } = useLang();
  const [expenses, setExpenses] = useState([]);
  const now = new Date();
  const [filterYear, setFilterYear] = useState(String(now.getFullYear()));
  const [filterMonth, setFilterMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'));
  const [filterDay, setFilterDay] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [visibleCount, setVisibleCount] = useState(20);
  const sentinelRef = useRef(null);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(20);
  }, [filterYear, filterMonth, filterDay, filterCategory]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => prev + 20);
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [expenses]);

  useEffect(() => {
    if (user) fetchExpenses();
  }, [user, filterYear, filterMonth, filterDay, filterCategory]);

  const getColRef = () => collection(db, 'users', user.uid, 'expenses');

  const monthNames = lang === 'vi'
    ? ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 7 }, (_, i) => String(currentYear - i));
  const selectedYM = `${filterYear}-${filterMonth}`;
  const daysInMonth = new Date(Number(filterYear), Number(filterMonth), 0).getDate();
  const dayOptions = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0'));

  const fetchExpenses = async () => {
    try {
      const q = query(getColRef(), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Filter by month
      items = items.filter((e) => e.date.slice(0, 7) === selectedYM);
      // Then filter by specific day if selected
      if (filterDay) {
        items = items.filter((e) => e.date === `${selectedYM}-${filterDay}`);
      }
      if (filterCategory) {
        items = items.filter((e) => e.category === filterCategory);
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
          <label className="filter-label">{t('year')}</label>
          <select value={filterYear} onChange={(e) => { setFilterYear(e.target.value); setFilterDay(''); }} className="filter-select">
            {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">{t('month')}</label>
          <select value={filterMonth} onChange={(e) => { setFilterMonth(e.target.value); setFilterDay(''); }} className="filter-select">
            {monthNames.map((name, i) => {
              const val = String(i + 1).padStart(2, '0');
              return <option key={val} value={val}>{name}</option>;
            })}
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">{t('day')}</label>
          <select value={filterDay} onChange={(e) => setFilterDay(e.target.value)} className="filter-select">
            <option value="">{t('allDays')}</option>
            {dayOptions.map((d) => <option key={d} value={d}>{Number(d)}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">{t('category')}</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">{t('allCategories')}</option>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{translateCategory(c)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="transaction-list">
        {expenses.length === 0 ? (
          <p className="empty-text">{t('noExpensesFound')}</p>
        ) : (
          <>
            {expenses.slice(0, visibleCount).map((exp) => (
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
            ))}
            {visibleCount < expenses.length && (
              <div ref={sentinelRef} className="scroll-sentinel" />
            )}
          </>
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
