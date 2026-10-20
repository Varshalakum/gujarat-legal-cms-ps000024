import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconScale } from '../components/Icons';

export const LoginPage = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username / Email is required.');
      return;
    }
    if (!password.trim()) {
      setError('Password is required.');
      return;
    }

    try {
      setLoading(true);
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const quickLoginAs = async (role) => {
    try {
      setLoading(true);
      setError('');
      const loginId = role.login || role.username;
      const pwd = role.password || 'password123';
      setUsername(loginId);
      setPassword(pwd);
      await login(loginId, pwd);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoRoles = [
    { username: 'admin', login: 'admin', password: 'Admin@123', title: 'System Administrator', name: 'Admin Console', dept: 'Legal Department', badge: 'Super Admin' },
    { username: 'verifier1', login: 'verifier1', password: 'Verifier@123', title: 'Bill Scrutiny Verifier', name: 'Vikas Patel', dept: 'Legal Scrutiny Cell', badge: 'Verifier (≤ ₹50k)' },
    { username: 'approver1', login: 'approver1', password: 'Approver@123', title: 'Sanctioning Approver', name: 'Anjali Sharma', dept: 'Law Office', badge: 'Approver (≤ ₹2L)' },
    { username: 'depthead1', login: 'depthead1', password: 'Depthead@123', title: 'Department Head', name: 'Rajesh Mehta', dept: 'State Secretariat', badge: 'HOD (> ₹2L)' },
    { username: 'legal_sharma', login: 'legal_sharma', password: 'password123', title: 'Legal Officer', name: 'K. Sharma', dept: 'Revenue Department', badge: 'Officer in Charge' },
    { username: 'advocate_trivedi', login: 'advocate_trivedi', password: 'password123', title: 'Advocate / Counsel', name: 'Shri R. K. Trivedi', dept: 'High Court', badge: 'Standing Counsel' },
  ];

  return (
    <div className="login-portal-wrapper">
      <div className="login-header-strip">
        <Link to="/" className="back-directory-link">
          &larr; Back to Authority Panels Directory
        </Link>
        <div className="portal-branding-right">
          <span>Government of Gujarat</span>
          <span>&bull;</span>
          <a href="/portal.html" target="_blank" rel="noopener noreferrer">
            Public Information Portal
          </a>
        </div>
      </div>

      <div className="login-card-container">
        <div className="login-brand-header">
          <div className="emblem-circle-small">
            <IconScale size={28} color="var(--primary-navy)" />
          </div>
          <h2>Government of Gujarat</h2>
          <h3>Legal Department — Case Management System</h3>
          <p>Official Authentication Gateway for Advocates, Officers &amp; Treasury</p>
        </div>

        {error && (
          <div className="login-error-alert" role="alert">
            <strong>Authentication Failed:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-main-form">
          <div className="form-input-group">
            <label htmlFor="username">Username or Official Email</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. legal_sharma or advocate_trivedi"
              required
            />
          </div>

          <div className="form-input-group">
            <label htmlFor="password">Security Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? 'Verifying Credentials...' : 'Sign In to Workspace &rarr;'}
          </button>
        </form>

        <div className="login-divider">
          <span>OR QUICK ACCESS BY ROLE</span>
        </div>

        <div className="quick-roles-grid">
          {demoRoles.map((r) => (
            <button
              key={r.username}
              type="button"
              className="quick-role-card-btn"
              disabled={loading}
              onClick={() => quickLoginAs(r.username)}
            >
              <div className="quick-role-badge">{r.badge}</div>
              <div className="quick-role-title">{r.title}</div>
              <div className="quick-role-name">{r.name}</div>
              <div className="quick-role-dept">{r.dept}</div>
            </button>
          ))}
        </div>
      </div>

      <footer className="login-footer">
        <p>
          &copy; {new Date().getFullYear()} Legal Department, Government of Gujarat.
          All actions are securely audited under Government IT and GIGW standards.
        </p>
      </footer>
    </div>
  );
};

export default LoginPage;
