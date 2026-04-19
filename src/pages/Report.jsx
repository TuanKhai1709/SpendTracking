import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

export default function Report() {
  const { user } = useAuth();
  const { t, formatMoney, translateCategory, lang } = useLang();
  const [mode, setMode] = useState('month');
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'));
  const [expenseSummary, setExpenseSummary] = useState([]);
  const [incomeSummary, setIncomeSummary] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);

  const monthNames = lang === 'vi'
    ? ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 7 }, (_, i) => String(currentYear - i));

  useEffect(() => {
    if (user) fetchReport();
  }, [user, mode, selectedYear, selectedMonth]);

  const fetchReport = async () => {
    try {
      const expSnap = await getDocs(collection(db, 'users', user.uid, 'expenses'));
      const incSnap = await getDocs(collection(db, 'users', user.uid, 'income'));

      const allExpenses = [];
      expSnap.forEach((doc) => allExpenses.push(doc.data()));
      const allIncome = [];
      incSnap.forEach((doc) => allIncome.push(doc.data()));

      const filterFn = mode === 'month'
        ? (d) => d.date.slice(0, 7) === `${selectedYear}-${selectedMonth}`
        : (d) => d.date.slice(0, 4) === selectedYear;

      const filteredExp = allExpenses.filter(filterFn);
      const filteredInc = allIncome.filter(filterFn);

      const expByCategory = {};
      let expTotal = 0;
      filteredExp.forEach((d) => {
        expByCategory[d.category] = (expByCategory[d.category] || 0) + d.amount;
        expTotal += d.amount;
      });

      const incByCategory = {};
      let incTotal = 0;
      filteredInc.forEach((d) => {
        incByCategory[d.category] = (incByCategory[d.category] || 0) + d.amount;
        incTotal += d.amount;
      });

      setExpenseSummary(Object.entries(expByCategory).map(([category, total]) => ({ category, total })));
      setIncomeSummary(Object.entries(incByCategory).map(([category, total]) => ({ category, total })));
      setTotalExpense(expTotal);
      setTotalIncome(incTotal);
    } catch (err) {
      console.error('Failed to fetch report', err);
    }
  };

  const balance = totalIncome - totalExpense;

  return (
    <div className="page">
      <h2 className="page-title">{t('report')}</h2>

      <div className="filter-bar">
        <div className="filter-group">
          <select value={mode} onChange={(e) => setMode(e.target.value)} className="filter-select">
            <option value="month">{t('byMonth')}</option>
            <option value="year">{t('byYear')}</option>
          </select>
        </div>
        <div className="filter-group">
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="filter-select">
            {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        {mode === 'month' && (
          <div className="filter-group">
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="filter-select">
              {monthNames.map((name, i) => {
                const val = String(i + 1).padStart(2, '0');
                return <option key={val} value={val}>{name}</option>;
              })}
            </select>
          </div>
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
