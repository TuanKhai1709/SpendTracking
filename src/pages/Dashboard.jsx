import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { useBudget } from '../context/BudgetContext';
import { useTransactionCache } from '../context/TransactionCacheContext';
import WeekChart from '../components/WeekChart';
import BudgetCard from '../components/BudgetCard';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, lang, formatMoney, translateCategory } = useLang();
  const { budgets } = useBudget();
  const { getTransactionsForMonth, getTransactionsForRange, formatDate } = useTransactionCache();

  const now = new Date();
  const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [selectedMonth, setSelectedMonth] = useState('');
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [recurringInvest, setRecurringInvest] = useState(0);
  const [budgetSpent, setBudgetSpent] = useState({});

  const activeYM = selectedMonth || currentYM;

  const getPastMonths = () => {
    const opts = [];
    for (let i = 1; i <= 11; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = lang === 'vi'
        ? `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`
        : d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      opts.push({ value: ym, label });
    }
    return opts;
  };

  useEffect(() => {
    if (user) fetchData(activeYM);
  }, [user, budgets, activeYM]);

  const fetchData = async (ym) => {
    try {
      const [allExpenses, allIncome] = await Promise.all([
        getTransactionsForMonth('expense', ym),
        getTransactionsForMonth('income', ym),
      ]);

      let expTotal = 0;
      let riTotal = 0;
      allExpenses.forEach((d) => {
        if (d.date) {
          expTotal += d.amount;
          const catKey = translateCategory(d.category);
          if (catKey === translateCategory('Recurring Investments')) riTotal += d.amount;
        }
      });

      let incTotal = 0;
      allIncome.forEach((d) => {
        if (d.date) {
          incTotal += d.amount;
        }
      });

      setTotalExpense(expTotal);
      setTotalIncome(incTotal);
      setRecurringInvest(riTotal);

      const spentEntries = await Promise.all(budgets.map(async (b) => {
        const endDate = new Date(`${b.endDate}T00:00:00`);
        endDate.setDate(endDate.getDate() + 1);
        const budgetExpenses = await getTransactionsForRange('expense', b.startDate, formatDate(endDate));
        const budgetCatKey = b.category === 'all' ? 'all' : translateCategory(b.category);
        const filtered = budgetExpenses.filter((e) => {
          const inRange = e.date >= b.startDate && e.date <= b.endDate;
          if (b.category === 'all') return inRange;
          return inRange && translateCategory(e.category) === budgetCatKey;
        });
        return [b.id, filtered.reduce((sum, expense) => sum + expense.amount, 0)];
      }));
      setBudgetSpent(Object.fromEntries(spentEntries));
    } catch (err) {
      console.error('Failed to fetch dashboard data');
    }
  };

  const balance = totalIncome - totalExpense;

  return (
    <div className="page">
      {/* Subscription expired / trial warning banner */}
      {user?.subStatus && !user.subStatus.active && (
        <div className="sub-expired-banner">
          <span>⚠️ Tài khoản đã hết hạn.</span>
          <button className="sub-expired-btn" onClick={() => navigate('/subscription')}>
            Gia hạn ngay
          </button>
        </div>
      )}
      {user?.subStatus?.active && user.subStatus.daysLeft !== Infinity && user.subStatus.daysLeft <= 3 && (
        <div className="sub-warning-banner">
          <span>⏳ Còn <strong>{user.subStatus.daysLeft} ngày</strong> sử dụng ({user.subStatus.label}).</span>
          <button className="sub-expired-btn" onClick={() => navigate('/subscription')}>
            Gia hạn
          </button>
        </div>
      )}

      <WeekChart />

      <div className="month-select-bar">
        <select
          className="month-select"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="">{t('current')}</option>
          {getPastMonths().map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="summary-grid">
        <div className="summary-grid-card invest">
          <span className="summary-grid-label">{t('catRecurringInvestments')}</span>
          <span className="summary-grid-value invest">{formatMoney(recurringInvest)}</span>
        </div>
        <div className="summary-grid-card expense">
          <span className="summary-grid-label">{t('totalExpenses')}</span>
          <span className="summary-grid-value expense">-{formatMoney(totalExpense)}</span>
        </div>
        <div className="summary-grid-card income">
          <span className="summary-grid-label">{t('totalIncome')}</span>
          <span className="summary-grid-value income">+{formatMoney(totalIncome)}</span>
        </div>
        <div className={`summary-grid-card balance ${balance >= 0 ? 'positive' : 'negative'}`}>
          <span className="summary-grid-label">{t('totalBalance')}</span>
          <span className={`summary-grid-value ${balance >= 0 ? 'positive' : 'negative'}`}>
            {balance >= 0 ? '+' : '-'}{formatMoney(Math.abs(balance))}
          </span>
        </div>
      </div>

      {budgets.length > 0 ? (
        <div className="summary-section">
          <h3>{t('budgets')}</h3>
          <div className="budget-list">
            {budgets.map((b) => (
              <BudgetCard key={b.id} budget={b} spent={budgetSpent[b.id] || 0} />
            ))}
          </div>
        </div>
      ) : (
        <div className="summary-section">
          <p className="set-budget-cta">
            Đặt hạn mức{' '}
            <span className="set-budget-link" onClick={() => navigate('/budgets')}>ngay</span>.
          </p>
        </div>
      )}
    </div>
  );
}
