import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, formatINR } from '../../services/api';
import DataTable from '../../components/DataTable';

export const CourtReportPage = () => {
  const [courtData, setCourtData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        setLoading(true);
        const data = await api.getCourtReport();
        setCourtData(data);
      } catch (err) {
        console.error('Error fetching court report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourts();
  }, []);

  const totalCases = courtData.reduce((acc, c) => acc + (c.totalCases || 0), 0);
  const totalHearings = courtData.reduce((acc, c) => acc + (c.pendingHearings || 0), 0);
  const totalDisbursed = courtData.reduce((acc, c) => acc + (c.billsDisbursed || 0), 0);

  const columns = [
    { header: 'Judicial Forum / Court', render: (row) => <strong>{row.courtName}</strong> },
    { header: 'Total Active Matters', key: 'totalCases' },
    { header: 'Pending Hearings', key: 'pendingHearings' },
    { header: 'Total Fee Disbursements', render: (row) => formatINR(row.billsDisbursed) },
    {
      header: 'Average Disposal Turnaround',
      render: (row) => `${row.avgTurnaroundDays} Days`,
    },
  ];

  return (
    <article>
      <header>
        <div>
          <Link to="/reports">&larr; Back to Reports Index</Link>
        </div>
        <h2>Court-wise Litigation Volume &amp; Turnaround Report</h2>
        <p>Comparative statistics across Supreme Court, High Court, and District Benches</p>
      </header>

      {/* Aggregate KPI */}
      <section>
        <table border="1" cellPadding="6" cellSpacing="0" width="100%">
          <thead>
            <tr>
              <th>Total Monitored Cases</th>
              <th>Pending Hearings Listed</th>
              <th>Total Court Disbursements</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>{totalCases}</strong>
              </td>
              <td>{totalHearings}</td>
              <td>
                <strong>{formatINR(totalDisbursed)}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <br />

      <div>
        <button
          type="button"
          onClick={() => alert('Exporting Court-wise Litigation Breakdown to CSV...')}
        >
          Export to CSV
        </button>
      </div>

      <br />

      <section>
        {loading ? (
          <p>Compiling court-wise metrics...</p>
        ) : (
          <DataTable columns={columns} data={courtData} />
        )}
      </section>
    </article>
  );
};

export default CourtReportPage;
