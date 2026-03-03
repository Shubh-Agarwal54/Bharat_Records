import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import './admin.css';

const NavIcon = ({ type }) => {
  const icons = {
    dashboard: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    users: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    documents: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    transactions: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    wallets: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
      </svg>
    ),
    logout: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
  };
  return <span className="adm-nav-icon">{icons[type]}</span>;
};

export default function AdminLayout() {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login', { replace: true });
      return;
    }
    try {
      const u = JSON.parse(localStorage.getItem('adminUser') || '{}');
      setAdminUser(u);
    } catch (_) {}
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login', { replace: true });
  };

  const pageTitles = {
    '/admin': 'Dashboard',
    '/admin/users': 'User Management',
    '/admin/documents': 'Documents',
    '/admin/transactions': 'Transactions',
    '/admin/wallets': 'Wallets',
  };

  const currentPath = window.location.pathname;
  const pageTitle = pageTitles[currentPath] || 'Admin Panel';

  return (
    <div className="adm-wrap">
      {/* Sidebar */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar-logo">
          <div style={{ fontSize: 20, color: '#fff', fontWeight: 800, letterSpacing: 1 }}>
            🛡️ Bharat Records
          </div>
          <div className="adm-sidebar-title">Admin Panel</div>
        </div>

        <nav className="adm-nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => `adm-nav-item${isActive ? ' adm-active' : ''}`}
          >
            <NavIcon type="dashboard" /> Dashboard
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) => `adm-nav-item${isActive ? ' adm-active' : ''}`}
          >
            <NavIcon type="users" /> Users
          </NavLink>
          <NavLink
            to="/admin/documents"
            className={({ isActive }) => `adm-nav-item${isActive ? ' adm-active' : ''}`}
          >
            <NavIcon type="documents" /> Documents
          </NavLink>
          <NavLink
            to="/admin/transactions"
            className={({ isActive }) => `adm-nav-item${isActive ? ' adm-active' : ''}`}
          >
            <NavIcon type="transactions" /> Transactions
          </NavLink>
          <NavLink
            to="/admin/wallets"
            className={({ isActive }) => `adm-nav-item${isActive ? ' adm-active' : ''}`}
          >
            <NavIcon type="wallets" /> Wallets
          </NavLink>
        </nav>

        <div className="adm-sidebar-footer">
          <button className="adm-logout-btn" onClick={handleLogout}>
            <NavIcon type="logout" /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="adm-main">
        <header className="adm-topbar">
          <h1 className="adm-topbar-title">{pageTitle}</h1>
          <div className="adm-topbar-admin">
            <div className="adm-admin-avatar">
              {(adminUser?.name || adminUser?.email || 'A')[0].toUpperCase()}
            </div>
            <span className="adm-admin-name">{adminUser?.name || adminUser?.email || 'Admin'}</span>
          </div>
        </header>

        <main className="adm-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
