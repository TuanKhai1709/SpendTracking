import { useState, useEffect } from 'react';
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

  // Notification: use localStorage pref (default true) + browser permission
  const getNotifPref = () => {
    const stored = localStorage.getItem('notif_pref');
    return stored === null ? true : stored === 'true'; // default ON
  };

  const [notifOn, setNotifOn] = useState(getNotifPref);
  const [notifPermission, setNotifPermission] = useState(
    'Notification' in window ? Notification.permission : 'unsupported'
  );

  // On mount: if pref is ON and permission is 'default', auto-request (needs page load, not gesture here)
  // We'll request on toggle click instead (user gesture required)
  useEffect(() => {
    if (!('Notification' in window)) return;
    setNotifPermission(Notification.permission);
  }, []);

  const handleNotifToggle = async () => {
    if (!('Notification' in window)) return;

    if (notifOn) {
      // Turn OFF: just set pref false (can't revoke browser permission)
      localStorage.setItem('notif_pref', 'false');
      setNotifOn(false);
      return;
    }

    // Turn ON
    if (notifPermission === 'denied') {
      alert(lang === 'vi'
        ? 'Thông báo đã bị chặn bởi trình duyệt. Vào Cài đặt trình duyệt → Thông báo → cho phép trang này, rồi thử lại.'
        : 'Notifications are blocked by the browser. Go to browser Settings → Notifications → allow this site, then try again.');
      return;
    }
    if (notifPermission !== 'granted') {
      const result = await Notification.requestPermission();
      setNotifPermission(result);
      if (result !== 'granted') return; // user denied
    }
    localStorage.setItem('notif_pref', 'true');
    setNotifOn(true);
  };

  // Toggle is visually ON when pref=true AND browser hasn't denied
  const toggleIsOn = notifOn && notifPermission !== 'denied';

  const handleLogout = async () => {
    await logout();
  };

  // Compute subscription display (language-aware)
  const sub = user?.subStatus;

  const getPlanLabel = () => {
    if (!sub) return lang === 'vi' ? 'Hết hạn' : 'Expired';
    const { planKey, daysLeft, label } = sub;
    if (!sub.active) return lang === 'vi' ? 'Hết hạn' : 'Expired';
    if (planKey === 'lifetime') return lang === 'vi' ? 'Vĩnh Viễn' : 'Lifetime';
    if (planKey === 'trial') {
      const base = lang === 'vi' ? 'Dùng thử' : 'Trial';
      const days = lang === 'vi' ? `còn ${daysLeft} ngày` : `${daysLeft} days left`;
      return `${base} · ${days}`;
    }
    // paid plan — label is the plan name (stored in vi)
    const days = lang === 'vi' ? `còn ${daysLeft} ngày` : `${daysLeft} days left`;
    return `${label} · ${days}`;
  };

  const subLabel = getPlanLabel();
  const subColor = sub?.active
    ? (sub.daysLeft !== Infinity && sub.daysLeft <= 3 ? '#FC5C65' : '#26DE81')
    : '#FC5C65';

  const usageLabel = lang === 'vi' ? 'Thời gian sử dụng' : 'Subscription';

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
          <span className="menu-item-label">{usageLabel}</span>
          <span className="menu-item-sub-badge" style={{ color: subColor }}>{subLabel}</span>
        </button>

        {/* Admin links */}
        {user?.isAdmin && (
          <>
            <button className="menu-item menu-item--admin" onClick={() => navigate('/admin/users')}>
              <span className="menu-item-label">{lang === 'vi' ? 'Quản lý Người dùng' : 'User Management'}</span>
              <span className="profile-menu-chevron">›</span>
            </button>
            <button className="menu-item menu-item--admin" onClick={() => navigate('/admin/packages')}>
              <span className="menu-item-label">{lang === 'vi' ? 'Quản lý Gói dịch vụ' : 'Package Management'}</span>
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

        {/* Notification permission */}
        <div className="menu-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <span className="menu-item-label">
              {lang === 'vi' ? 'Quyền thông báo' : 'Notification Permission'}
            </span>
            <div
              className={`toggle-switch ${toggleIsOn ? 'on' : ''}`}
              onClick={handleNotifToggle}
              style={{ cursor: 'pointer', flexShrink: 0 }}
            >
              <div className="toggle-knob" />
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {lang === 'vi'
              ? 'Khi tắt, bạn sẽ không nhận được cảnh báo khi chi tiêu vượt ngưỡng ngân sách.'
              : "When off, you won't receive alerts when spending exceeds your budget threshold."}
          </span>
        </div>
        <MenuItem icon={passwordIcon} label={t('changePassword')} onClick={() => navigate('/change-password')} />
        <MenuItem icon={logoutIcon} label={t('logoutAction')} onClick={handleLogout} />
      </div>
    </div>
  );
}
