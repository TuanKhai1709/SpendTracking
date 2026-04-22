import { useState, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

// Generate a simple math captcha
function generateCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { question: `${a} + ${b} = ?`, answer: a + b };
}

export default function Login() {
  const { user, login } = useAuth();
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [captcha, setCaptcha] = useState(() => generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [lockedUntil, setLockedUntil] = useState(null);

  const needsCaptcha = failedAttempts >= 3;
  const isLocked = lockedUntil && Date.now() < lockedUntil;

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha());
    setCaptchaInput('');
    setCaptchaError('');
  }, []);

  if (user) return <Navigate to="/" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCaptchaError('');

    if (isLocked) {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      setError(t('accountLocked').replace('{s}', remaining));
      return;
    }

    if (needsCaptcha) {
      if (parseInt(captchaInput, 10) !== captcha.answer) {
        setCaptchaError(t('captchaError'));
        refreshCaptcha();
        return;
      }
    }

    setLoading(true);
    try {
      await login(email, password);
      setFailedAttempts(0);
    } catch (err) {
      const newCount = failedAttempts + 1;
      setFailedAttempts(newCount);
      refreshCaptcha();
      if (newCount >= 5) {
        setLockedUntil(Date.now() + 60 * 1000);
        setError(t('tooManyAttempts'));
      } else {
        setError(err.code === 'auth/invalid-credential' ? t('invalidCredential') : err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>SpendTracker</h2>
        <p className="subtitle">{t('signInTitle')}</p>
        {error && <div className="error-message">{error}</div>}
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
          <div className="form-group">
            <label>{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={t('passwordPlaceholder')}
              autoComplete="current-password"
            />
          </div>
          {needsCaptcha && (
            <div className="form-group captcha-group">
              <label>{t('captchaLabel')}</label>
              <div className="captcha-row">
                <div className="captcha-question">{captcha.question}</div>
                <input
                  type="number"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  required
                  placeholder="?"
                  className="captcha-input"
                />
                <button type="button" className="captcha-refresh" onClick={refreshCaptcha} title={t('refreshCaptcha')}>↺</button>
              </div>
              {captchaError && <span className="captcha-error">{captchaError}</span>}
              <p className="captcha-hint">{t('captchaHint').replace('{n}', failedAttempts)}</p>
            </div>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading || isLocked}>
            {loading ? t('signingIn') : t('signIn')}
          </button>
        </form>
        <p className="auth-link">
          {t('noAccount')} <Link to="/register">{t('register')}</Link>
        </p>
      </div>
    </div>
  );
}
