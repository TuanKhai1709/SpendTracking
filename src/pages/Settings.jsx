import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { useTheme } from '../context/ThemeContext';
import MenuItem from '../components/MenuItem';
import reportIcon from '../../assets/report.png';
import categoryIcon from '../../assets/category.png';
import budgetIcon from '../../assets/budget.png';
import expenseIcon from '../../assets/expense.png';
import darkmodeIcon from '../../assets/darkmode.png';
import passwordIcon from '../../assets/password.png';
import logoutIcon from '../../assets/log-out.png';
import defaultAvatar from '../../assets/avartar.jpg';

export default function Settings() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { t, lang, toggleLang } = useLang();
  const { dark, toggleTheme } = useTheme();

  const avatarSrc = user?.photoURL || defaultAvatar;

  const handleLogout = async () => {
    await logout();
  };

  // Compute subscription display
  const sub = user?.subStatus;
  const subLabel = sub?.active
    ? (sub.daysLeft === Infinity ? 'Vĩnh Viễn' : `${sub.label} · còn ${sub.daysLeft} ngày`)
    : 'Hết hạn';
  const subColor = sub?.active
    ? (sub.daysLeft !== Infinity && sub.daysLeft <= 3 ? '#FC5C65' : '#26DE81')
    : '#FC5C65';

  return (
    <div className="page">
      <div className="settings-list">
        {/* Profile / Account */}
        <button className="menu-item profile-menu-item" onClick={() => navigate('/profile')}>
          <div className="profile-menu-left">
            <img src={avatarSrc} alt="avatar" className="profile-menu-avatar" />
            <div className="profile-menu-info">
              <span className="menu-item-label">{t('profile')}</span>
              <span className="profile-menu-email">{user?.email}</span>
            </div>
          </div>
          <span className="profile-menu-chevron">›</span>
        </button>

        {/* Subscription info row */}
        <button className="menu-item" onClick={() => navigate('/subscription')}>
          <span className="menu-item-label">Thời gian sử dụng</span>
          <span className="menu-item-sub-badge" style={{ color: subColor }}>{subLabel}</span>
        </button>

        {/* Admin links */}
        {user?.isAdmin && (
          <>
            <button className="menu-item menu-item--admin" onClick={() => navigate('/admin/users')}>
              <span className="menu-item-label">👤 Quản lý Người dùng</span>
              <span className="profile-menu-chevron">›</span>
            </button>
            <button className="menu-item menu-item--admin" onClick={() => navigate('/admin/packages')}>
              <span className="menu-item-label">📦 Quản lý Gói dịch vụ</span>
              <span className="profile-menu-chevron">›</span>
            </button>
          </>
        )}

        <MenuItem icon={reportIcon} label={t('report')} onClick={() => navigate('/report')} />
        <MenuItem icon={categoryIcon} label={t('categoryManagement')} onClick={() => navigate('/categories')} />
        <MenuItem icon={budgetIcon} label={t('budgeting')} onClick={() => navigate('/budgets')} />
        <MenuItem icon={expenseIcon} label={t('recurringExpenses')} onClick={() => navigate('/recurring')} />
        <button className="menu-item" onClick={toggleLang}>
          <span className="menu-item-label">{t('language')}</span>
          <span className="menu-item-lang-badge">{lang === 'vi' ? '🇻🇳' : '🇺🇸'}</span>
        </button>
        <button className="menu-item" onClick={toggleTheme}>
          <span className="menu-item-label">{t('darkMode')}</span>
          <div className={`toggle-switch ${dark ? 'on' : ''}`}>
            <div className="toggle-knob" />
          </div>
        </button>
        <MenuItem icon={passwordIcon} label={t('changePassword')} onClick={() => navigate('/change-password')} />
        <MenuItem icon={logoutIcon} label={t('logoutAction')} onClick={handleLogout} />
      </div>
    </div>
  );
}
