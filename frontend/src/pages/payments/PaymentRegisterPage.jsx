import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, formatINR, formatDate } from '../../services/api';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

export const PaymentRegisterPage = () => {
  const [payments, setPayments] = useState([]);
  const [approvedBills, setApprovedBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true);
        const [pData, bData] = await Promise.all([api.getPayments(), api.getBills()]);
        setPayments(pData);
        setApprovedBills(bData.filter((b) => b.status === 'APPROVED' && b.currentStage === 'FINANCE_PAYMENT'));
      } catch (err) {
        console.error('Error fetching payments:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPayments();
  }, []);

  const totalDisbursed = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const pendingLiability = approvedBills.reduce((acc, b) => acc + (b.approvedAmount || 0), 0);

  const paymentColumns = [
    { header: 'Payment ID', key: 'id' },
    { header: 'Transaction Ref', key: 'paymentReference' },
    {
      header: 'Bill Reference',
      render: (row) => <Link to={`/bills/${row.billId}`}>{row.billReference}</Link>,
    },
    { header: 'Advocate Payee', key: 'advocateName' },
    { header: 'Payment Date', render: (row) => formatDate(row.paymentDate) },
    { header: 'Mode', key: 'paymentMode' },
    { header: 'Amount Disbursed', render: (row) => formatINR(row.amount) },
    { header: 'Accounting Head', key: 'accountingHead' },
    {
      header: 'Reversals / Adjustments',
      render: (row) =>
        row.reversals && row.reversals.length > 0 ? (
          <ul>
            {row.reversals.map((rev, idx) => (
              <li key={idx}>
                {rev.reversalType}: {formatINR(rev.amount)} ({rev.reason})
              </li>
            ))}
          </ul>
        ) : (
          <span>None</span>
        ),
    },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <article>
      <header>
        <h2>Treasury Payment Register &amp; Disbursements</h2>
        <p>Electronic fund transfers, ECS/NEFT settlement entries, and clawback ledgers</p>
      </header>

      {/* Summary KPI */}
      <section>
        <table border="1" cellPadding="6" cellSpacing="0">
          <thead>
            <tr>
              <th>Total Treasury Disbursed (Paid)</th>
              <th>Approved Vouchers Pending Payment</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>{formatINR(totalDisbursed)}</strong>
              </td>
              <td>
                <strong>{formatINR(pendingLiability)}</strong> ({approvedBills.length} vouchers)
              </td>
              <td>
                <Link to="/payments/new">
                  <button type="button">+ Disburse Approved Bill</button>
                </Link>
                {' '}
                <Link to="/payments/adjustments">
                  <button type="button">Record Reversal / Adjustment</button>
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <br />

      {/* Approved Bills Awaiting Payment */}
      {approvedBills.length > 0 && (
        <section>
          <h3>Approved Bills Awaiting Treasury Release</h3>
          <table border="1" cellPadding="6" cellSpacing="0" width="100%">
            <thead>
              <tr>
                <th>Bill ID</th>
                <th>Reference</th>
                <th>Advocate</th>
                <th>Approved Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {approvedBills.map((b) => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{b.billReference}</td>
                  <td>{b.advocateName}</td>
                  <td>{formatINR(b.approvedAmount)}</td>
                  <td>
                    <Link to={`/payments/new?billId=${b.id}`}>
                      <button type="button">Issue Payment</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <br />
        </section>
      )}

      {/* Payment History Table */}
      <section>
        <h3>Settled Payment Records</h3>
        {loading ? (
          <p>Loading payment registers...</p>
        ) : (
          <DataTable
            columns={paymentColumns}
            data={payments}
            emptyMessage="No payment transactions executed yet."
          />
        )}
      </section>
    </article>
  );
};

export default PaymentRegisterPage;
