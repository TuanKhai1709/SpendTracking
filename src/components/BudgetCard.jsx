import { useLang } from '../context/LangContext';

export default function BudgetCard({ budget, spent }) {
  const { t, formatMoney, translateCategory } = useLang();
  const percent = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0;
  const isWarning = percent >= 75;
  const categoryLabel = budget.category === 'all' ? t('allCategories') : translateCategory(budget.category);

  return (
    <div className="budget-card">
      <div className="budget-card-header">
        <span className="budget-card-name">{categoryLabel}</span>
        <span className="budget-card-date">{budget.endDate}</span>
      </div>
      <div className="budget-progress-bar">
        <div
          className={`budget-progress-fill ${isWarning ? 'warning' : ''}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="budget-card-footer">
        <span>{formatMoney(spent)} / {formatMoney(budget.amount)}</span>
        <span className={`budget-percent ${isWarning ? 'warning' : ''}`}>
          {percent.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
