import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import bgImage from '../../assets/background.webp';

export default function Landing() {
  const { user, loading } = useAuth();
  const { t, lang, toggleLang } = useLang();
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
        <p className="landing-subtitle">{t('tagline')}</p>

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

        {/* Language switcher */}
        <div className="landing-lang">
          <span className="landing-lang-label">{t('landingChooseLang')}</span>
          <div className="landing-lang-btns">
            <button
              className={`landing-lang-btn ${lang === 'en' ? 'landing-lang-btn--active' : ''}`}
              onClick={() => lang !== 'en' && toggleLang()}
            >
              EN
            </button>
            <button
              className={`landing-lang-btn ${lang === 'vi' ? 'landing-lang-btn--active' : ''}`}
              onClick={() => lang !== 'vi' && toggleLang()}
            >
              VI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
