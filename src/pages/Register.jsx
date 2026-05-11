import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

export default function Register() {
  const { user, register, loginWithGoogle } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailVerificationShown, setEmailVerificationShown] = useState(false);

  if (user && !emailVerificationShown) return <Navigate to="/" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError(t('weakPassword'));
      return;
    }

    setLoading(true);
    try {
      await register(fullName, email, password);
      setSuccess(t('accountCreatedSuccess'));
      setEmailVerificationShown(true);
      // Redirect after 2 seconds
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use' ? t('emailInUse') :
        err.code === 'auth/weak-password' ? t('weakPassword') :
          err.code === 'auth/invalid-email' ? t('invalidEmail') :
            err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      console.error('Google signup error:', err);
      setError(err.message || 'Failed to sign up with Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <button className="auth-card-back" onClick={() => navigate('/login')} aria-label="Back">←</button>
        <div className="auth-card-header">
          <div className="auth-card-icon">✨</div>
        </div>
        <h2>{t('appName') || 'SpendTracker'}</h2>
        <p className="subtitle">{t('createYourAccount')}</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('fullName')}</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder={t('enterFullName')}
              autoComplete="name"
              maxLength={100}
            />
          </div>

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
              minLength={6}
              placeholder={t('passwordMinPlaceholder')}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label>{t('registerConfirmPassword')}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              placeholder={t('passwordMinPlaceholder')}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? t('creatingAccount') : t('createAccount')}
          </button>
        </form>

        <div className="auth-divider">
          <span className="auth-divider-text">{t('continueWith')}</span>
        </div>

        <button
          type="button"
          className="btn-google"
          onClick={handleGoogleSignUp}
          disabled={googleLoading}
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {googleLoading ? t('creatingAccount') : t('googleSignIn')}
        </button>

        <p className="auth-link">
          {t('alreadyHaveAccount')} <Link to="/login">{t('signIn')}</Link>
        </p>
      </div>
    </div>
  );
}
