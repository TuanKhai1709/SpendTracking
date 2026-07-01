import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { useSubscription } from '../context/SubscriptionContext';
import { doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import PaymentModal from '../components/PaymentModal';
import backIcon from '../../assets/back.png';

const PAYOS_CLIENT_ID = import.meta.env.VITE_PAYOS_CLIENT_ID?.trim();
const PAYOS_API_KEY = import.meta.env.VITE_PAYOS_API_KEY?.trim();
const PAYOS_BASE = import.meta.env.DEV ? '/payos' : 'https://api-merchant.payos.vn';
const PENDING_KEY = 'payos_pending_order';

function formatVND(n) {
  return (n || 0).toLocaleString('vi-VN') + '₫';
}

export default function Subscription() {
  const navigate = useNavigate();
  const { user, refreshSubscription } = useAuth();
  const { lang } = useLang();
  const { packages, loadingPkgs, effectivePrice } = useSubscription();
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [recovering, setRecovering] = useState(false);

  // On mount: check if there's a pending order that was never confirmed (e.g. user closed modal early)
  useEffect(() => {
    if (!user || !PAYOS_CLIENT_ID) return;
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return;

    let pending;
    try { pending = JSON.parse(raw); } catch { localStorage.removeItem(PENDING_KEY); return; }

    setRecovering(true);
    fetch(`${PAYOS_BASE}/v2/payment-requests/${pending.orderCode}`, {
      headers: { 'x-client-id': PAYOS_CLIENT_ID, 'x-api-key': PAYOS_API_KEY },
    })
      .then((r) => r.json())
      .then(async (data) => {
        if (data.data?.status === 'PAID') {
          let expiryDate = null;
          if (pending.pkgYears) {
            const exp = new Date();
            exp.setFullYear(exp.getFullYear() + pending.pkgYears);
            expiryDate = Timestamp.fromDate(exp);
          }
          await updateDoc(doc(db, 'users', user.uid), {
            'subscription.plan': pending.pkgId,
            'subscription.planName': pending.pkgName,
            'subscription.expiryDate': expiryDate,
            'subscription.activatedAt': serverTimestamp(),
          });
          await refreshSubscription();
          localStorage.removeItem(PENDING_KEY);
          alert(lang === 'vi'
            ? `Đã phát hiện thanh toán trước đó! Gói ${pending.pkgName} đã được kích hoạt.`
            : `Previous payment detected! ${pending.pkgName} activated.`);
        } else if (['CANCELLED', 'EXPIRED'].includes(data.data?.status)) {
          localStorage.removeItem(PENDING_KEY);
        }
      })
      .catch(() => {})
      .finally(() => setRecovering(false));
  }, [user]);

  const vi = lang === 'vi';
  const currentPlan = user?.subscription?.plan;
  const isCurrentPlan = (pkg) => currentPlan === pkg.id;

  // Firestore stores names in Vietnamese — map to English when needed
  const EN_PKG_NAMES = {
    '1year': '1 Year',
    '2year': '2 Years',
    '3year': '3 Years',
    'lifetime': 'Lifetime',
  };
  const pkgName = (pkg) => vi ? pkg.name : (EN_PKG_NAMES[pkg.id] || pkg.name);

  const txt = {
    title: vi ? 'Nâng cấp tài khoản' : 'Upgrade Account',
    desc: vi ? 'Chọn gói phù hợp để sử dụng đầy đủ tính năng SpendTracker' : 'Choose a plan to unlock all SpendTracker features',
    loading: vi ? 'Đang tải gói...' : 'Loading plans...',
    current: vi ? 'Đang dùng' : 'Current',
    renew: vi ? 'Gia hạn' : 'Renew',
    using: vi ? 'Đang sử dụng' : 'Current Plan',
    daysLeft: vi ? `còn ${user?.subStatus?.daysLeft} ngày` : `${user?.subStatus?.daysLeft} days left`,
    lifetime: vi ? 'Vĩnh Viễn' : 'Lifetime',
    trial: vi ? 'Dùng thử' : 'Trial',
    expired: vi ? 'Tài khoản đã hết hạn. Vui lòng gia hạn để tiếp tục sử dụng.' : 'Account expired. Please renew to continue.',
    yearsDesc: (y) => vi ? `Sử dụng ${y} năm` : `${y} year${y > 1 ? 's' : ''} access`,
    lifetimeDesc: vi ? 'Sử dụng vĩnh viễn' : 'Lifetime access',
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

      {recovering && (
        <div className="sub-status-banner sub-status-banner--active" style={{ justifyContent: 'center' }}>
          ⏳ {vi ? 'Đang kiểm tra thanh toán trước...' : 'Checking previous payment...'}
        </div>
      )}

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

                <div className="sub-pkg-name">{pkgName(pkg)}</div>

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
