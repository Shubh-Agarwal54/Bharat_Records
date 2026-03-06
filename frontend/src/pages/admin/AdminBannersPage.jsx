import React, { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../../services/api';
import './admin.css';

const SIZE_HINT = 'Recommended: 1000 × 400 px · Max 2 MB · JPG / PNG / WebP';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // form state
  const [mode, setMode] = useState('url'); // 'url' | 'file'
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [order, setOrder] = useState(0);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const fileRef = useRef(null);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAllBanners();
      setBanners(res.data || []);
    } catch {
      setError('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  const clearForm = () => {
    setTitle(''); setImageUrl(''); setLinkUrl(''); setOrder(0);
    setFile(null); setPreview('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) { setError('File exceeds 2 MB limit'); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (mode === 'url' && !imageUrl.trim()) { setError('Please enter an image URL'); return; }
    if (mode === 'file' && !file) { setError('Please select an image file'); return; }

    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append('title', title);
      fd.append('linkUrl', linkUrl);
      fd.append('order', order);
      if (mode === 'url') {
        fd.append('imageUrl', imageUrl);
      } else {
        fd.append('image', file);
      }
      await adminAPI.createBanner(fd);
      setSuccess('Banner added successfully');
      clearForm();
      fetchBanners();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add banner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await adminAPI.toggleBanner(id);
      fetchBanners();
    } catch { setError('Failed to toggle banner'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await adminAPI.deleteBanner(id);
      setSuccess('Banner deleted');
      fetchBanners();
    } catch { setError('Failed to delete banner'); }
  };

  const handleOrderChange = async (id, newOrder) => {
    try {
      await adminAPI.updateBannerOrder(id, newOrder);
      fetchBanners();
    } catch { setError('Failed to update order'); }
  };

  return (
    <div>
      {/* ── Add Banner Form ──────────────────────────────── */}
      <div className="adm-card" style={{ marginBottom: 24 ,padding:'20px'}}>
        <div className="adm-card-header">
          <h2 className="adm-card-title">Add New Banner</h2>
        </div>

        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#888' }}>{SIZE_HINT}</p>

        {error && <div className="adm-alert adm-alert-danger" style={alertStyle('danger')}>{error}</div>}
        {success && <div className="adm-alert adm-alert-success" style={alertStyle('success')}>{success}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Mode toggle */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className={`adm-btn adm-btn-sm ${mode === 'url' ? 'adm-btn-primary' : 'adm-btn-outline'}`}
              onClick={() => setMode('url')}
            >🔗 Image URL</button>
            <button
              type="button"
              className={`adm-btn adm-btn-sm ${mode === 'file' ? 'adm-btn-primary' : 'adm-btn-outline'}`}
              onClick={() => setMode('file')}
            >📁 Upload File</button>
          </div>

          <div className="adm-form-row" style={{ gap: 14, display: 'flex', flexWrap: 'wrap' }}>
            {/* Title */}
            <div style={{ flex: '1 1 200px' }}>
              <label className="adm-form-label">Banner Title (optional)</label>
              <input className="adm-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Summer Offer" />
            </div>
            {/* Order */}
            <div style={{ flex: '0 0 100px' }}>
              <label className="adm-form-label">Display Order</label>
              <input className="adm-input" type="number" min="0" value={order} onChange={e => setOrder(e.target.value)} />
            </div>
            {/* Link URL */}
            <div style={{ flex: '1 1 220px' }}>
              <label className="adm-form-label">Click-through URL (optional)</label>
              <input className="adm-input" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>

          {/* Image source */}
          {mode === 'url' ? (
            <div>
              <label className="adm-form-label">Image URL <span style={{ color: '#c00' }}>*</span></label>
              <input
                className="adm-input"
                value={imageUrl}
                onChange={e => { setImageUrl(e.target.value); setPreview(e.target.value); }}
                placeholder="https://your-cdn.com/banner.jpg"
              />
            </div>
          ) : (
            <div>
              <label className="adm-form-label">Upload Image <span style={{ color: '#c00' }}>*</span></label>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="adm-input"
                style={{ padding: '8px' }}
                onChange={handleFileChange}
              />
              <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{SIZE_HINT}</p>
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div style={{ marginTop: 8 }}>
              <label className="adm-form-label">Preview</label>
              <img
                src={preview}
                alt="preview"
                style={{ maxWidth: '100%', maxHeight: 160, borderRadius: 8, objectFit: 'cover', border: '1px solid #ddd' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          <div>
            <button className="adm-btn adm-btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : '+ Add Banner'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Banner List ──────────────────────────────────── */}
      <div className="adm-card" style={{padding:'20px'}}>
        <div className="adm-card-header">
          <h2 className="adm-card-title">All Banners ({banners.length})</h2>
        </div>

        {loading ? (
          <div className="adm-loading">Loading banners…</div>
        ) : banners.length === 0 ? (
          <p style={{ color: '#888', padding: '16px 0' }}>No banners yet. Add one above.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {banners.map(b => (
              <div key={b._id} style={bannerRowStyle(b.isActive)}>
                {/* Thumbnail */}
                <img
                  src={b.imageUrl}
                  alt={b.title || 'banner'}
                  style={{ width: 160, height: 64, objectFit: 'cover', borderRadius: 6, flexShrink: 0, border: '1px solid #ddd' }}
                  onError={e => { e.target.src = 'https://via.placeholder.com/160x64?text=No+Image'; }}
                />

                {/* Meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#222' }}>
                    {b.title || <em style={{ color: '#aaa' }}>No title</em>}
                    &nbsp;
                    <span style={badgeStyle(b.isActive)}>{b.isActive ? 'Active' : 'Inactive'}</span>
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#888', wordBreak: 'break-all' }}>{b.imageUrl}</p>
                  {b.linkUrl && <p style={{ margin: '2px 0 0', fontSize: 12, color: '#555' }}>Link: {b.linkUrl}</p>}
                </div>

                {/* Order input */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <label style={{ fontSize: 11, color: '#888' }}>Order</label>
                  <input
                    type="number"
                    min="0"
                    defaultValue={b.order}
                    style={{ width: 56, padding: '4px 6px', border: '1px solid #ddd', borderRadius: 6, textAlign: 'center', fontSize: 13 }}
                    onBlur={e => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val !== b.order) handleOrderChange(b._id, val);
                    }}
                  />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <button
                    className={`adm-btn adm-btn-sm ${b.isActive ? 'adm-btn-warning' : 'adm-btn-success'}`}
                    onClick={() => handleToggle(b._id)}
                  >{b.isActive ? 'Deactivate' : 'Activate'}</button>
                  <button
                    className="adm-btn adm-btn-sm adm-btn-danger"
                    onClick={() => handleDelete(b._id)}
                  >Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────────
const alertStyle = (type) => ({
  padding: '10px 14px',
  borderRadius: 8,
  marginBottom: 12,
  background: type === 'danger' ? '#fdecea' : '#e8f5e9',
  color: type === 'danger' ? '#c62828' : '#2e7d32',
  fontSize: 13,
  border: `1px solid ${type === 'danger' ? '#ef9a9a' : '#a5d6a7'}`
});

const bannerRowStyle = (isActive) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  padding: 12,
  borderRadius: 10,
  border: `1px solid ${isActive ? '#e0e0e0' : '#f3e5f5'}`,
  background: isActive ? '#fff' : '#fafafa',
  flexWrap: 'wrap'
});

const badgeStyle = (isActive) => ({
  display: 'inline-block',
  fontSize: 11,
  padding: '2px 8px',
  borderRadius: 20,
  background: isActive ? '#e8f5e9' : '#fce4ec',
  color: isActive ? '#2e7d32' : '#b71c1c',
  marginLeft: 4
});
