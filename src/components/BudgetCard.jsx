import { useEffect, useRef } from 'react';
import { useLang } from '../context/LangContext';

// Ask for notification permission once (no-op if already granted/denied)
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

// Fire a push notification — silently fails if permission not granted
function fireNotification(title, body, tag) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, { body, tag, icon: '/SpendTracking/favicon.ico' });
    } catch (_) {}
  }
}

const NOTIFIED_KEY = 'budget_notified'; // localStorage key (Set of "budgetId:threshold")

function getNotified() {
  try { return new Set(JSON.parse(localStorage.getItem(NOTIFIED_KEY) || '[]')); }
  catch { return new Set(); }
}
function markNotified(key) {
  const s = getNotified();
  s.add(key);
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify([...s]));
}

const THRESHOLDS = [75, 90, 100]; // % levels to notify at

export default function BudgetCard({ budget, spent }) {
  const { t, lang, formatMoney, translateCategory } = useLang();
  const percent = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0;
  const isWarning = percent >= 75;
  const isDanger = percent >= 90;
  const categoryLabel = budget.category === 'all' ? t('allCategories') : translateCategory(budget.category);
  const vi = lang === 'vi';

  // Request permission on first render
  const permRequested = useRef(false);
  useEffect(() => {
    if (!permRequested.current) {
      requestNotificationPermission();
      permRequested.current = true;
    }
  }, []);

  // Fire notifications at thresholds
  useEffect(() => {
    if (!budget?.id || budget.amount <= 0) return;

    const notified = getNotified();

    for (const threshold of THRESHOLDS) {
      if (percent >= threshold) {
        const key = `${budget.id}:${threshold}`;
        if (!notified.has(key)) {
          const title = vi
            ? `⚠️ Ngân sách ${categoryLabel} đạt ${threshold}%`
            : `⚠️ Budget "${categoryLabel}" at ${threshold}%`;
          const body = vi
            ? `Đã chi ${formatMoney(spent)} / ${formatMoney(budget.amount)}`
            : `Spent ${formatMoney(spent)} of ${formatMoney(budget.amount)}`;
          fireNotification(title, body, key);
          markNotified(key);
        }
      }
    }
  }, [percent, budget?.id]);

  return (
    <div className="budget-card">
      <div className="budget-card-header">
        <span className="budget-card-name">{categoryLabel}</span>
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
