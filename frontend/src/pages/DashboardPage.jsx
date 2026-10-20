import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, formatINR, formatDate } from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import {
  IconFolder,
  IconScale,
  IconFileText,
  IconRupee,
  IconGovernment,
  IconCalendar,
  IconAlertTriangle,
  IconBell,
  IconSearch,
  IconClock,
  IconCheckCircle,
  IconSignature,
  IconBarChart,
  IconTrendingUp,
  IconLock
} from '../components/Icons';

export const DashboardPage = () => {
  const { user } = useAuth();
  const role = user?.role || 'ADVOCATE';

  const [cases, setCases] = useState([]);
  const [hearings, setHearings] = useState([]);
  const [bills, setBills] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [cData, hData, bData, bgData, nData] = await Promise.all([
          api.getCases(),
          api.getHearings(),
          api.getBills(),
          api.getBudgetDashboard(),
          api.getNotifications()
        ]);
        setCases(cData);
        setHearings(hData);
        setBills(bData);
        setBudgets(bgData);
        setNotifications(nData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="panel-loading-box">
        <div className="panel-spinner"></div>
        <p>Loading authority workspace &amp; telemetry...</p>
      </div>
    );
  }

  // Filtered datasets based on current role
  const upcomingHearings = hearings.filter((h) => h.status === 'SCHEDULED');
  const attendancePendingHearings = hearings.filter((h) =>
    h.attendances?.some((a) => a.status === 'NOT_RECORDED')
  );
  const billsAwaitingAction = bills.filter(
    (b) => b.status === 'IN_APPROVAL' || b.status === 'UNDER_VERIFICATION' || b.currentStage === 'APPROVER_REVIEW'
  );
  const overdueBills = bills.filter((b) => (b.stageAgeDays || 0) >= 5);
  const budgetAlerts = budgets.filter((b) => (b.paidSpend / b.allocation) >= 0.75 || b.status === 'WARNING');

  // Role Metadata Config
  const roleHeaders = {
    ADVOCATE: {
      title: 'Advocate & Standing Counsel Workspace',
      badge: 'Advocate Panel',
      dept: 'Gujarat High Court Bar / Government Pleader Office',
      desc: 'Active briefs allocated to you, fee claims submitted, and today\'s scheduled hearings.',
      primaryColor: '#0284c7'
    },
    LEGAL_OFFICER: {
      title: 'Legal Officer In-Charge Operations Panel',
      badge: 'Legal Officer Panel',
      dept: user?.department || 'Revenue & Secretariat Department',
      desc: 'Case filings, affidavit status tracking, court cause lists, and advocate attendance certification.',
      primaryColor: '#d97706'
    },
    VERIFIER: {
      title: 'Bill Scrutiny & Rate Verification Cell',
      badge: 'Scrutiny Officer Panel',
      dept: 'Legal Department - Bill Scrutiny Division',
      desc: 'Verification queue against LR rate rules, daily court board cross-checks, and attendance slips.',
      primaryColor: '#059669'
    },
    APPROVER: {
      title: 'Sanctioning Authority Executive Desk',
      badge: 'Sanction Authority Panel',
      dept: 'Office of the Legal Secretary / Joint Secretary',
      desc: 'High-value bill sanctions, financial scrutiny authorizations, and administrative approvals.',
      primaryColor: '#7c3aed'
    },
    FINANCE_OFFICER: {
      title: 'Treasury & Finance Disbursement Panel',
      badge: 'Finance / DDO Panel',
      dept: 'Finance & Accounts Division',
      desc: 'Sanctioned voucher release, ECS / NEFT bank payouts, TDS withholding, and budget heads.',
      primaryColor: '#2563eb'
    },
    DEPARTMENT_HEAD: {
      title: 'Department Head & Principal Secretary Overview',
      badge: 'Department Head Panel',
      dept: user?.department || 'State Administrative Department',
      desc: 'Macro litigation risk exposure, department expenditure vs budget caps, and critical case status.',
      primaryColor: '#b91c1c'
    },
    ADMIN: {
      title: 'System Administrator Control Center',
      badge: 'System Admin Panel',
      dept: 'E-Governance Directorate',
      desc: 'Master configurations, empanelment of advocates, SLA thresholds, fee rules, and user roles.',
      primaryColor: '#1e293b'
    },
    AUDITOR: {
      title: 'Statutory CAG & Audit Inspection Panel',
      badge: 'Statutory Auditor Panel',
      dept: 'Principal Accountant General (Audit)',
      desc: 'Full immutable audit trail, financial variance logs, and compliance oversight across all claims.',
      primaryColor: '#475569'
    }
  };

  const currentRoleInfo = roleHeaders[role] || roleHeaders.LEGAL_OFFICER;

  return (
    <article className="role-panel-page">
      {/* 1. ROLE-SPECIFIC PANEL HEADER BANNER */}
      <div className="role-header-banner" style={{ borderLeftColor: currentRoleInfo.primaryColor }}>
        <div className="role-header-title-box">
          <div className="role-badge-row">
            <span className="panel-badge-pill" style={{ backgroundColor: currentRoleInfo.primaryColor }}>
              {currentRoleInfo.badge}
            </span>
            <span className="panel-user-name">
              Logged in as: <strong>{user?.name}</strong> ({user?.email})
            </span>
          </div>
          <h2 className="panel-main-heading">{currentRoleInfo.title}</h2>
          <p className="panel-sub-text">{currentRoleInfo.desc}</p>
        </div>

        <div className="panel-quick-actions">
          {role === 'ADVOCATE' && (
            <Link to="/bills/submit" className="panel-cta-btn primary">
              + Submit New Fee Bill
            </Link>
          )}
          {['LEGAL_OFFICER', 'ADMIN'].includes(role) && (
            <>
              <Link to="/cases/new" className="panel-cta-btn primary">
                + Register New Case
              </Link>
              <Link to="/hearings/attendance" className="panel-cta-btn secondary">
                Record Attendance
              </Link>
            </>
          )}
          {['VERIFIER'].includes(role) && (
            <Link to="/bills" className="panel-cta-btn primary">
              Open Scrutiny Queue ({billsAwaitingAction.length})
            </Link>
          )}
          {['APPROVER'].includes(role) && (
            <Link to="/approvals" className="panel-cta-btn primary">
              Open Approval Inbox
            </Link>
          )}
          {['FINANCE_OFFICER'].includes(role) && (
            <Link to="/payments/new" className="panel-cta-btn primary">
              + Process Bank Disbursement
            </Link>
          )}
          {['ADMIN'].includes(role) && (
            <Link to="/admin/users" className="panel-cta-btn primary">
              Manage Users
            </Link>
          )}
          {['AUDITOR'].includes(role) && (
            <Link to="/audit" className="panel-cta-btn primary">
              Audit Logs &amp; Integrity
            </Link>
          )}
          <Link to="/" className="panel-cta-btn outline">
            &larr; Switch Authority Panel
          </Link>
        </div>
      </div>

      {/* 2. ROLE-SPECIFIC KPI METRICS CARDS */}
      <section className="role-kpi-grid">
        {/* ADVOCATE SPECIFIC METRICS */}
        {role === 'ADVOCATE' && (
          <>
            <div className="role-kpi-card">
              <span className="kpi-icon"><IconFolder size={22} color="var(--primary-navy)" /></span>
              <div className="kpi-info">
                <span className="kpi-val">{cases.length}</span>
                <span className="kpi-lbl">Assigned Government Briefs</span>
              </div>
            </div>
            <div className="role-kpi-card">
              <span className="kpi-icon"><IconScale size={22} color="var(--primary-navy)" /></span>
              <div className="kpi-info">
                <span className="kpi-val">{upcomingHearings.length}</span>
                <span className="kpi-lbl">Scheduled Hearings</span>
              </div>
            </div>
            <div className="role-kpi-card">
              <span className="kpi-icon"><IconFileText size={22} color="var(--primary-navy)" /></span>
              <div className="kpi-info">
                <span className="kpi-val">{bills.length}</span>
                <span className="kpi-lbl">Total Fee Claims</span>
              </div>
            </div>
            <div className="role-kpi-card accent">
              <span className="kpi-icon"><IconRupee size={22} color="var(--accent-saffron)" /></span>
              <div className="kpi-info">
                <span className="kpi-val">
                  {formatINR(bills.reduce((acc, b) => acc + (b.totalClaimed || 0), 0))}
                </span>
                <span className="kpi-lbl">Total Claimed Value</span>
              </div>
            </div>
          </>
        )}

        {/* LEGAL OFFICER SPECIFIC METRICS */}
        {role === 'LEGAL_OFFICER' && (
          <>
            <div className="role-kpi-card">
              <span className="kpi-icon"><IconGovernment size={22} color="var(--primary-navy)" /></span>
              <div className="kpi-info">
                <span className="kpi-val">{cases.length}</span>
                <span className="kpi-lbl">Active State Cases</span>
              </div>
            </div>
            <div className="role-kpi-card">
              <span className="kpi-icon"><IconCalendar size={22} color="var(--primary-navy)" /></span>
              <div className="kpi-info">
                <span className="kpi-val">{upcomingHearings.length}</span>
                <span className="kpi-lbl">Upcoming Hearings</span>
              </div>
            </div>
            <div className="role-kpi-card warning">
              <span className="kpi-icon"><IconAlertTriangle size={22} color="var(--accent-gold)" /></span>
              <div className="kpi-info">
                <span className="kpi-val">{attendancePendingHearings.length}</span>
                <span className="kpi-lbl">Pending Attendance Recording</span>
              </div>
            </div>
            <div className="role-kpi-card">
              <span className="kpi-icon"><IconBell size={22} color="var(--primary-navy)" /></span>
              <div className="kpi-info">
                <span className="kpi-val">{notifications.filter(n => !n.isRead).length}</span>
                <span className="kpi-lbl">Unread Urgent Alerts</span>
              </div>
            </div>
          </>
        )}

        {/* VERIFIER SPECIFIC METRICS */}
        {role === 'VERIFIER' && (
          <>
            <div className="role-kpi-card accent">
              <span className="kpi-icon"><IconSearch size={22} color="var(--accent-saffron)" /></span>
              <div className="kpi-info">
                <span className="kpi-val">{billsAwaitingAction.length}</span>
                <span className="kpi-lbl">Bills in Scrutiny Queue</span>
              </div>
            </div>
            <div className="role-kpi-card warning">
              <span className="kpi-icon"><IconClock size={22} color="var(--accent-gold)" /></span>
              <div className="kpi-info">
                <span className="kpi-val">{overdueBills.length}</span>
                <span className="kpi-lbl">Overdue Bills (&gt;5 Days SLA)</span>
              </div>
            </div>
            <div className="role-kpi-card">
              <span className="kpi-icon"><IconFileText size={22} color="var(--primary-navy)" /></span>
              <div className="kpi-info">
                <span className="kpi-val">{attendancePendingHearings.length}</span>
                <span className="kpi-lbl">Uncertified Attendances</span>
              </div>
            </div>
            <div className="role-kpi-card">
              <span className="kpi-icon"><IconCheckCircle size={22} color="var(--accent-green)" /></span>
              <div className="kpi-info">
                <span className="kpi-val">{bills.filter(b => b.status === 'VERIFIED').length}</span>
                <span className="kpi-lbl">Verified This Month</span>
              </div>
            </div>
          </>
        )}

        {/* APPROVER SPECIFIC METRICS */}
        {role === 'APPROVER' && (
          <>
            <div className="role-kpi-card accent">
              <span className="kpi-icon"><IconSignature size={22} color="var(--accent-saffron)" /></span>
              <div className="kpi-info">
                <span className="kpi-val">
                  {bills.filter(b => b.status === 'IN_APPROVAL' || b.currentStage === 'APPROVER_REVIEW').length}
                </span>
                <span className="kpi-lbl">Pending Official Sanctions</span>
              </div>
            </div>
            <div className="role-kpi-card">
              <span className="kpi-icon"><IconRupee size={22} color="var(--primary-navy)" /></span>
              <div className="kpi-info">
                <span className="kpi-val">
                  {formatINR(
                    bills.filter(b => b.status === 'IN_APPROVAL')
                         .reduce((acc, b) => acc + (b.totalAdmissible || b.totalClaimed || 0), 0)
                  )}
                </span>
                <span className="kpi-lbl">Sanction Queue Value</span>
              </div>
            </div>
            <div className="role-kpi-card">
              <span className="kpi-icon"><IconClock size={22} color="var(--accent-gold)" /></span>
              <div className="kpi-info">
                <span className="kpi-val">{overdueBills.length}</span>
                <span className="kpi-lbl">Escalated Priority Vouchers</span>
              </div>
            </div>
            <div className="role-kpi-card">
              <span className="kpi-icon"><IconBarChart size={22} color="var(--primary-navy)" /></span>
              <div className="kpi-info">
                <span className="kpi-val">{budgetAlerts.length}</span>
                <span className="kpi-lbl">Budget Head Warnings</span>
              </div>
            </div>
          </>
        )}

        {/* FINANCE OFFICER METRICS */}
        {role === 'FINANCE_OFFICER' && (
          <>
            <div className="role-kpi-card accent">
              <span className="kpi-icon"><IconGovernment size={22} color="var(--accent-saffron)" /></span>
              <div className="kpi-info">
                <span className="kpi-val">{bills.filter(b => b.status === 'APPROVED').length}</span>
                <span className="kpi-lbl">Sanctioned for Disbursement</span>
              </div>
            </div>
            <div className="role-kpi-card">
              <span className="kpi-icon"><IconRupee size={22} color="var(--primary-navy)" /></span>
              <div className="kpi-info">
                <span className="kpi-val">
                  {formatINR(budgets.reduce((acc, b) => acc + (b.paidSpend || 0), 0))}
                </span>
                <span className="kpi-lbl">Total Disbursed (FY 2024-25)</span>
              </div>
            </div>
            <div className="role-kpi-card">
              <span className="kpi-icon"><IconTrendingUp size={22} color="var(--primary-navy)" /></span>
              <div className="kpi-info">
                <span className="kpi-val">
                  {formatINR(budgets.reduce((acc, b) => acc + (b.allocation || 0), 0))}
                </span>
                <span className="kpi-lbl">Total Budget Allocation</span>
              </div>
            </div>
            <div className="role-kpi-card warning">
              <span className="kpi-icon"><IconAlertTriangle size={22} color="var(--accent-gold)" /></span>
              <div className="kpi-info">
                <span className="kpi-val">{budgetAlerts.length}</span>
                <span className="kpi-lbl">Budgets &gt;75% Consumed</span>
              </div>
            </div>
          </>
        )}

        {/* DEPARTMENT HEAD & ADMIN & AUDITOR METRICS */}
        {['DEPARTMENT_HEAD', 'ADMIN', 'AUDITOR'].includes(role) && (
          <>
            <div className="role-kpi-card">
              <span className="kpi-icon"><IconGovernment size={22} color="var(--primary-navy)" /></span>
              <div className="kpi-info">
                <span className="kpi-val">{cases.length}</span>
                <span className="kpi-lbl">Total Monitored Cases</span>
              </div>
            </div>
            <div className="role-kpi-card accent">
              <span className="kpi-icon"><IconScale size={22} color="var(--accent-saffron)" /></span>
              <div className="kpi-info">
                <span className="kpi-val">
                  {formatINR(cases.reduce((acc, c) => acc + (c.financialExposure || 0), 0))}
                </span>
                <span className="kpi-lbl">State Financial Exposure</span>
              </div>
            </div>
            <div className="role-kpi-card">
              <span className="kpi-icon"><IconFileText size={22} color="var(--primary-navy)" /></span>
              <div className="kpi-info">
                <span className="kpi-val">{bills.length}</span>
                <span className="kpi-lbl">Total Bills Audited</span>
              </div>
            </div>
            <div className="role-kpi-card">
              <span className="kpi-icon"><IconLock size={22} color="var(--primary-navy)" /></span>
              <div className="kpi-info">
                <span className="kpi-val">{budgetAlerts.length}</span>
                <span className="kpi-lbl">Critical Budget Alerts</span>
              </div>
            </div>
          </>
        )}
      </section>

      {/* 3. ROLE-SPECIFIC WORKSPACE PANELS & TABLES */}

      {/* A. ADVOCATE WORKING VIEW */}
      {role === 'ADVOCATE' && (
        <section className="panel-work-section">
          <div className="section-head-bar">
            <div>
              <h3>My Assigned Cases &amp; Briefs</h3>
              <p>Active matters where you are appointed as Senior Standing Counsel or Government Pleader:</p>
            </div>
            <Link to="/bills/submit" className="panel-small-btn">+ New Fee Bill</Link>
          </div>
          <DataTable
            keyField="id"
            data={cases}
            columns={[
              {
                header: 'Case Number',
                render: (row) => (
                  <Link to={`/cases/${row.id}`} className="table-highlight-link">
                    <strong>{row.caseNumber}</strong>
                  </Link>
                ),
              },
              { header: 'Title / Parties', key: 'title' },
              { header: 'Court Bench', key: 'courtName' },
              { header: 'Department', key: 'department' },
              { header: 'Next Hearing', render: (row) => formatDate(row.nextHearingDate) },
              { header: 'Stage', key: 'currentStage' },
              {
                header: 'Action',
                render: (row) => (
                  <Link to={`/bills/submit?caseId=${row.id}`} className="action-pill-btn">
                    Claim Fee
                  </Link>
                ),
              },
            ]}
          />

          <div className="section-head-bar" style={{ marginTop: '2.5rem' }}>
            <div>
              <h3>My Submitted Fee Bills &amp; Payment Status</h3>
              <p>Real-time clearance tracker for your fee vouchers across scrutiny and treasury:</p>
            </div>
          </div>
          <DataTable
            keyField="id"
            data={bills}
            columns={[
              { header: 'Bill ID', key: 'id' },
              { header: 'Reference', key: 'billReference' },
              { header: 'Case Number', key: 'caseNumber' },
              { header: 'Claimed', render: (row) => formatINR(row.totalClaimed) },
              { header: 'Admissible', render: (row) => formatINR(row.totalAdmissible) },
              { header: 'Current Stage', key: 'currentStage' },
              { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
              {
                header: 'Details',
                render: (row) => <Link to={`/bills/${row.id}`}>View Voucher</Link>,
              },
            ]}
          />
        </section>
      )}

      {/* B. LEGAL OFFICER WORKING VIEW */}
      {role === 'LEGAL_OFFICER' && (
        <section className="panel-work-section">
          <div className="section-head-bar">
            <div>
              <h3>Hearings Requiring Attendance Certification</h3>
              <p>Certify advocate presence to enable compliant fee reimbursement under LR rules:</p>
            </div>
            <Link to="/hearings/attendance" className="panel-small-btn">Open Attendance Register</Link>
          </div>
          <DataTable
            keyField="id"
            data={attendancePendingHearings}
            columns={[
              { header: 'Hearing ID', key: 'id' },
              {
                header: 'Case Number',
                render: (row) => <Link to={`/cases/${row.caseId}`}>{row.caseNumber}</Link>,
              },
              { header: 'Hearing Date', render: (row) => formatDate(row.hearingDate) },
              { header: 'Court Room', key: 'courtRoom' },
              {
                header: 'Pending Advocates',
                render: (row) => (
                  <span>
                    {row.attendances?.filter(a => a.status === 'NOT_RECORDED').length} Advocate(s) unrecorded
                  </span>
                ),
              },
              {
                header: 'Action',
                render: (row) => (
                  <Link to="/hearings/attendance" className="action-pill-btn">
                    Record Attendance
                  </Link>
                ),
              },
            ]}
          />

          <div className="section-head-bar" style={{ marginTop: '2.5rem' }}>
            <div>
              <h3>Active Litigation Under Department</h3>
              <p>Monitor cases, pleadings, and scheduled dates:</p>
            </div>
            <Link to="/cases/new" className="panel-small-btn">+ Register Case</Link>
          </div>
          <DataTable
            keyField="id"
            data={cases}
            columns={[
              {
                header: 'Case Number',
                render: (row) => (
                  <Link to={`/cases/${row.id}`}><strong>{row.caseNumber}</strong></Link>
                ),
              },
              { header: 'Title', key: 'title' },
              { header: 'Court', key: 'courtName' },
              { header: 'Exposure', render: (row) => formatINR(row.financialExposure) },
              { header: 'Next Date', render: (row) => formatDate(row.nextHearingDate) },
              { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            ]}
          />
        </section>
      )}

      {/* C. VERIFIER WORKING VIEW */}
      {role === 'VERIFIER' && (
        <section className="panel-work-section">
          <div className="section-head-bar">
            <div>
              <h3>Bill Scrutiny &amp; Verification Queue</h3>
              <p>Bills requiring mathematical check, attendance slip matching, and rate verification:</p>
            </div>
          </div>
          <DataTable
            keyField="id"
            data={billsAwaitingAction}
            columns={[
              {
                header: 'Bill ID',
                render: (row) => (
                  <Link to={`/bills/${row.id}/review`} className="table-highlight-link">
                    <strong>{row.id}</strong>
                  </Link>
                ),
              },
              { header: 'Reference', key: 'billReference' },
              { header: 'Advocate', key: 'advocateName' },
              { header: 'Case Number', key: 'caseNumber' },
              { header: 'Claimed', render: (row) => formatINR(row.totalClaimed) },
              {
                header: 'SLA Age',
                render: (row) => (
                  <span className={row.stageAgeDays >= 5 ? 'sla-overdue' : 'sla-ok'} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {row.stageAgeDays} days {row.stageAgeDays >= 5 && <><IconAlertTriangle size={12} /> OVERDUE</>}
                  </span>
                ),
              },
              { header: 'Stage', key: 'currentStage' },
              {
                header: 'Action',
                render: (row) => (
                  <Link to={`/bills/${row.id}/review`} className="action-pill-btn">
                    Scrutinize &amp; Verify
                  </Link>
                ),
              },
            ]}
          />
        </section>
      )}

      {/* D. APPROVER WORKING VIEW */}
      {role === 'APPROVER' && (
        <section className="panel-work-section">
          <div className="section-head-bar">
            <div>
              <h3>Sanction Authority Inbox</h3>
              <p>Verified fee vouchers submitted for final administrative and financial sanction:</p>
            </div>
            <Link to="/approvals" className="panel-small-btn">Full Inbox</Link>
          </div>
          <DataTable
            keyField="id"
            data={bills.filter(b => b.status === 'IN_APPROVAL' || b.currentStage === 'APPROVER_REVIEW')}
            columns={[
              {
                header: 'Bill ID',
                render: (row) => (
                  <Link to={`/approvals/${row.id}/action`}>
                    <strong>{row.id}</strong>
                  </Link>
                ),
              },
              { header: 'Advocate', key: 'advocateName' },
              { header: 'Case', key: 'caseNumber' },
              { header: 'Admissible Amount', render: (row) => formatINR(row.totalAdmissible || row.totalClaimed) },
              { header: 'Fee Category', key: 'feeCategoryName' },
              {
                header: 'Action',
                render: (row) => (
                  <Link to={`/approvals/${row.id}/action`} className="action-pill-btn primary">
                    Sanction Voucher
                  </Link>
                ),
              },
            ]}
          />
        </section>
      )}

      {/* E. FINANCE OFFICER WORKING VIEW */}
      {role === 'FINANCE_OFFICER' && (
        <section className="panel-work-section">
          <div className="section-head-bar">
            <div>
              <h3>Approved Bills Pending Treasury Payout</h3>
              <p>Sanctioned fee bills ready for electronic payment advice generation &amp; ECS transfer:</p>
            </div>
            <Link to="/payments/new" className="panel-small-btn">+ Process Payment</Link>
          </div>
          <DataTable
            keyField="id"
            data={bills.filter(b => b.status === 'APPROVED' || b.status === 'IN_APPROVAL')}
            columns={[
              { header: 'Bill ID', key: 'id' },
              { header: 'Advocate', key: 'advocateName' },
              { header: 'Case', key: 'caseNumber' },
              { header: 'Sanctioned Amount', render: (row) => formatINR(row.totalAdmissible || row.totalClaimed) },
              { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
              {
                header: 'Disburse',
                render: (row) => (
                  <Link to={`/payments/new?billId=${row.id}`} className="action-pill-btn">
                    Disburse Funds
                  </Link>
                ),
              },
            ]}
          />

          <div className="section-head-bar" style={{ marginTop: '2.5rem' }}>
            <div>
              <h3>Department Budget Utilization Overview</h3>
              <p>Budget heads, allocated grants, and progressive expenditure:</p>
            </div>
            <Link to="/budget" className="panel-small-btn">Budget Dashboard</Link>
          </div>
          <DataTable
            keyField="id"
            data={budgets}
            columns={[
              { header: 'Budget Head', key: 'dimensionHead' },
              { header: 'Department', key: 'department' },
              { header: 'Allocation', render: (row) => formatINR(row.allocation) },
              { header: 'Paid Spend', render: (row) => formatINR(row.paidSpend) },
              {
                header: 'Utilization',
                render: (row) => {
                  const pct = Math.round((row.paidSpend / row.allocation) * 100);
                  return (
                    <div className="budget-progress-bar-wrapper">
                      <div
                        className={`budget-progress-fill ${pct >= 75 ? 'danger' : ''}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      ></div>
                      <span>{pct}%</span>
                    </div>
                  );
                },
              },
              { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            ]}
          />
        </section>
      )}

      {/* F. DEPARTMENT HEAD & ADMIN & AUDITOR WORKING VIEW */}
      {['DEPARTMENT_HEAD', 'ADMIN', 'AUDITOR'].includes(role) && (
        <section className="panel-work-section">
          <div className="section-head-bar">
            <div>
              <h3>High Exposure Litigation Tracking</h3>
              <p>Cases with high financial liability or strategic state significance:</p>
            </div>
            <Link to="/reports/cases" className="panel-small-btn">Full Case Report</Link>
          </div>
          <DataTable
            keyField="id"
            data={cases}
            columns={[
              {
                header: 'Case Number',
                render: (row) => <Link to={`/cases/${row.id}`}><strong>{row.caseNumber}</strong></Link>,
              },
              { header: 'Title / Subject', key: 'title' },
              { header: 'Department', key: 'department' },
              { header: 'Court Bench', key: 'courtName' },
              { header: 'Financial Exposure', render: (row) => <strong>{formatINR(row.financialExposure)}</strong> },
              { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            ]}
          />

          <div className="section-head-bar" style={{ marginTop: '2.5rem' }}>
            <div>
              <h3>State-Wide Budget Allocation &amp; Spend Matrix</h3>
              <p>Expenditure oversight and threshold alerts:</p>
            </div>
            <Link to="/budget" className="panel-small-btn">Detailed Analytics</Link>
          </div>
          <DataTable
            keyField="id"
            data={budgets}
            columns={[
              { header: 'Head Code', key: 'dimensionHead' },
              { header: 'Department', key: 'department' },
              { header: 'Grant Allocated', render: (row) => formatINR(row.allocation) },
              { header: 'Spend (Paid)', render: (row) => formatINR(row.paidSpend) },
              { header: 'Pending Sanction', render: (row) => formatINR(row.approvedUnpaid) },
              { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            ]}
          />
        </section>
      )}
    </article>
  );
};

export default DashboardPage;
