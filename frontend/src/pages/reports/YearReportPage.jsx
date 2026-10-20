import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, formatINR } from '../../services/api';
import DataTable from '../../components/DataTable';

export const YearReportPage = () => {
  const [yearData, setYearData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        setLoading(true);
        const data = await api.getYearReport();
        setYearData(data);
      } catch (err) {
        console.error('Error fetching year report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchYears();
  }, []);

  const columns = [
    { header: 'Financial Year (FY)', render: (row) => <strong>{row.financialYear}</strong> },
    { header: 'Hearings Listed', key: 'totalHearings' },
    { header: 'Fee Vouchers Submitted', key: 'billsSubmitted' },
    { header: 'Total Claimed (INR)', render: (row) => formatINR(row.totalClaimed) },
    {
      header: 'Total Treasury Disbursed (INR)',
      render: (row) => <strong>{formatINR(row.totalDisbursed)}</strong>,
    },
    {
      header: 'Settlement Ratio %',
      render: (row) => {
        const pct = Math.round((row.totalDisbursed / row.totalClaimed) * 100);
        return `${pct}%`;
      },
    },
  ];

  return (
    <article>
      <header>
        <div>
          <Link to="/reports">&larr; Back to Reports Index</Link>
        </div>
        <h2>Annual &amp; Financial Year (FY) Litigation Trends</h2>
        <p>Longitudinal analysis of state litigation expenditure and case volumes</p>
      </header>

      <div>
        <button
          type="button"
          onClick={() => alert('Exporting Annual Fiscal Trends to CSV...')}
        >
          Export to CSV
        </button>
      </div>

      <br />

      <section>
        {loading ? (
          <p>Compiling multi-year financial trends...</p>
        ) : (
          <DataTable columns={columns} data={yearData} />
        )}
      </section>
    </article>
  );
};

export default YearReportPage;
