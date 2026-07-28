import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useSubscription } from '../../context/SubscriptionContext';
import backIcon from '../../../assets/back.png';

function formatVND(amount) {
  return (amount || 0).toLocaleString('vi-VN') + '₫';
}

const MONTH_OPTIONS = [1, 2, 3, 4, 5, 6];

export default function AdminPackages() {
  const navigate = useNavigate();
  const { packages, loadingPkgs, updatePackage, addPackage, deletePackage, effectivePrice } = useSubscription();

  const [editing, setEditing] = useState({});
  const [saving, setSaving] = useState({});
  const [planCounts, setPlanCounts] = useState({});
  const [totalUsers, setTotalUsers] = useState(0);

  // Add package form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMonths, setNewMonths] = useState(1);
  const [newPrice, setNewPrice] = useState('');
  const [addingSaving, setAddingSaving] = useState(false);

  // Load user counts per plan
  useEffect(() => {
    async function loadCounts() {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const counts = {};
        let total = 0;
        snap.docs.forEach((d) => {
          const plan = d.data()?.subscription?.plan || '';
          counts[plan] = (counts[plan] || 0) + 1;
          total++;
        });
        setPlanCounts(counts);
        setTotalUsers(total);
      } catch (_) { /* silent if no permissions */ }
    }
    loadCounts();
  }, []);

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

  const handleAdd = async () => {
    if (!newPrice || Number(newPrice) <= 0) { alert('Vui lòng nhập giá hợp lệ.'); return; }
    setAddingSaving(true);
    try {
      await addPackage({ months: newMonths, originalPrice: Number(newPrice) });
      setNewMonths(1);
      setNewPrice('');
      setShowAddForm(false);
    } catch (err) {
      alert('Lỗi: ' + err.message);
    } finally {
      setAddingSaving(false);
    }
  };

  const handleDelete = async (pkg) => {
    if (!window.confirm(`Xóa gói "${pkg.name}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await deletePackage(pkg.id);
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
        <button className="back-btn" onClick={() => navigate('/settings')}>
          <img src={backIcon} alt="" className="back-icon" />
        </button>
        <div>
          <h1 className="admin-title">Quản lý Gói dịch vụ</h1>
          <p className="admin-subtitle">Thêm / Xóa gói, bật / tắt giảm giá và chỉnh giá sale</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
          <button className="admin-nav-btn" onClick={() => navigate('/admin/users')}>← Người dùng</button>
          <button className="btn-primary btn--sm" onClick={() => setShowAddForm((v) => !v)}>
            {showAddForm ? 'Huỷ thêm' : '+ Thêm gói'}
          </button>
        </div>
      </div>

      {/* Add package form */}
      {showAddForm && (
        <div className="admin-pkg-card" style={{ marginBottom: 16 }}>
          <div className="admin-pkg-name">Thêm gói mới</div>
          <div className="admin-pkg-row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 140 }}>
              <label className="admin-pkg-label">Thời hạn sử dụng</label>
              <select
                className="admin-input admin-input--sm"
                value={newMonths}
                onChange={(e) => setNewMonths(Number(e.target.value))}
              >
                {MONTH_OPTIONS.map((m) => (
                  <option key={m} value={m}>{m} tháng</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 140 }}>
              <label className="admin-pkg-label">Giá tiền (₫)</label>
              <input
                className="admin-input admin-input--sm"
                type="number"
                min={1}
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="VD: 50000"
              />
            </div>
          </div>
          <div className="admin-pkg-actions" style={{ marginTop: 8 }}>
            <button className="btn-secondary btn--sm" onClick={() => setShowAddForm(false)}>Huỷ</button>
            <button className="btn-primary btn--sm" onClick={handleAdd} disabled={addingSaving}>
              {addingSaving ? 'Đang lưu...' : 'Thêm gói'}
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      {totalUsers > 0 && (
        <div className="admin-stats-row">
          <div className="admin-stat-card">
            <span className="admin-stat-value">{totalUsers}</span>
            <span className="admin-stat-label">Tổng tài khoản</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value admin-stat-value--active">{planCounts['lifetime'] || 0}</span>
            <span className="admin-stat-label">Vĩnh Viễn</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value">
              {(planCounts['1year'] || 0) + (planCounts['2year'] || 0) + (planCounts['3year'] || 0)}
            </span>
            <span className="admin-stat-label">Gói có hạn</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value admin-stat-value--trial">{planCounts['trial'] || 0}</span>
            <span className="admin-stat-label">Dùng thử</span>
          </div>
        </div>
      )}

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

                {/* User count for this plan */}
                <div className="admin-pkg-user-count">
                  <span className="admin-pkg-user-count__num">{planCounts[pkg.id] || 0}</span>
                  <span className="admin-pkg-user-count__label"> người dùng</span>
                </div>

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
                    <>
                      <button className="admin-edit-btn" onClick={() => startEdit(pkg)}>Chỉnh sửa</button>
                      <button
                        className="btn-danger btn--sm"
                        style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                        onClick={() => handleDelete(pkg)}
                      >
                        Xóa
                      </button>
                    </>
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
