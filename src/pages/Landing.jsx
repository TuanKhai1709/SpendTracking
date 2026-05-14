import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import bgImage from '../../assets/background.webp';

export default function Landing() {
  const { user, loading } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) return null;

  return (
    <div className="landing-page" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="landing-overlay" />
      <div className="landing-content">
        <h1 className="landing-title">SpendTracker</h1>
        <p className="landing-subtitle">The best app for your plants</p>
        <div className="landing-actions">
          <button
            className="landing-btn-signin"
            onClick={() => navigate('/login')}
          >
            {t('signIn')}
          </button>
          <button
            className="landing-btn-signup"
            onClick={() => navigate('/register')}
          >
            {t('startNewAccount')}
          </button>
        </div>
      </div>
    </div>
  );
}
