-- ============================================================================
-- Government Legal Case Management System - Database Schema
-- Legal Department, Government of Gujarat
-- ============================================================================

-- 1. departments
CREATE TABLE IF NOT EXISTS departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. users
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    login VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    department_id BIGINT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. roles
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. user_roles
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. advocates
CREATE TABLE IF NOT EXISTS advocates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    registration_ref VARCHAR(100) NOT NULL UNIQUE,
    contact VARCHAR(50) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_advocates_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. courts
CREATE TABLE IF NOT EXISTS courts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    level VARCHAR(100) NOT NULL, -- HIGH_COURT, DISTRICT_COURT, SUPREME_COURT, TRIBUNAL
    location VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. cases
CREATE TABLE IF NOT EXISTS cases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    internal_case_no VARCHAR(100) NOT NULL UNIQUE,
    court_id BIGINT NOT NULL,
    court_case_ref VARCHAR(100) NOT NULL,
    department_id BIGINT NOT NULL,
    case_type VARCHAR(100) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN', -- OPEN, ACTIVE, ON_HOLD, CLOSED, DISPOSED
    priority VARCHAR(50) NOT NULL DEFAULT 'NORMAL',
    filing_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cases_court FOREIGN KEY (court_id) REFERENCES courts(id),
    CONSTRAINT fk_cases_department FOREIGN KEY (department_id) REFERENCES departments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. case_advocate_assignments
