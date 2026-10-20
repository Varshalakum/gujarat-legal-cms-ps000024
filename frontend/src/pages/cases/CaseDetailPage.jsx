import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, formatINR, formatDate } from '../../services/api';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Timeline from '../../components/Timeline';

export const CaseDetailPage = () => {
  const { id } = useParams();
  const [caseItem, setCaseItem] = useState(null);
  const [hearings, setHearings] = useState([]);
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newDocName, setNewDocName] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const [cData, hData, bData, pData] = await Promise.all([
          api.getCaseById(id),
          api.getHearings({ caseId: id }),
          api.getBills(),
          api.getPayments(),
        ]);
        setCaseItem(cData);
        setHearings(hData.filter((h) => h.caseId === id || h.caseNumber === cData?.caseNumber));
        setBills(bData.filter((b) => b.caseId === id || b.caseNumber === cData?.caseNumber));
        setPayments(pData);
      } catch (err) {
        console.error('Error fetching case details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleAddDocument = (e) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    const doc = {
      id: `DOC-${Date.now()}`,
      name: newDocName,
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: 'Officer',
    };
    setCaseItem((prev) => ({
      ...prev,
      documents: [...(prev.documents || []), doc],
    }));
    setNewDocName('');
  };

  if (loading) return <p>Loading comprehensive case dossier...</p>;
  if (!caseItem) return <p>Case record not found.</p>;

  // Build advocate assignment timeline events
  const timelineEvents = (caseItem.assignedAdvocates || []).map((adv) => ({
    action: `Advocate Assigned: ${adv.name}`,
    date: adv.assignedDate,
    actor: 'Legal Department',
    notes: `Designation: ${adv.role}`,
    status: 'ACTIVE',
  }));

  return (
    <article>
      <header>
        <div>
          <Link to="/cases">&larr; Back to Case Register</Link>
        </div>
        <h2>
          {caseItem.caseNumber}: {caseItem.title}
        </h2>
        <p>
          Status: <StatusBadge status={caseItem.status} /> | Current Stage:{' '}
          <strong>{caseItem.currentStage}</strong>
        </p>
      </header>

      {/* Case Metadata in Semantic Description List */}
      <section>
        <h3>Case Metadata</h3>
        <table border="1" cellPadding="6" cellSpacing="0" width="100%">
          <tbody>
            <tr>
              <th align="left">Court</th>
              <td>{caseItem.courtName}</td>
              <th align="left">Filing Date</th>
              <td>{formatDate(caseItem.filingDate)}</td>
            </tr>
            <tr>
              <th align="left">Case Type</th>
              <td>{caseItem.caseType}</td>
              <th align="left">Next Hearing Date</th>
              <td>{formatDate(caseItem.nextHearingDate)}</td>
            </tr>
            <tr>
              <th align="left">Nodal Department</th>
              <td>{caseItem.department}</td>
              <th align="left">Financial Exposure</th>
              <td>
                <strong>{formatINR(caseItem.financialExposure)}</strong>
              </td>
            </tr>
            <tr>
              <th align="left">Summary of Dispute</th>
              <td colSpan="3">{caseItem.summary || 'No dispute summary provided.'}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <br />

      {/* Advocate Assignment Timeline */}
      <section>
        <header>
          <h3>Advocate Engagement &amp; Representation Timeline</h3>
        </header>
        <Timeline events={timelineEvents} />
        <p>
          <Link to={`/admin/advocates`}>Manage Advocate Roster</Link>
        </p>
      </section>

      <br />

      {/* Linked Hearings & Attendance */}
      <section>
        <header>
          <h3>Linked Hearings &amp; Attendance Log</h3>
          <p>
            <Link to={`/hearings/new?caseId=${caseItem.id}&caseNumber=${caseItem.caseNumber}`}>
              + Schedule New Hearing Date
            </Link>
          </p>
        </header>

        <DataTable
          keyField="id"
          data={hearings}
          emptyMessage="No hearings scheduled yet for this case."
          columns={[
            { header: 'Hearing ID', key: 'id' },
            { header: 'Date', render: (row) => formatDate(row.hearingDate) },
            { header: 'Time', key: 'hearingTime' },
            { header: 'Bench / Room', key: 'courtRoom' },
            { header: 'Purpose', key: 'purpose' },
            { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            {
              header: 'Advocate Attendance',
              render: (row) => (
                <ul>
                  {(row.attendances || []).map((att, idx) => (
                    <li key={idx}>
                      {att.advocateName}: <strong>{att.status}</strong> ({att.verification})
                    </li>
                  ))}
                </ul>
              ),
            },
            {
              header: 'Actions',
              render: (row) => <Link to={`/hearings/${row.id}`}>View Hearing</Link>,
            },
          ]}
        />
      </section>

      <br />

      {/* Linked Fee Bills */}
      <section>
        <header>
          <h3>Linked Fee Bills &amp; Vouchers</h3>
          <p>
            <Link to={`/bills/submit?caseId=${caseItem.id}`}>+ Submit New Fee Bill</Link>
          </p>
        </header>

        <DataTable
          keyField="id"
          data={bills}
          emptyMessage="No fee vouchers filed for this case."
          columns={[
            { header: 'Bill ID', key: 'id' },
            { header: 'Reference', key: 'billReference' },
            { header: 'Advocate', key: 'advocateName' },
            { header: 'Category', key: 'feeCategoryName' },
            { header: 'Claimed', render: (row) => formatINR(row.totalClaimed) },
            { header: 'Approved', render: (row) => formatINR(row.approvedAmount) },
            { header: 'Stage', key: 'currentStage' },
            { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            {
              header: 'Action',
              render: (row) => <Link to={`/bills/${row.id}`}>Review Packet</Link>,
            },
          ]}
        />
      </section>

      <br />

      {/* Linked Payments */}
      <section>
        <header>
          <h3>Disbursed Payments &amp; Treasury Debits</h3>
        </header>

        <DataTable
          keyField="id"
          data={payments.filter((p) => bills.some((b) => b.id === p.billId))}
          emptyMessage="No treasury payments disbursed yet."
          columns={[
            { header: 'Payment Ref', key: 'paymentReference' },
            { header: 'Advocate', key: 'advocateName' },
            { header: 'Date', render: (row) => formatDate(row.paymentDate) },
            { header: 'Mode', key: 'paymentMode' },
            { header: 'Amount Disbursed', render: (row) => formatINR(row.amount) },
            { header: 'Accounting Head', key: 'accountingHead' },
            { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          ]}
        />
      </section>

      <br />

      {/* Decisions & Orders */}
      <section>
        <header>
          <h3>Judicial Decisions &amp; Court Orders</h3>
        </header>
        {hearings.some((h) => h.outcome) ? (
          <ul>
            {hearings
              .filter((h) => h.outcome)
              .map((h) => (
                <li key={h.id}>
                  <strong>Order on {formatDate(h.hearingDate)}:</strong> {h.outcome}
                  {h.nextHearingDate ? (
                    <span> (Adjourned to {formatDate(h.nextHearingDate)})</span>
                  ) : null}
                </li>
              ))}
          </ul>
        ) : (
          <p>
            <em>No interim or final judgments pronounced yet.</em>
          </p>
        )}
      </section>

      <br />

      {/* Documents Repository */}
      <section>
        <header>
          <h3>Uploaded Case Documents &amp; Pleadings</h3>
        </header>

        <DataTable
          keyField="id"
          data={caseItem.documents || []}
          emptyMessage="No documents attached to this case docket."
          columns={[
            { header: 'Document Title', key: 'name' },
            { header: 'Upload Date', render: (row) => formatDate(row.uploadDate) },
            { header: 'Uploaded By', key: 'uploadedBy' },
            {
              header: 'File Access',
              render: (row) => (
                <button type="button" onClick={() => alert(`Simulating download of ${row.name}`)}>
                  Download File
                </button>
              ),
            },
          ]}
        />

        <br />

        <form onSubmit={handleAddDocument}>
          <fieldset>
            <legend>Attach New Document</legend>
            <label htmlFor="docName">Document Name / Pleading Title: </label>
            <input
              id="docName"
              type="text"
              placeholder="e.g. Counter_Affidavit.pdf"
              value={newDocName}
              onChange={(e) => setNewDocName(e.target.value)}
              required
            />
            {' '}
            <button type="submit">Upload Pleading</button>
          </fieldset>
        </form>
      </section>
    </article>
  );
};

export default CaseDetailPage;
