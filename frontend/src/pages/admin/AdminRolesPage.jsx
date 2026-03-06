import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import './admin.css';

const SECTIONS = [
  { key: 'dashboard',    label: 'Dashboard' },
  { key: 'users',        label: 'Users' },
  { key: 'documents',    label: 'Documents' },
  { key: 'transactions', label: 'Transactions' },
  { key: 'wallets',      label: 'Wallets' },
  { key: 'helpQueries',  label: 'Help Queries' },
  { key: 'banners',      label: 'Banners' },
  { key: 'adminRoles',   label: 'Admin Roles' },
];
const PERMS = ['view', 'edit', 'manage', 'delete'];
const ROLES = [
  { value: 'sub-admin',    label: 'Sub Admin' },
  { value: 'admin',        label: 'Admin' },
  { value: 'master-admin', label: 'Master Admin' },
  { value: 'super-admin',  label: 'Super Admin' },
];

const emptyPermissions = () => {
  const p = {};
  SECTIONS.forEach(s => { p[s.key] = { view: false, edit: false, manage: false, delete: false }; });
  return p;
};

const roleBadgeColor = (role) => {
  const map = {
    'super-admin':  { bg: '#f3e5f5', color: '#6a1b9a' },
    'master-admin': { bg: '#e8eaf6', color: '#283593' },
    'admin':        { bg: '#e3f2fd', color: '#1565c0' },
    'sub-admin':    { bg: '#e8f5e9', color: '#2e7d32' },
  };
  return map[role] || { bg: '#f5f5f5', color: '#555' };
};

const ROLE_LABEL = Object.fromEntries(ROLES.map(r => [r.value, r.label]));

