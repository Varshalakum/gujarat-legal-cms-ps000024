// API Service for Gujarat Legal Case Management System
// Pure Fetch API with fallback data for MVP testing

const BASE_URL = '/api';

export const formatINR = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(val);
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch (e) {
    return dateString;
  }
};

export const isMockModeEnabled = () => {
  const envVal = import.meta.env.VITE_ENABLE_MOCK;
  if (envVal !== undefined) return envVal === 'true';
  const stored = localStorage.getItem('app_mock_mode');
  return stored === 'true';
};

export const toggleMockMode = (enabled) => {
  localStorage.setItem('app_mock_mode', enabled ? 'true' : 'false');
  console.info(`[LCMS] Mock mode toggled: ${enabled}`);
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && !token.startsWith('mock-jwt-token-') ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const request = async (url, options = {}, mockFallback = null) => {
  const mockEnabled = isMockModeEnabled();
  const token = localStorage.getItem('token');
  const isMockToken = !token || token.startsWith('mock-jwt-token-');

  // If mock mode is explicitly forced and fallback is available, skip network
  if (mockEnabled && mockFallback !== null) {
    return typeof mockFallback === 'function' ? mockFallback() : mockFallback;
  }

  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...(options.headers || {}),
      },
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data.data !== undefined ? data.data : data;
  } catch (err) {
    if (mockFallback !== null) {
      console.warn(`[LCMS Fallback] Request to ${url} failed (${err.message}). Using local fallback data.`);
      return typeof mockFallback === 'function' ? mockFallback() : mockFallback;
    }
    throw err;
  }
};

// Mock data stores
let mockCases = [
  {
    id: 'CASE-2024-001',
    caseNumber: 'SCA/1024/2024',
    title: 'State of Gujarat vs Patel Infrastructure Ltd',
    courtName: 'High Court of Gujarat',
    courtId: 'CRT-001',
    caseType: 'Special Civil Application',
    department: 'Revenue Department',
    departmentId: 'DEP-001',
    status: 'ACTIVE',
    filingDate: '2024-01-15',
    nextHearingDate: '2024-11-20',
    currentStage: 'Evidence Presentation',
    financialExposure: 4500000,
    assignedAdvocates: [
      { id: 'ADV-001', name: 'Shri R. K. Trivedi', role: 'Senior Standing Counsel', assignedDate: '2024-01-18' },
      { id: 'ADV-002', name: 'Smt. Ananya Desai', role: 'Assistant Government Pleader', assignedDate: '2024-01-18' }
    ],
    summary: 'Dispute regarding land acquisition compensation and procedural delay challenges.',
    documents: [
      { id: 'DOC-1', name: 'Writ_Petition.pdf', uploadDate: '2024-01-15', uploadedBy: 'Petitioner' },
      { id: 'DOC-2', name: 'Reply_Affidavit_State.pdf', uploadDate: '2024-02-10', uploadedBy: 'Revenue Dept' }
    ]
  },
  {
    id: 'CASE-2024-002',
    caseNumber: 'LPA/450/2023',
    title: 'Gujarat Industrial Corp vs M/s Western Chemicals',
    courtName: 'High Court of Gujarat',
    courtId: 'CRT-001',
    caseType: 'Letters Patent Appeal',
    department: 'Industries and Mines Department',
    departmentId: 'DEP-002',
    status: 'ACTIVE',
    filingDate: '2023-08-10',
    nextHearingDate: '2024-11-25',
    currentStage: 'Final Hearing',
    financialExposure: 12500000,
    assignedAdvocates: [
      { id: 'ADV-003', name: 'Shri H. M. Parekh', role: 'Government Pleader', assignedDate: '2023-08-15' }
    ],
    summary: 'Lease cancellation challenge and environmental compliance violation claims.',
    documents: [
      { id: 'DOC-3', name: 'GIDC_Order_Copy.pdf', uploadDate: '2023-08-12', uploadedBy: 'GIDC' }
    ]
  },
  {
    id: 'CASE-2024-003',
    caseNumber: 'CRA/88/2024',
    title: 'State vs Maheshbhai Parmar & Ors',
    courtName: 'City Civil Court, Ahmedabad',
    courtId: 'CRT-002',
    caseType: 'Civil Revision Application',
    department: 'Home Department',
    departmentId: 'DEP-003',
    status: 'ACTIVE',
    filingDate: '2024-03-01',
    nextHearingDate: '2024-11-18',
    currentStage: 'Arguments',
    financialExposure: 800000,
    assignedAdvocates: [
      { id: 'ADV-004', name: 'Shri Bhavesh Patel', role: 'Additional Public Prosecutor', assignedDate: '2024-03-05' }
    ],
    summary: 'Stay application against attachment of government property.',
    documents: []
  }
];

