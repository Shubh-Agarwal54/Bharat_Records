import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import './admin.css';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const fmtCur = (n) => '₹' + Number(n ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function AdminTransactionsPage() {
  const navigate = useNavigate();
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadTxns = useCallback(async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: p, limit: 20 };
      if (typeFilter) params.type = typeFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await adminAPI.getTransactions(params);
      const d = res.data.data || res.data;
      setTxns(d.transactions || []);
      setTotalPages(d.pages || d.totalPages || 1);
      setTotal(d.total || 0);
      setPage(d.page || p);
    } catch (err) {
      if (err.response?.status === 401) { navigate('/admin/login', { replace: true }); return; }
      setError(err.response?.data?.message || 'Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter, navigate]);

  useEffect(() => { loadTxns(1); }, [loadTxns]);

  const txnTypes = ['credit', 'debit', 'transfer'];
  const txnStatuses = ['pending', 'success', 'failed', 'cancelled'];

  const statusBadge = (s) => {
    const map = { success: 'adm-badge-green', pending: 'adm-badge-orange', failed: 'adm-badge-red', cancelled: 'adm-badge-grey' };
    return map[s] || 'adm-badge-grey';
  };

  const typeBadge = (t) => {
    const map = { credit: 'adm-badge-green', debit: 'adm-badge-red', subscription: 'adm-badge-purple', refund: 'adm-badge-blue', transfer: 'adm-badge-orange' };
    return map[t] || 'adm-badge-grey';
  };

  return (
    <div className="adm-card">
      <div className="adm-card-header">
        <h3 className="adm-card-title">All Transactions ({total})</h3>
        <div className="adm-filters">
          <select className="adm-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            {txnTypes.map(t => <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
          <select className="adm-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {txnStatuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <button className="adm-btn adm-btn-primary" onClick={() => loadTxns(1)}>Filter</button>
        </div>
      </div>

      {error && <div className="adm-alert-error" style={{ margin: '12px 22px' }}>{error}</div>}

      <div className="adm-table-wrap">
        {loading ? (
          <div className="adm-loading">Loading transactions…</div>
        ) : txns.length === 0 ? (
          <div className="adm-empty">No transactions found.</div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Description</th>
                <th>Ref / Order ID</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {txns.map((t, idx) => (
                <tr key={t._id}>
                  <td>{(page - 1) * 20 + idx + 1}</td>
                  <td style={{ fontSize: 12 }}>
                    {t.user?.fullName || t.user?.mobile || t.user?.email || '—'}
                  </td>
                  <td>
                    <span className={`adm-badge ${typeBadge(t.type)}`} style={{ textTransform: 'capitalize' }}>
                      {t.type || '—'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{fmtCur(t.amount)}</td>
                  <td>
                    <span className={`adm-badge ${statusBadge(t.status)}`} style={{ textTransform: 'capitalize' }}>
                      {t.status || '—'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.description || '—'}
                  </td>
                  <td style={{ fontSize: 11, color: '#888' }}>
                    {t.orderId || t.referenceId || t.transactionId || '—'}
                  </td>
                  <td style={{ fontSize: 12 }}>{fmtDate(t.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="adm-pagination">
          <span className="adm-page-info">Page {page} of {totalPages}</span>
          <button className="adm-page-btn" disabled={page <= 1} onClick={() => loadTxns(page - 1)}>‹</button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`adm-page-btn ${p === page ? 'adm-page-active' : ''}`}
              onClick={() => loadTxns(p)}
            >
              {p}
            </button>
          ))}
          <button className="adm-page-btn" disabled={page >= totalPages} onClick={() => loadTxns(page + 1)}>›</button>
        </div>
      )}
    </div>
  );
}
