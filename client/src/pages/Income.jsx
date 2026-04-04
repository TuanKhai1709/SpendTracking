import { useState, useEffect } from 'react';
import api from '../api';
import TransactionModal from '../components/TransactionModal';

export default function Income() {
  const [incomeList, setIncomeList] = useState([]);
  const [filter, setFilter] = useState('recent');
  const [filterDate, setFilterDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    fetchIncome();
  }, [filter, filterDate]);

  const fetchIncome = async () => {
    try {
      let params = {};
      if (filter === 'day' && filterDate) {
        params = { filter: 'day', date: filterDate };
      } else if (filter === 'month' && filterDate) {
        params = { filter: 'month', date: filterDate };
      }
      const res = await api.get('/income', { params });
      setIncomeList(res.data);
    } catch (err) {
      console.error('Failed to fetch income');
    }
  };

  const handleSave = async (data) => {
    try {
      if (editItem) {
        await api.put(`/income/${editItem.id}`, data);
      } else {
        await api.post('/income', data);
      }
      setShowModal(false);
      setEditItem(null);
      fetchIncome();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this income record?')) {
      try {
        await api.delete(`/income/${id}`);
        setShowModal(false);
        setEditItem(null);
        fetchIncome();
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
      <h2 className="page-title">Income</h2>

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
        {incomeList.length === 0 ? (
          <p className="empty-text">No income records found</p>
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
                <span className="transaction-category">{item.category}</span>
              </div>
              <div className="transaction-right">
                <span className="transaction-amount income">
                  +${item.amount.toFixed(2)}
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