let mockHearings = [
  {
    id: 'HRG-2024-101',
    caseId: 'CASE-2024-001',
    caseNumber: 'SCA/1024/2024',
    caseTitle: 'State of Gujarat vs Patel Infrastructure Ltd',
    courtName: 'High Court of Gujarat',
    courtRoom: 'Courtroom 4, Bench II',
    hearingDate: '2024-11-20',
    hearingTime: '11:00',
    purpose: 'Cross-examination of Revenue Officer',
    status: 'SCHEDULED',
    outcome: '',
    nextHearingDate: '',
    rescheduleHistory: [],
    attendances: [
      { advocateId: 'ADV-001', advocateName: 'Shri R. K. Trivedi', status: 'NOT_RECORDED', recordedBy: '', verification: 'PENDING', evidence: '' },
      { advocateId: 'ADV-002', advocateName: 'Smt. Ananya Desai', status: 'NOT_RECORDED', recordedBy: '', verification: 'PENDING', evidence: '' }
    ]
  },
  {
    id: 'HRG-2024-100',
    caseId: 'CASE-2024-001',
    caseNumber: 'SCA/1024/2024',
    caseTitle: 'State of Gujarat vs Patel Infrastructure Ltd',
    courtName: 'High Court of Gujarat',
    courtRoom: 'Courtroom 4, Bench II',
    hearingDate: '2024-10-10',
    hearingTime: '14:30',
    purpose: 'Hearing on Interim Relief',
    status: 'COMPLETED',
    outcome: 'Interim stay granted in favour of State. Directed parties to file evidence.',
    nextHearingDate: '2024-11-20',
    rescheduleHistory: [{ originalDate: '2024-09-25', revisedDate: '2024-10-10', reason: 'Bench not sitting' }],
    attendances: [
      { advocateId: 'ADV-001', advocateName: 'Shri R. K. Trivedi', status: 'PRESENT', recordedBy: 'LEGAL_OFFICER (K. Sharma)', verification: 'VERIFIED', evidence: 'High Court Daily Cause List & Appearance Slip' },
      { advocateId: 'ADV-002', advocateName: 'Smt. Ananya Desai', status: 'PRESENT', recordedBy: 'LEGAL_OFFICER (K. Sharma)', verification: 'VERIFIED', evidence: 'Order Sheet noting dated 10-10-2024' }
    ]
  },
  {
    id: 'HRG-2024-099',
    caseId: 'CASE-2024-002',
    caseNumber: 'LPA/450/2023',
    caseTitle: 'Gujarat Industrial Corp vs M/s Western Chemicals',
    courtName: 'High Court of Gujarat',
    courtRoom: 'Courtroom 1 (Chief Justice)',
    hearingDate: '2024-10-05',
    hearingTime: '10:30',
    purpose: 'Final Arguments',
    status: 'COMPLETED',
    outcome: 'Arguments concluded in part. Matter adjourned for remaining submissions.',
    nextHearingDate: '2024-11-25',
    rescheduleHistory: [],
    attendances: [
      { advocateId: 'ADV-003', advocateName: 'Shri H. M. Parekh', status: 'PRESENT', recordedBy: 'LEGAL_OFFICER (M. Shah)', verification: 'VERIFIED', evidence: 'Court Daily Order Sheet' }
    ]
  }
];

let mockBills = [
  {
    id: 'BILL-2024-501',
    billReference: 'BILL/RKT/2024/09',
    advocateId: 'ADV-001',
    advocateName: 'Shri R. K. Trivedi',
    caseId: 'CASE-2024-001',
    caseNumber: 'SCA/1024/2024',
    feeCategoryId: 'FEE-CAT-HC-EVID',
    feeCategoryName: 'High Court - Effective Hearing / Arguments',
    claimPeriodStart: '2024-10-01',
    claimPeriodEnd: '2024-10-15',
    billDate: '2024-10-12',
    amount: 35000,
    clerkageAmount: 3500,
    miscAmount: 1500,
    totalClaimed: 40000,
    approvedAmount: 40000,
    paidAmount: 0,
    currentStage: 'APPROVER_REVIEW',
    stageAgeDays: 4,
    status: 'IN_APPROVAL',
    hearingId: 'HRG-2024-100',
    documents: [
      { name: 'Appearance_Memo_10Oct.pdf', verified: true },
      { name: 'Fee_Voucher_Signed.pdf', verified: true }
    ],
    duplicateMatches: [],
    verifierChecklist: {
      hearingVerified: true,
      attendanceVerified: true,
      scaleRateAdherence: true,
      originalVouchersAttached: true
    },
    actionHistory: [
      { action: 'SUBMITTED', actor: 'ADV-001 (Shri R. K. Trivedi)', date: '2024-10-12', notes: 'Claimed for hearing on 10-10-2024' },
      { action: 'VERIFIED', actor: 'VERIFIER (A. V. Joshi)', date: '2024-10-14', notes: 'Attendance and daily board verified. Forwarded to Approver.' }
    ]
  },
  {
    id: 'BILL-2024-502',
    billReference: 'BILL/AD/2024/11',
    advocateId: 'ADV-002',
    advocateName: 'Smt. Ananya Desai',
    caseId: 'CASE-2024-001',
    caseNumber: 'SCA/1024/2024',
    feeCategoryId: 'FEE-CAT-HC-ASST',
    feeCategoryName: 'High Court - Assistance to Senior Counsel',
    claimPeriodStart: '2024-10-01',
    claimPeriodEnd: '2024-10-15',
    billDate: '2024-10-13',
    amount: 15000,
    clerkageAmount: 1500,
    miscAmount: 500,
    totalClaimed: 17000,
    approvedAmount: 17000,
    paidAmount: 17000,
    currentStage: 'PAID',
    stageAgeDays: 0,
    status: 'PAID',
    hearingId: 'HRG-2024-100',
    documents: [{ name: 'Voucher_Signed.pdf', verified: true }],
    duplicateMatches: [],
    verifierChecklist: { hearingVerified: true, attendanceVerified: true, scaleRateAdherence: true, originalVouchersAttached: true },
    actionHistory: [
      { action: 'SUBMITTED', actor: 'ADV-002', date: '2024-10-13', notes: 'Initial submission' },
      { action: 'APPROVED', actor: 'APPROVER (Sec Legal)', date: '2024-10-16', notes: 'Approved as per scale' },
      { action: 'PAID', actor: 'FINANCE_OFFICER', date: '2024-10-20', notes: 'Paid via ECS/NEFT' }
    ]
  },
  {
    id: 'BILL-2024-503',
    billReference: 'BILL/HMP/2024/02',
    advocateId: 'ADV-003',
    advocateName: 'Shri H. M. Parekh',
    caseId: 'CASE-2024-002',
    caseNumber: 'LPA/450/2023',
    feeCategoryId: 'FEE-CAT-HC-EVID',
    feeCategoryName: 'High Court - Final Arguments',
    claimPeriodStart: '2024-10-01',
    claimPeriodEnd: '2024-10-10',
    billDate: '2024-10-11',
    amount: 50000,
    clerkageAmount: 5000,
    miscAmount: 2000,
    totalClaimed: 57000,
    approvedAmount: 0,
    paidAmount: 0,
    currentStage: 'VERIFICATION',
    stageAgeDays: 7,
    status: 'UNDER_VERIFICATION',
    hearingId: 'HRG-2024-099',
    documents: [{ name: 'Order_Sheet.pdf', verified: false }],
    duplicateMatches: [],
    verifierChecklist: { hearingVerified: true, attendanceVerified: true, scaleRateAdherence: false, originalVouchersAttached: false },
    actionHistory: [
      { action: 'SUBMITTED', actor: 'ADV-003', date: '2024-10-11', notes: 'Submitted for scrutiny' }
    ]
  }
];

