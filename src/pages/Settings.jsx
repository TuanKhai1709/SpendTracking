import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { useTheme } from '../context/ThemeContext';
import MenuItem from '../components/MenuItem';
import reportIcon from '../../assets/report.png';
import categoryIcon from '../../assets/category.png';
import budgetIcon from '../../assets/budget.png';
import darkmodeIcon from '../../assets/darkmode.png';
import passwordIcon from '../../assets/password.png';
import logoutIcon from '../../assets/log-out.png';

export default function Settings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t, lang, toggleLang } = useLang();
  const { dark, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="page">
      <div className="settings-list">
        <MenuItem icon={reportIcon} label={t('report')} onClick={() => navigate('/report')} />
        <MenuItem icon={categoryIcon} label={t('categoryManagement')} onClick={() => navigate('/categories')} />
        <MenuItem icon={budgetIcon} label={t('budgeting')} onClick={() => navigate('/budgets')} />
        <button className="menu-item" onClick={toggleLang}>
          <span className="menu-item-label">{t('language')}</span>
          <span className="menu-item-lang-badge">{lang === 'en' ? '🇻🇳' : '🇺🇸'}</span>
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
