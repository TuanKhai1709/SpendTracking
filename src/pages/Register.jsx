import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

export default function Register() {
  const { user, register } = useAuth();
  const { t } = useLang();
  const [username, setUsername] = useState('');
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
      await register(username, email, password);
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use' ? t('emailInUse') :
        err.code === 'auth/weak-password' ? t('weakPassword') :
          err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>SpendTracker</h2>
        <p className="subtitle">{t('createYourAccount')}</p>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('username')}</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder={t('usernamePlaceholder')}
              autoComplete="username"
              maxLength={50}
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
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? t('creatingAccount') : t('createAccount')}
          </button>
        </form>
        <p className="auth-link">
          {t('haveAccount')} <Link to="/login">{t('signIn')}</Link>
        </p>
      </div>
    </div>
  );
}