let mockPayments = [
  {
    id: 'PAY-2024-901',
    paymentReference: 'TXN/GOV/2024/8821',
    billId: 'BILL-2024-502',
    billReference: 'BILL/AD/2024/11',
    advocateName: 'Smt. Ananya Desai',
    paymentDate: '2024-10-20',
    amount: 17000,
    paymentMode: 'NEFT',
    bankReferenceNumber: 'RBI2024102099381',
    accountingHead: '2014-00-114-01-00 (Administration of Justice)',
    status: 'SUCCESS',
    reversals: []
  }
];

let mockBudgets = [
  {
    id: 'BUD-2024-01',
    financialYear: '2024-2025',
    department: 'Revenue Department',
    departmentId: 'DEP-001',
    dimensionHead: 'Legal Fees & Retainers (2014-Legal-01)',
    allocation: 25000000,
    paidSpend: 8400000,
    approvedUnpaid: 1200000,
    exposure: 14500000,
    warningThresholdPercent: 80,
    status: 'ACTIVE'
  },
  {
    id: 'BUD-2024-02',
    financialYear: '2024-2025',
    department: 'Industries and Mines Department',
    departmentId: 'DEP-002',
    dimensionHead: 'Litigation & Court Expenses (2014-Legal-02)',
    allocation: 18000000,
    paidSpend: 13500000,
    approvedUnpaid: 2100000,
    exposure: 19800000,
    warningThresholdPercent: 80,
    status: 'WARNING'
  },
  {
    id: 'BUD-2024-03',
    financialYear: '2024-2025',
    department: 'Home Department',
    departmentId: 'DEP-003',
    dimensionHead: 'Public Prosecutor Fees (2014-Legal-03)',
    allocation: 30000000,
    paidSpend: 9200000,
    approvedUnpaid: 850000,
    exposure: 12000000,
    warningThresholdPercent: 80,
    status: 'ACTIVE'
  }
];

let mockNotifications = [
  {
    id: 'NOTIF-01',
    recipientRole: 'VERIFIER',
    event: 'HEARING_ATTENDANCE_PENDING',
    title: 'Attendance not recorded for 2 advocates',
    message: 'Hearing on 20-Nov-2024 for SCA/1024/2024 requires attendance confirmation.',
    linkedCaseNumber: 'SCA/1024/2024',
    linkedBillId: null,
    dueDate: '2024-11-21',
    isRead: false,
    createdAt: '2024-10-13T09:00:00Z'
  },
  {
    id: 'NOTIF-02',
    recipientRole: 'APPROVER',
    event: 'BILL_AWAITING_APPROVAL',
    title: 'Bill BILL/RKT/2024/09 requires approval',
    message: 'Claim of ₹40,000 for Senior Standing Counsel has been verified.',
    linkedCaseNumber: 'SCA/1024/2024',
    linkedBillId: 'BILL-2024-501',
    dueDate: '2024-10-18',
    isRead: false,
    createdAt: '2024-10-14T11:20:00Z'
  },
  {
    id: 'NOTIF-03',
    recipientRole: 'FINANCE_OFFICER',
    event: 'BUDGET_WARNING',
    title: 'Budget utilization reached 86% in Industries Dept',
    message: 'Approved + paid liabilities exceed 80% threshold for Head 2014-Legal-02.',
    linkedCaseNumber: null,
    linkedBillId: null,
    dueDate: '2024-10-25',
    isRead: true,
    createdAt: '2024-10-10T16:45:00Z'
  }
];

let mockAudits = [
  {
    id: 'AUD-1001',
    action: 'BILL_SUBMISSION',
    actor: 'Shri R. K. Trivedi (ADVOCATE)',
    role: 'ADVOCATE',
    timestamp: '2024-10-12T10:15:00Z',
    entity: 'BILL: BILL-2024-501',
    reason: 'Initial fee bill submission for hearing dated 10-Oct-2024',
    previousStatus: 'DRAFT',
    newStatus: 'SUBMITTED'
  },
  {
    id: 'AUD-1002',
    action: 'VERIFICATION_PASSED',
    actor: 'A. V. Joshi (VERIFIER)',
    role: 'VERIFIER',
    timestamp: '2024-10-14T14:30:00Z',
    entity: 'BILL: BILL-2024-501',
    reason: 'Checked court board and advocate attendance slip. Matched rate schedule.',
    previousStatus: 'SUBMITTED',
    newStatus: 'IN_APPROVAL'
  },
  {
    id: 'AUD-1003',
    action: 'PAYMENT_PROCESSED',
    actor: 'D. K. Patel (FINANCE_OFFICER)',
    role: 'FINANCE_OFFICER',
    timestamp: '2024-10-20T16:00:00Z',
    entity: 'BILL: BILL-2024-502',
    reason: 'ECS Transfer ref RBI2024102099381',
    previousStatus: 'APPROVED',
    newStatus: 'PAID'
  }
];

