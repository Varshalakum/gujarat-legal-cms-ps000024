import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api, formatINR } from '../../services/api';
import DuplicateWarning from './DuplicateWarning';

export const BillSubmitPage = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [hearings, setHearings] = useState([]);
  const [feeCategories, setFeeCategories] = useState([]);
  const [advocates, setAdvocates] = useState([]);

  const [selectedCaseId, setSelectedCaseId] = useState(searchParams.get('caseId') || '');
  const [selectedAdvocateId, setSelectedAdvocateId] = useState('');
  const [selectedHearingId, setSelectedHearingId] = useState('');
  const [selectedFeeCategoryId, setSelectedFeeCategoryId] = useState('');

  const [billReference, setBillReference] = useState(`BILL/${Date.now().toString().slice(-6)}`);
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [claimPeriodStart, setClaimPeriodStart] = useState(new Date().toISOString().split('T')[0]);
  const [claimPeriodEnd, setClaimPeriodEnd] = useState(new Date().toISOString().split('T')[0]);

  const [amount, setAmount] = useState(35000);
  const [clerkagePercent, setClerkagePercent] = useState(10);
  const [miscAmount, setMiscAmount] = useState(1000);

  const [docsChecked, setDocsChecked] = useState({
    appearanceMemo: true,
    feeBillSigned: true,
    dailyOrderSheet: false,
  });

  const [duplicateMatches, setDuplicateMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Clerkage and total calculations
  const clerkageAmount = Math.round((Number(amount) * clerkagePercent) / 100);
  const totalClaimed = Number(amount) + clerkageAmount + Number(miscAmount);

  useEffect(() => {
    const initData = async () => {
      try {
        const [cList, hList, fcList, aList] = await Promise.all([
          api.getCases(),
          api.getHearings(),
          api.getFeeCategories(),
          api.getAdvocates(),
        ]);
        setCases(cList);
        setHearings(hList);
        setFeeCategories(fcList);
        setAdvocates(aList);

        if (!selectedCaseId && cList.length > 0) {
          setSelectedCaseId(cList[0].id);
        }
        if (aList.length > 0) {
          setSelectedAdvocateId(aList[0].id);
        }
        if (fcList.length > 0) {
          setSelectedFeeCategoryId(fcList[0].id);
          setAmount(fcList[0].rateScale);
        }
      } catch (err) {
        setError('Failed to load initial fee billing configuration.');
      }
    };
    initData();
  }, []);

  // Update hearing list when case changes
  const filteredHearings = hearings.filter((h) => h.caseId === selectedCaseId);

  // Check duplicates when hearing or advocate changes
  useEffect(() => {
    const checkDups = async () => {
      if (selectedHearingId && selectedAdvocateId) {
        const res = await api.checkDuplicates(selectedHearingId, selectedAdvocateId);
        setDuplicateMatches(res.duplicates || []);
      } else {
        setDuplicateMatches([]);
      }
    };
    checkDups();
  }, [selectedHearingId, selectedAdvocateId]);

  const handleFeeCategoryChange = (e) => {
    const fcId = e.target.value;
    setSelectedFeeCategoryId(fcId);
    const cat = feeCategories.find((c) => c.id === fcId);
    if (cat) {
      setAmount(cat.rateScale);
      setClerkagePercent(cat.clerkagePercent || 10);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!billReference.trim()) {
      setError('Bill Reference identifier is required.');
      return;
    }
    if (amount <= 0) {
      setError('Base professional fee amount must be greater than zero.');
      return;
    }

    const c = cases.find((x) => x.id === selectedCaseId);
    const adv = advocates.find((x) => x.id === selectedAdvocateId);
    const fc = feeCategories.find((x) => x.id === selectedFeeCategoryId);

    try {
      setLoading(true);
      const newBill = await api.submitBill({
        billReference,
        advocateId: selectedAdvocateId,
        advocateName: adv ? adv.name : user?.name || 'Advocate',
        caseId: selectedCaseId,
        caseNumber: c ? c.caseNumber : 'UNASSIGNED',
        feeCategoryId: selectedFeeCategoryId,
        feeCategoryName: fc ? fc.categoryName : 'Government Scale Fee',
        claimPeriodStart,
        claimPeriodEnd,
        billDate,
        amount: Number(amount),
        clerkageAmount,
        miscAmount: Number(miscAmount),
        totalClaimed,
        hearingId: selectedHearingId || null,
        documents: [
          ...(docsChecked.appearanceMemo ? [{ name: 'Appearance_Memo_Certified.pdf', verified: false }] : []),
          ...(docsChecked.feeBillSigned ? [{ name: 'Original_Fee_Bill_Signed.pdf', verified: false }] : []),
          ...(docsChecked.dailyOrderSheet ? [{ name: 'Daily_Court_Order_Sheet.pdf', verified: false }] : []),
        ],
        verifierChecklist: {
          hearingVerified: false,
          attendanceVerified: false,
          scaleRateAdherence: false,
          originalVouchersAttached: false,
        },
      });

      navigate(`/bills/${newBill.id}`);
    } catch (err) {
      setError(err.message || 'Failed to submit bill.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <article>
      <header>
        <div>
          <Link to="/bills">&larr; Back to Bill Register</Link>
        </div>
        <h2>Submit Advocate Fee Claim Voucher</h2>
        <p>File representation fees for certification and treasury disbursement</p>
      </header>

      {error && (
        <aside role="alert">
          <p>
            <strong>Submission Error:</strong> {error}
          </p>
        </aside>
      )}

      {/* Duplicate warning banner */}
      <DuplicateWarning duplicates={duplicateMatches} />

      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>Case Docket &amp; Advocate Particulars</legend>

          <div>
            <label htmlFor="caseSelect">Case Docket: </label>
            <br />
            <select
              id="caseSelect"
              value={selectedCaseId}
              onChange={(e) => {
                setSelectedCaseId(e.target.value);
                setSelectedHearingId('');
              }}
              required
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.caseNumber} - {c.title}
                </option>
              ))}
            </select>
          </div>

          <br />

          <div>
            <label htmlFor="advSelect">Claimant Advocate: </label>
            <br />
            <select
              id="advSelect"
              value={selectedAdvocateId}
              onChange={(e) => setSelectedAdvocateId(e.target.value)}
              required
            >
              {advocates.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.designation} - Bar: {a.barRegistrationNumber})
                </option>
              ))}
            </select>
          </div>

          <br />

          <div>
            <label htmlFor="hearingSelect">Linked Court Hearing (Cause List Date): </label>
            <br />
            <select
              id="hearingSelect"
              value={selectedHearingId}
              onChange={(e) => setSelectedHearingId(e.target.value)}
            >
              <option value="">-- No specific hearing linked (General Work) --</option>
              {filteredHearings.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.id} | Date: {h.hearingDate} - {h.purpose} ({h.courtName})
                </option>
              ))}
            </select>
          </div>
        </fieldset>

        <br />

        <fieldset>
          <legend>Voucher Identification &amp; Claim Period</legend>

          <div>
            <label htmlFor="billRef">Bill / Invoice Reference Number: </label>
            <br />
            <input
              id="billRef"
              type="text"
              value={billReference}
              onChange={(e) => setBillReference(e.target.value)}
              required
            />
          </div>

          <br />

          <div>
            <label htmlFor="billDate">Bill Date: </label>
            <br />
            <input
              id="billDate"
              type="date"
              value={billDate}
              onChange={(e) => setBillDate(e.target.value)}
              required
            />
          </div>

          <br />

          <div>
            <label htmlFor="pStart">Claim Period Start: </label>
            <input
              id="pStart"
              type="date"
              value={claimPeriodStart}
              onChange={(e) => setClaimPeriodStart(e.target.value)}
              required
            />
            {' '}
            <label htmlFor="pEnd">Claim Period End: </label>
            <input
              id="pEnd"
              type="date"
              value={claimPeriodEnd}
              onChange={(e) => setClaimPeriodEnd(e.target.value)}
              required
            />
          </div>
        </fieldset>

        <br />

        <fieldset>
          <legend>Fee Category &amp; Amount Computation</legend>

          <div>
            <label htmlFor="feeCat">Fee Schedule Category: </label>
            <br />
            <select
              id="feeCat"
              value={selectedFeeCategoryId}
              onChange={handleFeeCategoryChange}
              required
            >
              {feeCategories.map((fc) => (
                <option key={fc.id} value={fc.id}>
                  {fc.courtType} - {fc.categoryName} (Standard Scale: {formatINR(fc.rateScale)})
                </option>
              ))}
            </select>
          </div>

          <br />

          <div>
            <label htmlFor="baseAmt">Base Professional Appearance Fee (INR): </label>
            <br />
            <input
              id="baseAmt"
              type="number"
              min="0"
              step="500"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />
          </div>

          <br />

          <div>
            <label htmlFor="clerkPercent">Clerkage Allowance Percentage (%): </label>
            <br />
            <input
              id="clerkPercent"
              type="number"
              min="0"
              max="20"
              value={clerkagePercent}
              onChange={(e) => setClerkagePercent(Number(e.target.value))}
            />
            {' '}
            <span>Calculated Clerkage: <strong>{formatINR(clerkageAmount)}</strong></span>
          </div>

          <br />

          <div>
            <label htmlFor="miscAmt">Out of Pocket / Typing / Stationery Expenses (INR): </label>
            <br />
            <input
              id="miscAmt"
              type="number"
              min="0"
              step="100"
              value={miscAmount}
              onChange={(e) => setMiscAmount(Number(e.target.value))}
            />
          </div>

          <br />

          <p>
            Total Net Amount Claimed: <strong>{formatINR(totalClaimed)}</strong>
          </p>
        </fieldset>

        <br />

        <fieldset>
          <legend>Mandatory Document Verification Checklist</legend>
          <div>
            <label>
              <input
                type="checkbox"
                checked={docsChecked.appearanceMemo}
                onChange={(e) =>
                  setDocsChecked((prev) => ({ ...prev, appearanceMemo: e.target.checked }))
                }
              />{' '}
              Advocate Appearance Memo / Court Cause List slip certified
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={docsChecked.feeBillSigned}
                onChange={(e) =>
                  setDocsChecked((prev) => ({ ...prev, feeBillSigned: e.target.checked }))
                }
              />{' '}
              Signed Original Fee Voucher with PAN and Bar Council details
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={docsChecked.dailyOrderSheet}
                onChange={(e) =>
                  setDocsChecked((prev) => ({ ...prev, dailyOrderSheet: e.target.checked }))
                }
              />{' '}
              Copy of Court Daily Order Sheet attached
            </label>
          </div>
        </fieldset>

        <br />

        <div>
          <button type="submit" disabled={loading}>
            {loading ? 'Submitting Claim...' : 'Submit Fee Bill for Scrutiny'}
          </button>
          {' '}
          <Link to="/bills">
            <button type="button">Cancel</button>
          </Link>
        </div>
      </form>
    </article>
  );
};

export default BillSubmitPage;
