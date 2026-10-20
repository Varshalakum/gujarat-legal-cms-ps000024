import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { isMockModeEnabled, toggleMockMode } from '../services/api';
import {
  IconScale,
  IconGovernment,
  IconBell,
  IconGlobe,
  IconAlertTriangle,
  IconLiveDot
} from './Icons';

export const Navbar = () => {
  const { user, logout, switchRole } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const [mockActive, setMockActive] = useState(isMockModeEnabled());
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleMockToggle = () => {
    const nextVal = !mockActive;
    toggleMockMode(nextVal);
    setMockActive(nextVal);
  };

  const roles = [
    { key: 'ADVOCATE', label: t('roles.ADVOCATE') },
    { key: 'LEGAL_OFFICER', label: t('roles.LEGAL_OFFICER') },
    { key: 'VERIFIER', label: t('roles.VERIFIER') },
    { key: 'APPROVER', label: t('roles.APPROVER') },
    { key: 'FINANCE_OFFICER', label: t('roles.FINANCE_OFFICER') },
    { key: 'DEPARTMENT_HEAD', label: t('roles.DEPARTMENT_HEAD') },
    { key: 'ADMIN', label: t('roles.ADMIN') },
    { key: 'AUDITOR', label: t('roles.AUDITOR') },
  ];

  return (
    <header className="app-main-header">
      <div className="header-brand-block">
        <Link to="/dashboard" className="brand-logo-link">
          <span className="brand-emblem-mini">
            <IconScale size={22} color="#ffcc80" />
          </span>
          <div>
            <div className="brand-gov-title">{t('govTitle')}</div>
            <div className="brand-sys-title">{t('appTitle')}</div>
          </div>
        </Link>
      </div>

      <div className="header-controls-block">
        {/* Language & API Mode Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '12px' }}>
          <button
            type="button"
            onClick={toggleLanguage}
            title="Switch Language / ભાષા બદલો"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 600,
              background: '#0d47a1',
              color: '#ffffff',
              border: '1px solid #ffffff44',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            <IconGlobe size={13} style={{ marginRight: '5px' }} />
            {lang === 'en' ? 'ગુજરાતી' : 'English'}
          </button>

          <button
            type="button"
            onClick={handleMockToggle}
            title="Toggle between Live Backend REST API and Offline Mock Fallback"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              background: mockActive ? '#e65100' : '#2e7d32',
              color: '#ffffff',
            }}
          >
            {mockActive ? (
              <>
                <IconAlertTriangle size={12} style={{ marginRight: '4px' }} />
                {t('mockMode')}
              </>
            ) : (
              <>
                <IconLiveDot size={8} active={true} />
                {t('liveApi')}
              </>
            )}
          </button>
        </div>

        {user ? (
          <>
            <div className="user-profile-badge">
              <div className="user-avatar-initial">
                {user.name ? user.name.charAt(0) : 'U'}
              </div>
              <div className="user-details-text">
                <span className="user-display-name">{user.name}</span>
                <span className="user-role-dept">
                  <strong>{user.role}</strong> &bull; {user.department || 'Legal Dept'}
                </span>
              </div>
            </div>

            <div className="header-actions-group">
              <div className="role-switcher-wrapper">
                <label htmlFor="role-switcher" className="switcher-label">{t('switchRole')}:</label>
                <select
                  id="role-switcher"
                  className="role-switcher-select"
                  value={user.role}
                  onChange={(e) => switchRole(e.target.value)}
                >
                  {roles.map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <Link to="/" className="nav-panel-link">
                <IconGovernment size={15} style={{ marginRight: '5px' }} />
                {t('panelsDirectory')}
              </Link>

              <Link to="/notifications" className="nav-icon-link" title={t('notifications')}>
                <IconBell size={18} />
              </Link>

              <a
                href="/portal.html"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-portal-link"
              >
                {t('publicPortal')}
              </a>

              <button
                type="button"
                className="logout-action-btn"
                onClick={handleLogout}
              >
                {t('logout')}
              </button>
            </div>
          </>
        ) : (
          <div className="guest-nav-actions">
            <Link to="/" className="nav-panel-link">
              {t('panelsDirectory')}
            </Link>
            <Link to="/login" className="login-action-btn">
              Sign In
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
