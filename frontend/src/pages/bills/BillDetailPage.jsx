import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, formatINR, formatDate } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import Timeline from '../../components/Timeline';

export const BillDetailPage = () => {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        setLoading(true);
        const data = await api.getBillById(id);
        setBill(data);
      } catch (err) {
        console.error('Error fetching bill:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBill();
  }, [id]);

  if (loading) return <p>Loading fee voucher details...</p>;
  if (!bill) return <p>Fee voucher not found.</p>;

  return (
    <article>
      <header>
        <div>
          <Link to="/bills">&larr; Back to Bill Register</Link>
        </div>
        <h2>
          Fee Voucher: {bill.billReference} ({bill.id})
        </h2>
        <p>
          Current Stage: <strong>{bill.currentStage}</strong> | Status:{' '}
          <StatusBadge status={bill.status} />
        </p>
      </header>

      {/* Bill Overview */}
      <section>
        <h3>Voucher Particulars</h3>
        <table border="1" cellPadding="6" cellSpacing="0" width="100%">
          <tbody>
            <tr>
              <th align="left">Advocate Name</th>
              <td>{bill.advocateName}</td>
              <th align="left">Bill Date</th>
              <td>{formatDate(bill.billDate)}</td>
            </tr>
            <tr>
              <th align="left">Case Reference</th>
              <td>
                <Link to={`/cases/${bill.caseId}`}>{bill.caseNumber}</Link>
              </td>
              <th align="left">Claim Period</th>
              <td>
                {formatDate(bill.claimPeriodStart)} to {formatDate(bill.claimPeriodEnd)}
              </td>
            </tr>
            <tr>
              <th align="left">Fee Category</th>
              <td>{bill.feeCategoryName}</td>
              <th align="left">Linked Hearing ID</th>
              <td>
                {bill.hearingId ? (
                  <Link to={`/hearings/${bill.hearingId}`}>{bill.hearingId}</Link>
                ) : (
                  'None'
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <br />

      {/* Financial Claim Breakdown */}
      <section>
        <h3>Financial Claim &amp; Sanction Breakdown</h3>
        <table border="1" cellPadding="6" cellSpacing="0" width="100%">
          <thead>
            <tr>
              <th>Fee Component</th>
              <th>Claimed Amount</th>
              <th>Sanctioned Amount</th>
              <th>Disbursed Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Base Professional Appearance Fee</td>
              <td>{formatINR(bill.amount)}</td>
              <td>{formatINR(bill.approvedAmount ? bill.amount : 0)}</td>
              <td>{formatINR(bill.paidAmount ? bill.amount : 0)}</td>
            </tr>
            <tr>
              <td>Clerkage Allowance (10%)</td>
              <td>{formatINR(bill.clerkageAmount)}</td>
              <td>{formatINR(bill.approvedAmount ? bill.clerkageAmount : 0)}</td>
              <td>{formatINR(bill.paidAmount ? bill.clerkageAmount : 0)}</td>
            </tr>
            <tr>
              <td>Out of Pocket / Misc Expenses</td>
              <td>{formatINR(bill.miscAmount)}</td>
              <td>{formatINR(bill.approvedAmount ? bill.miscAmount : 0)}</td>
              <td>{formatINR(bill.paidAmount ? bill.miscAmount : 0)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th>Total Voucher Amount</th>
              <th>{formatINR(bill.totalClaimed)}</th>
              <th>{formatINR(bill.approvedAmount)}</th>
              <th>{formatINR(bill.paidAmount)}</th>
            </tr>
          </tfoot>
        </table>
      </section>

      <br />

      {/* Verifier Checklist Audit */}
      <section>
        <header>
          <h3>Scrutiny &amp; Verification Checklist</h3>
        </header>
        {bill.verifierChecklist ? (
          <ul>
            <li>
              Hearing verified on official cause list:{' '}
              <strong>{bill.verifierChecklist.hearingVerified ? 'YES' : 'NO'}</strong>
            </li>
            <li>
              Advocate physical attendance verified:{' '}
              <strong>{bill.verifierChecklist.attendanceVerified ? 'YES' : 'NO'}</strong>
            </li>
            <li>
              Rate adheres to Government Resolution scale:{' '}
              <strong>{bill.verifierChecklist.scaleRateAdherence ? 'YES' : 'NO'}</strong>
            </li>
            <li>
              Signed original vouchers and appearance memo attached:{' '}
              <strong>{bill.verifierChecklist.originalVouchersAttached ? 'YES' : 'NO'}</strong>
            </li>
          </ul>
        ) : (
          <p>
            <em>Verification not yet performed.</em>
          </p>
        )}
        <p>
          <Link to={`/bills/${bill.id}/review`}>&rarr; Open Bill Review Packet</Link>
        </p>
      </section>

      <br />

      {/* Documents attached */}
      <section>
        <header>
          <h3>Attached Supporting Vouchers &amp; Memos</h3>
        </header>
        {bill.documents && bill.documents.length > 0 ? (
          <ul>
            {bill.documents.map((d, idx) => (
              <li key={idx}>
                <strong>{d.name}</strong> - Verification Status: {d.verified ? 'VERIFIED' : 'PENDING'}
              </li>
            ))}
          </ul>
        ) : (
          <p>
            <em>No digital documents attached to this bill submission.</em>
          </p>
        )}
      </section>

      <br />

      {/* Action History / Workflow Timeline */}
      <section>
        <header>
          <h3>Audit Trail &amp; Processing History</h3>
        </header>
        <Timeline events={bill.actionHistory || []} />
      </section>
    </article>
  );
};

export default BillDetailPage;
