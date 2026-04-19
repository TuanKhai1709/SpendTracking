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
import { useTheme } from '../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function WeekChart() {
  const { user } = useAuth();
  const { t, formatMoney, lang, EXCHANGE_RATE } = useLang();
  const { dark } = useTheme();
  const [chartLabels, setChartLabels] = useState([]);
  const [chartIncomeData, setChartIncomeData] = useState([]);
  const [chartExpenseData, setChartExpenseData] = useState([]);
  const [range, setRange] = useState('7d');

  useEffect(() => {
    if (user) fetchChartData();
  }, [user, range]);

  const fetchChartData = async () => {
    try {
      const expSnap = await getDocs(collection(db, 'users', user.uid, 'expenses'));
      const incSnap = await getDocs(collection(db, 'users', user.uid, 'income'));

      const allExpenses = [];
      expSnap.forEach((doc) => allExpenses.push(doc.data()));
      const allIncome = [];
      incSnap.forEach((doc) => allIncome.push(doc.data()));

      const today = new Date();
      let days = [];

      if (range === 'month') {
        const year = today.getFullYear();
        const month = today.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
          const d = new Date(year, month, i);
          days.push(d.toISOString().split('T')[0]);
        }
      } else {
        const numDays = range === '14d' ? 14 : 7;
        for (let i = numDays - 1; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          days.push(d.toISOString().split('T')[0]);
        }
      }

      const dayNames = lang === 'vi'
        ? ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      const labels = days.map((dateStr) => {
        if (range === 'month') {
          return dateStr.slice(8);
        }
        const d = new Date(dateStr + 'T00:00:00');
        return dayNames[d.getDay()];
      });

      const incData = days.map((dateStr) =>
        allIncome.filter((i) => i.date === dateStr).reduce((s, i) => s + i.amount, 0)
      );
      const expData = days.map((dateStr) =>
        allExpenses.filter((e) => e.date === dateStr).reduce((s, e) => s + e.amount, 0)
      );

      setChartLabels(labels);
      setChartIncomeData(incData);
      setChartExpenseData(expData);
    } catch (err) {
      console.error('Failed to fetch chart data', err);
    }
  };

  const shortMoney = (val) => {
    if (val === 0) return '';
    if (lang === 'vi') {
      const vnd = val * EXCHANGE_RATE;
      if (vnd >= 1000000) return (vnd / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
      if (vnd >= 1000) return (vnd / 1000).toFixed(0) + 'K';
      return vnd.toLocaleString('vi-VN') + '₫';
    }
    if (val >= 1000) return '$' + (val / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return '$' + val.toFixed(0);
  };

  const textColor = dark ? '#E0E0E0' : '#1A1A2E';
  const gridColor = dark ? '#333' : '#F0F2F5';

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
          color: dark ? '#A9A0F0' : '#5B4FCF',
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
          color: dark ? '#E0B830' : '#C49B20',
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
          color: textColor,
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
        color: textColor,
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
          color: textColor,
        },
        grid: { color: gridColor },
      },
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { font: { size: 10 }, color: textColor },
      },
    },
  };

  return (
    <div>
      <div className="chart-range-bar">
        <button className={`chart-range-btn ${range === '7d' ? 'active' : ''}`} onClick={() => setRange('7d')}>
          {t('last7Days')}
        </button>
        <button className={`chart-range-btn ${range === '14d' ? 'active' : ''}`} onClick={() => setRange('14d')}>
          {t('last14Days')}
        </button>
        <button className={`chart-range-btn ${range === 'month' ? 'active' : ''}`} onClick={() => setRange('month')}>
          {t('thisMonth')}
        </button>
      </div>
      <div className="chart-container" style={{ height: '280px' }}>
        {chartLabels.length > 0 ? (
          <Bar data={chartData} options={chartOptions} plugins={[ChartDataLabels]} />
        ) : (
          <p className="empty-text" style={{ textAlign: 'center', paddingTop: '100px' }}>
            {t('noExpensesYet')}
          </p>
        )}
      </div>
    </div>
  );
}
