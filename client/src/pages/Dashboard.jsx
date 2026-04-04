import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import api from '../api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [expenseSummary, setExpenseSummary] = useState([]);
  const [incomeSummary, setIncomeSummary] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [expRes, incRes] = await Promise.all([
        api.get('/expenses/summary'),
        api.get('/income/summary'),
      ]);
      setExpenseSummary(expRes.data);
      setIncomeSummary(incRes.data);
      setTotalExpense(expRes.data.reduce((sum, e) => sum + e.total, 0));
      setTotalIncome(incRes.data.reduce((sum, i) => sum + i.total, 0));
    } catch (err) {
      console.error('Failed to fetch dashboard data');
    }
  };

  const balance = totalIncome - totalExpense;

  const chartData = {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        data: [totalIncome, totalExpense],
        backgroundColor: ['#26DE81', '#FC5C65'],
        borderRadius: 8,
        barThickness: 60,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Income vs Expenses',
        font: { size: 16, weight: '600' },
        color: '#1A1A2E',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (v) => '$' + v.toLocaleString() },
        grid: { color: '#F0F2F5' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <div className="page">
      <h2 className="page-title">Dashboard</h2>

      <div className="chart-container">
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div
        className="balance-card"
        style={{
          background: balance >= 0 ? 'var(--success-light)' : 'var(--danger-light)',
        }}
      >
        <span className="balance-label">Total Balance</span>
        <span className={`balance-amount ${balance >= 0 ? 'positive' : 'negative'}`}>
          {balance >= 0 ? '+' : ''}${Math.abs(balance).toFixed(2)}
        </span>
      </div>

      <div className="summary-section">
        <h3>Expense Categories</h3>
        {expenseSummary.length === 0 ? (
          <p className="empty-text">No expenses yet</p>
        ) : (
          <div className="summary-list">
            {expenseSummary.map((item) => (
              <div key={item.category} className="summary-item">
                <span>{item.category}</span>
                <span className="amount expense">-${item.total.toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-item total">
              <span>Total Expenses</span>
              <span className="amount expense">-${totalExpense.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="summary-section">
        <h3>Income Categories</h3>
        {incomeSummary.length === 0 ? (
          <p className="empty-text">No income yet</p>
        ) : (
          <div className="summary-list">
            {incomeSummary.map((item) => (
              <div key={item.category} className="summary-item">
                <span>{item.category}</span>
                <span className="amount income">+${item.total.toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-item total">
              <span>Total Income</span>
              <span className="amount income">+${totalIncome.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
