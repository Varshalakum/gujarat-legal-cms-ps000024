import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, formatINR } from '../../services/api';
import DataTable from '../../components/DataTable';

export const AdvocateReportPage = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAdvocate, setFilterAdvocate] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const data = await api.getAdvocateReport();
        setReportData(data);
      } catch (err) {
        console.error('Error fetching advocate report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const filtered = reportData.filter((r) =>
    r.advocateName.toLowerCase().includes(filterAdvocate.toLowerCase())
  );

  const totalClaimed = filtered.reduce((acc, r) => acc + (r.billsClaimed || 0), 0);
  const totalApproved = filtered.reduce((acc, r) => acc + (r.billsApproved || 0), 0);
  const totalPaid = filtered.reduce((acc, r) => acc + (r.billsPaid || 0), 0);
  const totalLiability = filtered.reduce((acc, r) => acc + (r.pendingLiability || 0), 0);

  const columns = [
    { header: 'Advocate Name', render: (row) => <strong>{row.advocateName}</strong> },
    { header: 'Bar Council Reg No', key: 'barNo' },
    { header: 'Assigned Cases', key: 'assignedCases' },
    { header: 'Total Hearings', key: 'totalHearings' },
    { header: 'Certified Attendances', key: 'attendancesRecorded' },
    { header: 'Claimed (INR)', render: (row) => formatINR(row.billsClaimed) },
    { header: 'Sanctioned (INR)', render: (row) => formatINR(row.billsApproved) },
    { header: 'Disbursed (INR)', render: (row) => formatINR(row.billsPaid) },
    {
      header: 'Pending State Liability',
      render: (row) => <strong>{formatINR(row.pendingLiability)}</strong>,
    },
  ];

  return (
    <article>
      <header>
        <div>
          <Link to="/reports">&larr; Back to Reports Index</Link>
        </div>
        <h2>Advocate Performance &amp; Fee Ledger Report</h2>
        <p>Audit statement of counsel appearances, fee bill sanctions, and outstanding commitments</p>
      </header>

      {/* Aggregate KPI */}
      <section>
        <table border="1" cellPadding="6" cellSpacing="0" width="100%">
          <thead>
            <tr>
              <th>Total Claimed</th>
              <th>Total Sanctioned</th>
              <th>Total Disbursed</th>
              <th>Total Pending Liability</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{formatINR(totalClaimed)}</td>
              <td>{formatINR(totalApproved)}</td>
              <td>{formatINR(totalPaid)}</td>
              <td>
                <strong>{formatINR(totalLiability)}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <br />

      {/* Filter & Export */}
      <section>
        <fieldset>
          <legend>Report Filters</legend>
          <label htmlFor="advFilter">Filter by Advocate Name: </label>
          <input
            id="advFilter"
            type="text"
            placeholder="Type advocate name..."
            value={filterAdvocate}
            onChange={(e) => setFilterAdvocate(e.target.value)}
          />
          {' '}
          <button
            type="button"
            onClick={() => alert('Simulating CSV export of Advocate Fee Ledger...')}
          >
            Export to CSV
          </button>
        </fieldset>
      </section>

      <br />

      <section>
        {loading ? (
          <p>Compiling advocate performance data...</p>
        ) : (
          <DataTable columns={columns} data={filtered} />
        )}
      </section>
    </article>
  );
};

export default AdvocateReportPage;
