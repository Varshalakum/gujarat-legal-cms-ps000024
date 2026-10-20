import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, formatINR, formatDate } from '../../services/api';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';

export const BillListPage = () => {
  const [bills, setBills] = useState([]);
  const [stageFilter, setStageFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const loadBills = async () => {
    try {
      setLoading(true);
      const data = await api.getBills({
        currentStage: stageFilter,
        status: statusFilter,
      });
      setBills(data);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching bills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, [stageFilter, statusFilter]);

  const totalPages = Math.ceil(bills.length / pageSize) || 1;
  const paginatedBills = bills.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns = [
    {
      header: 'Bill ID',
      render: (row) => (
        <Link to={`/bills/${row.id}`}>
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
    { header: 'Bill Date', render: (row) => formatDate(row.billDate) },
    { header: 'Claimed (INR)', render: (row) => formatINR(row.totalClaimed) },
    { header: 'Approved (INR)', render: (row) => formatINR(row.approvedAmount) },
    { header: 'Paid (INR)', render: (row) => formatINR(row.paidAmount) },
    { header: 'Current Stage', key: 'currentStage' },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Actions',
      render: (row) => (
        <div>
          <Link to={`/bills/${row.id}`}>View Packet</Link>
          {' | '}
          <Link to={`/bills/${row.id}/review`}>Scrutiny</Link>
        </div>
      ),
    },
  ];

  return (
    <article>
      <header>
        <h2>Advocate Fee Voucher Register</h2>
        <p>Fee claims, verification workflow, and settlement status</p>
      </header>

      <div>
        <Link to="/bills/submit">
          <button type="button">+ Submit Fee Bill</button>
        </Link>
        {' '}
        <Link to="/approvals">
          <button type="button">Go to Approval Inbox</button>
        </Link>
      </div>

      <br />

      <section>
        <fieldset>
          <legend>Filter Fee Bills</legend>

          <label htmlFor="stageSelect">Workflow Stage: </label>
          <select
            id="stageSelect"
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
          >
            <option value="ALL">All Stages</option>
            <option value="VERIFICATION">Under Verification</option>
            <option value="APPROVER_REVIEW">Approver Review</option>
            <option value="FINANCE_PAYMENT">Finance Payment</option>
            <option value="PAID">Disbursed / Paid</option>
            <option value="RETURNED_TO_ADVOCATE">Returned for Resubmission</option>
            <option value="CLOSED">Rejected / Closed</option>
          </select>

          {' | '}

          <label htmlFor="statusSelect">Bill Status: </label>
          <select
            id="statusSelect"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="UNDER_VERIFICATION">UNDER_VERIFICATION</option>
            <option value="IN_APPROVAL">IN_APPROVAL</option>
            <option value="APPROVED">APPROVED</option>
            <option value="PAID">PAID</option>
            <option value="RETURNED">RETURNED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </fieldset>
      </section>

      <br />

      <section>
        {loading ? (
          <p>Loading fee vouchers...</p>
        ) : (
          <>
            <DataTable columns={columns} data={paginatedBills} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={bills.length}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </section>
    </article>
  );
};

export default BillListPage;