CREATE TABLE IF NOT EXISTS case_advocate_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    case_id BIGINT NOT NULL,
    advocate_id BIGINT NOT NULL,
    role VARCHAR(100) NOT NULL, -- LEAD_COUNSEL, ASSOCIATE, SPECIAL_COUNSEL
    valid_from DATE NOT NULL,
    valid_to DATE,
    reason VARCHAR(500),
    changed_by BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_caa_case FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    CONSTRAINT fk_caa_advocate FOREIGN KEY (advocate_id) REFERENCES advocates(id),
    CONSTRAINT fk_caa_changed_by FOREIGN KEY (changed_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. hearings
CREATE TABLE IF NOT EXISTS hearings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    case_id BIGINT NOT NULL,
    court_id BIGINT NOT NULL,
    scheduled_at DATETIME NOT NULL,
    outcome VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED', -- SCHEDULED, COMPLETED, ADJOURNED, CANCELLED
    next_hearing_at DATETIME,
    postponement_reason VARCHAR(500),
    notes TEXT,
    entered_by BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_hearings_case FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    CONSTRAINT fk_hearings_court FOREIGN KEY (court_id) REFERENCES courts(id),
    CONSTRAINT fk_hearings_entered_by FOREIGN KEY (entered_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. hearing_attendance
CREATE TABLE IF NOT EXISTS hearing_attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hearing_id BIGINT NOT NULL,
    advocate_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'NOT_RECORDED', -- PRESENT, ABSENT, NOT_RECORDED
    entered_by BIGINT,
    entered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, VERIFIED, REJECTED
    source_ref VARCHAR(255),
    notes TEXT,
    CONSTRAINT fk_ha_hearing FOREIGN KEY (hearing_id) REFERENCES hearings(id) ON DELETE CASCADE,
    CONSTRAINT fk_ha_advocate FOREIGN KEY (advocate_id) REFERENCES advocates(id),
    CONSTRAINT fk_ha_entered_by FOREIGN KEY (entered_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. hearing_change_events
CREATE TABLE IF NOT EXISTS hearing_change_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hearing_id BIGINT NOT NULL,
    previous_date DATETIME,
    new_date DATETIME NOT NULL,
    reason VARCHAR(500) NOT NULL,
    actor_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_hce_hearing FOREIGN KEY (hearing_id) REFERENCES hearings(id) ON DELETE CASCADE,
    CONSTRAINT fk_hce_actor FOREIGN KEY (actor_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. fee_categories
CREATE TABLE IF NOT EXISTS fee_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    label VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. fee_rules
CREATE TABLE IF NOT EXISTS fee_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT NOT NULL,
    rule_type VARCHAR(100) NOT NULL,
    rate DECIMAL(14,2) NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE,
    requires_hearing BOOLEAN NOT NULL DEFAULT FALSE,
    required_documents VARCHAR(500),
    CONSTRAINT fk_fr_category FOREIGN KEY (category_id) REFERENCES fee_categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. bills
CREATE TABLE IF NOT EXISTS bills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bill_no VARCHAR(100) NOT NULL UNIQUE,
    advocate_id BIGINT NOT NULL,
    case_id BIGINT NOT NULL,
    bill_reference VARCHAR(150),
    claim_date DATE NOT NULL,
    period_start DATE,
    period_end DATE,
    category_id BIGINT NOT NULL,
    claimed_amount DECIMAL(14,2) NOT NULL,
    approved_amount DECIMAL(14,2) DEFAULT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- DRAFT, SUBMITTED, PENDING_VERIFICATION, RETURNED, VERIFIED, PENDING_APPROVAL, APPROVED, REJECTED, WITHDRAWN
    submitted_at DATETIME,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bills_advocate FOREIGN KEY (advocate_id) REFERENCES advocates(id),
    CONSTRAINT fk_bills_case FOREIGN KEY (case_id) REFERENCES cases(id),
    CONSTRAINT fk_bills_category FOREIGN KEY (category_id) REFERENCES fee_categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. bill_hearings
CREATE TABLE IF NOT EXISTS bill_hearings (
    bill_id BIGINT NOT NULL,
    hearing_id BIGINT NOT NULL,
    PRIMARY KEY (bill_id, hearing_id),
    CONSTRAINT fk_bh_bill FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
    CONSTRAINT fk_bh_hearing FOREIGN KEY (hearing_id) REFERENCES hearings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. bill_versions
CREATE TABLE IF NOT EXISTS bill_versions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bill_id BIGINT NOT NULL,
    version_no INT NOT NULL,
    amount DECIMAL(14,2) NOT NULL,
    period VARCHAR(100),
    changes TEXT,
    reason VARCHAR(500),
    actor_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bv_bill FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
    CONSTRAINT fk_bv_actor FOREIGN KEY (actor_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. bill_documents
CREATE TABLE IF NOT EXISTS bill_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bill_id BIGINT NOT NULL,
    storage_key VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    uploaded_by BIGINT,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bd_bill FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
    CONSTRAINT fk_bd_user FOREIGN KEY (uploaded_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. verification_checks
CREATE TABLE IF NOT EXISTS verification_checks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bill_id BIGINT NOT NULL,
    verifier_id BIGINT NOT NULL,
    check_code VARCHAR(100) NOT NULL,
    result VARCHAR(50) NOT NULL DEFAULT 'NOT_STARTED', -- NOT_STARTED, PASS, FAIL, EXCEPTION_APPROVED
    comment VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vc_bill FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
    CONSTRAINT fk_vc_verifier FOREIGN KEY (verifier_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. workflow_definitions
CREATE TABLE IF NOT EXISTS workflow_definitions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    workflow_code VARCHAR(50) NOT NULL UNIQUE,
    version INT NOT NULL DEFAULT 1,
    active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. workflow_stages
CREATE TABLE IF NOT EXISTS workflow_stages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    workflow_id BIGINT NOT NULL,
    stage_order INT NOT NULL,
    role_code VARCHAR(50) NOT NULL,
    due_hours INT NOT NULL DEFAULT 48,
    authority_limit DECIMAL(14,2),
    CONSTRAINT fk_ws_workflow FOREIGN KEY (workflow_id) REFERENCES workflow_definitions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. workflow_tasks
CREATE TABLE IF NOT EXISTS workflow_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bill_id BIGINT NOT NULL,
    stage_id BIGINT NOT NULL,
    owner_id BIGINT,
    entered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    due_at DATETIME,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED, REJECTED, RETURNED
    CONSTRAINT fk_wt_bill FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
    CONSTRAINT fk_wt_stage FOREIGN KEY (stage_id) REFERENCES workflow_stages(id),
    CONSTRAINT fk_wt_owner FOREIGN KEY (owner_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. approval_actions
CREATE TABLE IF NOT EXISTS approval_actions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT NOT NULL,
    actor_id BIGINT NOT NULL,
    decision VARCHAR(50) NOT NULL, -- APPROVE, RETURN, REJECT
    comment VARCHAR(1000),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_aa_task FOREIGN KEY (task_id) REFERENCES workflow_tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_aa_actor FOREIGN KEY (actor_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. payments
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bill_id BIGINT NOT NULL,
    payment_reference VARCHAR(100) NOT NULL UNIQUE,
    idempotency_key VARCHAR(100) NOT NULL UNIQUE,
    amount DECIMAL(14,2) NOT NULL,
    payment_date DATE NOT NULL,
    mode VARCHAR(50) NOT NULL, -- NEFT, RTGS, CHEQUE, TREASURY_TRANSFER, DIRECT_BENEFIT_TRANSFER
    status VARCHAR(50) NOT NULL DEFAULT 'RECORDED', -- RECORDED, REVERSED, ADJUSTED
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_bill FOREIGN KEY (bill_id) REFERENCES bills(id),
    CONSTRAINT fk_payments_creator FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. payment_adjustments
CREATE TABLE IF NOT EXISTS payment_adjustments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    original_payment_id BIGINT NOT NULL,
    adjustment_type VARCHAR(50) NOT NULL, -- DEDUCTION, REFUND, PENALTY, RECOVERY, REVERSAL
    amount DECIMAL(14,2) NOT NULL,
    reason VARCHAR(500) NOT NULL,
    actor_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pa_payment FOREIGN KEY (original_payment_id) REFERENCES payments(id),
    CONSTRAINT fk_pa_actor FOREIGN KEY (actor_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 25. accounting_entries
CREATE TABLE IF NOT EXISTS accounting_entries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_id BIGINT NOT NULL,
    voucher_reference VARCHAR(100) NOT NULL UNIQUE,
    accounting_head VARCHAR(100) NOT NULL,
    financial_year VARCHAR(20) NOT NULL,
    entered_by BIGINT NOT NULL,
    entered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ae_payment FOREIGN KEY (payment_id) REFERENCES payments(id),
    CONSTRAINT fk_ae_user FOREIGN KEY (entered_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 26. budget_allocations
CREATE TABLE IF NOT EXISTS budget_allocations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    financial_year VARCHAR(20) NOT NULL,
    department_id BIGINT NOT NULL,
    budget_dimension VARCHAR(100) NOT NULL,
    allocated_amount DECIMAL(14,2) NOT NULL,
    version INT NOT NULL DEFAULT 1,
    approved_by BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ba_dept FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT fk_ba_approver FOREIGN KEY (approved_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 27. notifications
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_id BIGINT NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME,
    channel VARCHAR(50) NOT NULL DEFAULT 'IN_APP',
    delivery_status VARCHAR(50) NOT NULL DEFAULT 'SENT',
    CONSTRAINT fk_notif_recipient FOREIGN KEY (recipient_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 28. audit_events (APPEND-ONLY)
CREATE TABLE IF NOT EXISTS audit_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    actor_id BIGINT,
    role_code VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id BIGINT,
    before_after_summary TEXT,
    reason VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    request_id VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Seed Initial Data
-- ============================================================================

INSERT IGNORE INTO roles (id, code, name) VALUES
(1, 'ADVOCATE', 'Advocate'),
(2, 'LEGAL_OFFICER', 'Legal Officer'),
(3, 'BILL_PREPARER', 'Bill Preparer'),
(4, 'VERIFIER', 'Verifier'),
(5, 'APPROVER', 'Approver'),
(6, 'FINANCE_OFFICER', 'Finance Officer'),
(7, 'DEPARTMENT_HEAD', 'Department Head'),
(8, 'ADMIN', 'System Administrator'),
(9, 'AUDITOR', 'Auditor');

INSERT IGNORE INTO departments (id, code, name, active) VALUES
(1, 'LEGAL_DEPT', 'Legal Department, Government of Gujarat', TRUE),
(2, 'REV_DEPT', 'Revenue Department', TRUE),
(3, 'HOME_DEPT', 'Home Department', TRUE),
(4, 'FIN_DEPT', 'Finance Department', TRUE);

-- Initial Courts
INSERT IGNORE INTO courts (id, name, level, location, active) VALUES
(1, 'High Court of Gujarat', 'HIGH_COURT', 'Ahmedabad', TRUE),
(2, 'City Civil & Sessions Court, Ahmedabad', 'DISTRICT_COURT', 'Ahmedabad', TRUE),
(3, 'District & Sessions Court, Gandhinagar', 'DISTRICT_COURT', 'Gandhinagar', TRUE),
(4, 'Supreme Court of India', 'SUPREME_COURT', 'New Delhi', TRUE),
(5, 'Gujarat Revenue Tribunal', 'TRIBUNAL', 'Ahmedabad', TRUE);

-- Initial Fee Categories
INSERT IGNORE INTO fee_categories (id, code, label, active) VALUES
(1, 'HC_APPEARANCE', 'High Court Effective Appearance', TRUE),
(2, 'HC_NON_APPEARANCE', 'High Court Non-Effective Appearance', TRUE),
(3, 'DRAFTING_PETITION', 'Drafting Special Civil Application / Petition', TRUE),
(4, 'WRITTEN_SUBMISSION', 'Preparation of Written Submissions / Counter Affidavit', TRUE),
(5, 'DIST_APPEARANCE', 'District Court Appearance', TRUE);

-- Initial Fee Rules
INSERT IGNORE INTO fee_rules (id, category_id, rule_type, rate, effective_from, effective_to, requires_hearing, required_documents) VALUES
(1, 1, 'PER_HEARING', 7500.00, '2024-01-01', NULL, TRUE, 'ATTENDANCE_MEMO,DAILY_ORDER'),
(2, 2, 'PER_HEARING', 2500.00, '2024-01-01', NULL, TRUE, 'CAUSE_LIST'),
(3, 3, 'PER_DOCUMENT', 5000.00, '2024-01-01', NULL, FALSE, 'PETITION_COPY'),
(4, 4, 'PER_DOCUMENT', 3500.00, '2024-01-01', NULL, FALSE, 'AFFIDAVIT_COPY'),
(5, 5, 'PER_HEARING', 4000.00, '2024-01-01', NULL, TRUE, 'ATTENDANCE_MEMO');

-- Initial Workflow Definitions & Stages
INSERT IGNORE INTO workflow_definitions (id, workflow_code, version, active) VALUES
(1, 'STANDARD_BILL_FLOW', 1, TRUE);

INSERT IGNORE INTO workflow_stages (id, workflow_id, stage_order, role_code, due_hours, authority_limit) VALUES
(1, 1, 1, 'VERIFIER', 48, 50000.00),
(2, 1, 2, 'APPROVER', 48, 200000.00),
(3, 1, 3, 'DEPARTMENT_HEAD', 72, NULL); -- No limit for Dept Head

-- Initial Admin and Demo Users (password is 'Password@123' hashed with BCrypt)
-- Hash: $2a$10$wTfD3b8yA0yqF0vj8nFZeOqP9yG12yqSfZoI1J9xX8eNqWz5W1B3i (or standard bcrypt)
-- We will also provide auto-hash seeding in DataInitializer
