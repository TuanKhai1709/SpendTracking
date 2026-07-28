import { useState, useCallback, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

// Generate a simple math captcha
function generateCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { question: `${a} + ${b} = ?`, answer: a + b };
}

export default function Login() {
  const { user, login, loginWithGoogle } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const [email, setEmail] = useState(() => localStorage.getItem('rememberMe_email') || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem('rememberMe_email'));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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

  // Countdown timer for account lock
  useEffect(() => {
    if (!isLocked) return;
    const interval = setInterval(() => {
      if (Date.now() >= lockedUntil) {
        setLockedUntil(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil, isLocked]);

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
      await login(email, password, rememberMe);
      setFailedAttempts(0);
      navigate('/');
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

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result) {
        // Popup succeeded — navigate into app
        navigate('/');
      }
      // If result is null → redirect flow started, page will navigate away automatically
    } catch (err) {
      console.error('Google login error:', err);
      const msg = err.code === 'auth/unauthorized-domain'
        ? 'This domain is not authorized in Firebase. Please contact support.'
        : (err.message || 'Failed to sign in with Google');
      setError(msg);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <button className="auth-card-back" onClick={() => navigate('/welcome')} aria-label="Back">←</button>
        <div className="auth-card-header">
          <div className="auth-card-icon">💰</div>
        </div>
        <h2>{t('appName') || 'SpendTracking'}</h2>
        <p className="tagline">{t('tagline')}</p>

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

          <div className="forgot-password-link">
            <Link to="/forgot-password">{t('forgotPassword')}</Link>
          </div>

          <div className="form-group-checkbox">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe">{t('rememberMe')}</label>
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

        <div className="auth-divider">
          <span className="auth-divider-text">{t('continueWith')}</span>
        </div>

        <button
          type="button"
          className="btn-google"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {googleLoading ? t('signingIn') : t('googleSignIn')}
        </button>

        <p className="auth-link">
          {t('noAccount')} <Link to="/register">{t('signUp')}</Link>
        </p>
      </div>
    </div>
  );
}
