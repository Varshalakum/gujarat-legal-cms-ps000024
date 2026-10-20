-- ============================================================================
-- Government Legal Case Management System - Database Migration V2
-- Security Hardening, Cryptographic Audit Hash-Chaining & Statutory Deductions
-- ============================================================================

-- 1. Audit Trail Cryptographic Hash Chaining
ALTER TABLE audit_events
    ADD COLUMN IF NOT EXISTS previous_hash VARCHAR(64) DEFAULT NULL AFTER request_id,
    ADD COLUMN IF NOT EXISTS current_hash VARCHAR(64) DEFAULT NULL AFTER previous_hash;

-- 2. Document Checksum for Deduplication and Tamper Detection
ALTER TABLE bill_documents
    ADD COLUMN IF NOT EXISTS checksum_sha256 VARCHAR(64) DEFAULT NULL AFTER document_type;

-- 3. Digital Signatures (DSC Class 3 / Aadhaar e-Sign) on Sanction Decisions
ALTER TABLE approval_actions
    ADD COLUMN IF NOT EXISTS is_digitally_signed BOOLEAN DEFAULT FALSE AFTER comment,
    ADD COLUMN IF NOT EXISTS signature_certificate VARCHAR(255) DEFAULT NULL AFTER is_digitally_signed,
    ADD COLUMN IF NOT EXISTS signature_digest VARCHAR(64) DEFAULT NULL AFTER signature_certificate,
    ADD COLUMN IF NOT EXISTS signed_at DATETIME DEFAULT NULL AFTER signature_digest;

-- 4. Multi-Tier Statutory Deductions (IT TDS u/s 194J, GST TDS u/s 51, Advocate Welfare Fund)
ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS gross_amount DECIMAL(14,2) DEFAULT NULL AFTER idempotency_key,
    ADD COLUMN IF NOT EXISTS tds_amount DECIMAL(14,2) DEFAULT 0.00 AFTER gross_amount,
    ADD COLUMN IF NOT EXISTS gst_tds_amount DECIMAL(14,2) DEFAULT 0.00 AFTER tds_amount,
    ADD COLUMN IF NOT EXISTS welfare_fund_amount DECIMAL(14,2) DEFAULT 0.00 AFTER gst_tds_amount;