let mockUsers = [
  { id: 'USR-001', username: 'advocate_trivedi', name: 'Shri R. K. Trivedi', email: 'trivedi.adv@gujarat.gov.in', role: 'ADVOCATE', department: 'Revenue Department', status: 'ACTIVE' },
  { id: 'USR-002', username: 'legal_sharma', name: 'K. Sharma', email: 'sharma.legal@gujarat.gov.in', role: 'LEGAL_OFFICER', department: 'Revenue Department', status: 'ACTIVE' },
  { id: 'USR-003', username: 'bill_preparer_1', name: 'P. M. Vora', email: 'vora.bills@gujarat.gov.in', role: 'BILL_PREPARER', department: 'Finance Department', status: 'ACTIVE' },
  { id: 'USR-004', username: 'verifier_joshi', name: 'A. V. Joshi', email: 'joshi.scrutiny@gujarat.gov.in', role: 'VERIFIER', department: 'Legal Department', status: 'ACTIVE' },
  { id: 'USR-005', username: 'approver_sec', name: 'Secretary (Legal)', email: 'secretary.legal@gujarat.gov.in', role: 'APPROVER', department: 'Legal Department', status: 'ACTIVE' },
  { id: 'USR-006', username: 'finance_patel', name: 'D. K. Patel', email: 'patel.finance@gujarat.gov.in', role: 'FINANCE_OFFICER', department: 'Finance Department', status: 'ACTIVE' },
  { id: 'USR-007', username: 'head_revenue', name: 'Pr. Secretary (Revenue)', email: 'sec.revenue@gujarat.gov.in', role: 'DEPARTMENT_HEAD', department: 'Revenue Department', status: 'ACTIVE' },
  { id: 'USR-008', username: 'admin_sys', name: 'System Administrator', email: 'admin.legal@gujarat.gov.in', role: 'ADMIN', department: 'Legal Department', status: 'ACTIVE' },
  { id: 'USR-009', username: 'auditor_cag', name: 'Senior Audit Officer', email: 'audit.legal@gujarat.gov.in', role: 'AUDITOR', department: 'Audit & Accounts', status: 'ACTIVE' }
];

let mockCourts = [
  { id: 'CRT-001', name: 'High Court of Gujarat', code: 'GUJ-HC', city: 'Ahmedabad', benchType: 'Principal Bench', jurisdiction: 'State-wide', status: 'ACTIVE' },
  { id: 'CRT-002', name: 'City Civil & Sessions Court', code: 'AHM-CCC', city: 'Ahmedabad', benchType: 'District Court', jurisdiction: 'Ahmedabad City', status: 'ACTIVE' },
  { id: 'CRT-003', name: 'District & Sessions Court, Gandhinagar', code: 'GNR-DC', city: 'Gandhinagar', benchType: 'District Court', jurisdiction: 'Gandhinagar District', status: 'ACTIVE' },
  { id: 'CRT-004', name: 'Supreme Court of India', code: 'SCI', city: 'New Delhi', benchType: 'Apex Court', jurisdiction: 'National', status: 'ACTIVE' }
];

let mockAdvocates = [
  { id: 'ADV-001', name: 'Shri R. K. Trivedi', barRegistrationNumber: 'G/1234/1998', designation: 'Senior Standing Counsel', court: 'High Court of Gujarat', email: 'trivedi.adv@gujarat.gov.in', phone: '9825012345', pan: 'AAAPT1234F', status: 'ACTIVE' },
  { id: 'ADV-002', name: 'Smt. Ananya Desai', barRegistrationNumber: 'G/5678/2008', designation: 'Assistant Government Pleader', court: 'High Court of Gujarat', email: 'ananya.desai@gujarat.gov.in', phone: '9825054321', pan: 'ABEPD5678R', status: 'ACTIVE' },
  { id: 'ADV-003', name: 'Shri H. M. Parekh', barRegistrationNumber: 'G/9012/1995', designation: 'Government Pleader', court: 'High Court of Gujarat', email: 'hm.parekh@gujarat.gov.in', phone: '9824099887', pan: 'AZZPP9012K', status: 'ACTIVE' },
  { id: 'ADV-004', name: 'Shri Bhavesh Patel', barRegistrationNumber: 'G/3456/2012', designation: 'Additional Public Prosecutor', court: 'City Civil Court, Ahmedabad', email: 'bhavesh.patel@gujarat.gov.in', phone: '9824011223', pan: 'AYTPB3456N', status: 'ACTIVE' }
];

let mockDepartments = [
  { id: 'DEP-001', name: 'Revenue Department', code: 'REV', nodalOfficer: 'Shri S. K. Mehta', contactEmail: 'nodal.rev@gujarat.gov.in', budgetAllocated: 25000000, activeCases: 420 },
  { id: 'DEP-002', name: 'Industries and Mines Department', code: 'IND', nodalOfficer: 'Smt. G. V. Bhatt', contactEmail: 'nodal.ind@gujarat.gov.in', budgetAllocated: 18000000, activeCases: 215 },
  { id: 'DEP-003', name: 'Home Department', code: 'HOME', nodalOfficer: 'Shri V. R. Rao', contactEmail: 'nodal.home@gujarat.gov.in', budgetAllocated: 30000000, activeCases: 540 },
  { id: 'DEP-004', name: 'Urban Development & Urban Housing', code: 'UDD', nodalOfficer: 'Shri P. J. Solanki', contactEmail: 'nodal.udd@gujarat.gov.in', budgetAllocated: 15000000, activeCases: 310 }
];

let mockFeeCategories = [
  { id: 'FEE-CAT-HC-EVID', courtType: 'High Court', categoryName: 'Effective Hearing / Arguments', rateScale: 35000, maxHearingsPerDay: 3, clerkagePercent: 10, effectiveDate: '2023-04-01', description: 'Appearance for substantial arguments or examination of witnesses' },
  { id: 'FEE-CAT-HC-ASST', courtType: 'High Court', categoryName: 'Assistance to Senior Counsel', rateScale: 15000, maxHearingsPerDay: 4, clerkagePercent: 10, effectiveDate: '2023-04-01', description: 'Assisting senior designated advocate' },
  { id: 'FEE-CAT-HC-ADJ', courtType: 'High Court', categoryName: 'Formal Appearance / Adjournment', rateScale: 5000, maxHearingsPerDay: 5, clerkagePercent: 10, effectiveDate: '2023-04-01', description: 'Non-effective hearing where matter is simply adjourned' },
  { id: 'FEE-CAT-DC-ARG', courtType: 'District & Sessions Court', categoryName: 'Trial Arguments', rateScale: 10000, maxHearingsPerDay: 4, clerkagePercent: 10, effectiveDate: '2023-04-01', description: 'Arguments before trial judge' }
];

