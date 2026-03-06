import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import './admin.css';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const STATUS_COLORS = {
  open:        'adm-badge-red',
  'in-progress': 'adm-badge-orange',
  resolved:    'adm-badge-green',
  closed:      'adm-badge-grey',
};

export default function AdminHelpPage() {
  const navigate = useNavigate();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusCounts, setStatusCounts] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Detail / reply modal
  const [selected, setSelected] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNote, setEditNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');

  const loadQueries = useCallback(async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: p, limit: 15 };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      const res = await adminAPI.getHelpQueries(params);
      const d = res.data;
      setQueries(d.helpQueries || []);
      setTotalPages(d.pages || d.totalPages || 1);
      setTotal(d.total || 0);
      setPage(d.page || p);
      setStatusCounts(d.statusCounts || []);
    } catch (err) {
      if (err.response?.status === 401) { navigate('/admin/login', { replace: true }); return; }
      setError(err.response?.message || 'Failed to load queries.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, navigate]);

  useEffect(() => { loadQueries(1); }, [loadQueries]);

  const openDetail = (q) => {
    setSelected(q);
    setEditStatus(q.status);
    setEditNote(q.adminNote || '');
    setUpdateMsg('');
  };

  const handleUpdate = async () => {
    setUpdating(true);
    setUpdateMsg('');
    try {
      await adminAPI.updateHelpQuery(selected._id, { status: editStatus, adminNote: editNote });
      setUpdateMsg('Updated successfully.');
      // Refresh list
      setSelected(prev => ({ ...prev, status: editStatus, adminNote: editNote }));
      loadQueries(page);
    } catch (err) {
      setUpdateMsg(err.response?.data?.message || 'Update failed.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this help query?')) return;
    try {
      await adminAPI.deleteHelpQuery(id);
      if (selected?._id === id) setSelected(null);
      loadQueries(page);
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  // Count helper
  const getCount = (status) => {
    const found = statusCounts.find(s => s._id === status);
    return found ? found.count : 0;
  };

  return (
    <>
      {/* Summary badges */}
      <div className="adm-stats-grid" style={{ marginBottom: 20 }}>
        {[
          { label: 'Open',        status: 'open',        icon: '🔴', color: 'adm-red'    },
          { label: 'In Progress', status: 'in-progress', icon: '🟡', color: 'adm-orange' },
          { label: 'Resolved',    status: 'resolved',    icon: '🟢', color: 'adm-green'  },
          { label: 'Closed',      status: 'closed',      icon: '⚪', color: 'adm-blue'   },
        ].map(c => (
          <div
            className="adm-stat-card"
            key={c.status}
            style={{ cursor: 'pointer', outline: statusFilter === c.status ? '2px solid #3D1F8F' : 'none' }}
            onClick={() => setStatusFilter(prev => prev === c.status ? '' : c.status)}
          >
            <div className={`adm-stat-icon ${c.color}`}>{c.icon}</div>
            <div className="adm-stat-info">
              <div className="adm-stat-value">{getCount(c.status)}</div>
              <div className="adm-stat-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="adm-card">
        <div className="adm-card-header">
          <h3 className="adm-card-title">Help Queries ({total})</h3>
          <div className="adm-filters">
            <input
              className="adm-input"
              placeholder="Search name / email / query…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: 240 }}
              onKeyDown={e => e.key === 'Enter' && loadQueries(1)}
            />
            <select className="adm-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <button className="adm-btn adm-btn-primary" onClick={() => loadQueries(1)}>Search</button>
          </div>
        </div>

        {error && <div className="adm-alert-error" style={{ margin: '12px 22px' }}>{error}</div>}

        <div className="adm-table-wrap">
          {loading ? (
            <div className="adm-loading">Loading queries…</div>
          ) : queries.length === 0 ? (
            <div className="adm-empty">No help queries found.</div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Query</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {queries.map((q, idx) => (
                  <tr key={q._id}>
                    <td>{(page - 1) * 15 + idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>{q.name}</td>
                    <td style={{ fontSize: 12 }}>{q.email}</td>
                    <td style={{ fontSize: 12 }}>{q.phone || '—'}</td>
                    <td style={{ maxWidth: 220 }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220, fontSize: 13 }}>
                        {q.query}
                      </div>
                    </td>
                    <td>
                      <span className={`adm-badge ${STATUS_COLORS[q.status] || 'adm-badge-grey'}`} style={{ textTransform: 'capitalize' }}>
                        {q.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>{fmtDate(q.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="adm-btn adm-btn-outline adm-btn-sm" onClick={() => openDetail(q)}>
                          View
                        </button>
                        <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => handleDelete(q._id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && totalPages > 1 && (
          <div className="adm-pagination">
            <span className="adm-page-info">Page {page} of {totalPages}</span>
            <button className="adm-page-btn" disabled={page <= 1} onClick={() => loadQueries(page - 1)}>‹</button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                className={`adm-page-btn ${p === page ? 'adm-page-active' : ''}`}
                onClick={() => loadQueries(p)}
              >
                {p}
              </button>
            ))}
            <button className="adm-page-btn" disabled={page >= totalPages} onClick={() => loadQueries(page + 1)}>›</button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="adm-modal-overlay" onClick={() => setSelected(null)}>
          <div className="adm-modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <button className="adm-modal-close" onClick={() => setSelected(null)}>✕</button>
            <h3 className="adm-modal-title">Help Query Detail</h3>

            {[
              ['From',    selected.name],
              ['Email',   selected.email],
              ['Phone',   selected.phone || '—'],
              ['Submitted', fmtDate(selected.createdAt)],
            ].map(([k, v]) => (
              <div className="adm-detail-row" key={k}>
                <span className="adm-detail-key">{k}</span>
                <span className="adm-detail-val">{v}</span>
              </div>
            ))}

            <div style={{ marginTop: 16, marginBottom: 16 }}>
              <div className="adm-form-label" style={{ marginBottom: 8 }}>Query</div>
              <div style={{
                background: '#f8f6ff', border: '1px solid #ede8ff', borderRadius: 10,
                padding: '12px 14px', fontSize: 14, lineHeight: 1.6, color: '#333',
                whiteSpace: 'pre-wrap', wordBreak: 'break-word'
              }}>
                {selected.query}
              </div>
            </div>

            <div className="adm-form-row">
              <label className="adm-form-label">Update Status</label>
              <select
                className="adm-select"
                style={{ width: '100%' }}
                value={editStatus}
                onChange={e => setEditStatus(e.target.value)}
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="adm-form-row">
              <label className="adm-form-label">Admin Note (internal)</label>
              <textarea
                className="adm-input"
                style={{ width: '100%', minHeight: 80, resize: 'vertical', boxSizing: 'border-box' }}
                placeholder="Add an internal note…"
                value={editNote}
                onChange={e => setEditNote(e.target.value)}
              />
            </div>

            {updateMsg && (
              <div className={updateMsg.includes('success') ? 'adm-alert-success' : 'adm-alert-error'}>
                {updateMsg}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="adm-btn adm-btn-primary" onClick={handleUpdate} disabled={updating}>
                {updating ? 'Saving…' : 'Save Changes'}
              </button>
              <button className="adm-btn adm-btn-danger" onClick={() => handleDelete(selected._id)}>
                Delete Query
              </button>
              <button className="adm-btn adm-btn-outline" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
