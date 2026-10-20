import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, formatINR, formatDate } from '../../services/api';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

export const ApprovalInboxPage = () => {
  const [inboxBills, setInboxBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadInbox = async () => {
    try {
      setLoading(true);
      const data = await api.getApprovalInbox();
      setInboxBills(data);
    } catch (err) {
      console.error('Error fetching approval inbox:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInbox();
  }, []);

  const columns = [
    {
      header: 'Bill ID',
      render: (row) => (
        <Link to={`/approvals/${row.id}/action`}>
          <strong>{row.id}</strong>
        </Link>
      ),
    },
    { header: 'Reference', key: 'billReference' },
    { header: 'Advocate', key: 'advocateName' },
    {
      header: 'Case Number',
      render: (row) => <Link to={`/cases/${row.caseId}`}>{row.caseNumber}</Link>,
    },
    { header: 'Fee Category', key: 'feeCategoryName' },
    { header: 'Claimed Amount', render: (row) => formatINR(row.totalClaimed) },
    { header: 'Current Stage', key: 'currentStage' },
    {
      header: 'Stage Age',
      render: (row) => (
        <span>
          {row.stageAgeDays} days {row.stageAgeDays >= 5 ? <strong>(OVERDUE)</strong> : ''}
        </span>
      ),
    },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Action',
      render: (row) => (
        <Link to={`/approvals/${row.id}/action`}>
          <button type="button">Sanction / Take Action</button>
        </Link>
      ),
    },
  ];

  return (
    <article>
      <header>
        <h2>Sanction &amp; Approval Inbox</h2>
        <p>Vouchers awaiting executive financial sanction before treasury disbursement</p>
      </header>

      <section>
        {loading ? (
          <p>Loading approval inbox...</p>
        ) : (
          <DataTable
            columns={columns}
            data={inboxBills}
            emptyMessage="No vouchers currently pending executive sanction."
          />
        )}
      </section>
    </article>
  );
};

export default ApprovalInboxPage;
