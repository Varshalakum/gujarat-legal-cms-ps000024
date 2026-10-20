import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import DataTable from '../../components/DataTable';

export const AttendanceReportPage = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const data = await api.getAttendanceReport();
        setReportData(data);
      } catch (err) {
        console.error('Error fetching attendance report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const totalHearings = reportData.reduce((acc, r) => acc + (r.totalHearings || 0), 0);
  const totalRecorded = reportData.reduce((acc, r) => acc + (r.attendancesRecorded || 0), 0);
  const totalPending = reportData.reduce((acc, r) => acc + (r.pendingAttendance || 0), 0);

  const columns = [
    { header: 'Court Forum', render: (row) => <strong>{row.court}</strong> },
    { header: 'Total Hearings Listed', key: 'totalHearings' },
    { header: 'Attendances Certified', key: 'attendancesRecorded' },
    { header: 'Pending Certifications', key: 'pendingAttendance' },
    { header: 'Compliance Rate %', render: (row) => <strong>{row.complianceRate}</strong> },
  ];

  return (
    <article>
      <header>
        <div>
          <Link to="/reports">&larr; Back to Reports Index</Link>
        </div>
        <h2>Hearing Attendance &amp; Appearance Compliance Report</h2>
        <p>Audit verification compliance of state advocates across judicial forums</p>
      </header>

      {/* Aggregate KPI */}
      <section>
        <table border="1" cellPadding="6" cellSpacing="0" width="100%">
          <thead>
            <tr>
              <th>Total Scheduled Hearings</th>
              <th>Certified Appearances</th>
              <th>Unrecorded / Pending</th>
              <th>Overall Compliance Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>{totalHearings}</strong>
              </td>
              <td>{totalRecorded}</td>
              <td>{totalPending}</td>
              <td>
                <strong>
                  {totalHearings > 0
                    ? ((totalRecorded / totalHearings) * 100).toFixed(1) + '%'
                    : '100%'}
                </strong>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <br />

      <div>
        <button
          type="button"
          onClick={() => alert('Exporting Hearing Attendance Audit Report to CSV...')}
        >
          Export to CSV
        </button>
      </div>

      <br />

      <section>
        {loading ? (
          <p>Compiling attendance compliance metrics...</p>
        ) : (
          <DataTable columns={columns} data={reportData} />
        )}
      </section>
    </article>
  );
};

export default AttendanceReportPage;
