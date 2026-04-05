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
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const { user } = useAuth();
  const { t, formatMoney, translateCategory, lang, currencySymbol, fromUSD, EXCHANGE_RATE } = useLang();
  const [expenseSummary, setExpenseSummary] = useState([]);
  const [incomeSummary, setIncomeSummary] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [chartLabels, setChartLabels] = useState([]);
  const [chartIncomeData, setChartIncomeData] = useState([]);
  const [chartExpenseData, setChartExpenseData] = useState([]);
  const [period, setPeriod] = useState('day');
  const [periodValue, setPeriodValue] = useState(() => new Date().toISOString().slice(0, 7));

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    const now = new Date();
    if (newPeriod === 'day') {
      setPeriodValue(now.toISOString().slice(0, 7)); // select a month to see daily breakdown
    } else if (newPeriod === 'month') {
      setPeriodValue(String(now.getFullYear())); // select a year to see monthly breakdown
    } else if (newPeriod === 'year') {
      setPeriodValue('all');
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user, period, periodValue]);

  const fetchData = async () => {
    try {
      const expSnap = await getDocs(collection(db, 'users', user.uid, 'expenses'));
      const incSnap = await getDocs(collection(db, 'users', user.uid, 'income'));

      const allExpenses = [];
      expSnap.forEach((doc) => allExpenses.push(doc.data()));
      const allIncome = [];
      incSnap.forEach((doc) => allIncome.push(doc.data()));

      // Generate time buckets based on period
      let buckets = [];
      let getBucket;
      let filterItem;

      if (period === 'day') {
        // Show each day of the selected month
        const [y, m] = periodValue.split('-').map(Number);
        const daysInMonth = new Date(y, m, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
          const key = `${periodValue}-${String(d).padStart(2, '0')}`;
          buckets.push({ key, label: String(d) });
        }
        getBucket = (dateStr) => dateStr;
        filterItem = (d) => d.date.slice(0, 7) === periodValue;
      } else if (period === 'month') {
        // Show 12 months of the selected year
        const monthNames = lang === 'vi'
          ? ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']
          : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (let m = 1; m <= 12; m++) {
          const key = `${periodValue}-${String(m).padStart(2, '0')}`;
          buckets.push({ key, label: monthNames[m - 1] });
        }
        getBucket = (dateStr) => dateStr.slice(0, 7);
        filterItem = (d) => d.date.slice(0, 4) === periodValue;
      } else {
        // Year: show last 7 years
        const curYear = new Date().getFullYear();
        for (let y = curYear - 6; y <= curYear; y++) {
          buckets.push({ key: String(y), label: String(y) });
        }
        getBucket = (dateStr) => dateStr.slice(0, 4);
        filterItem = () => true;
      }

      // Aggregate into buckets
      const expBuckets = {};
      const incBuckets = {};
      buckets.forEach((b) => { expBuckets[b.key] = 0; incBuckets[b.key] = 0; });

      const expByCategory = {};
      let expTotal = 0;
      allExpenses.filter(filterItem).forEach((d) => {
        const bk = getBucket(d.date);
        if (expBuckets[bk] !== undefined) expBuckets[bk] += d.amount;
        expByCategory[d.category] = (expByCategory[d.category] || 0) + d.amount;
        expTotal += d.amount;
      });

      const incByCategory = {};
      let incTotal = 0;
      allIncome.filter(filterItem).forEach((d) => {
        const bk = getBucket(d.date);
        if (incBuckets[bk] !== undefined) incBuckets[bk] += d.amount;
        incByCategory[d.category] = (incByCategory[d.category] || 0) + d.amount;
        incTotal += d.amount;
      });

      setChartLabels(buckets.map((b) => b.label));
      setChartIncomeData(buckets.map((b) => incBuckets[b.key]));
      setChartExpenseData(buckets.map((b) => expBuckets[b.key]));
      setExpenseSummary(Object.entries(expByCategory).map(([category, total]) => ({ category, total })));
      setIncomeSummary(Object.entries(incByCategory).map(([category, total]) => ({ category, total })));
      setTotalExpense(expTotal);
      setTotalIncome(incTotal);
    } catch (err) {
      console.error('Failed to fetch dashboard data');
    }
  };

  const balance = totalIncome - totalExpense;

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 7 }, (_, i) => String(currentYear - i));

  const shortMoney = (val) => {
    if (val === 0) return '';
    if (lang === 'vi') {
      const vnd = val * EXCHANGE_RATE;
      if (vnd >= 1000000) return (vnd / 1000000).toFixed(1).replace(/\.0$/, '') + 'M₫';
      if (vnd >= 1000) return (vnd / 1000).toFixed(0) + 'K₫';
      return vnd.toLocaleString('vi-VN') + '₫';
    }
    if (val >= 1000) return '$' + (val / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return '$' + val.toFixed(0);
  };

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: t('income'),
        data: chartIncomeData,
        backgroundColor: '#7B68EE',
        borderRadius: { topLeft: 4, topRight: 4 },
        barPercentage: 0.7,
        categoryPercentage: 0.8,
        datalabels: {
          anchor: 'end',
          align: 'top',
          color: '#5B4FCF',
          font: { size: 9, weight: '600' },
          formatter: (v) => shortMoney(v),
        },
      },
      {
        label: t('expenses'),
        data: chartExpenseData.map((v) => -v),
        backgroundColor: '#F5C542',
        borderRadius: { bottomLeft: 4, bottomRight: 4 },
        barPercentage: 0.7,
        categoryPercentage: 0.8,
        datalabels: {
          anchor: 'end',
          align: 'bottom',
          color: '#C49B20',
          font: { size: 9, weight: '600' },
          formatter: (v) => shortMoney(Math.abs(v)),
        },
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 16,
          font: { size: 12 },
          generateLabels: (chart) => {
            const ds = chart.data.datasets;
            return ds.map((d, i) => ({
              text: d.label,
              fillStyle: d.backgroundColor,
              strokeStyle: d.backgroundColor,
              hidden: !chart.isDatasetVisible(i),
              datasetIndex: i,
              pointStyle: 'rectRounded',
            }));
          },
        },
      },
      title: {
        display: true,
        text: t('incomeVsExpenses'),
        font: { size: 15, weight: '600' },
        color: '#1A1A2E',
        padding: { bottom: 12 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const val = Math.abs(ctx.raw);
            return `${ctx.dataset.label}: ${formatMoney(val)}`;
          },
        },
      },
    },
    scales: {
      y: {
        stacked: true,
        ticks: {
          callback: (v) => shortMoney(Math.abs(v)),
          font: { size: 10 },
        },
        grid: { color: '#F0F2F5' },
      },
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { font: { size: 10 } },
      },
    },
  };

  return (
    <div className="page">
      <h2 className="page-title">{t('dashboard')}</h2>

      <div className="filter-bar">
        <select
          value={period}
          onChange={(e) => handlePeriodChange(e.target.value)}
          className="filter-select"
        >
          <option value="day">{t('byDay')}</option>
          <option value="month">{t('byMonth')}</option>
          <option value="year">{t('byYear')}</option>
        </select>
        {period === 'day' && (
          <input
            type="month"
            value={periodValue}
            onChange={(e) => setPeriodValue(e.target.value)}
            className="filter-input"
          />
        )}
        {period === 'month' && (
          <select
            value={periodValue}
            onChange={(e) => setPeriodValue(e.target.value)}
            className="filter-select"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        )}
      </div>

      <div className="chart-container" style={{ height: '360px' }}>
        {chartLabels.length > 0 ? (
          <Bar data={chartData} options={chartOptions} plugins={[ChartDataLabels]} />
        ) : (
          <p className="empty-text" style={{ textAlign: 'center', paddingTop: '120px' }}>{t('noExpensesYet')}</p>
        )}
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
