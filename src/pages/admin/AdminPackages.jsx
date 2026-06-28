import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../context/SubscriptionContext';
import backIcon from '../../../assets/back.png';

function formatVND(amount) {
  return (amount || 0).toLocaleString('vi-VN') + '₫';
}

export default function AdminPackages() {
  const navigate = useNavigate();
  const { packages, loadingPkgs, updatePackage, effectivePrice } = useSubscription();

  // Per-package editing state: { [id]: { saleEnabled, salePrice } }
  const [editing, setEditing] = useState({});
  const [saving, setSaving] = useState({});

  const startEdit = (pkg) => {
    setEditing((prev) => ({
      ...prev,
      [pkg.id]: {
        saleEnabled: pkg.saleEnabled || false,
        salePrice: pkg.salePrice || '',
      },
    }));
  };

  const cancelEdit = (id) => {
    setEditing((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleSave = async (pkg) => {
    const e = editing[pkg.id];
    if (!e) return;
    setSaving((prev) => ({ ...prev, [pkg.id]: true }));
    try {
      const salePrice = e.saleEnabled ? Number(e.salePrice) : null;
      if (e.saleEnabled && (!salePrice || salePrice <= 0 || salePrice >= pkg.originalPrice)) {
        alert('Giá sale phải lớn hơn 0 và nhỏ hơn giá gốc.');
        return;
      }
      await updatePackage(pkg.id, { saleEnabled: e.saleEnabled, salePrice });
      cancelEdit(pkg.id);
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
    setSaving((prev) => ({ ...prev, [pkg.id]: false }));
  };

  const toggleSale = (id, currentVal) => {
    setEditing((prev) => ({
      ...prev,
      [id]: { ...prev[id], saleEnabled: !currentVal },
    }));
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
        <button className="back-btn" onClick={() => navigate('/admin/users')}>
          <img src={backIcon} alt="" className="back-icon" />
        </button>
        <div>
          <h1 className="admin-title">Quản lý Gói dịch vụ</h1>
          <p className="admin-subtitle">Bật / Tắt giảm giá và chỉnh giá sale</p>
        </div>
        <button className="admin-nav-btn" onClick={() => navigate('/admin/users')}>
          ← Người dùng
        </button>
      </div>

      {loadingPkgs ? (
        <div className="admin-loading">Đang tải...</div>
      ) : (
        <div className="admin-pkg-grid">
          {packages.map((pkg) => {
            const ed = editing[pkg.id];
            const isEditing = !!ed;
            const currentSaleEnabled = isEditing ? ed.saleEnabled : pkg.saleEnabled;
            const currentSalePrice = isEditing ? ed.salePrice : (pkg.salePrice || '');
            const curEffective = effectivePrice(
              isEditing ? { ...pkg, saleEnabled: ed.saleEnabled, salePrice: Number(ed.salePrice) || null } : pkg
            );

            return (
              <div key={pkg.id} className={`admin-pkg-card ${currentSaleEnabled ? 'admin-pkg-card--sale' : ''}`}>
                {currentSaleEnabled && <span className="admin-sale-badge">SALE</span>}

                <div className="admin-pkg-name">{pkg.name}</div>

                <div className="admin-pkg-prices">
                  {currentSaleEnabled && pkg.originalPrice ? (
                    <>
                      <span className="admin-pkg-original">{formatVND(pkg.originalPrice)}</span>
                      <span className="admin-pkg-sale">{formatVND(curEffective)}</span>
                    </>
                  ) : (
                    <span className="admin-pkg-current">{formatVND(pkg.originalPrice)}</span>
                  )}
                </div>

                {/* Sale toggle */}
                <div className="admin-pkg-row">
                  <span className="admin-pkg-label">Giảm giá</span>
                  {isEditing ? (
                    <button
                      className={`admin-toggle ${currentSaleEnabled ? 'admin-toggle--on' : 'admin-toggle--off'}`}
                      onClick={() => toggleSale(pkg.id, currentSaleEnabled)}
                    >
                      {currentSaleEnabled ? 'ON' : 'OFF'}
                    </button>
                  ) : (
                    <span className={`admin-badge ${pkg.saleEnabled ? 'admin-badge--admin' : 'admin-badge--user'}`}>
                      {pkg.saleEnabled ? 'Đang sale' : 'Tắt'}
                    </span>
                  )}
                </div>

                {/* Sale price input */}
                {isEditing && currentSaleEnabled && (
                  <div className="admin-pkg-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                    <label className="admin-pkg-label">Giá sale (₫)</label>
                    <input
                      className="admin-input admin-input--sm"
                      type="number"
                      min={1}
                      max={pkg.originalPrice - 1}
                      value={currentSalePrice}
                      onChange={(e) =>
                        setEditing((prev) => ({
                          ...prev,
                          [pkg.id]: { ...prev[pkg.id], salePrice: e.target.value },
                        }))
                      }
                      placeholder={`Nhỏ hơn ${formatVND(pkg.originalPrice)}`}
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="admin-pkg-actions">
                  {isEditing ? (
                    <>
                      <button className="btn-secondary btn--sm" onClick={() => cancelEdit(pkg.id)}>Huỷ</button>
                      <button
                        className="btn-primary btn--sm"
                        onClick={() => handleSave(pkg)}
                        disabled={saving[pkg.id]}
                      >
                        {saving[pkg.id] ? 'Lưu...' : 'Lưu'}
                      </button>
                    </>
                  ) : (
                    <button className="admin-edit-btn" onClick={() => startEdit(pkg)}>Chỉnh sửa</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
