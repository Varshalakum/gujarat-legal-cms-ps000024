import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api, formatINR, formatDate } from '../../services/api';
import DuplicateWarning from './DuplicateWarning';
import Timeline from '../../components/Timeline';

export const BillReviewPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bill, setBill] = useState(null);
  const [hearing, setHearing] = useState(null);
  const [duplicateMatches, setDuplicateMatches] = useState([]);
  const [checklist, setChecklist] = useState({
    hearingVerified: true,
    attendanceVerified: true,
    scaleRateAdherence: true,
    originalVouchersAttached: true,
  });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const loadPacket = async () => {
      try {
        setLoading(true);
        const b = await api.getBillById(id);
        setBill(b);
        if (b.verifierChecklist) {
          setChecklist(b.verifierChecklist);
        }

        if (b.hearingId) {
          const h = await api.getHearingById(b.hearingId);
          setHearing(h);
        }

        const dups = await api.checkDuplicates(b.hearingId, b.advocateId);
        // Exclude self from duplicates
        setDuplicateMatches((dups.duplicates || []).filter((d) => d.id !== b.id));
      } catch (err) {
        console.error('Error loading review packet:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPacket();
  }, [id]);

  const handleCheckbox = (field) => {
    setChecklist((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleReviewAction = async (passed) => {
    if (!notes.trim() && !passed) {
      alert('Mandatory reason/objection notes required when returning bill.');
      return;
    }

    try {
      setSubmitting(true);
      await api.reviewBill(id, {
        checklist,
        passed,
        notes: notes || (passed ? 'Scrutiny verified and passed by officer.' : 'Returned with objections.'),
        actor: `${user?.role || 'VERIFIER'} (${user?.name || 'Officer'})`,
      });
      setMsg(passed ? 'Bill verified successfully and escalated to Approver Inbox.' : 'Bill returned to claimant advocate.');
      setTimeout(() => navigate('/bills'), 1500);
    } catch (err) {
      alert('Failed to submit scrutiny review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading comprehensive scrutiny review packet...</p>;
  if (!bill) return <p>Bill packet not found.</p>;

  return (
    <article>
      <header>
        <div>
          <Link to={`/bills/${bill.id}`}>&larr; Back to Bill Summary</Link>
        </div>
        <h2>Scrutiny &amp; Verification Review Packet: {bill.id}</h2>
        <p>Official examination of advocate fee claim before financial sanction</p>
      </header>

      {msg && (
        <aside>
          <p>
            <strong>Decision Recorded:</strong> {msg}
          </p>
        </aside>
      )}

      {/* Duplicate detection */}
      <DuplicateWarning duplicates={duplicateMatches} />

      {/* Section 1: Claim & Advocate Information */}
      <section>
        <h3>1. Claim &amp; Advocate Particulars</h3>
        <table border="1" cellPadding="6" cellSpacing="0" width="100%">
          <tbody>
            <tr>
              <th align="left">Advocate Claimant</th>
              <td>
                <strong>{bill.advocateName}</strong> (ID: {bill.advocateId})
              </td>
              <th align="left">Bill Reference / Date</th>
              <td>
                {bill.billReference} | {formatDate(bill.billDate)}
              </td>
            </tr>
            <tr>
              <th align="left">Case Docket</th>
              <td>
                <Link to={`/cases/${bill.caseId}`}>{bill.caseNumber}</Link>
              </td>
              <th align="left">Claim Period</th>
              <td>
                {formatDate(bill.claimPeriodStart)} to {formatDate(bill.claimPeriodEnd)}
              </td>
            </tr>
            <tr>
              <th align="left">Fee Category Applied</th>
              <td>{bill.feeCategoryName}</td>
              <th align="left">Net Total Claimed</th>
              <td>
                <strong>{formatINR(bill.totalClaimed)}</strong> (Base: {formatINR(bill.amount)}, Clerkage:{' '}
                {formatINR(bill.clerkageAmount)}, Misc: {formatINR(bill.miscAmount)})
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <br />

      {/* Section 2: Hearing Attendance & Evidence Scrutiny */}
      <section>
        <h3>2. Hearing &amp; Physical Appearance Verification</h3>
        {hearing ? (
          <div>
            <table border="1" cellPadding="6" cellSpacing="0" width="100%">
              <tbody>
                <tr>
                  <th align="left">Court &amp; Bench</th>
                  <td>
                    {hearing.courtName} - {hearing.courtRoom}
                  </td>
                  <th align="left">Hearing Listing Date</th>
                  <td>{formatDate(hearing.hearingDate)}</td>
                </tr>
                <tr>
                  <th align="left">Cause of Listing</th>
                  <td>{hearing.purpose}</td>
                  <th align="left">Outcome Pronounced</th>
                  <td>{hearing.outcome || 'No outcome entered'}</td>
                </tr>
              </tbody>
            </table>

            <h4>Advocate Appearance Verification Roll:</h4>
            <ul>
              {(hearing.attendances || []).map((att, idx) => (
                <li key={idx}>
                  <strong>{att.advocateName}</strong>: Status <code>{att.status}</code> | Certified by:{' '}
                  <em>{att.recordedBy || 'N/A'}</em> | Evidence: {att.evidence || 'None'}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>
            <em>No specific court hearing attached to this voucher.</em>
          </p>
        )}
      </section>

      <br />

      {/* Section 3: Supporting Documents Examination */}
      <section>
        <h3>3. Supporting Document Attachments</h3>
        {bill.documents && bill.documents.length > 0 ? (
          <table border="1" cellPadding="6" cellSpacing="0" width="100%">
            <thead>
              <tr>
                <th>Document File Name</th>
                <th>Verification State</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bill.documents.map((d, idx) => (
                <tr key={idx}>
                  <td>{d.name}</td>
                  <td>{d.verified ? 'VERIFIED' : 'PENDING'}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => alert(`Simulating review of ${d.name}`)}
                    >
                      Inspect Document
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>
            <em>No supporting documents submitted.</em>
          </p>
        )}
      </section>

      <br />

      {/* Section 4: Verifier Checklist & Sanction Recommendation */}
      <section>
        <h3>4. Scrutiny Officer Verification Checklist</h3>
        <fieldset>
          <legend>Compliance Checks</legend>
          <div>
            <label>
              <input
                type="checkbox"
                checked={checklist.hearingVerified}
                onChange={() => handleCheckbox('hearingVerified')}
              />{' '}
              Court cause list cross-verified against official court roster
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={checklist.attendanceVerified}
                onChange={() => handleCheckbox('attendanceVerified')}
              />{' '}
              Advocate physical presence confirmed by Legal Officer
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={checklist.scaleRateAdherence}
                onChange={() => handleCheckbox('scaleRateAdherence')}
              />{' '}
              Fee claimed adheres to Government Resolution scale rates
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={checklist.originalVouchersAttached}
                onChange={() => handleCheckbox('originalVouchersAttached')}
              />{' '}
              Original signed vouchers and stamped appearance memo inspected
            </label>
          </div>
        </fieldset>

        <br />

        <div>
          <label htmlFor="notes">Scrutiny / Objection Notes: </label>
          <br />
          <textarea
            id="notes"
            rows="3"
            cols="60"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Record comments, verification details or reasons for returning the bill..."
          />
        </div>

        <br />

        <div>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleReviewAction(true)}
          >
            <strong>&check; Pass Scrutiny &amp; Escalate to Approver</strong>
          </button>
          {' '}
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleReviewAction(false)}
          >
            &cross; Return to Advocate with Objections
          </button>
        </div>
      </section>

      <br />

      {/* Section 5: Action History */}
      <section>
        <h3>5. Prior Action History</h3>
        <Timeline events={bill.actionHistory || []} />
      </section>
    </article>
  );
};

export default BillReviewPage;