let mockWorkflowConfig = [
  { stageId: 'STG-01', stageName: 'Bill Submission', roleAllowed: 'ADVOCATE', sequenceOrder: 1, requiresMandatoryDocuments: true, slaHours: 48 },
  { stageId: 'STG-02', stageName: 'Scrutiny & Verification', roleAllowed: 'VERIFIER', sequenceOrder: 2, requiresMandatoryDocuments: true, slaHours: 72 },
  { stageId: 'STG-03', stageName: 'Sanction & Approval', roleAllowed: 'APPROVER', sequenceOrder: 3, requiresMandatoryDocuments: false, slaHours: 96 },
  { stageId: 'STG-04', stageName: 'Disbursement & Payment', roleAllowed: 'FINANCE_OFFICER', sequenceOrder: 4, requiresMandatoryDocuments: true, slaHours: 120 }
];

let mockSlaConfig = [
  { entity: 'Hearing Attendance Recording', targetRole: 'LEGAL_OFFICER', warningHours: 24, breachHours: 48, escalationRole: 'DEPARTMENT_HEAD' },
  { entity: 'Bill Verification', targetRole: 'VERIFIER', warningHours: 48, breachHours: 72, escalationRole: 'APPROVER' },
  { entity: 'Bill Sanction', targetRole: 'APPROVER', warningHours: 72, breachHours: 96, escalationRole: 'DEPARTMENT_HEAD' },
  { entity: 'Payment Execution', targetRole: 'FINANCE_OFFICER', warningHours: 96, breachHours: 120, escalationRole: 'FINANCE_SECRETARY' }
];

let mockBudgetDimensions = [
  { id: 'DIM-01', code: '2014-00-114-01', name: 'High Court Legal Retainers', description: 'Fees paid to Senior Counsel and Govt Pleaders in High Court', financialHead: '2014-Administration of Justice', status: 'ACTIVE' },
  { id: 'DIM-02', code: '2014-00-114-02', name: 'Subordinate Courts Prosecution', description: 'Public Prosecutor fees in Sessions and City Courts', financialHead: '2014-Administration of Justice', status: 'ACTIVE' },
  { id: 'DIM-03', code: '2014-00-114-03', name: 'Special Counsel & Commissions', description: 'Special assignments, arbitration fees and inquiry commissions', financialHead: '2014-Administration of Justice', status: 'ACTIVE' }
];

