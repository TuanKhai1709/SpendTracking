import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import backIcon from '../../../assets/back.png';

const PLAN_OPTIONS = [
  { value: '', label: 'Chưa mua' },
  { value: 'trial', label: 'Dùng thử' },
  { value: '1year', label: '1 Năm' },
  { value: '2year', label: '2 Năm' },
  { value: '3year', label: '3 Năm' },
  { value: 'lifetime', label: 'Vĩnh Viễn' },
];

const PLAN_YEARS = { '1year': 1, '2year': 2, '3year': 3 };

function planLabel(sub) {
  if (!sub || !sub.plan || sub.plan === '') return 'Chưa mua';
  if (sub.plan === 'trial') return 'Dùng thử';
  if (sub.plan === 'lifetime') return 'Vĩnh Viễn';
  return sub.planName || sub.plan;
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState(null);   // user doc being edited
  const [editPlan, setEditPlan] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (a.email || '').localeCompare(b.email || ''));
      setUsers(list);
    } catch (err) {
      console.error('Failed to load users', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleStatus = async (u) => {
    const newStatus = u.status === 'active' ? 'inactive' : 'active';
    await updateDoc(doc(db, 'users', u.id), { status: newStatus });
    setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, status: newStatus } : x));
  };

  const openEdit = (u) => {
    setEditTarget(u);
    setEditPlan(u.subscription?.plan || '');
  };

  const saveEdit = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      const planOpt = PLAN_OPTIONS.find((o) => o.value === editPlan);
      let expiryDate = null;
      const years = PLAN_YEARS[editPlan];
      if (years) {
        const exp = new Date();
        exp.setFullYear(exp.getFullYear() + years);
        expiryDate = exp;
      }

      await updateDoc(doc(db, 'users', editTarget.id), {
        'subscription.plan': editPlan,
        'subscription.planName': planOpt?.label || editPlan,
        'subscription.expiryDate': expiryDate
          ? { seconds: Math.floor(expiryDate.getTime() / 1000), nanoseconds: 0 }
          : null,
        'subscription.activatedAt': { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
      });

      setUsers((prev) =>
        prev.map((x) =>
          x.id === editTarget.id
            ? {
              ...x,
              subscription: {
                ...x.subscription,
                plan: editPlan,
                planName: planOpt?.label || editPlan,
                expiryDate,
              },
            }
            : x
        )
      );
      setEditTarget(null);
    } catch (err) {
      alert('Lưu thất bại: ' + err.message);
    }
    setSaving(false);
  };

  const filtered = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const userCount  = users.filter((u) => u.role !== 'admin').length;

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
        <button className="back-btn" onClick={() => navigate('/settings')}>
          <img src={backIcon} alt="" className="back-icon" />
        </button>
        <div>
          <h1 className="admin-title">Quản lý Người dùng</h1>
          <p className="admin-subtitle">Tổng: {users.length} tài khoản</p>
        </div>
        <button className="admin-nav-btn" onClick={() => navigate('/admin/packages')}>
          Gói dịch vụ →
        </button>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="admin-stats-row">
          <div className="admin-stat-card">
            <span className="admin-stat-value">{users.length}</span>
            <span className="admin-stat-label">Tổng tài khoản</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value admin-stat-value--admin">{adminCount}</span>
            <span className="admin-stat-label">Quản trị viên</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value">{userCount}</span>
            <span className="admin-stat-label">Người dùng</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value admin-stat-value--active">
              {users.filter((u) => u.status === 'active').length}
            </span>
            <span className="admin-stat-label">Đang hoạt động</span>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="admin-search-bar">
        <input
          className="admin-input"
          placeholder="Tìm theo email hoặc tên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-loading">Đang tải...</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Email</th>
                <th>Status</th>
                <th>Gói đang dùng</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className={u.id === currentUser?.uid ? 'admin-row-self' : ''}>
                  <td>
                    <span className={`admin-badge ${u.role === 'admin' ? 'admin-badge--admin' : 'admin-badge--user'}`}>
                      {u.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="admin-email-cell">{u.email}</td>
                  <td>
                    <button
                      className={`admin-toggle ${u.status === 'active' ? 'admin-toggle--on' : 'admin-toggle--off'}`}
                      onClick={() => toggleStatus(u)}
                      title={u.status === 'active' ? 'Đang hoạt động – Bấm để vô hiệu' : 'Đã vô hiệu – Bấm để kích hoạt'}
                    >
                      {u.status === 'active' ? 'ON' : 'OFF'}
                    </button>
                  </td>
                  <td>
                    <span className="admin-plan-label">{planLabel(u.subscription)}</span>
                  </td>
                  <td>
                    <button className="admin-edit-btn" onClick={() => openEdit(u)}>
                      Sửa
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="admin-empty">Không tìm thấy người dùng</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <div className="modal-overlay" onClick={() => setEditTarget(null)}>
          <div className="modal-card admin-edit-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Chỉnh sửa gói – {editTarget.email}</h3>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="form-label">Gói dịch vụ</label>
              <select
                className="admin-select"
                value={editPlan}
                onChange={(e) => setEditPlan(e.target.value)}
              >
                {PLAN_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <p className="admin-edit-note">
              Nếu chọn gói có thời hạn, ngày hết hạn sẽ được tính từ hôm nay.
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setEditTarget(null)}>Huỷ</button>
              <button className="btn-primary" onClick={saveEdit} disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
