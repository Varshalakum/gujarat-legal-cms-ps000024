import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, formatINR, formatDate } from '../../services/api';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

export const CaseReportPage = () => {
  const [caseReports, setCaseReports] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        const data = await api.getCaseReport();
        setCaseReports(data);
      } catch (err) {
        console.error('Error fetching case report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const filtered = caseReports.filter((c) =>
    departmentFilter === 'ALL' ? true : c.department === departmentFilter
  );

  const totalExposure = filtered.reduce((acc, c) => acc + (c.exposure || 0), 0);
  const totalSpend = filtered.reduce((acc, c) => acc + (c.billsTotal || 0), 0);

  const columns = [
    { header: 'Case Number', render: (row) => <strong>{row.caseNumber}</strong> },
    { header: 'Parties / Caption', key: 'title' },
    { header: 'Department', key: 'department' },
    { header: 'Court Name', key: 'court' },
    { header: 'Filing Date', render: (row) => formatDate(row.filingDate) },
    { header: 'Financial Exposure (INR)', render: (row) => formatINR(row.exposure) },
    { header: 'Legal Fees Incurred (INR)', render: (row) => formatINR(row.billsTotal) },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <article>
      <header>
        <div>
          <Link to="/reports">&larr; Back to Reports Index</Link>
        </div>
        <h2>Case Spend vs Financial Exposure Analysis</h2>
        <p>Litigation risk and cost of defense across state departments</p>
      </header>

      {/* Aggregate KPI */}
      <section>
        <table border="1" cellPadding="6" cellSpacing="0" width="100%">
          <thead>
            <tr>
              <th>Total Financial Exposure at Stake</th>
              <th>Total Legal Defense Spend Incurred</th>
              <th>Defense Spend to Exposure Ratio</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>{formatINR(totalExposure)}</strong>
              </td>
              <td>{formatINR(totalSpend)}</td>
              <td>
                {totalExposure > 0
                  ? ((totalSpend / totalExposure) * 100).toFixed(2) + '%'
                  : '0%'}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <br />

      {/* Filter and Export */}
      <section>
        <fieldset>
          <legend>Department Filter &amp; Export</legend>
          <label htmlFor="dept">Filter Department: </label>
          <select
            id="dept"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="ALL">All Departments</option>
            <option value="Revenue Department">Revenue Department</option>
            <option value="Industries and Mines Department">Industries and Mines</option>
            <option value="Home Department">Home Department</option>
          </select>
          {' '}
          <button
            type="button"
            onClick={() => alert('Exporting Case Financial Exposure Report to CSV...')}
          >
            Export to CSV
          </button>
        </fieldset>
      </section>

      <br />

      <section>
        {loading ? (
          <p>Analyzing case financial exposures...</p>
        ) : (
          <DataTable columns={columns} data={filtered} />
        )}
      </section>
    </article>
  );
};

export default CaseReportPage;
