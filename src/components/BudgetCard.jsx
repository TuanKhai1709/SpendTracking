import { useEffect } from 'react';
import { useLang } from '../context/LangContext';
import warningIcon from '../../assets/warning.png';

const THRESHOLDS = [75, 90, 100];

export default function BudgetCard({ budget, spent, onAlert }) {
  const { t, lang, formatMoney, translateCategory } = useLang();
  const percent = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0;
  const isWarning = percent >= 75;
  const isDanger = percent >= 90;
  const categoryLabel = budget.category === 'all' ? t('allCategories') : translateCategory(budget.category);
  const vi = lang === 'vi';

  useEffect(() => {
    if (!budget?.id || budget.amount <= 0 || !onAlert) return;

    // Check notif_pref (default ON)
    const pref = localStorage.getItem('notif_pref');
    const prefOn = pref === null ? true : pref === 'true';
    if (!prefOn) return;

    for (const threshold of THRESHOLDS) {
      // Persist alerted state in localStorage so modal only shows once ever
      const storageKey = `budget_alert_${budget.id}_${threshold}`;
      if (percent >= threshold && !localStorage.getItem(storageKey)) {
        localStorage.setItem(storageKey, '1');
        const title = vi
          ? `⚠️ Ngân sách "${categoryLabel}" đạt ${threshold}%`
          : `⚠️ Budget "${categoryLabel}" at ${threshold}%`;
        const message = vi
          ? `Bạn đã chi ${formatMoney(spent)} / ${formatMoney(budget.amount)} (${threshold}%).`
          : `You've spent ${formatMoney(spent)} of ${formatMoney(budget.amount)} (${threshold}%).`;
        onAlert({ title, message });
      }
    }
  }, [percent, budget?.id, lang]);

  return (
    <div className="budget-card">
      <div className="budget-card-header">
        <span className="budget-card-name">
          {categoryLabel}
          {isWarning && (
            <img src={warningIcon} alt="!" style={{ width: 16, height: 16, marginLeft: 6, verticalAlign: 'middle', opacity: 0.9 }} />
          )}
        </span>
        <span className="budget-card-date">{budget.endDate}</span>
      </div>
      <div className="budget-progress-bar">
        <div
          className={`budget-progress-fill ${isDanger ? 'danger' : isWarning ? 'warning' : ''}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="budget-card-footer">
        <span>{formatMoney(spent)} / {formatMoney(budget.amount)}</span>
        <span className={`budget-percent ${isDanger ? 'danger' : isWarning ? 'warning' : ''}`}>
          {percent.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

