import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Core Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

// Cases
import CaseListPage from './pages/cases/CaseListPage';
import CaseDetailPage from './pages/cases/CaseDetailPage';
import CaseFormPage from './pages/cases/CaseFormPage';

// Hearings
import HearingListPage from './pages/hearings/HearingListPage';
import HearingDetailPage from './pages/hearings/HearingDetailPage';
import HearingFormPage from './pages/hearings/HearingFormPage';
import AttendancePage from './pages/hearings/AttendancePage';

// Bills
import BillListPage from './pages/bills/BillListPage';
import BillDetailPage from './pages/bills/BillDetailPage';
import BillSubmitPage from './pages/bills/BillSubmitPage';
import BillReviewPage from './pages/bills/BillReviewPage';

// Approvals
import ApprovalInboxPage from './pages/approvals/ApprovalInboxPage';
import ApprovalActionPage from './pages/approvals/ApprovalActionPage';

// Payments
import PaymentRegisterPage from './pages/payments/PaymentRegisterPage';
import PaymentFormPage from './pages/payments/PaymentFormPage';
import PaymentAdjustmentPage from './pages/payments/PaymentAdjustmentPage';

// Budget
import BudgetDashboardPage from './pages/budget/BudgetDashboardPage';
import BudgetSetupPage from './pages/budget/BudgetSetupPage';

// Reports
import ReportListPage from './pages/reports/ReportListPage';
import AdvocateReportPage from './pages/reports/AdvocateReportPage';
import CaseReportPage from './pages/reports/CaseReportPage';
import CourtReportPage from './pages/reports/CourtReportPage';
import YearReportPage from './pages/reports/YearReportPage';
import BudgetReportPage from './pages/reports/BudgetReportPage';
import AttendanceReportPage from './pages/reports/AttendanceReportPage';

// Notifications & Audit
import NotificationListPage from './pages/notifications/NotificationListPage';
import AuditHistoryPage from './pages/audit/AuditHistoryPage';

// Admin
import UserManagementPage from './pages/admin/UserManagementPage';
import CourtManagementPage from './pages/admin/CourtManagementPage';
import AdvocateManagementPage from './pages/admin/AdvocateManagementPage';
import DepartmentManagementPage from './pages/admin/DepartmentManagementPage';
import FeeCategoryPage from './pages/admin/FeeCategoryPage';
import WorkflowConfigPage from './pages/admin/WorkflowConfigPage';
import SlaConfigPage from './pages/admin/SlaConfigPage';
import BudgetDimensionPage from './pages/admin/BudgetDimensionPage';

// Landing Page
import LandingPage from './pages/LandingPage';

export const App = () => {
  return (
    <Routes>
      {/* Public Landing Directory for all panels */}
      <Route path="/" element={<LandingPage />} />

      {/* Public Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Cases */}
          <Route path="/cases" element={<CaseListPage />} />
          <Route path="/cases/new" element={<CaseFormPage />} />
          <Route path="/cases/:id" element={<CaseDetailPage />} />
          <Route path="/cases/:id/edit" element={<CaseFormPage />} />

          {/* Hearings */}
          <Route path="/hearings" element={<HearingListPage />} />
          <Route path="/hearings/new" element={<HearingFormPage />} />
          <Route path="/hearings/attendance" element={<AttendancePage />} />
          <Route path="/hearings/:id" element={<HearingDetailPage />} />

          {/* Bills */}
          <Route path="/bills" element={<BillListPage />} />
          <Route path="/bills/submit" element={<BillSubmitPage />} />
          <Route path="/bills/:id" element={<BillDetailPage />} />
          <Route path="/bills/:id/review" element={<BillReviewPage />} />

          {/* Approvals */}
          <Route path="/approvals" element={<ApprovalInboxPage />} />
          <Route path="/approvals/:id/action" element={<ApprovalActionPage />} />

          {/* Payments */}
          <Route path="/payments" element={<PaymentRegisterPage />} />
          <Route path="/payments/new" element={<PaymentFormPage />} />
          <Route path="/payments/adjustments" element={<PaymentAdjustmentPage />} />

          {/* Budget */}
          <Route path="/budget" element={<BudgetDashboardPage />} />
          <Route path="/budget/setup" element={<BudgetSetupPage />} />

          {/* Reports */}
          <Route path="/reports" element={<ReportListPage />} />
          <Route path="/reports/advocates" element={<AdvocateReportPage />} />
          <Route path="/reports/cases" element={<CaseReportPage />} />
          <Route path="/reports/courts" element={<CourtReportPage />} />
          <Route path="/reports/years" element={<YearReportPage />} />
          <Route path="/reports/budget" element={<BudgetReportPage />} />
          <Route path="/reports/attendance" element={<AttendanceReportPage />} />

          {/* Notifications */}
          <Route path="/notifications" element={<NotificationListPage />} />

          {/* Audit */}
          <Route path="/audit" element={<AuditHistoryPage />} />

          {/* Admin Masters */}
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/courts" element={<CourtManagementPage />} />
          <Route path="/admin/advocates" element={<AdvocateManagementPage />} />
          <Route path="/admin/departments" element={<DepartmentManagementPage />} />
          <Route path="/admin/fee-categories" element={<FeeCategoryPage />} />
          <Route path="/admin/workflow-config" element={<WorkflowConfigPage />} />
          <Route path="/admin/sla-config" element={<SlaConfigPage />} />
          <Route path="/admin/budget-dimensions" element={<BudgetDimensionPage />} />
        </Route>
      </Route>

      {/* 404 Fallback */}
      <Route
        path="*"
        element={
          <main>
            <h2>404 - Page Not Found</h2>
            <p>The requested litigation URL or master route does not exist.</p>
            <p>
              <a href="/dashboard">Return to Dashboard</a>
            </p>
          </main>
        }
      />
    </Routes>
  );
};

export default App;
