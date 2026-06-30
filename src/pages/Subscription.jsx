import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { useSubscription } from '../context/SubscriptionContext';
import PaymentModal from '../components/PaymentModal';
import backIcon from '../../assets/back.png';

function formatVND(n) {
  return (n || 0).toLocaleString('vi-VN') + '₫';
}

export default function Subscription() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lang } = useLang();
  const { packages, loadingPkgs, effectivePrice } = useSubscription();
  const [selectedPkg, setSelectedPkg] = useState(null);

  const vi = lang === 'vi';
  const currentPlan = user?.subscription?.plan;
  const isCurrentPlan = (pkg) => currentPlan === pkg.id;

  const txt = {
    title:       vi ? 'Nâng cấp tài khoản' : 'Upgrade Account',
    desc:        vi ? 'Chọn gói phù hợp để sử dụng đầy đủ tính năng SpendTracker' : 'Choose a plan to unlock all SpendTracker features',
    loading:     vi ? 'Đang tải gói...' : 'Loading plans...',
    current:     vi ? 'Đang dùng' : 'Current',
    renew:       vi ? 'Gia hạn' : 'Renew',
    using:       vi ? 'Đang sử dụng' : 'Current Plan',
    daysLeft:    vi ? `còn ${user?.subStatus?.daysLeft} ngày` : `${user?.subStatus?.daysLeft} days left`,
    lifetime:    vi ? 'Vĩnh Viễn' : 'Lifetime',
    trial:       vi ? 'Dùng thử' : 'Trial',
    expired:     vi ? 'Tài khoản đã hết hạn. Vui lòng gia hạn để tiếp tục sử dụng.' : 'Account expired. Please renew to continue.',
    yearsDesc:   (y) => vi ? `Sử dụng ${y} năm` : `${y} year${y > 1 ? 's' : ''} access`,
    lifetimeDesc:vi ? 'Sử dụng vĩnh viễn' : 'Lifetime access',
  };

  const getPlanStatusText = () => {
    const sub = user?.subStatus;
    if (!sub?.active) return null;
    if (sub.planKey === 'lifetime') return `✓ ${txt.lifetime}`;
    if (sub.planKey === 'trial') return `✓ ${txt.trial} · ${txt.daysLeft}`;
    return `✓ ${user?.subscription?.planName} · ${txt.daysLeft}`;
  };

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/settings')}>
          <img src={backIcon} alt="" className="back-icon" />
        </button>
        <h2 className="page-title">{txt.title}</h2>
      </div>

      {/* Current plan banner */}
      {user?.subStatus && (
        <div className={`sub-status-banner ${user.subStatus.active ? 'sub-status-banner--active' : 'sub-status-banner--expired'}`}>
          <span className="sub-status-icon">{user.subStatus.active ? '✓' : '!'}</span>
          <span>
            {user.subStatus.active ? getPlanStatusText() : txt.expired}
          </span>
        </div>
      )}

      <p className="sub-page-desc">{txt.desc}</p>

      {loadingPkgs ? (
        <div className="admin-loading">{txt.loading}</div>
      ) : (
        <div className="sub-pkg-list">
          {packages.map((pkg) => {
            const price = effectivePrice(pkg);
            const onSale = pkg.saleEnabled && pkg.salePrice;
            const isCurrent = isCurrentPlan(pkg);

            return (
              <div key={pkg.id} className={`sub-pkg-card ${isCurrent ? 'sub-pkg-card--current' : ''} ${onSale ? 'sub-pkg-card--sale' : ''}`}>
                {onSale && <span className="sub-sale-badge">SALE 🔥</span>}
                {isCurrent && <span className="sub-current-badge">{txt.current}</span>}

                <div className="sub-pkg-name">{pkg.name}</div>

                <div className="sub-pkg-price-row">
                  {onSale ? (
                    <>
                      <span className="sub-pkg-original">{formatVND(pkg.originalPrice)}</span>
                      <span className="sub-pkg-sale">{formatVND(price)}</span>
                    </>
                  ) : (
                    <span className="sub-pkg-price">{formatVND(price)}</span>
                  )}
                </div>

                <div className="sub-pkg-desc">
                  {pkg.years ? txt.yearsDesc(pkg.years) : txt.lifetimeDesc}
                </div>

                <button
                  className={`sub-pkg-btn ${isCurrent ? 'sub-pkg-btn--current' : 'btn-primary'}`}
                  disabled={isCurrent}
                  onClick={() => !isCurrent && setSelectedPkg(pkg)}
                >
                  {isCurrent ? txt.using : txt.renew}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selectedPkg && (
        <PaymentModal
          pkg={selectedPkg}
          effectivePrice={effectivePrice(selectedPkg)}
          onClose={() => setSelectedPkg(null)}
          onSuccess={() => setSelectedPkg(null)}
        />
      )}
    </div>
  );
}
