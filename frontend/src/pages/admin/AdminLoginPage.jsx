import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import './admin.css';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (localStorage.getItem('adminToken')) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      let payload;
      try {
        // Path A: master admin (User model)
        const res = await adminAPI.login(email.trim(), password);
        payload = res.data?.data || res.data;
      } catch (masterErr) {
        if (masterErr.response?.status === 401) {
          // Path B: sub-admin / AdminAccount model
          const res = await adminAPI.subAdminLogin(email.trim(), password);
          payload = res.data?.data || res.data || res;
        } else {
          throw masterErr;
        }
      }
      localStorage.setItem('adminToken', payload.token);
      localStorage.setItem('adminUser', JSON.stringify(payload.admin || payload.account || {}));
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-login-page">
      <div className="adm-login-box">
        <div className="adm-login-logo">
          <span style={{ fontSize: 36 }}>🛡️</span>
        </div>
        <h1 className="adm-login-title">Admin Panel</h1>
        <p className="adm-login-subtitle">BHARAT RECORDS</p>

        {error && <div className="adm-alert-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="adm-form-row">
            <label className="adm-form-label">Email Address</label>
            <input
              className="adm-input"
              style={{ width: '100%', boxSizing: 'border-box' }}
              type="email"
              placeholder="admin@bharatrecords.in"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="adm-form-row">
            <label className="adm-form-label">Password</label>
            <input
              className="adm-input"
              style={{ width: '100%', boxSizing: 'border-box' }}
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button className="adm-login-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
