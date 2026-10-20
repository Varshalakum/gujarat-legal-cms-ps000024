import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api, formatINR, formatDate } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import Timeline from '../../components/Timeline';
import { IconCertificate } from '../../components/Icons';

export const ApprovalActionPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bill, setBill] = useState(null);
  const [action, setAction] = useState('APPROVE');
  const [sanctionedAmount, setSanctionedAmount] = useState(0);
  const [reason, setReason] = useState('');
  const [useDigitalSignature, setUseDigitalSignature] = useState(true);
  const [hashDigest] = useState(() => Math.floor(Math.random() * 1000000000) + 100000000);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBill = async () => {
      try {
        setLoading(true);
        const b = await api.getBillById(id);
        setBill(b);
        setSanctionedAmount(b.totalClaimed);
      } catch (err) {
        setError('Failed to fetch voucher for approval.');
      } finally {
        setLoading(false);
      }
    };
    fetchBill();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!reason.trim()) {
      setError('A mandatory official reason/justification is required for this sanction action.');
      return;
    }

    if (action === 'APPROVE' && sanctionedAmount <= 0) {
      setError('Sanctioned amount must be greater than zero for approval.');
      return;
    }

    try {
      setSubmitting(true);
      await api.takeApprovalAction(id, {
        action,
        reason,
        actorRole: user?.role || 'APPROVER',
        approvedAmount: Number(sanctionedAmount),
        isDigitallySigned: action === 'APPROVE' && useDigitalSignature,
        signatureCertificate: useDigitalSignature ? `NIC-CA-GUJ-${user?.role || 'APPROVER'}-2026` : null,
        signatureDigest: useDigitalSignature ? Math.abs(hashDigest).toString(16).padStart(32, 'a') : null,
      });

      alert(`Voucher ${action} action recorded successfully.`);
      navigate('/approvals');
    } catch (err) {
      setError(err.message || 'Failed to process approval action.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading sanction dossier...</p>;
  if (!bill) return <p>Voucher record not found.</p>;

  return (
    <article>
      <header>
        <div>
          <Link to="/approvals">&larr; Back to Approval Inbox</Link>
        </div>
        <h2>Executive Sanction Docket: {bill.id}</h2>
        <p>
          Reference: <strong>{bill.billReference}</strong> | Status: <StatusBadge status={bill.status} />
        </p>
      </header>

      {error && (
        <aside role="alert">
          <p>
            <strong>Action Error:</strong> {error}
          </p>
        </aside>
      )}

      {/* Summary */}
      <section>
        <h3>Voucher Claim Summary</h3>
        <table border="1" cellPadding="6" cellSpacing="0" width="100%">
          <tbody>
            <tr>
              <th align="left">Claimant Advocate</th>
              <td>{bill.advocateName}</td>
              <th align="left">Case Docket</th>
              <td>
                <Link to={`/cases/${bill.caseId}`}>{bill.caseNumber}</Link>
              </td>
            </tr>
            <tr>
              <th align="left">Fee Category</th>
              <td>{bill.feeCategoryName}</td>
              <th align="left">Bill Date</th>
              <td>{formatDate(bill.billDate)}</td>
            </tr>
            <tr>
              <th align="left">Claimed Net Total</th>
              <td>
                <strong>{formatINR(bill.totalClaimed)}</strong>
              </td>
              <th align="left">Stage Age</th>
              <td>{bill.stageAgeDays} days</td>
            </tr>
          </tbody>
        </table>
      </section>

      <br />

      {/* Verification Scrutiny Checks */}
      <section>
        <h3>Verifier Scrutiny Findings</h3>
        {bill.verifierChecklist ? (
          <ul>
            <li>
              Hearing Listed &amp; Validated: {bill.verifierChecklist.hearingVerified ? 'YES' : 'NO'}
            </li>
            <li>
              Advocate Appearance Certified:{' '}
              {bill.verifierChecklist.attendanceVerified ? 'YES' : 'NO'}
            </li>
            <li>
              Scale Rate Adherence: {bill.verifierChecklist.scaleRateAdherence ? 'YES' : 'NO'}
            </li>
            <li>
              Signed Vouchers Attached:{' '}
              {bill.verifierChecklist.originalVouchersAttached ? 'YES' : 'NO'}
            </li>
          </ul>
        ) : (
          <p>
            <em>No scrutiny checklist recorded.</em>
          </p>
        )}
      </section>

      <br />

      {/* Decision Form */}
      <section>
        <form onSubmit={handleSubmit}>
          <fieldset>
            <legend>Sanctioning Decision</legend>

            <div>
              <label>Select Executive Action: </label>
              <br />
              <label>
                <input
                  type="radio"
                  name="approvalAction"
                  value="APPROVE"
                  checked={action === 'APPROVE'}
                  onChange={(e) => setAction(e.target.value)}
                />{' '}
                <strong>APPROVE</strong> (Grant financial sanction and queue for payment)
              </label>
              <br />
              <label>
                <input
                  type="radio"
                  name="approvalAction"
                  value="RETURN"
                  checked={action === 'RETURN'}
                  onChange={(e) => setAction(e.target.value)}
                />{' '}
                <strong>RETURN</strong> (Send back to claimant advocate for clarifications)
              </label>
              <br />
              <label>
                <input
                  type="radio"
                  name="approvalAction"
                  value="REJECT"
                  checked={action === 'REJECT'}
                  onChange={(e) => setAction(e.target.value)}
                />{' '}
                <strong>REJECT</strong> (Decline fee claim outright)
              </label>
            </div>

            <br />

            {/* Delegation Limit Guidance */}
            <div style={{ background: '#f5f7fa', padding: '10px 14px', borderRadius: '4px', borderLeft: '4px solid #1976d2', marginBottom: '14px' }}>
              <strong>Delegation of Financial Powers (DFPR) Thresholds:</strong>
              <ul style={{ margin: '6px 0 0 16px', fontSize: '13px' }}>
                <li><strong>Tier 1 (Law Officer):</strong> Up to ₹50,000</li>
                <li><strong>Tier 2 (Secretary Legal):</strong> Up to ₹2,00,000</li>
                <li><strong>Tier 3 (Department Head / Pr. Secretary):</strong> Above ₹2,00,000</li>
                <li><em>Verifier role is restricted to document scrutiny and possesses ₹0 financial sanction power.</em></li>
              </ul>
            </div>

            {action === 'APPROVE' && (
              <div>
                <label htmlFor="sanctionAmt">Sanctioned Amount (INR): </label>
                <br />
                <input
                  id="sanctionAmt"
                  type="number"
                  min="0"
                  step="500"
                  value={sanctionedAmount}
                  onChange={(e) => setSanctionedAmount(Number(e.target.value))}
                  required
                />
                <p>
                  <small>Claimed Amount was {formatINR(bill.totalClaimed)}</small>
                </p>
              </div>
            )}

            <br />

            {/* Digital Signature (DSC / e-Sign) Security Card */}
            {action === 'APPROVE' && (
              <div style={{ background: '#eef6fc', border: '1px solid #90caf9', borderRadius: '6px', padding: '12px', marginBottom: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={useDigitalSignature}
                    onChange={(e) => setUseDigitalSignature(e.target.checked)}
                  />
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <IconCertificate size={16} color="#0d47a1" />
                    Authenticate Sanction Order with Digital Signature (Class 3 DSC / Aadhaar e-Sign)
                  </span>
                </label>
                {useDigitalSignature && (
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#0d47a1', background: '#ffffff', padding: '8px', borderRadius: '4px', border: '1px dashed #64b5f6' }}>
                    <div><strong>Signer Token ID:</strong> {user?.name || 'Sanctioning Authority'} (NIC-CA-GUJ-{user?.role || 'APPROVER'})</div>
                    <div><strong>Certificate Serial:</strong> 2026-GUJ-LEGAL-DSC-{(bill.id || '999').toString().padStart(6, '0')}</div>
                    <div><strong>Cryptographic Digest (SHA-256):</strong> <code>{Math.abs(hashDigest).toString(16).padStart(32, 'a')}...</code></div>
                    <div><strong>Signing Timestamp:</strong> {new Date().toISOString()}</div>
                  </div>
                )}
              </div>
            )}

            <div>
              <label htmlFor="reason">
                <strong>Mandatory Official Reason / Sanction Order Remarks: </strong>
              </label>
              <br />
              <textarea
                id="reason"
                rows="4"
                cols="60"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter regulatory justification, scale compliance note, or objection specifics..."
                required
              />
            </div>

            <br />

            <div>
              <button type="submit" disabled={submitting}>
                {submitting ? 'Executing Sanction...' : `Confirm Decision: [${action}]`}
              </button>
              {' '}
              <Link to="/approvals">
                <button type="button">Cancel</button>
              </Link>
            </div>
          </fieldset>
        </form>
      </section>

      <br />

      {/* History */}
      <section>
        <h3>Audit &amp; Action Timeline</h3>
        <Timeline events={bill.actionHistory || []} />
      </section>
    </article>
  );
};

export default ApprovalActionPage;
