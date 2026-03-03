import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import './admin.css';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '—';
const fmtCur = (n) => '₹' + Number(n ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function AdminWalletsPage() {
  const navigate = useNavigate();
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  const loadWallets = useCallback(async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: p, limit: 20 };
      if (search.trim()) params.search = search.trim();
      const res = await adminAPI.getWallets(params);
      const d = res.data.data || res.data;
      setWallets(d.wallets || []);
      setTotalPages(d.pages || d.totalPages || 1);
      setTotal(d.total || 0);
      setPage(d.page || p);
    } catch (err) {
      if (err.response?.status === 401) { navigate('/admin/login', { replace: true }); return; }
      setError(err.response?.data?.message || 'Failed to load wallets.');
    } finally {
      setLoading(false);
    }
  }, [search, navigate]);

  useEffect(() => { loadWallets(1); }, [loadWallets]);

  return (
    <div className="adm-card">
      <div className="adm-card-header">
        <h3 className="adm-card-title">All Wallets ({total})</h3>
        <div className="adm-filters">
          <input
            className="adm-input"
            placeholder="Search user name / mobile…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 240 }}
            onKeyDown={e => e.key === 'Enter' && loadWallets(1)}
          />
          <button className="adm-btn adm-btn-primary" onClick={() => loadWallets(1)}>Search</button>
        </div>
      </div>

      {error && <div className="adm-alert-error" style={{ margin: '12px 22px' }}>{error}</div>}

      <div className="adm-table-wrap">
        {loading ? (
          <div className="adm-loading">Loading wallets…</div>
        ) : wallets.length === 0 ? (
          <div className="adm-empty">No wallets found.</div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>Balance</th>
                <th>Daily Spent</th>
                <th>Monthly Spent</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {wallets.map((w, idx) => (
                <tr key={w._id}>
                  <td>{(page - 1) * 20 + idx + 1}</td>
                  <td>{w.user?.fullName || '—'}</td>
                  <td>{w.user?.mobile || '—'}</td>
                  <td style={{ fontSize: 12 }}>{w.user?.email || '—'}</td>
                  <td style={{ fontWeight: 700, color: w.balance > 0 ? '#2e7d32' : '#c62828' }}>
                    {fmtCur(w.balance)}
                  </td>
                  <td>{fmtCur(w.dailySpent)}</td>
                  <td>{fmtCur(w.monthlySpent)}</td>
                  <td style={{ fontSize: 12 }}>{fmtDate(w.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="adm-pagination">
          <span className="adm-page-info">Page {page} of {totalPages}</span>
          <button className="adm-page-btn" disabled={page <= 1} onClick={() => loadWallets(page - 1)}>‹</button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`adm-page-btn ${p === page ? 'adm-page-active' : ''}`}
              onClick={() => loadWallets(p)}
            >
              {p}
            </button>
          ))}
          <button className="adm-page-btn" disabled={page >= totalPages} onClick={() => loadWallets(page + 1)}>›</button>
        </div>
      )}
    </div>
  );
}
