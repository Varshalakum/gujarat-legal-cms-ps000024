import React from 'react';
import { Link } from 'react-router-dom';

export const ReportListPage = () => {
  return (
    <article>
      <header>
        <h2>Government Legal Case &amp; Financial Analytics Hub</h2>
        <p>Comprehensive statutory reporting, MIS queries, and audit extracts</p>
      </header>

      <section>
        <h3>Available MIS Statements &amp; Reports</h3>

        <table border="1" cellPadding="8" cellSpacing="0" width="100%">
          <thead>
            <tr>
              <th>Report Title</th>
              <th>Description / Metrics Included</th>
              <th>Target Stakeholders</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Advocate Performance &amp; Fee Ledger</strong>
              </td>
              <td>
                Cases assigned, hearings attended, bills claimed, sanctioned amounts, disbursed funds, and pending liabilities per counsel.
              </td>
              <td>Legal Department, AG Office</td>
              <td>
                <Link to="/reports/advocates">Open Report</Link>
              </td>
            </tr>
            <tr>
              <td>
                <strong>Case Exposure vs Spend Analysis</strong>
              </td>
              <td>
                Breakdown of litigation claims, risk exposure, and legal fees spent per case docket.
              </td>
              <td>Pr. Secretaries, Legal Officers</td>
              <td>
                <Link to="/reports/cases">Open Report</Link>
              </td>
            </tr>
            <tr>
              <td>
                <strong>Court-wise Litigation Volume &amp; Turnaround</strong>
              </td>
              <td>
                Active cases, pending hearings, disbursement totals, and average disposal turnaround by court.
              </td>
              <td>Registrar General, Legal Officers</td>
              <td>
                <Link to="/reports/courts">Open Report</Link>
              </td>
            </tr>
            <tr>
              <td>
                <strong>Annual &amp; Financial Year (FY) Trends</strong>
              </td>
              <td>
                Multi-year trends for litigation filings, total claims processed, and state treasury disbursements.
              </td>
              <td>Finance Department, Planning</td>
              <td>
                <Link to="/reports/years">Open Report</Link>
              </td>
            </tr>
            <tr>
              <td>
                <strong>Budget vs Spend &amp; Liability Statement</strong>
              </td>
              <td>
                Department-level budget allocations, paid disbursements, approved pending liabilities, and exposure warnings.
              </td>
              <td>Finance Secretary, Dept Heads</td>
              <td>
                <Link to="/reports/budget">Open Report</Link>
              </td>
            </tr>
            <tr>
              <td>
                <strong>Hearing Attendance &amp; Appearance Compliance</strong>
              </td>
              <td>
                Court hearing compliance, advocate presence certification rates, and cause list verification ratios.
              </td>
              <td>Registrar, Legal Scrutiny</td>
              <td>
                <Link to="/reports/attendance">Open Report</Link>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <br />

      <section>
        <h4>Data Export Utility</h4>
        <p>
          Need raw data in CSV / Excel format for external auditing?
        </p>
        <button
          type="button"
          onClick={() => alert('Simulating export of consolidated state litigation MIS to CSV format...')}
        >
          Export All Records (CSV / Excel)
        </button>
      </section>
    </article>
  );
};

export default ReportListPage;
