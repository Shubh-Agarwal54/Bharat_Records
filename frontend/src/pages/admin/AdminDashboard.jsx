import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import './admin.css';

const fmt = (n) => (n ?? 0).toLocaleString('en-IN');
const fmtCur = (n) =>
  '₹' + Number(n ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await adminAPI.getStats();
        const payload = res.data.data || res.data;
        // Flatten nested stats + related collections into one object
        setStats({
          ...(payload.stats || payload),
          recentUsers: payload.recentUsers || [],
          recentTransactions: payload.recentTransactions || [],
          subBreakdown: payload.subBreakdown || [],
        });
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/admin/login', { replace: true });
          return;
        }
        setError(err.response?.data?.message || 'Failed to load dashboard stats.');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  if (loading) return <div className="adm-loading">Loading dashboard…</div>;
  if (error) return <div className="adm-alert-error">{error}</div>;
  if (!stats) return null;

  const statCards = [
    { label: 'Total Users',        value: fmt(stats.totalUsers),        icon: '👥', color: 'adm-purple' },
    { label: 'Active Users',       value: fmt(stats.activeUsers),       icon: '✅', color: 'adm-green'  },
    { label: 'Total Documents',    value: fmt(stats.totalDocuments),    icon: '📄', color: 'adm-blue'   },
    { label: 'Total Transactions', value: fmt(stats.totalTransactions), icon: '💳', color: 'adm-orange' },
    { label: 'Wallet Balance',     value: fmtCur(stats.totalWalletBalance), icon: '💰', color: 'adm-teal' },
    { label: 'Inactive Users',     value: fmt(stats.inactiveUsers),     icon: '🚫', color: 'adm-red'    },
  ];

  return (
    <>
      {/* Stat cards */}
      <div className="adm-stats-grid">
        {statCards.map((c) => (
          <div className="adm-stat-card" key={c.label}>
            <div className={`adm-stat-icon ${c.color}`}>{c.icon}</div>
            <div className="adm-stat-info">
              <div className="adm-stat-value">{c.value}</div>
              <div className="adm-stat-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="adm-recent-grid">
        {/* Recent Users */}
        <div className="adm-card">
          <div className="adm-card-header">
            <h3 className="adm-card-title">Recent Users</h3>
            <button className="adm-btn adm-btn-outline adm-btn-sm" onClick={() => navigate('/admin/users')}>
              View All
            </button>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Plan</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {(stats.recentUsers || []).length === 0 ? (
                  <tr><td colSpan={4} className="adm-empty">No users yet</td></tr>
                ) : (
                  (stats.recentUsers || []).map((u) => (
                    <tr key={u._id}>
                      <td>{u.fullName || '—'}</td>
                      <td>{u.mobile || u.email || '—'}</td>
                      <td>
                        <span className={`adm-badge ${u.subscriptionPlan === 'premium' ? 'adm-badge-purple' : 'adm-badge-grey'}`}>
                          {u.subscriptionPlan || 'free'}
                        </span>
                      </td>
                      <td>{fmtDate(u.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="adm-card">
          <div className="adm-card-header">
            <h3 className="adm-card-title">Recent Transactions</h3>
            <button className="adm-btn adm-btn-outline adm-btn-sm" onClick={() => navigate('/admin/transactions')}>
              View All
            </button>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {(stats.recentTransactions || []).length === 0 ? (
                  <tr><td colSpan={4} className="adm-empty">No transactions yet</td></tr>
                ) : (
                  (stats.recentTransactions || []).map((t) => (
                    <tr key={t._id}>
                      <td style={{ textTransform: 'capitalize' }}>{t.type || '—'}</td>
                      <td>{fmtCur(t.amount)}</td>
                      <td>
                        <span className={`adm-badge ${
                          t.status === 'success'   ? 'adm-badge-green' :
                          t.status === 'pending'   ? 'adm-badge-orange' : 'adm-badge-red'
                        }`}>
                          {t.status || '—'}
                        </span>
                      </td>
                      <td>{fmtDate(t.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Subscription breakdown */}
      {stats.subBreakdown && stats.subBreakdown.length > 0 && (
        <div className="adm-card" style={{ marginTop: 0 }}>
          <div className="adm-card-header">
            <h3 className="adm-card-title">Subscription Breakdown</h3>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr><th>Plan</th><th>Count</th></tr>
              </thead>
              <tbody>
                {stats.subBreakdown.map((s) => (
                  <tr key={s._id}>
                    <td style={{ textTransform: 'capitalize' }}>
                      <span className={`adm-badge ${s._id === 'premium' ? 'adm-badge-purple' : 'adm-badge-grey'}`}>
                        {s._id || 'free'}
                      </span>
                    </td>
                    <td>{fmt(s.count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
