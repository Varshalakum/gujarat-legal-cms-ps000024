import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, formatINR } from '../../services/api';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

export const BudgetReportPage = () => {
  const [budgetReports, setBudgetReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudgetReport = async () => {
      try {
        setLoading(true);
        const data = await api.getBudgetReport();
        setBudgetReports(data);
      } catch (err) {
        console.error('Error fetching budget report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBudgetReport();
  }, []);

  const totalAlloc = budgetReports.reduce((acc, b) => acc + (b.allocation || 0), 0);
  const totalPaid = budgetReports.reduce((acc, b) => acc + (b.paidSpend || 0), 0);
  const totalUnpaid = budgetReports.reduce((acc, b) => acc + (b.approvedUnpaid || 0), 0);
  const totalExposure = budgetReports.reduce((acc, b) => acc + (b.exposure || 0), 0);

  const columns = [
    { header: 'Department', render: (row) => <strong>{row.department}</strong> },
    { header: 'Financial Year', key: 'financialYear' },
    { header: 'Budget Head / Dimension', key: 'dimensionHead' },
    { header: 'Allocation (INR)', render: (row) => formatINR(row.allocation) },
    { header: 'Disbursed Spend (INR)', render: (row) => formatINR(row.paidSpend) },
    { header: 'Approved Unpaid Liability (INR)', render: (row) => formatINR(row.approvedUnpaid) },
    { header: 'Total Exposure (INR)', render: (row) => <strong>{formatINR(row.exposure)}</strong> },
    {
      header: 'Spend + Liability %',
      render: (row) => {
        const pct = Math.round(((row.paidSpend + row.approvedUnpaid) / row.allocation) * 100);
        return <span>{pct}%</span>;
      },
    },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <article>
      <header>
        <div>
          <Link to="/reports">&larr; Back to Reports Index</Link>
        </div>
        <h2>Budget vs Spend &amp; Liability Statement</h2>
        <p>Comprehensive audit of legal appropriations and encumbrances by administrative department</p>
      </header>

      {/* Aggregate KPI */}
      <section>
        <table border="1" cellPadding="6" cellSpacing="0" width="100%">
          <thead>
            <tr>
              <th>Total Sanctioned Budget</th>
              <th>Total Disbursed Spend</th>
              <th>Total Approved Unpaid Liability</th>
              <th>Net Total Exposure</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>{formatINR(totalAlloc)}</strong>
              </td>
              <td>{formatINR(totalPaid)}</td>
              <td>{formatINR(totalUnpaid)}</td>
              <td>
                <strong>{formatINR(totalExposure)}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <br />

      <div>
        <button
          type="button"
          onClick={() => alert('Exporting Budget vs Liability Statement to CSV...')}
        >
          Export to CSV
        </button>
      </div>

      <br />

      <section>
        {loading ? (
          <p>Compiling budget statement...</p>
        ) : (
          <DataTable columns={columns} data={budgetReports} />
        )}
      </section>
    </article>
  );
};

export default BudgetReportPage;
