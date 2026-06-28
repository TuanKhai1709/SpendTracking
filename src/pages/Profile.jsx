import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import backIcon from '../../assets/back.png';
import defaultAvatar from '../../assets/avartar.jpg';

export default function Profile() {
  const navigate = useNavigate();
  const { user, sessionPassword } = useAuth();
  const { t, lang } = useLang();
  const [showPassword, setShowPassword] = useState(false);

  const avatarSrc = user?.photoURL || defaultAvatar;

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const locale = lang === 'vi' ? 'vi-VN' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/settings')}>
          <img src={backIcon} alt="" className="back-icon" />
        </button>
        <h2 className="page-title">{t('profile')}</h2>
      </div>

      <div className="profile-avatar-section">
        <img src={avatarSrc} alt="avatar" className="profile-avatar-lg" />
      </div>

      <div className="settings-list profile-info-card">
        <div className="profile-field-row">
          <span className="profile-field-label">{t('username')}</span>
          <div className="profile-name-wrap">
            <span className="profile-field-value">{user?.displayName || '—'}</span>
            {user?.isAdmin && <span className="profile-admin-badge">{t('adminRole')}</span>}
          </div>
        </div>

        <div className="profile-field-row">
          <span className="profile-field-label">{t('email')}</span>
          <span className="profile-field-value profile-field-value--email">{user?.email}</span>
        </div>

        <div className="profile-field-row">
          <span className="profile-field-label">{t('password')}</span>
          {user?.isGoogleUser ? (
            <span className="profile-google-badge">{t('googleAccount')}</span>
          ) : (
            <div className="profile-password-wrap">
              <span className="profile-password-text">
                {showPassword
                  ? (sessionPassword || '••••••••')
                  : (sessionPassword ? '•'.repeat(sessionPassword.length) : '••••••••')}
              </span>
              <button
                className="profile-show-btn"
                onClick={() => setShowPassword((s) => !s)}
              >
                {showPassword ? t('hidePassword') : t('showPassword')}
              </button>
            </div>
          )}
        </div>

        <div className="profile-field-row profile-field-row--last">
          <span className="profile-field-label">{t('accountCreated')}</span>
          <span className="profile-field-value">{formatDate(user?.creationTime)}</span>
        </div>
      </div>

      {/* Subscription block */}
      <div className="settings-list profile-info-card" style={{ marginTop: 12 }}>
        <div className="profile-field-row">
          <span className="profile-field-label">Gói đang dùng</span>
          <span className="profile-field-value">
            {user?.subscription?.planName || 'Dùng thử'}
          </span>
        </div>
        <div className="profile-field-row profile-field-row--last">
          <span className="profile-field-label">Thời gian còn lại</span>
          <span
            className="profile-field-value"
            style={{
              color: user?.subStatus?.active
                ? (user.subStatus.daysLeft !== Infinity && user.subStatus.daysLeft <= 3 ? '#FC5C65' : '#26DE81')
                : '#FC5C65',
              fontWeight: 600,
            }}
          >
            {user?.subStatus?.active
              ? (user.subStatus.daysLeft === Infinity ? 'Vĩnh viễn' : `${user.subStatus.daysLeft} ngày`)
              : 'Hết hạn'}
          </span>
        </div>
      </div>
    </div>
  );
}
