import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import PaymentModal from '../components/PaymentModal';
import backIcon from '../../assets/back.png';

function formatVND(n) {
  return (n || 0).toLocaleString('vi-VN') + '₫';
}

export default function Subscription() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { packages, loadingPkgs, effectivePrice } = useSubscription();
  const [selectedPkg, setSelectedPkg] = useState(null);

  const currentPlan = user?.subscription?.plan;

  const isCurrentPlan = (pkg) => currentPlan === pkg.id;

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/settings')}>
          <img src={backIcon} alt="" className="back-icon" />
        </button>
        <h2 className="page-title">Nâng cấp tài khoản</h2>
      </div>

      {/* Current plan banner */}
      {user?.subStatus && (
        <div className={`sub-status-banner ${user.subStatus.active ? 'sub-status-banner--active' : 'sub-status-banner--expired'}`}>
          {user.subStatus.active ? (
            <>
              <span className="sub-status-icon">✓</span>
              <span>
                Gói <strong>{user.subStatus.label}</strong>
                {user.subStatus.daysLeft !== Infinity && ` · còn ${user.subStatus.daysLeft} ngày`}
              </span>
            </>
          ) : (
            <>
              <span className="sub-status-icon">!</span>
              <span>Tài khoản đã hết hạn. Vui lòng gia hạn để tiếp tục sử dụng.</span>
            </>
          )}
        </div>
      )}

      <p className="sub-page-desc">
        Chọn gói phù hợp để sử dụng đầy đủ tính năng SpendTracker
      </p>

      {loadingPkgs ? (
        <div className="admin-loading">Đang tải gói...</div>
      ) : (
        <div className="sub-pkg-list">
          {packages.map((pkg) => {
            const price = effectivePrice(pkg);
            const onSale = pkg.saleEnabled && pkg.salePrice;
            const isCurrent = isCurrentPlan(pkg);

            return (
              <div key={pkg.id} className={`sub-pkg-card ${isCurrent ? 'sub-pkg-card--current' : ''} ${onSale ? 'sub-pkg-card--sale' : ''}`}>
                {onSale && <span className="sub-sale-badge">SALE 🔥</span>}
                {isCurrent && <span className="sub-current-badge">Đang dùng</span>}

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
                  {pkg.years ? `Sử dụng ${pkg.years} năm` : 'Sử dụng vĩnh viễn'}
                </div>

                <button
                  className={`sub-pkg-btn ${isCurrent ? 'sub-pkg-btn--current' : 'btn-primary'}`}
                  disabled={isCurrent}
                  onClick={() => !isCurrent && setSelectedPkg(pkg)}
                >
                  {isCurrent ? 'Đang sử dụng' : 'Mua ngay'}
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
