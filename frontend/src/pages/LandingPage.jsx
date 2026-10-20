import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  IconScale,
  IconGovernment,
  IconSearch,
  IconClock,
  IconShield,
  IconFileText,
  IconGlobe
} from '../components/Icons';

export const LandingPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Department Panels Configuration
  const panels = [
    {
      id: 'advocate',
      role: 'ADVOCATE',
      username: 'advocate_trivedi',
      title: 'Advocate & Standing Counsel Panel',
      department: 'High Court & District Courts',
      category: 'LEGAL',
      badge: 'Legal Representative',
      badgeColor: '#0284c7',
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      description: 'Manage allocated government briefs, submit fee claim bills, check hearing cause lists, and view attendance certifications.',
      keyActions: [
        { label: 'Submit Fee Bill', path: '/bills/submit' },
        { label: 'My Assigned Cases', path: '/cases' },
        { label: 'Daily Cause List', path: '/hearings' }
      ],
      metrics: { primary: '2 Active Briefs', secondary: '1 Fee Bill Pending' }
    },
    {
      id: 'legal_officer',
      role: 'LEGAL_OFFICER',
      username: 'legal_sharma',
      title: 'Legal Officer Panel',
      department: 'Revenue & Secretariat Department',
      category: 'ADMINISTRATION',
      badge: 'Officer in Charge',
      badgeColor: '#d97706',
      image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
      description: 'Register and monitor state litigation cases, schedule urgent court hearings, review affidavits, and record advocate attendance.',
      keyActions: [
        { label: 'Register New Case', path: '/cases/new' },
        { label: 'Schedule Hearing', path: '/hearings/new' },
        { label: 'Mark Attendance', path: '/hearings/attendance' }
      ],
      metrics: { primary: '3 Active Cases', secondary: '1 Hearing Today' }
    },
    {
      id: 'verifier',
      role: 'VERIFIER',
      username: 'verifier_joshi',
      title: 'Bill Scrutiny & Verification Panel',
      department: 'Legal Department Scrutiny Cell',
      category: 'FINANCE',
      badge: 'Scrutiny Officer',
      badgeColor: '#059669',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
      description: 'Examine advocate fee vouchers against Gujarat Legal Remembrancer (LR) rate schedules, cross-check court boards & certified attendance.',
      keyActions: [
        { label: 'Scrutiny Queue', path: '/bills' },
        { label: 'Audit Attendance', path: '/hearings/attendance' },
        { label: 'Check Rate Schedules', path: '/admin/fee-categories' }
      ],
      metrics: { primary: '2 Bills for Scrutiny', secondary: '1 Overdue 5+ Days' }
    },
    {
      id: 'approver',
      role: 'APPROVER',
      username: 'approver_sec',
      title: 'Sanctioning Authority & Approver Panel',
      department: 'Office of Legal Secretary / Law Department',
      category: 'APPROVAL',
      badge: 'Secretary / Joint Secretary',
      badgeColor: '#7c3aed',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
      description: 'High-level financial sanction inbox. Grant official sanctions, approve fee vouchers, request clarification, or reject discrepancies.',
      keyActions: [
        { label: 'Approval Inbox', path: '/approvals' },
        { label: 'Expenditure Register', path: '/reports/budget' },
        { label: 'Audit Trail', path: '/audit' }
      ],
      metrics: { primary: '₹45,000 In Sanction Queue', secondary: '1 Urgent Sanction' }
    },
    {
      id: 'finance',
      role: 'FINANCE_OFFICER',
      username: 'finance_patel',
      title: 'Finance & Treasury Disbursement Panel',
      department: 'Finance & Accounts Division',
      category: 'FINANCE',
      badge: 'Drawing & Disbursing (DDO)',
      badgeColor: '#2563eb',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
      description: 'Disburse sanctioned payments via RBI Treasury ECS / NEFT, process TDS deductions, manage department budget heads, and reconcile ledger.',
      keyActions: [
        { label: 'Payment Register', path: '/payments' },
        { label: 'Disburse Funds', path: '/payments/new' },
        { label: 'Budget Utilization', path: '/budget' }
      ],
      metrics: { primary: '₹2.5 Cr Total Allocation', secondary: '₹84 Lakh Disbursed' }
    },
    {
      id: 'department_head',
      role: 'DEPARTMENT_HEAD',
      username: 'head_revenue',
      title: 'Department Head & Executive Panel',
      department: 'Principal Secretary (Revenue / Home / Ind.)',
      category: 'ADMINISTRATION',
      badge: 'Principal Secretary',
      badgeColor: '#b91c1c',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      description: 'Departmental oversight, financial exposure tracking across litigation categories, budget cap analytics, and high-stake case reviews.',
      keyActions: [
        { label: 'Executive Dashboard', path: '/dashboard' },
        { label: 'Budget Analytics', path: '/budget' },
        { label: 'High Exposure Cases', path: '/cases' }
      ],
      metrics: { primary: '₹1.78 Cr Total Exposure', secondary: '3 Active Disputes' }
    },
    {
      id: 'admin',
      role: 'ADMIN',
      username: 'admin_sys',
      title: 'System Administrator Control Panel',
      department: 'IT Directorate & Legal E-Governance',
      category: 'SYSTEM',
      badge: 'Super Administrator',
      badgeColor: '#1e293b',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
      description: 'Configure court benches, advocate empanelment, LR fee structures, SLA turn-around thresholds, multi-tier approvals, and user accounts.',
      keyActions: [
        { label: 'User Management', path: '/admin/users' },
        { label: 'Empanel Advocates', path: '/admin/advocates' },
        { label: 'SLA & Workflow Config', path: '/admin/workflow' }
      ],
      metrics: { primary: '9 System Users', secondary: '4 Court Benches Configured' }
    },
    {
      id: 'auditor',
      role: 'AUDITOR',
      username: 'auditor_cag',
      title: 'Statutory Auditor & CAG Panel',
      department: 'Office of the Principal Accountant General (Audit)',
      category: 'AUDIT',
      badge: 'Statutory Auditor',
      badgeColor: '#475569',
      image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
      description: 'Independent audit trail inspection, procedural deviation alerts, budget variance verification, and unalterable audit log extraction.',
      keyActions: [
        { label: 'Audit Trail Logs', path: '/audit' },
        { label: 'Compliance Reports', path: '/reports' },
        { label: 'Disbursement Audit', path: '/payments' }
      ],
      metrics: { primary: '100% Immutable Audit', secondary: '3 Audited Actions' }
    }
  ];

  const handlePanelLogin = async (username) => {
    try {
      setLoggingIn(true);
      await login(username, 'demo123');
      navigate('/dashboard');
    } catch (err) {
      alert('Login error: ' + err.message);
    } finally {
      setLoggingIn(false);
    }
  };

  const filteredPanels = panels.filter((p) => {
    const matchesCategory = activeCategory === 'ALL' || p.category === activeCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="portal-container">
      {/* 1. TOP UTILITY BAR (Pressville Style) */}
      <div className="top-utility-bar">
        <div className="top-utility-inner">
          <div className="utility-left">
            <span>Government of Gujarat</span>
            <span className="separator">|</span>
            <span>Legal Department (કાયદા વિભાગ)</span>
            <span className="separator">|</span>
            <span className="portal-tag">Official e-Governance System</span>
          </div>
          <div className="utility-right">
            <a href="/portal.html" target="_blank" rel="noopener noreferrer" className="utility-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <IconGovernment size={14} />
              Public Information Portal
            </a>
            <span className="separator">|</span>
            <Link to="/login" className="utility-link login-btn-top">
              Direct Sign In
            </Link>
            <div className="lang-switcher">
              <span className="lang-active">EN</span>
              <span>ગુજ</span>
              <span>हिं</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PRESSVILLE HERO BRANDING HEADER */}
      <header className="pressville-header">
        <div className="header-overlay"></div>
        <div className="header-content">
          <div className="emblem-wrapper">
            <div className="emblem-circle">
              <IconScale size={32} color="#ffcc80" />
            </div>
            <div className="header-title-box">
              <h1 className="header-main-title">Legal Case Management System</h1>
              <p className="header-sub-title">
                Government of Gujarat &bull; Official Digital Workflow &amp; Litigation Panel Portal
              </p>
            </div>
          </div>
          <div className="header-quick-stats">
            <div className="stat-pill">
              <span className="stat-num">8</span>
              <span className="stat-lbl">Role Panels</span>
            </div>
            <div className="stat-pill">
              <span className="stat-num">100%</span>
              <span className="stat-lbl">Audited</span>
            </div>
            <div className="stat-pill">
              <span className="stat-num">Fast-Track</span>
              <span className="stat-lbl">Fee Clearance</span>
            </div>
          </div>
        </div>
      </header>

      {/* 3. SUB-NAV / FILTER BAR (Pressville Red/Navy Accent Bar) */}
      <nav className="filter-nav-bar">
        <div className="filter-nav-inner">
          <div className="filter-tabs">
            <button
              className={`filter-btn ${activeCategory === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveCategory('ALL')}
            >
              All Authority Panels
            </button>
            <button
              className={`filter-btn ${activeCategory === 'LEGAL' ? 'active' : ''}`}
              onClick={() => setActiveCategory('LEGAL')}
            >
              Advocates &amp; Counsel
            </button>
            <button
              className={`filter-btn ${activeCategory === 'ADMINISTRATION' ? 'active' : ''}`}
              onClick={() => setActiveCategory('ADMINISTRATION')}
            >
              Officers &amp; Secretariat
            </button>
            <button
              className={`filter-btn ${activeCategory === 'FINANCE' ? 'active' : ''}`}
              onClick={() => setActiveCategory('FINANCE')}
            >
              Scrutiny &amp; Treasury
            </button>
            <button
              className={`filter-btn ${activeCategory === 'APPROVAL' ? 'active' : ''}`}
              onClick={() => setActiveCategory('APPROVAL')}
            >
              Sanction Authorities
            </button>
            <button
              className={`filter-btn ${activeCategory === 'SYSTEM' ? 'active' : ''}`}
              onClick={() => setActiveCategory('SYSTEM')}
            >
              System Admin &amp; Audit
            </button>
          </div>

          <div className="search-box-wrapper">
            <input
              type="text"
              placeholder="Search panel or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="panel-search-input"
            />
            <span className="search-icon-btn">
              <IconSearch size={16} color="var(--primary-navy)" />
            </span>
          </div>
        </div>
      </nav>

      {/* 4. MAIN DIRECTORY SECTION (Pressville Directory Grid) */}
      <main className="directory-main-section">
        <div className="directory-header-row">
          <div>
            <h2 className="directory-title">Authority Working Panels</h2>
            <p className="directory-subtitle">
              Select your authority panel below to log in directly into your tailored workspace. Each role receives a specialized dashboard with designated tasks, approvals, and reports.
            </p>
          </div>
          <div className="directory-count">
            Showing <strong>{filteredPanels.length}</strong> Authority Panels
          </div>
        </div>

        {/* 3x3 Card Grid matching Pressville Directory Layout */}
        <div className="pressville-grid">
          {filteredPanels.map((panel) => (
            <div className="pressville-card" key={panel.id}>
              <div className="card-image-box">
                <img src={panel.image} alt={panel.title} className="card-bg-img" />
                <div className="card-badge" style={{ backgroundColor: panel.badgeColor }}>
                  {panel.badge}
                </div>
                <div className="card-image-overlay">
                  <span className="dept-tag">{panel.department}</span>
                </div>
              </div>

              <div className="card-content-body">
                <h3 className="card-title">{panel.title}</h3>
                <p className="card-description">{panel.description}</p>

                <div className="card-metrics-strip">
                  <div className="metric-chip">
                    <span className="metric-dot"></span>
                    <span>{panel.metrics.primary}</span>
                  </div>
                  <div className="metric-chip secondary">
                    <span>{panel.metrics.secondary}</span>
                  </div>
                </div>

                <div className="card-key-actions">
                  <span className="actions-header">Assigned Responsibilities:</span>
                  <div className="action-tags">
                    {panel.keyActions.map((act, i) => (
                      <span key={i} className="action-tag">
                        &bull; {act.label}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="card-footer-action">
                  <button
                    className="enter-panel-btn"
                    disabled={loggingIn}
                    onClick={() => handlePanelLogin(panel.username)}
                  >
                    <span>Enter {panel.badge} Panel</span>
                    <span className="btn-arrow">&rarr;</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPanels.length === 0 && (
          <div className="no-panels-found">
            <h3>No authority panels match your query</h3>
            <p>Try clearing filters or search term.</p>
            <button onClick={() => { setActiveCategory('ALL'); setSearchQuery(''); }}>
              Reset Filters
            </button>
          </div>
        )}

        {/* 5. PRESSVILLE INFO ACCORDION / HIGHLIGHT BLOCKS */}
        <section className="pressville-info-banner">
          <div className="info-banner-item">
            <div className="info-icon">
              <IconGovernment size={24} color="var(--primary-navy)" />
            </div>
            <div>
              <h4>Single Sign-On Architecture</h4>
              <p>Strict RBAC enforcement ensures each officer accesses only authorized court registers and financial heads.</p>
            </div>
          </div>
          <div className="info-banner-item">
            <div className="info-icon">
              <IconClock size={24} color="var(--accent-saffron)" />
            </div>
            <div>
              <h4>Automated SLA Monitoring</h4>
              <p>Vouchers automatically escalate after 5 days with amber/red visual alerts to prevent fee clearance backlogs.</p>
            </div>
          </div>
          <div className="info-banner-item">
            <div className="info-icon">
              <IconShield size={24} color="var(--accent-green)" />
            </div>
            <div>
              <h4>CAG / AG Audit Readiness</h4>
              <p>Every decision, document upload, rate verification, and bank ECS payment is stamped with an immutable audit trail.</p>
            </div>
          </div>
        </section>
      </main>

      {/* 6. PRESSVILLE DARK FOOTER */}
      <footer className="pressville-footer">
        <div className="footer-columns-wrapper">
          <div className="footer-col about-col">
            <div className="footer-logo">
              <span className="footer-emblem">
                <IconScale size={24} color="#ffcc80" />
              </span>
              <h4>Gujarat Legal Case Management System</h4>
            </div>
            <p className="footer-desc">
              State-of-the-art case tracking, advocate fee disbursement, and litigation lifecycle portal engineered for the Legal Department, Government of Gujarat.
            </p>
            <div className="footer-social-icons">
              <span className="social-circle" title="Court Portals"><IconGovernment size={16} /></span>
              <span className="social-circle" title="Gazette & Notifications"><IconFileText size={16} /></span>
              <span className="social-circle" title="Judicial Guidelines"><IconScale size={16} /></span>
              <span className="social-circle" title="e-Governance"><IconGlobe size={16} /></span>
            </div>
          </div>

          <div className="footer-col">
            <h5>Authority Panels</h5>
            <ul className="footer-links">
              <li><button onClick={() => handlePanelLogin('advocate_trivedi')}>Advocate Panel</button></li>
              <li><button onClick={() => handlePanelLogin('legal_sharma')}>Legal Officer Panel</button></li>
              <li><button onClick={() => handlePanelLogin('verifier_joshi')}>Bill Scrutiny Cell</button></li>
              <li><button onClick={() => handlePanelLogin('approver_sec')}>Sanctioning Authority</button></li>
              <li><button onClick={() => handlePanelLogin('finance_patel')}>Treasury &amp; Finance</button></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Key Services</h5>
            <ul className="footer-links">
              <li><Link to="/portal.html">Cause Lists &amp; Benches</Link></li>
              <li><Link to="/portal.html">Legal Remembrancer Rules</Link></li>
              <li><Link to="/portal.html">Government Notifications</Link></li>
              <li><Link to="/portal.html">Contact Law Department</Link></li>
              <li><Link to="/portal.html">GIGW Compliance</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Support &amp; Helpdesk</h5>
            <p className="support-text">
              Legal Informatics Division<br />
              Block No. 4, 3rd Floor, New Sachivalaya,<br />
              Gandhinagar, Gujarat - 382010
            </p>
            <p className="support-contact">
              <strong>Toll Free:</strong> 1800-233-LEGAL<br />
              <strong>Email:</strong> support-lcms@gujarat.gov.in
            </p>
          </div>
        </div>

        <div className="footer-sub-bar">
          <p>
            &copy; {new Date().getFullYear()} Legal Department, Government of Gujarat. Built for GIGW &amp; NIC Compliance.
          </p>
          <div className="sub-bar-links">
            <a href="/portal.html">Privacy Policy</a>
            <span>&bull;</span>
            <a href="/portal.html">Terms of Service</a>
            <span>&bull;</span>
            <a href="/portal.html">Hyperlinking Policy</a>
            <span>&bull;</span>
            <a href="/portal.html">Accessibility Statement</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
