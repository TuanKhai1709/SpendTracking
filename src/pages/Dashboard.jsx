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
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const { user } = useAuth();
  const { t, formatMoney, translateCategory, lang, currencySymbol } = useLang();
  const [expenseSummary, setExpenseSummary] = useState([]);
  const [incomeSummary, setIncomeSummary] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const expSnap = await getDocs(collection(db, 'users', user.uid, 'expenses'));
      const incSnap = await getDocs(collection(db, 'users', user.uid, 'income'));

      const expByCategory = {};
      let expTotal = 0;
      expSnap.forEach((doc) => {
        const d = doc.data();
        expByCategory[d.category] = (expByCategory[d.category] || 0) + d.amount;
        expTotal += d.amount;
      });

      const incByCategory = {};
      let incTotal = 0;
      incSnap.forEach((doc) => {
        const d = doc.data();
        incByCategory[d.category] = (incByCategory[d.category] || 0) + d.amount;
        incTotal += d.amount;
      });

      setExpenseSummary(Object.entries(expByCategory).map(([category, total]) => ({ category, total })));
      setIncomeSummary(Object.entries(incByCategory).map(([category, total]) => ({ category, total })));
      setTotalExpense(expTotal);
      setTotalIncome(incTotal);
    } catch (err) {
      console.error('Failed to fetch dashboard data');
    }
  };

  const balance = totalIncome - totalExpense;

  const chartData = {
    labels: [t('income'), t('expenses')],
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
        text: t('incomeVsExpenses'),
        font: { size: 16, weight: '600' },
        color: '#1A1A2E',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (v) => formatMoney(v) },
        grid: { color: '#F0F2F5' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <div className="page">
      <h2 className="page-title">{t('dashboard')}</h2>

      <div className="chart-container">
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div
        className="balance-card"
        style={{
          background: balance >= 0 ? 'var(--success-light)' : 'var(--danger-light)',
        }}
      >
        <span className="balance-label">{t('totalBalance')}</span>
        <span className={`balance-amount ${balance >= 0 ? 'positive' : 'negative'}`}>
          {balance >= 0 ? '+' : '-'}{formatMoney(Math.abs(balance))}
        </span>
      </div>

      <div className="summary-section">
        <h3>{t('expenseCategories')}</h3>
        {expenseSummary.length === 0 ? (
          <p className="empty-text">{t('noExpensesYet')}</p>
        ) : (
          <div className="summary-list">
            {expenseSummary.map((item) => (
              <div key={item.category} className="summary-item">
                <span>{translateCategory(item.category)}</span>
                <span className="amount expense">-{formatMoney(item.total)}</span>
              </div>
            ))}
            <div className="summary-item total">
              <span>{t('totalExpenses')}</span>
              <span className="amount expense">-{formatMoney(totalExpense)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="summary-section">
        <h3>{t('incomeCategories')}</h3>
        {incomeSummary.length === 0 ? (
          <p className="empty-text">{t('noIncomeYet')}</p>
        ) : (
          <div className="summary-list">
            {incomeSummary.map((item) => (
              <div key={item.category} className="summary-item">
                <span>{translateCategory(item.category)}</span>
                <span className="amount income">+{formatMoney(item.total)}</span>
              </div>
            ))}
            <div className="summary-item total">
              <span>{t('totalIncome')}</span>
              <span className="amount income">+{formatMoney(totalIncome)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
