import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import './admin.css';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');

  // Detail modal
  const [detailUser, setDetailUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Edit subscription modal
  const [editSub, setEditSub] = useState(null); // { userId }
  const [editPlan, setEditPlan] = useState('free');
  const [editExpiry, setEditExpiry] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  const loadUsers = useCallback(async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: p, limit: 15 };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (planFilter) params.plan = planFilter;
      const res = await adminAPI.getUsers(params);
      const d = res.data.data || res.data;
      setUsers(d.users || []);
      setTotalPages(d.pages || d.totalPages || 1);
      setTotal(d.total || 0);
      setPage(d.page || p);
    } catch (err) {
      if (err.response?.status === 401) { navigate('/admin/login', { replace: true }); return; }
      setError(err.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, planFilter, navigate]);

  useEffect(() => { loadUsers(1); }, [loadUsers]);

  const handleSearch = (e) => { e.preventDefault(); loadUsers(1); };

  const handleToggleStatus = async (userId) => {
    try {
      await adminAPI.toggleUserStatus(userId);
      loadUsers(page);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Deactivate this user? This action can be reversed.')) return;
    try {
      await adminAPI.deleteUser(userId);
      loadUsers(page);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const openDetail = async (userId) => {
    setDetailLoading(true);
    setDetailUser(null);
    try {
      const res = await adminAPI.getUserDetail(userId);
      setDetailUser(res.data.data || res.data);
    } catch (err) {
      alert('Failed to load user details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const openEditSub = (u) => {
    setEditSub({ userId: u._id });
    setEditPlan(u.subscriptionPlan || 'free');
    setEditExpiry(u.subscriptionExpiry ? new Date(u.subscriptionExpiry).toISOString().split('T')[0] : '');
    setEditError('');
  };

  const handleSaveSub = async () => {
    setEditLoading(true);
    setEditError('');
    try {
      await adminAPI.updateUserSubscription(editSub.userId, editPlan, editExpiry || null);
      setEditSub(null);
      loadUsers(page);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update subscription.');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <>
      <div className="adm-card">
        <div className="adm-card-header">
          <h3 className="adm-card-title">All Users ({total})</h3>
          <form className="adm-filters" onSubmit={handleSearch}>
            <input
              className="adm-input"
              placeholder="Search name / mobile / email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: 240 }}
            />
            <select className="adm-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); }}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select className="adm-select" value={planFilter} onChange={e => { setPlanFilter(e.target.value); }}>
              <option value="">All Plans</option>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <button className="adm-btn adm-btn-primary" type="submit">Search</button>
          </form>
        </div>

        {error && <div className="adm-alert-error" style={{ margin: '12px 22px' }}>{error}</div>}

        <div className="adm-table-wrap">
          {loading ? (
            <div className="adm-loading">Loading users…</div>
          ) : users.length === 0 ? (
            <div className="adm-empty">No users found.</div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Email</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Docs</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr key={u._id}>
                    <td>{(page - 1) * 15 + idx + 1}</td>
                    <td>{u.fullName || '—'}</td>
                    <td>{u.mobile || '—'}</td>
                    <td style={{ fontSize: 12 , wordBreak:'break-all' }}>{u.email || '—'}</td>
                    <td>
                      <span className={`adm-badge ${u.subscriptionPlan === 'premium' ? 'adm-badge-purple' : u.subscriptionPlan === 'enterprise' ? 'adm-badge-blue' : 'adm-badge-grey'}`}>
                        {u.subscriptionPlan || 'free'}
                      </span>
                    </td>
                    <td>
                      <span className={`adm-badge ${u.isActive ? 'adm-badge-green' : 'adm-badge-red'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{u.documentCount ?? '—'}</td>
                    <td style={{ fontSize: 12 }}>{fmtDate(u.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button className="adm-btn adm-btn-outline adm-btn-sm" onClick={() => openDetail(u._id)}>
                          View
                        </button>
                        <button
                          className={`adm-btn adm-btn-sm ${u.isActive ? 'adm-btn-warning' : 'adm-btn-success'}`}
                          onClick={() => handleToggleStatus(u._id)}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        {/* <button className="adm-btn adm-btn-outline adm-btn-sm" onClick={() => openEditSub(u)}>
                          Plan
                        </button> */}
                        {/* <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => handleDeleteUser(u._id)}>
                          Delete
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="adm-pagination">
            <span className="adm-page-info">Page {page} of {totalPages}</span>
            <button className="adm-page-btn" disabled={page <= 1} onClick={() => loadUsers(page - 1)}>‹</button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  className={`adm-page-btn ${p === page ? 'adm-page-active' : ''}`}
                  onClick={() => loadUsers(p)}
                >
                  {p}
                </button>
              );
            })}
            <button className="adm-page-btn" disabled={page >= totalPages} onClick={() => loadUsers(page + 1)}>›</button>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {(detailLoading || detailUser) && (
        <div className="adm-modal-overlay" onClick={() => { setDetailUser(null); }}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <button className="adm-modal-close" onClick={() => setDetailUser(null)}>✕</button>
            {detailLoading ? (
              <div className="adm-loading">Loading…</div>
            ) : detailUser && (
              <>
                <h3 className="adm-modal-title">User Details</h3>
                {[
                  ['Name', detailUser.user?.fullName],
                  ['Mobile', detailUser.user?.mobile],
                  ['Email', detailUser.user?.email],
                  ['Plan', detailUser.user?.subscriptionPlan || 'free'],
                  ['Plan Expires', fmtDate(detailUser.user?.subscriptionExpiry)],
                  ['Status', detailUser.user?.isActive ? 'Active' : 'Inactive'],
                  ['Email Verified', detailUser.user?.isEmailVerified ? 'Yes' : 'No'],
                  ['Mobile Verified', detailUser.user?.isMobileVerified ? 'Yes' : 'No'],
                  ['Joined', fmtDate(detailUser.user?.createdAt)],
                  ['Wallet Balance', '₹' + Number(detailUser.wallet?.balance ?? 0).toFixed(2)],
                  ['Total Documents', detailUser.documents?.length ?? 0],
                  ['Total Transactions', detailUser.transactions?.length ?? 0],
                ].map(([k, v]) => (
                  <div className="adm-detail-row" key={k}>
                    <span className="adm-detail-key">{k}</span>
                    <span className="adm-detail-val">{v ?? '—'}</span>
                  </div>
                ))}

                {detailUser.documents?.length > 0 && (
                  <>
                    <h4 style={{ marginTop: 18, marginBottom: 10, color: '#2D165F', fontSize: 14 }}>Recent Documents</h4>
                    {detailUser.documents.slice(0, 5).map((doc) => (
                      <div className="adm-detail-row" key={doc._id}>
                        <span className="adm-detail-key">{doc.documentType || doc.category || '—'}</span>
                        <span className="adm-detail-val" style={{ fontSize: 12 }}>{fmtDate(doc.createdAt)}</span>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Edit Subscription Modal */}
      {editSub && (
        <div className="adm-modal-overlay" onClick={() => setEditSub(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <button className="adm-modal-close" onClick={() => setEditSub(null)}>✕</button>
            <h3 className="adm-modal-title">Update Subscription</h3>
            {editError && <div className="adm-alert-error">{editError}</div>}
            <div className="adm-form-row">
              <label className="adm-form-label">Plan</label>
              <select className="adm-select" style={{ width: '100%' }} value={editPlan} onChange={e => setEditPlan(e.target.value)}>
                <option value="free">Free</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div className="adm-form-row">
              <label className="adm-form-label">Expiry Date (optional)</label>
              <input
                className="adm-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
                type="date"
                value={editExpiry}
                onChange={e => setEditExpiry(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="adm-btn adm-btn-primary" onClick={handleSaveSub} disabled={editLoading}>
                {editLoading ? 'Saving…' : 'Save'}
              </button>
              <button className="adm-btn adm-btn-outline" onClick={() => setEditSub(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
