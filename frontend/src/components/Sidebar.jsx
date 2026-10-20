import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  IconDashboard,
  IconBell,
  IconFolder,
  IconPlus,
  IconCalendar,
  IconClock,
  IconPencil,
  IconFileText,
  IconCheckCircle,
  IconCreditCard,
  IconRupee,
  IconTrendingUp,
  IconSettings,
  IconReports,
  IconLock,
  IconUsers,
  IconGovernment,
  IconScale
} from './Icons';

export const Sidebar = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const role = user?.role || 'ADVOCATE';

  const canCreateCase = ['ADMIN', 'LEGAL_OFFICER', 'BILL_PREPARER'].includes(role);
  const canScheduleHearing = ['ADMIN', 'LEGAL_OFFICER'].includes(role);
  const canRecordAttendance = ['ADMIN', 'LEGAL_OFFICER', 'VERIFIER'].includes(role);
  const canSubmitBill = ['ADMIN', 'ADVOCATE', 'BILL_PREPARER'].includes(role);
  const canApprove = ['ADMIN', 'APPROVER', 'DEPARTMENT_HEAD', 'LEGAL_OFFICER'].includes(role);
  const canManagePayments = ['ADMIN', 'FINANCE_OFFICER'].includes(role);
  const canViewPayments = ['ADMIN', 'FINANCE_OFFICER', 'DEPARTMENT_HEAD', 'AUDITOR'].includes(role);
  const canManageBudget = ['ADMIN', 'FINANCE_OFFICER'].includes(role);
  const canViewBudget = ['ADMIN', 'FINANCE_OFFICER', 'DEPARTMENT_HEAD', 'AUDITOR'].includes(role);
  const canViewAudit = ['ADMIN', 'AUDITOR', 'DEPARTMENT_HEAD', 'APPROVER'].includes(role);
  const isAdmin = role === 'ADMIN';

  return (
    <aside className="app-sidebar" aria-label="System Navigation Menu">
      <div className="sidebar-scrollable">
        <div className="sidebar-group">
          <div className="sidebar-group-title">Core Operations</div>
          <ul className="sidebar-menu-list">
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="sidebar-icon"><IconDashboard size={18} /></span>
                <span>{t('dashboard')}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/notifications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="sidebar-icon"><IconBell size={18} /></span>
                <span>{t('notifications')}</span>
              </NavLink>
            </li>
          </ul>
        </div>

        <div className="sidebar-group">
          <div className="sidebar-group-title">{t('cases')}</div>
          <ul className="sidebar-menu-list">
            <li>
              <NavLink to="/cases" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="sidebar-icon"><IconFolder size={18} /></span>
                <span>All Cases</span>
              </NavLink>
            </li>
            {canCreateCase && (
              <li>
                <NavLink to="/cases/new" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <span className="sidebar-icon"><IconPlus size={18} /></span>
                  <span>Register New Case</span>
                </NavLink>
              </li>
            )}
          </ul>
        </div>

        <div className="sidebar-group">
          <div className="sidebar-group-title">{t('hearings')}</div>
          <ul className="sidebar-menu-list">
            <li>
              <NavLink to="/hearings" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="sidebar-icon"><IconCalendar size={18} /></span>
                <span>Hearing Calendar</span>
              </NavLink>
            </li>
            {canScheduleHearing && (
              <li>
                <NavLink to="/hearings/new" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <span className="sidebar-icon"><IconClock size={18} /></span>
                  <span>Schedule Hearing</span>
                </NavLink>
              </li>
            )}
            {canRecordAttendance && (
              <li>
                <NavLink to="/hearings/attendance" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <span className="sidebar-icon"><IconPencil size={18} /></span>
                  <span>Record Attendance</span>
                </NavLink>
              </li>
            )}
          </ul>
        </div>

        <div className="sidebar-group">
          <div className="sidebar-group-title">{t('bills')}</div>
          <ul className="sidebar-menu-list">
            <li>
              <NavLink to="/bills" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="sidebar-icon"><IconFileText size={18} /></span>
                <span>Bill Register</span>
              </NavLink>
            </li>
            {canSubmitBill && (
              <li>
                <NavLink to="/bills/submit" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <span className="sidebar-icon"><IconPlus size={18} /></span>
                  <span>Submit Fee Claim</span>
                </NavLink>
              </li>
            )}
          </ul>
        </div>

        {canApprove && (
          <div className="sidebar-group">
            <div className="sidebar-group-title">{t('approvals')}</div>
            <ul className="sidebar-menu-list">
              <li>
                <NavLink to="/approvals" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <span className="sidebar-icon"><IconCheckCircle size={18} /></span>
                  <span>Approval Inbox</span>
                </NavLink>
              </li>
            </ul>
          </div>
        )}

        {canViewPayments && (
          <div className="sidebar-group">
            <div className="sidebar-group-title">{t('payments')}</div>
            <ul className="sidebar-menu-list">
              <li>
                <NavLink to="/payments" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <span className="sidebar-icon"><IconCreditCard size={18} /></span>
                  <span>Payment Register</span>
                </NavLink>
              </li>
              {canManagePayments && (
                <li>
                  <NavLink to="/payments/new" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    <span className="sidebar-icon"><IconRupee size={18} /></span>
                    <span>Disburse Payment</span>
                  </NavLink>
                </li>
              )}
            </ul>
          </div>
        )}

        {canViewBudget && (
          <div className="sidebar-group">
            <div className="sidebar-group-title">{t('budget')}</div>
            <ul className="sidebar-menu-list">
              <li>
                <NavLink to="/budget" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <span className="sidebar-icon"><IconTrendingUp size={18} /></span>
                  <span>Budget Dashboard</span>
                </NavLink>
              </li>
              {canManageBudget && (
                <li>
                  <NavLink to="/budget/setup" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    <span className="sidebar-icon"><IconSettings size={18} /></span>
                    <span>Budget Allocation</span>
                  </NavLink>
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="sidebar-group">
          <div className="sidebar-group-title">{t('reports')}</div>
          <ul className="sidebar-menu-list">
            <li>
              <NavLink to="/reports" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="sidebar-icon"><IconReports size={18} /></span>
                <span>Reports &amp; MIS</span>
              </NavLink>
            </li>
            {canViewAudit && (
              <li>
                <NavLink to="/audit" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <span className="sidebar-icon"><IconLock size={18} /></span>
                  <span>{t('audit')}</span>
                </NavLink>
              </li>
            )}
          </ul>
        </div>

        {isAdmin && (
          <div className="sidebar-group">
            <div className="sidebar-group-title">{t('admin')}</div>
            <ul className="sidebar-menu-list">
              <li>
                <NavLink to="/admin/users" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <span className="sidebar-icon"><IconUsers size={18} /></span>
                  <span>User Management</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/courts" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <span className="sidebar-icon"><IconGovernment size={18} /></span>
                  <span>Court Benches</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/advocates" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <span className="sidebar-icon"><IconScale size={18} /></span>
                  <span>Advocates</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/workflow" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <span className="sidebar-icon"><IconSettings size={18} /></span>
                  <span>Workflow &amp; SLA</span>
                </NavLink>
              </li>
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
