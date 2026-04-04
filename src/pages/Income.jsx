import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import TransactionModal from '../components/TransactionModal';

export default function Income() {
  const { user } = useAuth();
  const { t, formatMoney, translateCategory } = useLang();
  const [incomeList, setIncomeList] = useState([]);
  const [filter, setFilter] = useState('recent');
  const [filterDate, setFilterDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    if (user) fetchIncome();
  }, [user, filter, filterDate]);

  const getColRef = () => collection(db, 'users', user.uid, 'income');

  const fetchIncome = async () => {
    try {
      const q = query(getColRef(), orderBy('date', 'desc'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (filter === 'day' && filterDate) {
        items = items.filter((e) => e.date === filterDate);
      } else if (filter === 'month' && filterDate) {
        items = items.filter((e) => e.date.slice(0, 7) === filterDate);
      } else {
        items = items.slice(0, 5);
      }
      setIncomeList(items);
    } catch (err) {
      console.error('Failed to fetch income');
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

  const handleFilterChange = (value) => {
    setFilter(value);
    if (value === 'recent') {
      setFilterDate('');
    } else if (value === 'day') {
      setFilterDate(new Date().toISOString().split('T')[0]);
    } else if (value === 'month') {
      setFilterDate(new Date().toISOString().slice(0, 7));
    }
  };

  return (
    <div className="page">
      <h2 className="page-title">{t('income')}</h2>

      <div className="filter-bar">
        <select
          value={filter}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="filter-select"
        >
          <option value="recent">{t('recent5')}</option>
          <option value="day">{t('byDay')}</option>
          <option value="month">{t('byMonth')}</option>
        </select>
        {filter === 'day' && (
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="filter-input"
          />
        )}
        {filter === 'month' && (
          <input
            type="month"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="filter-input"
          />
        )}
      </div>

      <div className="transaction-list">
        {incomeList.length === 0 ? (
          <p className="empty-text">{t('noIncomeFound')}</p>
        ) : (
          incomeList.map((item) => (
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
          ))
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
