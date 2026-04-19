import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { useCategory } from '../context/CategoryContext';
import TransactionModal from '../components/TransactionModal';

export default function Income() {
  const { user } = useAuth();
  const { t, lang, formatMoney, translateCategory } = useLang();
  const { incomeCategories: INCOME_CATEGORIES } = useCategory();
  const [incomeList, setIncomeList] = useState([]);
  const now = new Date();
  const [filterYear, setFilterYear] = useState(String(now.getFullYear()));
  const [filterMonth, setFilterMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'));
  const [filterDay, setFilterDay] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [visibleCount, setVisibleCount] = useState(20);
  const sentinelRef = useRef(null);

  useEffect(() => {
    setVisibleCount(20);
  }, [filterYear, filterMonth, filterDay, filterCategory]);

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
  }, [incomeList]);

  useEffect(() => {
    if (user) fetchIncome();
  }, [user, filterYear, filterMonth, filterDay, filterCategory]);

  const getColRef = () => collection(db, 'users', user.uid, 'income');

  const monthNames = lang === 'vi'
    ? ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 7 }, (_, i) => String(currentYear - i));
  const selectedYM = `${filterYear}-${filterMonth}`;
  const daysInMonth = new Date(Number(filterYear), Number(filterMonth), 0).getDate();
  const dayOptions = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0'));

  const fetchIncome = async () => {
    try {
      const q = query(getColRef(), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      items = items.filter((e) => e.date.slice(0, 7) === selectedYM);
      if (filterDay) {
        items = items.filter((e) => e.date === `${selectedYM}-${filterDay}`);
      }
      if (filterCategory) {
        items = items.filter((e) => e.category === filterCategory);
      }
      setIncomeList(items);
    } catch (err) {
      console.error('Failed to fetch income', err);
    }
  };

  const handleSave = async (data) => {
    try {
      if (editItem) {
        await updateDoc(doc(db, 'users', user.uid, 'income', editItem.id), {
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
      fetchIncome();
    } catch (err) {
      alert(t('failedToSave'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('deleteIncomeConfirm'))) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'income', id));
        setShowModal(false);
        setEditItem(null);
        fetchIncome();
      } catch (err) {
        alert(t('failedToDelete'));
      }
    }
  };

  return (
    <div className="page">
      <h2 className="page-title">{t('income')}</h2>

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
            {INCOME_CATEGORIES.map((c) => (
              <option key={c} value={c}>{translateCategory(c)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="transaction-list">
        {incomeList.length === 0 ? (
          <p className="empty-text">{t('noIncomeFound')}</p>
        ) : (
          <>
            {incomeList.slice(0, visibleCount).map((item) => (
              <div
                key={item.id}
                className="transaction-card"
                onClick={() => {
                  setEditItem(item);
                  setShowModal(true);
                }}
              >
                <div className="transaction-info">
                  <span className="transaction-title">{item.title}</span>
                  <span className="transaction-category">{translateCategory(item.category)}</span>
                </div>
                <div className="transaction-right">
                  <span className="transaction-amount income">
                    +{formatMoney(item.amount)}
                  </span>
                  <span className="transaction-date">{item.date}</span>
                </div>
              </div>
            ))}
            {visibleCount < incomeList.length && (
              <div ref={sentinelRef} className="scroll-sentinel" />
            )}
          </>
        )}
      </div>

      <button
        className="fab fab-income"
        onClick={() => {
          setEditItem(null);
          setShowModal(true);
        }}
        aria-label="Add income"
      >
        +
      </button>

      {showModal && (
        <TransactionModal
          type="income"
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
