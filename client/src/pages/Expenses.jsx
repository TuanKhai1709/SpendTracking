import { useState, useEffect } from 'react';
import api from '../api';
import TransactionModal from '../components/TransactionModal';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [filter, setFilter] = useState('recent');
  const [filterDate, setFilterDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, [filter, filterDate]);

  const fetchExpenses = async () => {
    try {
      let params = {};
      if (filter === 'day' && filterDate) {
        params = { filter: 'day', date: filterDate };
      } else if (filter === 'month' && filterDate) {
        params = { filter: 'month', date: filterDate };
      }
      const res = await api.get('/expenses', { params });
      setExpenses(res.data);
    } catch (err) {
      console.error('Failed to fetch expenses');
    }
  };

  const handleSave = async (data) => {
    try {
      if (editItem) {
        await api.put(`/expenses/${editItem.id}`, data);
      } else {
        await api.post('/expenses', data);
      }
      setShowModal(false);
      setEditItem(null);
      fetchExpenses();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this expense?')) {
      try {
        await api.delete(`/expenses/${id}`);
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
