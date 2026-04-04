import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import TransactionModal from '../components/TransactionModal';

export default function Expenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [filter, setFilter] = useState('recent');
  const [filterDate, setFilterDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    if (user) fetchExpenses();
  }, [user, filter, filterDate]);

  const getColRef = () => collection(db, 'users', user.uid, 'expenses');

  const fetchExpenses = async () => {
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
      setExpenses(items);
    } catch (err) {
      console.error('Failed to fetch expenses');
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
      alert('Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this expense?')) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'expenses', id));
        setShowModal(false);
        setEditItem(null);
        fetchExpenses();
      } catch (err) {
        alert('Failed to delete');
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
      <h2 className="page-title">Expenses</h2>

      <div className="filter-bar">
        <select
          value={filter}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="filter-select"
        >
          <option value="recent">Recent (5)</option>
          <option value="day">By Day</option>
          <option value="month">By Month</option>
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
        {expenses.length === 0 ? (
          <p className="empty-text">No expenses found</p>
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
                <span className="transaction-category">{exp.category}</span>
              </div>
              <div className="transaction-right">
                <span className="transaction-amount expense">
                  -${exp.amount.toFixed(2)}
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
