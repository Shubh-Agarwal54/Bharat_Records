import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import './admin.css';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function AdminDocumentsPage() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const loadDocs = useCallback(async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: p, limit: 15 };
      if (search.trim()) params.search = search.trim();
      if (categoryFilter) params.category = categoryFilter;
      const res = await adminAPI.getDocuments(params);
      const d = res.data.data || res.data;
      setDocs(d.documents || []);
      setTotalPages(d.pages || d.totalPages || 1);
      setTotal(d.total || 0);
      setPage(d.page || p);
    } catch (err) {
      if (err.response?.status === 401) { navigate('/admin/login', { replace: true }); return; }
      setError(err.response?.data?.message || 'Failed to load documents.');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, navigate]);

  useEffect(() => { loadDocs(1); }, [loadDocs]);

  const [viewingId, setViewingId] = useState(null);

  const handleView = async (doc) => {
    setViewingId(doc._id);
    try {
      const res = await adminAPI.getDocumentSignedUrl(doc._id);
      const url = res.data?.url;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        alert('Could not get signed URL.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to open document.');
    } finally {
      setViewingId(null);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Delete this document? This cannot be undone.')) return;
    try {
      await adminAPI.deleteDocument(docId);
      loadDocs(page);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete document.');
    }
  };

  const categories = ['identity', 'education', 'financial', 'medical', 'property', 'vehicle', 'insurance', 'other'];

  return (
    <div className="adm-card">
      <div className="adm-card-header">
        <h3 className="adm-card-title">All Documents ({total})</h3>
        <div className="adm-filters">
          <input
            className="adm-input"
            placeholder="Search document name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 220 }}
            onKeyDown={e => e.key === 'Enter' && loadDocs(1)}
          />
          <select className="adm-select" value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); }}>
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <button className="adm-btn adm-btn-primary" onClick={() => loadDocs(1)}>Search</button>
        </div>
      </div>

      {error && <div className="adm-alert-error" style={{ margin: '12px 22px' }}>{error}</div>}

      <div className="adm-table-wrap">
        {loading ? (
          <div className="adm-loading">Loading documents…</div>
        ) : docs.length === 0 ? (
          <div className="adm-empty">No documents found.</div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Document Name / Type</th>
                <th>Category</th>
                <th>Owner</th>
                <th>File Type</th>
                <th>Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc, idx) => (
                <tr key={doc._id}>
                  <td>{(page - 1) * 15 + idx + 1}</td>
                  <td>
                    <strong>{doc.title || doc.documentName || '—'}</strong>
                    <div style={{ fontSize: 12, color: '#888' }}>{doc.documentType || '—'}</div>
                  </td>
                  <td>
                    <span className="adm-badge adm-badge-blue" style={{ textTransform: 'capitalize' }}>
                      {doc.category || '—'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12 }}>
                    {doc.user?.fullName || doc.user?.email || doc.user?.mobile || '—'}
                  </td>
                  <td>
                    <span className="adm-badge adm-badge-grey" style={{ textTransform: 'uppercase', fontSize: 11 }}>
                      {doc.fileType || '—'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12 }}>{fmtDate(doc.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="adm-btn adm-btn-outline adm-btn-sm"
                        onClick={() => handleView(doc)}
                        disabled={viewingId === doc._id}
                      >
                        {viewingId === doc._id ? '…' : 'View'}
                      </button>
                      <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => handleDelete(doc._id)}>
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
          <button className="adm-page-btn" disabled={page <= 1} onClick={() => loadDocs(page - 1)}>‹</button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`adm-page-btn ${p === page ? 'adm-page-active' : ''}`}
              onClick={() => loadDocs(p)}
            >
              {p}
            </button>
          ))}
          <button className="adm-page-btn" disabled={page >= totalPages} onClick={() => loadDocs(page + 1)}>›</button>
        </div>
      )}
    </div>
  );
}
