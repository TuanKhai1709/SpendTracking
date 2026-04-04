import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

export default function Login() {
  const { user, login } = useAuth();
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.code === 'auth/invalid-credential' ? t('invalidCredential') : err.message);
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
          <button type="submit" className="btn btn-primary" disabled={loading}>
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