export default function AdminRolesPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // form
  const [editing, setEditing] = useState(null); // account object when editing
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('sub-admin');
  const [permissions, setPermissions] = useState(emptyPermissions());
  const [showPassword, setShowPassword] = useState(false);

  // reset-password modal
  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAdminAccounts();
      setAccounts(res.data || []);
    } catch { setError('Failed to load admin accounts'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAccounts(); }, []);

  // ── form helpers ───────────────────────────────────────────────────────────
  const clearForm = () => {
    setEditing(null);
    setName(''); setEmail(''); setPassword(''); setRole('sub-admin');
    setPermissions(emptyPermissions()); setShowPassword(false);
    setError(''); setSuccess('');
  };

  const startEdit = (acc) => {
    setEditing(acc);
    setName(acc.name);
    setEmail(acc.email);
    setPassword('');
    setRole(acc.role);
    // deep-copy permissions
    const p = emptyPermissions();
    SECTIONS.forEach(s => {
      if (acc.permissions?.[s.key]) {
        p[s.key] = { ...acc.permissions[s.key] };
      }
    });
    setPermissions(p);
    setError(''); setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const togglePerm = (section, perm) => {
    setPermissions(prev => ({
      ...prev,
      [section]: { ...prev[section], [perm]: !prev[section][perm] }
    }));
  };

  // Toggle entire row (all 4 perms)
  const toggleRow = (section) => {
    const current = permissions[section];
    const allOn = PERMS.every(p => current[p]);
    const next = { view: !allOn, edit: !allOn, manage: !allOn, delete: !allOn };
    setPermissions(prev => ({ ...prev, [section]: next }));
  };

  // Toggle entire column (all sections for one perm)
  const toggleCol = (perm) => {
    const allOn = SECTIONS.every(s => permissions[s.key][perm]);
    const updated = { ...permissions };
    SECTIONS.forEach(s => { updated[s.key] = { ...updated[s.key], [perm]: !allOn }; });
    setPermissions(updated);
  };

  // Preset shortcuts
  const applyPreset = (preset) => {
    const p = emptyPermissions();
    if (preset === 'view-only') {
      SECTIONS.forEach(s => { p[s.key].view = true; });
    } else if (preset === 'editor') {
      SECTIONS.forEach(s => { p[s.key].view = true; p[s.key].edit = true; });
    } else if (preset === 'manager') {
      SECTIONS.forEach(s => { p[s.key].view = true; p[s.key].edit = true; p[s.key].manage = true; });
    } else if (preset === 'full') {
      SECTIONS.forEach(s => { PERMS.forEach(perm => { p[s.key][perm] = true; }); });
    }
    setPermissions(p);
  };

  // ── submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (!name.trim()) return setError('Name is required');
    if (!email.trim()) return setError('Email is required');
    if (!editing && (!password || password.length < 6))
      return setError('Password must be at least 6 characters');

    try {
      setSubmitting(true);
      const payload = { name, email, role, permissions };
      if (password) payload.password = password;

      if (editing) {
        await adminAPI.updateAdminAccount(editing._id, payload);
        setSuccess('Admin account updated successfully');
      } else {
        await adminAPI.createAdminAccount(payload);
        setSuccess('Admin account created successfully');
      }
      clearForm();
      fetchAccounts();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await adminAPI.toggleAdminAccount(id);
      fetchAccounts();
    } catch { setError('Failed to toggle status'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this admin account? This cannot be undone.')) return;
    try {
      await adminAPI.deleteAdminAccount(id);
      setSuccess('Admin account deleted');
      fetchAccounts();
    } catch { setError('Failed to delete account'); }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6)
      return setError('Password must be at least 6 characters');
    try {
      setResetting(true);
      await adminAPI.resetAdminAccountPassword(resetTarget._id, newPassword);
      setSuccess('Password reset successfully');
      setResetTarget(null); setNewPassword('');
    } catch { setError('Failed to reset password'); }
    finally { setResetting(false); }
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── Form card ──────────────────────────────────── */}
      <div className="adm-card" style={{ marginBottom: 24, padding: 20 }}>
        <div className="adm-card-header">
          <h2 className="adm-card-title">
            {editing ? `✏️ Edit — ${editing.name}` : '➕ Create New Admin Account'}
          </h2>
          {editing && (
            <button className="adm-btn adm-btn-sm adm-btn-outline" onClick={clearForm}>
              Cancel
            </button>
          )}
        </div>

        {error   && <div style={alertSt('danger')}>{error}</div>}
        {success && <div style={alertSt('success')}>{success}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Basic info row */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 180px' }}>
              <label className="adm-form-label">Name <Req /></label>
              <input className="adm-input" value={name} onChange={e => setName(e.target.value)} placeholder="Full name" />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label className="adm-form-label">Email Address <Req /></label>
              <input className="adm-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" />
            </div>
            <div style={{ flex: '1 1 180px' }}>
              <label className="adm-form-label">
                {editing ? 'New Password (leave blank to keep)' : 'Password'} {!editing && <Req />}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="adm-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={editing ? 'Leave blank to keep current' : 'Min 6 characters'}
                  style={{ paddingRight: 36 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 13 }}
                >{showPassword ? '🙈' : '👁️'}</button>
              </div>
            </div>
            <div style={{ flex: '0 0 160px' }}>
              <label className="adm-form-label">Role <Req /></label>
              <select className="adm-input" value={role} onChange={e => setRole(e.target.value)}>
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#3D1F8F' }}>Section Permissions</span>
              <span style={{ fontSize: 12, color: '#999' }}>Quick presets:</span>
              {[['view-only', 'View Only'], ['editor', 'Editor'], ['manager', 'Manager'], ['full', 'Full Access']].map(([k, l]) => (
                <button key={k} type="button" className="adm-btn adm-btn-sm adm-btn-outline"
                  style={{ fontSize: 11, padding: '3px 10px' }}
                  onClick={() => applyPreset(k)}>{l}</button>
              ))}
            </div>

            <div className="adm-table-wrap">
              <table className="adm-table" style={{ minWidth: 540 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', minWidth: 130 }}>Section</th>
                    {PERMS.map(p => (
                      <th key={p} style={{ textAlign: 'center', textTransform: 'capitalize', cursor: 'pointer' }}
                        onClick={() => toggleCol(p)}
                        title={`Click to toggle all ${p}`}>
                        {p} ⟳
                      </th>
                    ))}
                    <th style={{ textAlign: 'center', minWidth: 60 }}>All</th>
                  </tr>
                </thead>
                <tbody>
                  {SECTIONS.map(s => {
                    const sp = permissions[s.key];
                    const allOn = PERMS.every(p => sp[p]);
                    return (
                      <tr key={s.key}>
                        <td style={{ fontWeight: 500, color: '#333', fontSize: 13 }}>{s.label}</td>
                        {PERMS.map(p => (
                          <td key={p} style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={!!sp[p]}
                              onChange={() => togglePerm(s.key, p)}
                              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#3D1F8F' }}
                            />
                          </td>
                        ))}
                        <td style={{ textAlign: 'center' }}>
                          <button type="button"
                            onClick={() => toggleRow(s.key)}
                            className={`adm-btn adm-btn-sm ${allOn ? 'adm-btn-danger' : 'adm-btn-success'}`}
                            style={{ fontSize: 10, padding: '2px 8px' }}>
                            {allOn ? 'Clear' : 'All'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <button className="adm-btn adm-btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : editing ? 'Update Admin Account' : 'Create Admin Account'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Account list ──────────────────────────────── */}
      <div className="adm-card" style={{ padding: 20 }}>
        <div className="adm-card-header">
          <h2 className="adm-card-title">All Admin Accounts ({accounts.length})</h2>
        </div>

        {loading ? (
          <div className="adm-loading">Loading…</div>
        ) : accounts.length === 0 ? (
          <p style={{ color: '#888', padding: '14px 0' }}>No admin accounts yet.</p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Permissions summary</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map(acc => {
                  const { bg, color } = roleBadgeColor(acc.role);
                  const permSummary = SECTIONS
                    .filter(s => acc.permissions?.[s.key] && PERMS.some(p => acc.permissions[s.key][p]))
                    .map(s => {
                      const grantedPerms = PERMS.filter(p => acc.permissions[s.key][p]);
                      return `${s.label}: ${grantedPerms.join(', ')}`;
                    });

                  return (
                    <tr key={acc._id}>
                      <td style={{ fontWeight: 600 }}>{acc.name}</td>
                      <td style={{ fontSize: 13, color: '#555' }}>{acc.email}</td>
                      <td>
                        <span style={{ background: bg, color, fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {ROLE_LABEL[acc.role] || acc.role}
                        </span>
                      </td>
                      <td style={{ maxWidth: 250 }}>
                        {permSummary.length === 0
                          ? <span style={{ color: '#bbb', fontSize: 12 }}>No permissions</span>
                          : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                              {permSummary.map((s, i) => (
                                <span key={i} style={{ fontSize: 10, background: '#f0eeff', color: '#3D1F8F', padding: '2px 7px', borderRadius: 10, whiteSpace: 'nowrap' }}>{s}</span>
                              ))}
                            </div>
                          )}
                      </td>
                      <td>
                        <span style={{
                          fontSize: 11,
                          padding: '3px 10px',
                          borderRadius: 20,
                          background: acc.isActive ? '#e8f5e9' : '#fce4ec',
                          color: acc.isActive ? '#2e7d32' : '#b71c1c',
                          fontWeight: 600
                        }}>
                          {acc.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          <button className="adm-btn adm-btn-sm adm-btn-primary" onClick={() => startEdit(acc)}>Edit</button>
                          <button
                            className={`adm-btn adm-btn-sm ${acc.isActive ? 'adm-btn-warning' : 'adm-btn-success'}`}
                            onClick={() => handleToggle(acc._id)}
                          >{acc.isActive ? 'Deactivate' : 'Activate'}</button>
                          <button
                            className="adm-btn adm-btn-sm adm-btn-outline"
                            onClick={() => { setResetTarget(acc); setNewPassword(''); setError(''); }}
                          >🔑 Reset Pwd</button>
                          <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => handleDelete(acc._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Reset Password Modal ────────────────────────── */}
      {resetTarget && (
        <div style={modalOverlaySt} onClick={() => setResetTarget(null)}>
          <div style={modalBoxSt} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 4px', color: '#3D1F8F' }}>🔑 Reset Password</h3>
            <p style={{ margin: '0 0 16px', color: '#666', fontSize: 13 }}>
              Resetting password for <strong>{resetTarget.name}</strong> ({resetTarget.email})
            </p>
            {error && <div style={alertSt('danger')}>{error}</div>}
            {success && <div style={alertSt('success')}>{success}</div>}
            <label className="adm-form-label">New Password (min 6 chars)</label>
            <input
              className="adm-input"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              style={{ marginBottom: 14 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="adm-btn adm-btn-primary" onClick={handleResetPassword} disabled={resetting}>
                {resetting ? 'Resetting…' : 'Reset Password'}
              </button>
              <button className="adm-btn adm-btn-outline" onClick={() => { setResetTarget(null); setError(''); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── tiny helpers ──────────────────────────────────────────────────────────────
const Req = () => <span style={{ color: '#c00' }}> *</span>;

const alertSt = (type) => ({
  padding: '10px 14px',
  borderRadius: 8,
  marginBottom: 12,
  background: type === 'danger' ? '#fdecea' : '#e8f5e9',
  color: type === 'danger' ? '#c62828' : '#2e7d32',
  fontSize: 13,
  border: `1px solid ${type === 'danger' ? '#ef9a9a' : '#a5d6a7'}`
});

const modalOverlaySt = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
};

const modalBoxSt = {
  background: '#fff', borderRadius: 14, padding: 28,
  width: '100%', maxWidth: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.18)'
};
