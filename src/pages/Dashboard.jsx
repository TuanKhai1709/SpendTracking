import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { useBudget } from '../context/BudgetContext';
import WeekChart from '../components/WeekChart';
import BudgetCard from '../components/BudgetCard';

export default function Dashboard() {
  const { user } = useAuth();
  const { t, formatMoney } = useLang();
  const { budgets } = useBudget();

  const [totalExpense, setTotalExpense] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [budgetSpent, setBudgetSpent] = useState({});

  useEffect(() => {
    if (user) fetchData();
  }, [user, budgets]);

  const fetchData = async () => {
    try {
      const expSnap = await getDocs(collection(db, 'users', user.uid, 'expenses'));
      const incSnap = await getDocs(collection(db, 'users', user.uid, 'income'));

      const allExpenses = [];
      expSnap.forEach((doc) => allExpenses.push(doc.data()));
      const allIncome = [];
      incSnap.forEach((doc) => allIncome.push(doc.data()));

      // Filter for current month only
      const now = new Date();
      const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      let expTotal = 0;
      allExpenses.forEach((d) => {
        if (d.date && d.date.slice(0, 7) === currentYM) {
          expTotal += d.amount;
        }
      });

      let incTotal = 0;
      allIncome.forEach((d) => {
        if (d.date && d.date.slice(0, 7) === currentYM) {
          incTotal += d.amount;
        }
      });

      setTotalExpense(expTotal);
      setTotalIncome(incTotal);

      const spent = {};
      budgets.forEach((b) => {
        const filtered = allExpenses.filter((e) => {
          const inRange = e.date >= b.startDate && e.date <= b.endDate;
          if (b.category === 'all') return inRange;
          return inRange && e.category === b.category;
        });
        spent[b.id] = filtered.reduce((s, e) => s + e.amount, 0);
      });
      setBudgetSpent(spent);
    } catch (err) {
      console.error('Failed to fetch dashboard data');
    }
  };

  const balance = totalIncome - totalExpense;

  return (
    <div className="page">
      <WeekChart />

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

      {budgets.length > 0 && (
        <div className="summary-section">
          <h3>{t('budgets')}</h3>
          <div className="budget-list">
            {budgets.map((b) => (
              <BudgetCard key={b.id} budget={b} spent={budgetSpent[b.id] || 0} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
