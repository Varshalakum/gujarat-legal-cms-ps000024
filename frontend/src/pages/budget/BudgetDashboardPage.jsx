import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, formatINR } from '../../services/api';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

export const BudgetDashboardPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [selectedFY, setSelectedFY] = useState('2024-2025');
  const [loading, setLoading] = useState(true);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const data = await api.getBudgetDashboard();
      setBudgets(data);
    } catch (err) {
      console.error('Error fetching budget dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const totalAllocation = budgets.reduce((acc, b) => acc + (b.allocation || 0), 0);
  const totalPaid = budgets.reduce((acc, b) => acc + (b.paidSpend || 0), 0);
  const totalApprovedUnpaid = budgets.reduce((acc, b) => acc + (b.approvedUnpaid || 0), 0);
  const totalExposure = budgets.reduce((acc, b) => acc + (b.exposure || 0), 0);
  const balanceAvailable = totalAllocation - totalPaid - totalApprovedUnpaid;

  const columns = [
    { header: 'Budget ID', key: 'id' },
    { header: 'Department', key: 'department' },
    { header: 'Budget Dimension / Head', key: 'dimensionHead' },
    { header: 'Allocation (INR)', render: (row) => formatINR(row.allocation) },
    { header: 'Paid Spend (INR)', render: (row) => formatINR(row.paidSpend) },
    { header: 'Approved Unpaid (INR)', render: (row) => formatINR(row.approvedUnpaid) },
    {
      header: 'Total Exposure (INR)',
      render: (row) => <strong>{formatINR(row.exposure)}</strong>,
    },
    {
      header: 'Balance Remaining',
      render: (row) => {
        const bal = row.allocation - row.paidSpend - row.approvedUnpaid;
        return <span>{formatINR(bal)}</span>;
      },
    },
    {
      header: 'Utilization %',
      render: (row) => {
        const pct = Math.round(((row.paidSpend + row.approvedUnpaid) / row.allocation) * 100);
        return (
          <span>
            {pct}% {pct >= (row.warningThresholdPercent || 80) ? <strong>[ALERT]</strong> : ''}
          </span>
        );
      },
    },
    {
      header: 'Threshold Alert',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <article>
      <header>
        <h2>Budget Telemetry &amp; Financial Exposure Dashboard</h2>
        <p>State Litigation Expenditure &amp; Encumbrance Monitoring</p>
      </header>

      <div>
        <Link to="/budget/setup">
          <button type="button">+ Configure Budget Allocations</button>
        </Link>
        {' '}
        <Link to="/reports/budget">
          <button type="button">View Fiscal Year Analysis</button>
        </Link>
      </div>

      <br />

      {/* Aggregate KPI */}
      <section>
        <table border="1" cellPadding="6" cellSpacing="0" width="100%">
          <thead>
            <tr>
              <th>Total Sanctioned Budget</th>
              <th>Disbursed Spend (Paid)</th>
              <th>Committed / Approved Unpaid</th>
              <th>Current Total Exposure</th>
              <th>Net Available Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>{formatINR(totalAllocation)}</strong>
              </td>
              <td>{formatINR(totalPaid)}</td>
              <td>{formatINR(totalApprovedUnpaid)}</td>
              <td>
                <strong>{formatINR(totalExposure)}</strong>
              </td>
              <td>
                <strong>{formatINR(balanceAvailable)}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <br />

      {/* Warning Alert Banner */}
      {budgets.some((b) => (b.paidSpend + b.approvedUnpaid) / b.allocation >= 0.8) && (
        <aside role="alert">
          <h4>Notice of Budget Ceiling Breaches</h4>
          <p>
            Departments marked with <code>[WARNING]</code> or <code>[ALERT]</code> have consumed over
            80% of their budgetary allocation. Additional voucher sanctions will require revised
            estimates (RE) approval from the Finance Department.
          </p>
        </aside>
      )}

      {/* Budget Dimension Breakdown */}
      <section>
        <header>
          <h3>Departmental Head Allocations &amp; Spend</h3>
        </header>

        {loading ? (
          <p>Loading budget telemetry...</p>
        ) : (
          <DataTable columns={columns} data={budgets} />
        )}
      </section>
    </article>
  );
};

export default BudgetDashboardPage;
