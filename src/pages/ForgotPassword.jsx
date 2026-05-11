import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
      // Redirect after 3 seconds
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error('Password reset error:', err);
      // Firebase doesn't confirm if email exists, so we show generic message
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <div className="auth-card-icon">🔐</div>
        </div>
        <h2>{t('resetPassword')}</h2>
        <p className="subtitle">{t('enterEmailToReset')}</p>

        {success && (
          <div className="success-message">
            {t('resetEmailSent')}
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {!success ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{t('email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={t('emailPlaceholder')}
                autoComplete="email"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? t('sending') : t('sendResetEmail')}
            </button>
          </form>
        ) : null}

        <p className="auth-link" style={{ marginTop: success ? '24px' : '16px' }}>
          <Link to="/login">← {t('backToLogin')}</Link>
        </p>
      </div>
    </div>
  );
}
