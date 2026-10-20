import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api, formatINR } from '../../services/api';
import { IconCalculator } from '../../components/Icons';

export const PaymentFormPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [approvedBills, setApprovedBills] = useState([]);
  const [selectedBillId, setSelectedBillId] = useState(searchParams.get('billId') || '');
  const [selectedBill, setSelectedBill] = useState(null);

  const [paymentReference, setPaymentReference] = useState(`TXN/GUJ/${Date.now().toString().slice(-6)}`);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('NEFT');
  const [bankReferenceNumber, setBankReferenceNumber] = useState('');
  const [accountingHead, setAccountingHead] = useState('2014-00-114-01-00 (Administration of Justice)');

  // Statutory Deductions State
  const [grossAmount, setGrossAmount] = useState(0);
  const [tdsRate, setTdsRate] = useState(10); // Standard 10% under Sec 194J
  const [applyGstTds, setApplyGstTds] = useState(false); // 2% under Sec 51 CGST Act
  const [welfareFundDeduction, setWelfareFundDeduction] = useState(100); // Standard Welfare Stamp

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Automatic Statutory Calculations
  const itTdsAmount = Math.round(grossAmount * (tdsRate / 100) * 100) / 100;
  const gstTdsAmount = applyGstTds ? Math.round(grossAmount * 0.02 * 100) / 100 : 0;
  const netDisbursableAmount = Math.max(0, Math.round((grossAmount - itTdsAmount - gstTdsAmount - welfareFundDeduction) * 100) / 100);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const bills = await api.getBills();
        // Bills ready for payment
        const ready = bills.filter(
          (b) => b.status === 'APPROVED' || b.currentStage === 'FINANCE_PAYMENT' || b.status === 'IN_APPROVAL'
        );
        setApprovedBills(ready);

        const targetId = selectedBillId || (ready.length > 0 ? ready[0].id : '');
        setSelectedBillId(targetId);
      } catch (err) {
        setError('Failed to load approved vouchers.');
      }
    };
    fetchBills();
  }, [selectedBillId]);

  useEffect(() => {
    if (!selectedBillId) return;
    const b = approvedBills.find((x) => x.id === selectedBillId);
    if (b) {
      setSelectedBill(b);
      const sanctioned = Number(b.approvedAmount || b.totalClaimed || 0);
      setGrossAmount(sanctioned);
      // Auto-suggest GST TDS if sanctioned amount >= 2,50,000 (Section 51 threshold)
      if (sanctioned >= 250000) {
        setApplyGstTds(true);
      }
    }
  }, [selectedBillId, approvedBills]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedBillId) {
      setError('Please select an approved fee voucher to disburse.');
      return;
    }
    if (!bankReferenceNumber.trim()) {
      setError('Bank UTR or Treasury Transaction Reference is mandatory.');
      return;
    }
    if (netDisbursableAmount <= 0) {
      setError('Net payment disbursement amount must be greater than zero.');
      return;
    }

    try {
      setLoading(true);
      await api.recordPayment({
        paymentReference,
        billId: selectedBill.id,
        billReference: selectedBill.billReference,
        advocateName: selectedBill.advocateName,
        paymentDate,
        grossAmount: Number(grossAmount),
        tdsAmount: Number(itTdsAmount),
        gstTdsAmount: Number(gstTdsAmount),
        welfareFundAmount: Number(welfareFundDeduction),
        amount: Number(netDisbursableAmount),
        paymentMode,
        bankReferenceNumber,
        accountingHead,
      });

      alert(`Payment disbursement of ${formatINR(netDisbursableAmount)} recorded successfully.`);
      navigate('/payments');
    } catch (err) {
      setError(err.message || 'Failed to disburse payment.');
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
        <h2>Process Treasury Payment Disbursement</h2>
        <p>Record fund transfer voucher, calculate statutory deductions, and update state accounting records</p>
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
          <legend>Voucher Selection</legend>

          <div>
            <label htmlFor="billSelect">Select Approved Voucher: </label>
            <br />
            <select
              id="billSelect"
              value={selectedBillId}
              onChange={(e) => setSelectedBillId(e.target.value)}
              required
            >
              {approvedBills.length === 0 ? (
                <option value="">No approved bills available for payment</option>
              ) : (
                approvedBills.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.id} - {b.billReference} ({b.advocateName}) | Sanctioned:{' '}
                    {formatINR(b.approvedAmount || b.totalClaimed)}
                  </option>
                ))
              )}
            </select>
          </div>

          {selectedBill && (
            <div>
              <br />
              <table border="1" cellPadding="4" cellSpacing="0">
                <tbody>
                  <tr>
                    <th>Advocate Payee</th>
                    <td>{selectedBill.advocateName}</td>
                  </tr>
                  <tr>
                    <th>Case Docket</th>
                    <td>{selectedBill.caseNumber}</td>
                  </tr>
                  <tr>
                    <th>Claim Category</th>
                    <td>{selectedBill.feeCategoryName}</td>
                  </tr>
                  <tr>
                    <th>Sanctioned Amount</th>
                    <td>
                      <strong>{formatINR(selectedBill.approvedAmount || selectedBill.totalClaimed)}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </fieldset>

        <br />

        {/* Statutory Deductions Calculator */}
        <fieldset style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '14px' }}>
          <legend>
            <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <IconCalculator size={16} color="var(--primary-navy)" />
              Statutory Deductions &amp; Tax Calculation
            </strong>
          </legend>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div>
              <label htmlFor="grossAmt">Gross Sanctioned Amount (₹):</label>
              <br />
              <input
                id="grossAmt"
                type="number"
                min="0"
                step="100"
                value={grossAmount}
                onChange={(e) => setGrossAmount(Number(e.target.value))}
                required
              />
            </div>

            <div>
              <label htmlFor="tdsRateSelect">Income Tax TDS (Sec 194J):</label>
              <br />
              <select
                id="tdsRateSelect"
                value={tdsRate}
                onChange={(e) => setTdsRate(Number(e.target.value))}
              >
                <option value={10}>10% - Standard Professional Fees</option>
                <option value={2}>2% - Technical / Specified Sub-clause</option>
                <option value={0}>0% - Tax Exemption / Nil Certificate</option>
              </select>
            </div>

            <div>
              <label htmlFor="welfareDeduct">Advocate Welfare Stamp (₹):</label>
              <br />
              <input
                id="welfareDeduct"
                type="number"
                min="0"
                value={welfareFundDeduction}
                onChange={(e) => setWelfareFundDeduction(Number(e.target.value))}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginTop: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={applyGstTds}
                  onChange={(e) => setApplyGstTds(e.target.checked)}
                />
                <span>Apply 2% GST TDS (Sec 51 CGST Act)</span>
              </label>
            </div>
          </div>

          <br />

          {/* Deduction Statement */}
          <div style={{ background: '#ffffff', padding: '12px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
            <h4>Disbursement Breakdown:</h4>
            <table width="100%" style={{ fontSize: '13px' }}>
              <tbody>
                <tr>
                  <td>Gross Sanctioned Claim:</td>
                  <td align="right"><strong>{formatINR(grossAmount)}</strong></td>
                </tr>
                <tr style={{ color: '#c62828' }}>
                  <td>Less: Income Tax TDS ({tdsRate}%):</td>
                  <td align="right">- {formatINR(itTdsAmount)}</td>
                </tr>
                {applyGstTds && (
                  <tr style={{ color: '#c62828' }}>
                    <td>Less: GST TDS (2% under Sec 51):</td>
                    <td align="right">- {formatINR(gstTdsAmount)}</td>
                  </tr>
                )}
                <tr style={{ color: '#c62828' }}>
                  <td>Less: Advocate Welfare Stamp Fund:</td>
                  <td align="right">- {formatINR(welfareFundDeduction)}</td>
                </tr>
                <tr style={{ borderTop: '2px solid #333', fontSize: '15px' }}>
                  <td><strong>Net Payable to Advocate:</strong></td>
                  <td align="right"><strong>{formatINR(netDisbursableAmount)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </fieldset>

        <br />

        <fieldset>
          <legend>Disbursement &amp; Banking Particulars</legend>

          <div>
            <label htmlFor="payRef">Treasury Voucher / Payment Reference: </label>
            <br />
            <input
              id="payRef"
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              required
            />
          </div>

          <br />

          <div>
            <label htmlFor="payDate">Payment Execution Date: </label>
            <br />
            <input
              id="payDate"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
            />
          </div>

          <br />

          <div>
            <label htmlFor="payMode">Payment Channel / Mode: </label>
            <br />
            <select
              id="payMode"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
            >
              <option value="NEFT">NEFT (National Electronic Funds Transfer)</option>
              <option value="RTGS">RTGS (Real Time Gross Settlement)</option>
              <option value="PFMS">PFMS (Public Financial Management System)</option>
              <option value="TREASURY_CHEQUE">State Treasury Account Cheque</option>
            </select>
          </div>

          <br />

          <div>
            <label htmlFor="bankRef">Bank UTR / Transaction Reference Number: </label>
            <br />
            <input
              id="bankRef"
              type="text"
              placeholder="e.g. RBI2024102099381 or UTR998822"
              value={bankReferenceNumber}
              onChange={(e) => setBankReferenceNumber(e.target.value)}
              required
            />
          </div>

          <br />

          <div>
            <label htmlFor="acctHead">Budget Accounting Head (Major/Minor): </label>
            <br />
            <select
              id="acctHead"
              value={accountingHead}
              onChange={(e) => setAccountingHead(e.target.value)}
            >
              <option value="2014-00-114-01-00 (Administration of Justice)">
                2014-00-114-01-00 (High Court Legal Retainers)
              </option>
              <option value="2014-00-114-02-00 (Subordinate Court Prosecution)">
                2014-00-114-02-00 (Subordinate Courts Prosecution)
              </option>
              <option value="2014-00-114-03-00 (Special Commissions & Arbitrations)">
                2014-00-114-03-00 (Special Commissions &amp; Arbitrations)
              </option>
            </select>
          </div>
        </fieldset>

        <br />

        <div>
          <button type="submit" disabled={loading || !selectedBill}>
            {loading ? 'Disbursing Payment...' : `Release Net Payment: [${formatINR(netDisbursableAmount)}]`}
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

export default PaymentFormPage;