export const api = {
  // Auth
  async login(username, password) {
    if (!isMockModeEnabled()) {
      try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ login: username, password })
        });
        if (response.ok) {
          const body = await response.json();
          if (body.success && body.data) {
            const token = body.data.token;
            const liveUser = {
              id: body.data.userId || 'USR-LIVE',
              username: body.data.login || username,
              name: body.data.name || username,
              email: body.data.email || `${username}@gujarat.gov.in`,
              role: (body.data.roles && body.data.roles[0]) ? body.data.roles[0].replace('ROLE_', '') : 'ADMIN',
              department: body.data.departmentName || 'Legal Department',
              status: 'ACTIVE'
            };
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(liveUser));
            return { token, user: liveUser };
          }
        }
      } catch (err) {
        console.warn('[LCMS] Live API login attempt failed, falling back to mock authentication:', err);
      }
    }

    const user = mockUsers.find(
      (u) => u.username === username || u.email === username
    ) || {
      id: 'USR-TEMP',
      username: username || 'demo_user',
      name: username ? username.toUpperCase() : 'Government Officer',
      email: `${username || 'user'}@gujarat.gov.in`,
      role: 'LEGAL_OFFICER',
      department: 'Legal Department',
      status: 'ACTIVE'
    };
    const token = 'mock-jwt-token-' + Date.now();
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return { token, user };
  },

  getCurrentUser() {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return Promise.resolve();
  },

  // Cases
  async getCases(filters = {}) {
    return request('/cases', {}, () => {
      let filtered = [...mockCases];
      if (filters.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.caseNumber.toLowerCase().includes(q) ||
            c.title.toLowerCase().includes(q) ||
            c.department.toLowerCase().includes(q)
        );
      }
      if (filters.department && filters.department !== 'ALL') {
        filtered = filtered.filter((c) => c.department === filters.department);
      }
      if (filters.status && filters.status !== 'ALL') {
        filtered = filtered.filter((c) => c.status === filters.status);
      }
      return filtered;
    });
  },

  async getCaseById(id) {
    return request(`/cases/${id}`, {}, () => {
      const found = mockCases.find((c) => c.id === id || c.caseNumber === id);
      if (!found) throw new Error('Case not found');
      return found;
    });
  },

  async createCase(caseData) {
    return request('/cases', { method: 'POST', body: JSON.stringify(caseData) }, () => {
      const newCase = {
        ...caseData,
        id: `CASE-2024-${String(mockCases.length + 1).padStart(3, '0')}`,
        status: 'ACTIVE',
        assignedAdvocates: caseData.assignedAdvocates || [],
        documents: []
      };
      mockCases.unshift(newCase);
      return newCase;
    });
  },

  async updateCase(id, caseData) {
    return request(`/cases/${id}`, { method: 'PUT', body: JSON.stringify(caseData) }, () => {
      const idx = mockCases.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error('Case not found');
      mockCases[idx] = { ...mockCases[idx], ...caseData };
      return mockCases[idx];
    });
  },

  // Hearings
  async getHearings(filters = {}) {
    return request('/hearings', {}, () => {
      let filtered = [...mockHearings];
      if (filters.caseId) {
        filtered = filtered.filter((h) => h.caseId === filters.caseId);
      }
      if (filters.status && filters.status !== 'ALL') {
        filtered = filtered.filter((h) => h.status === filters.status);
      }
      return filtered;
    });
  },

  async getHearingById(id) {
    return request(`/hearings/${id}`, {}, () => {
      const found = mockHearings.find((h) => h.id === id);
      if (!found) throw new Error('Hearing not found');
      return found;
    });
  },

  async createHearing(data) {
    return request('/hearings', { method: 'POST', body: JSON.stringify(data) }, () => {
      const newHearing = {
        ...data,
        id: `HRG-2024-${String(mockHearings.length + 101).padStart(3, '0')}`,
        status: 'SCHEDULED',
        outcome: '',
        rescheduleHistory: [],
        attendances: data.attendances || []
      };
      mockHearings.unshift(newHearing);
      return newHearing;
    });
  },

  async updateHearing(id, data) {
    return request(`/hearings/${id}`, { method: 'PUT', body: JSON.stringify(data) }, () => {
      const idx = mockHearings.findIndex((h) => h.id === id);
      if (idx === -1) throw new Error('Hearing not found');
      mockHearings[idx] = { ...mockHearings[idx], ...data };
      return mockHearings[idx];
    });
  },

  async recordAttendance(hearingId, attendanceData) {
    return request(`/hearings/${hearingId}/attendance`, { method: 'POST', body: JSON.stringify(attendanceData) }, () => {
      const idx = mockHearings.findIndex((h) => h.id === hearingId);
      if (idx === -1) throw new Error('Hearing not found');
      mockHearings[idx].attendances = attendanceData.attendances;
      return mockHearings[idx];
    });
  },

  // Bills
  async getBills(filters = {}) {
    return request('/bills', {}, () => {
      let filtered = [...mockBills];
      if (filters.advocateId) {
        filtered = filtered.filter((b) => b.advocateId === filters.advocateId);
      }
      if (filters.currentStage && filters.currentStage !== 'ALL') {
        filtered = filtered.filter((b) => b.currentStage === filters.currentStage);
      }
      if (filters.status && filters.status !== 'ALL') {
        filtered = filtered.filter((b) => b.status === filters.status);
      }
      return filtered;
    });
  },

  async getBillById(id) {
    return request(`/bills/${id}`, {}, () => {
      const found = mockBills.find((b) => b.id === id);
      if (!found) throw new Error('Bill not found');
      return found;
    });
  },

  async submitBill(billData) {
    return request('/bills', { method: 'POST', body: JSON.stringify(billData) }, () => {
      const newBill = {
        ...billData,
        id: `BILL-2024-${String(mockBills.length + 501).padStart(3, '0')}`,
        status: 'SUBMITTED',
        currentStage: 'VERIFICATION',
        stageAgeDays: 0,
        approvedAmount: 0,
        paidAmount: 0,
        duplicateMatches: [],
        actionHistory: [
          {
            action: 'SUBMITTED',
            actor: billData.advocateName || 'ADVOCATE',
            date: new Date().toISOString().split('T')[0],
            notes: 'Bill submitted for verification'
          }
        ]
      };
      mockBills.unshift(newBill);
      return newBill;
    });
  },

  async checkDuplicates(hearingId, advocateId) {
    return request('/bills/check-duplicates', { method: 'POST', body: JSON.stringify({ hearingId, advocateId }) }, () => {
      const matches = mockBills.filter(
        (b) => b.hearingId === hearingId && b.advocateId === advocateId
      );
      return { hasDuplicates: matches.length > 0, duplicates: matches };
    });
  },

  async reviewBill(billId, reviewData) {
    return request(`/bills/${billId}/review`, { method: 'POST', body: JSON.stringify(reviewData) }, () => {
      const idx = mockBills.findIndex((b) => b.id === billId);
      if (idx === -1) throw new Error('Bill not found');
      mockBills[idx].verifierChecklist = reviewData.checklist;
      mockBills[idx].currentStage = reviewData.passed ? 'APPROVER_REVIEW' : 'RETURNED_TO_ADVOCATE';
      mockBills[idx].status = reviewData.passed ? 'IN_APPROVAL' : 'RETURNED';
      mockBills[idx].actionHistory.push({
        action: reviewData.passed ? 'VERIFIED' : 'RETURNED_BY_VERIFIER',
        actor: reviewData.actor || 'VERIFIER',
        date: new Date().toISOString().split('T')[0],
        notes: reviewData.notes || 'Verification review completed'
      });
      return mockBills[idx];
    });
  },

  // Approvals
  async getApprovalInbox() {
    return request('/approvals/inbox', {}, () => {
      return mockBills.filter((b) => b.status === 'IN_APPROVAL' || b.currentStage === 'APPROVER_REVIEW');
    });
  },

  async takeApprovalAction(billId, { action, reason, actorRole, approvedAmount, isDigitallySigned, signatureCertificate, signatureDigest }) {
    return request(`/approvals/${billId}/action`, {
      method: 'POST',
      body: JSON.stringify({
        decision: action,
        comment: reason,
        approvedAmount,
        isDigitallySigned,
        signatureCertificate,
        signatureDigest,
      })
    }, () => {
      const idx = mockBills.findIndex((b) => b.id === billId);
      if (idx === -1) throw new Error('Bill not found');
      if (action === 'APPROVE') {
        mockBills[idx].status = 'APPROVED';
        mockBills[idx].currentStage = 'FINANCE_PAYMENT';
        mockBills[idx].approvedAmount = approvedAmount || mockBills[idx].totalClaimed;
      } else if (action === 'RETURN') {
        mockBills[idx].status = 'RETURNED';
        mockBills[idx].currentStage = 'RETURNED_TO_ADVOCATE';
      } else if (action === 'REJECT') {
        mockBills[idx].status = 'REJECTED';
        mockBills[idx].currentStage = 'CLOSED';
      }
      mockBills[idx].actionHistory.push({
        action,
        actor: `${actorRole || 'APPROVER'} ${isDigitallySigned ? '[DSC/e-Sign Verified]' : ''}`,
        date: new Date().toISOString().split('T')[0],
        notes: reason
      });
      mockAudits.unshift({
        id: `AUD-${Date.now()}`,
        action: `BILL_${action}`,
        actor: `${actorRole || 'APPROVER'}`,
        role: actorRole || 'APPROVER',
        timestamp: new Date().toISOString(),
        entity: `BILL: ${billId}`,
        reason: reason,
        previousStatus: 'IN_APPROVAL',
        newStatus: mockBills[idx].status
      });
      return mockBills[idx];
    });
  },

  // Payments
  async getPayments() {
    return request('/payments', {}, () => mockPayments);
  },

  async recordPayment(paymentData) {
    return request('/payments', { method: 'POST', body: JSON.stringify(paymentData) }, () => {
      const newPayment = {
        ...paymentData,
        id: `PAY-2024-${String(mockPayments.length + 902).padStart(3, '0')}`,
        status: 'SUCCESS',
        reversals: []
      };
      mockPayments.unshift(newPayment);
      const bIdx = mockBills.findIndex((b) => b.id === paymentData.billId);
      if (bIdx !== -1) {
        mockBills[bIdx].status = 'PAID';
        mockBills[bIdx].currentStage = 'PAID';
        mockBills[bIdx].paidAmount = paymentData.amount;
        mockBills[bIdx].actionHistory.push({
          action: 'PAID',
          actor: 'FINANCE_OFFICER',
          date: new Date().toISOString().split('T')[0],
          notes: `Paid ref ${newPayment.paymentReference} amount ₹${paymentData.amount}`
        });
      }
      return newPayment;
    });
  },

  async adjustPayment(paymentId, adjustmentData) {
    return request(`/payments/${paymentId}/adjustment`, { method: 'POST', body: JSON.stringify(adjustmentData) }, () => {
      const pIdx = mockPayments.findIndex((p) => p.id === paymentId);
      if (pIdx === -1) throw new Error('Payment not found');
      mockPayments[pIdx].reversals.push({
        date: new Date().toISOString().split('T')[0],
        amount: adjustmentData.amount,
        reason: adjustmentData.reason,
        reversalType: adjustmentData.reversalType
      });
      return mockPayments[pIdx];
    });
  },

  // Budget
  async getBudgetDashboard() {
    return request('/budget/dashboard', {}, () => mockBudgets);
  },

  async getBudgetSetup() {
    return request('/budget/setup', {}, () => mockBudgets);
  },

  async saveBudgetSetup(budgets) {
    return request('/budget/setup', { method: 'POST', body: JSON.stringify(budgets) }, () => {
      mockBudgets = budgets;
      return mockBudgets;
    });
  },

  // Reports
  async getAdvocateReport() {
    return request('/reports/advocates', {}, () => [
      { advocateName: 'Shri R. K. Trivedi', barNo: 'G/1234/1998', assignedCases: 14, totalHearings: 42, attendancesRecorded: 42, billsClaimed: 1450000, billsApproved: 1450000, billsPaid: 1250000, pendingLiability: 200000 },
      { advocateName: 'Smt. Ananya Desai', barNo: 'G/5678/2008', assignedCases: 28, totalHearings: 86, attendancesRecorded: 85, billsClaimed: 890000, billsApproved: 870000, billsPaid: 850000, pendingLiability: 20000 },
      { advocateName: 'Shri H. M. Parekh', barNo: 'G/9012/1995', assignedCases: 32, totalHearings: 110, attendancesRecorded: 108, billsClaimed: 2450000, billsApproved: 2300000, billsPaid: 2100000, pendingLiability: 200000 },
      { advocateName: 'Shri Bhavesh Patel', barNo: 'G/3456/2012', assignedCases: 45, totalHearings: 130, attendancesRecorded: 128, billsClaimed: 950000, billsApproved: 920000, billsPaid: 900000, pendingLiability: 20000 }
    ]);
  },

  async getCaseReport() {
    return request('/reports/cases', {}, () => mockCases.map(c => ({
      caseNumber: c.caseNumber,
      title: c.title,
      department: c.department,
      court: c.courtName,
      status: c.status,
      filingDate: c.filingDate,
      exposure: c.financialExposure,
      billsTotal: 40000
    })));
  },

  async getCourtReport() {
    return request('/reports/courts', {}, () => [
      { courtName: 'High Court of Gujarat', totalCases: 635, pendingHearings: 184, billsDisbursed: 42500000, avgTurnaroundDays: 14 },
      { courtName: 'City Civil Court, Ahmedabad', totalCases: 412, pendingHearings: 92, billsDisbursed: 14200000, avgTurnaroundDays: 11 },
      { courtName: 'District Court, Gandhinagar', totalCases: 198, pendingHearings: 45, billsDisbursed: 6800000, avgTurnaroundDays: 9 },
      { courtName: 'Supreme Court of India', totalCases: 64, pendingHearings: 18, billsDisbursed: 19500000, avgTurnaroundDays: 21 }
    ]);
  },

  async getYearReport() {
    return request('/reports/years', {}, () => [
      { financialYear: '2021-2022', totalHearings: 1240, billsSubmitted: 940, totalClaimed: 48000000, totalDisbursed: 46200000 },
      { financialYear: '2022-2023', totalHearings: 1480, billsSubmitted: 1120, totalClaimed: 58500000, totalDisbursed: 56400000 },
      { financialYear: '2023-2024', totalHearings: 1690, billsSubmitted: 1350, totalClaimed: 71200000, totalDisbursed: 69800000 },
      { financialYear: '2024-2025 (YTD)', totalHearings: 920, billsSubmitted: 780, totalClaimed: 42100000, totalDisbursed: 31100000 }
    ]);
  },

  async getBudgetReport() {
    return request('/reports/budget', {}, () => mockBudgets);
  },

  async getAttendanceReport() {
    return request('/reports/attendance', {}, () => [
      { court: 'High Court of Gujarat', totalHearings: 450, attendancesRecorded: 432, pendingAttendance: 18, complianceRate: '96%' },
      { court: 'City Civil Court', totalHearings: 210, attendancesRecorded: 195, pendingAttendance: 15, complianceRate: '92.8%' },
      { court: 'District Court Gandhinagar', totalHearings: 140, attendancesRecorded: 138, pendingAttendance: 2, complianceRate: '98.5%' }
    ]);
  },

  // Notifications
  async getNotifications() {
    return request('/notifications', {}, () => mockNotifications);
  },

  async markNotificationRead(id) {
    return request(`/notifications/${id}/read`, { method: 'POST' }, () => {
      const notif = mockNotifications.find((n) => n.id === id);
      if (notif) notif.isRead = true;
      return notif;
    });
  },

  // Audit
  async getAuditHistory(filters = {}) {
    return request('/audit', {}, () => {
      let filtered = [...mockAudits];
      if (filters.action && filters.action !== 'ALL') {
        filtered = filtered.filter((a) => a.action === filters.action);
      }
      if (filters.role && filters.role !== 'ALL') {
        filtered = filtered.filter((a) => a.role === filters.role);
      }
      return filtered;
    });
  },

  // Admin Masters
  async getUsers() {
    return request('/admin/users', {}, () => mockUsers);
  },

  async createUser(u) {
    return request('/admin/users', { method: 'POST', body: JSON.stringify(u) }, () => {
      const newUser = { ...u, id: `USR-${String(mockUsers.length + 1).padStart(3, '0')}` };
      mockUsers.push(newUser);
      return newUser;
    });
  },

  async updateUser(id, u) {
    return request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(u) }, () => {
      const idx = mockUsers.findIndex((x) => x.id === id);
      if (idx !== -1) mockUsers[idx] = { ...mockUsers[idx], ...u };
      return mockUsers[idx];
    });
  },

  async deleteUser(id) {
    return request(`/admin/users/${id}`, { method: 'DELETE' }, () => {
      mockUsers = mockUsers.filter((x) => x.id !== id);
      return { success: true };
    });
  },

  async getCourts() {
    return request('/admin/courts', {}, () => mockCourts);
  },

  async createCourt(c) {
    return request('/admin/courts', { method: 'POST', body: JSON.stringify(c) }, () => {
      const newCourt = { ...c, id: `CRT-${String(mockCourts.length + 1).padStart(3, '0')}` };
      mockCourts.push(newCourt);
      return newCourt;
    });
  },

  async updateCourt(id, c) {
    return request(`/admin/courts/${id}`, { method: 'PUT', body: JSON.stringify(c) }, () => {
      const idx = mockCourts.findIndex((x) => x.id === id);
      if (idx !== -1) mockCourts[idx] = { ...mockCourts[idx], ...c };
      return mockCourts[idx];
    });
  },

  async deleteCourt(id) {
    return request(`/admin/courts/${id}`, { method: 'DELETE' }, () => {
      mockCourts = mockCourts.filter((x) => x.id !== id);
      return { success: true };
    });
  },

  async getAdvocates() {
    return request('/admin/advocates', {}, () => mockAdvocates);
  },

  async createAdvocate(a) {
    return request('/admin/advocates', { method: 'POST', body: JSON.stringify(a) }, () => {
      const newAdv = { ...a, id: `ADV-${String(mockAdvocates.length + 1).padStart(3, '0')}` };
      mockAdvocates.push(newAdv);
      return newAdv;
    });
  },

  async updateAdvocate(id, a) {
    return request(`/admin/advocates/${id}`, { method: 'PUT', body: JSON.stringify(a) }, () => {
      const idx = mockAdvocates.findIndex((x) => x.id === id);
      if (idx !== -1) mockAdvocates[idx] = { ...mockAdvocates[idx], ...a };
      return mockAdvocates[idx];
    });
  },

  async deleteAdvocate(id) {
    return request(`/admin/advocates/${id}`, { method: 'DELETE' }, () => {
      mockAdvocates = mockAdvocates.filter((x) => x.id !== id);
      return { success: true };
    });
  },

  async getDepartments() {
    return request('/admin/departments', {}, () => mockDepartments);
  },

  async createDepartment(d) {
    return request('/admin/departments', { method: 'POST', body: JSON.stringify(d) }, () => {
      const newDept = { ...d, id: `DEP-${String(mockDepartments.length + 1).padStart(3, '0')}` };
      mockDepartments.push(newDept);
      return newDept;
    });
  },

  async updateDepartment(id, d) {
    return request(`/admin/departments/${id}`, { method: 'PUT', body: JSON.stringify(d) }, () => {
      const idx = mockDepartments.findIndex((x) => x.id === id);
      if (idx !== -1) mockDepartments[idx] = { ...mockDepartments[idx], ...d };
      return mockDepartments[idx];
    });
  },

  async deleteDepartment(id) {
    return request(`/admin/departments/${id}`, { method: 'DELETE' }, () => {
      mockDepartments = mockDepartments.filter((x) => x.id !== id);
      return { success: true };
    });
  },

  async getFeeCategories() {
    return request('/admin/fee-categories', {}, () => mockFeeCategories);
  },

  async createFeeCategory(fc) {
    return request('/admin/fee-categories', { method: 'POST', body: JSON.stringify(fc) }, () => {
      const newFc = { ...fc, id: `FEE-${Date.now()}` };
      mockFeeCategories.push(newFc);
      return newFc;
    });
  },

  async updateFeeCategory(id, fc) {
    return request(`/admin/fee-categories/${id}`, { method: 'PUT', body: JSON.stringify(fc) }, () => {
      const idx = mockFeeCategories.findIndex((x) => x.id === id);
      if (idx !== -1) mockFeeCategories[idx] = { ...mockFeeCategories[idx], ...fc };
      return mockFeeCategories[idx];
    });
  },

  async getWorkflowConfig() {
    return request('/admin/workflow-config', {}, () => mockWorkflowConfig);
  },

  async saveWorkflowConfig(cfg) {
    return request('/admin/workflow-config', { method: 'POST', body: JSON.stringify(cfg) }, () => {
      mockWorkflowConfig = cfg;
      return mockWorkflowConfig;
    });
  },

  async getSlaConfig() {
    return request('/admin/sla-config', {}, () => mockSlaConfig);
  },

  async saveSlaConfig(cfg) {
    return request('/admin/sla-config', { method: 'POST', body: JSON.stringify(cfg) }, () => {
      mockSlaConfig = cfg;
      return mockSlaConfig;
    });
  },

  async getBudgetDimensions() {
    return request('/admin/budget-dimensions', {}, () => mockBudgetDimensions);
  },

  async saveBudgetDimensions(dims) {
    return request('/admin/budget-dimensions', { method: 'POST', body: JSON.stringify(dims) }, () => {
      mockBudgetDimensions = dims;
      return mockBudgetDimensions;
    });
  }
};
