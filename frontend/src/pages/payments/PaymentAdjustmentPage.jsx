import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, formatINR } from '../../services/api';

export const PaymentAdjustmentPage = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState('');
  const [reversalType, setReversalType] = useState('PARTIAL_CLAWBACK');
  const [amount, setAmount] = useState(5000);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const pList = await api.getPayments();
        setPayments(pList);
        if (pList.length > 0) setSelectedPaymentId(pList[0].id);
      } catch (err) {
        setError('Failed to fetch payments.');
      }
    };
    fetchPayments();
  }, []);

  const selectedPayment = payments.find((p) => p.id === selectedPaymentId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedPaymentId) {
      setError('Please select a payment record.');
      return;
    }
    if (!reason.trim()) {
      setError('Mandatory audit / recovery justification reason required.');
      return;
    }
    if (amount <= 0 || (selectedPayment && amount > selectedPayment.amount)) {
      setError(`Adjustment amount must be between 1 and ${formatINR(selectedPayment?.amount || 0)}.`);
      return;
    }

    try {
      setLoading(true);
      await api.adjustPayment(selectedPaymentId, {
        reversalType,
        amount: Number(amount),
        reason,
      });

      alert('Payment adjustment / reversal logged successfully.');
      navigate('/payments');
    } catch (err) {
      setError(err.message || 'Failed to process adjustment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <article>
      <header>
        <div>
          <Link to="/payments">&larr; Back to Payment Register</Link>
        </div>
        <h2>Payment Reversal &amp; Audit Clawback Adjustment</h2>
        <p>Record recovery, audit disallowance, or banking return against disbursed voucher</p>
      </header>

      {error && (
        <aside role="alert">
          <p>
            <strong>Error:</strong> {error}
          </p>
        </aside>
      )}

      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>Transaction Selection</legend>

          <div>
            <label htmlFor="paySelect">Select Disbursed Payment: </label>
            <br />
            <select
              id="paySelect"
              value={selectedPaymentId}
              onChange={(e) => setSelectedPaymentId(e.target.value)}
              required
            >
              {payments.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.paymentReference} - {p.advocateName} ({formatINR(p.amount)}) - Date:{' '}
                  {p.paymentDate}
                </option>
              ))}
            </select>
          </div>

          {selectedPayment && (
            <div>
              <br />
              <table border="1" cellPadding="4" cellSpacing="0">
                <tbody>
                  <tr>
                    <th>Original Voucher</th>
                    <td>{selectedPayment.billReference}</td>
                  </tr>
                  <tr>
                    <th>Bank Reference</th>
                    <td>{selectedPayment.bankReferenceNumber}</td>
                  </tr>
                  <tr>
                    <th>Original Disbursed Amount</th>
                    <td>{formatINR(selectedPayment.amount)}</td>
                  </tr>
                  <tr>
                    <th>Accounting Head</th>
                    <td>{selectedPayment.accountingHead}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </fieldset>

        <br />

        <fieldset>
          <legend>Adjustment Particulars</legend>

          <div>
            <label htmlFor="revType">Adjustment / Reversal Classification: </label>
            <br />
            <select
              id="revType"
              value={reversalType}
              onChange={(e) => setReversalType(e.target.value)}
            >
              <option value="PARTIAL_CLAWBACK">Partial Clawback / Overpayment Recovery</option>
              <option value="FULL_REVERSAL">Full Voucher Reversal</option>
              <option value="AUDIT_DISALLOWANCE">CAG / Internal Audit Disallowance</option>
              <option value="BANK_FAILURE_BOUNCE">Bank Transmission Failure / Account Inactive</option>
            </select>
          </div>

          <br />

          <div>
            <label htmlFor="adjAmt">Clawback / Adjustment Amount (INR): </label>
            <br />
            <input
              id="adjAmt"
              type="number"
              min="1"
              max={selectedPayment ? selectedPayment.amount : undefined}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />
          </div>

          <br />

          <div>
            <label htmlFor="reason">
              <strong>Mandatory Recovery Reason / Audit Note: </strong>
            </label>
            <br />
            <textarea
              id="reason"
              rows="4"
              cols="60"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Cite audit paragraph number, double-claim reference, or banking return memo..."
              required
            />
          </div>
        </fieldset>

        <br />

        <div>
          <button type="submit" disabled={loading || !selectedPayment}>
            {loading ? 'Executing Adjustment...' : 'Record Adjustment & Credit Treasury'}
          </button>
          {' '}
          <Link to="/payments">
            <button type="button">Cancel</button>
          </Link>
        </div>
      </form>
    </article>
  );
};

export default PaymentAdjustmentPage;
