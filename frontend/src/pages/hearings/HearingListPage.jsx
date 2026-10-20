import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, formatDate } from '../../services/api';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

export const HearingListPage = () => {
  const [hearings, setHearings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const loadHearings = async () => {
    try {
      setLoading(true);
      const data = await api.getHearings({ status: statusFilter });
      setHearings(data);
    } catch (err) {
      console.error('Error fetching hearings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHearings();
  }, [statusFilter]);

  const columns = [
    { header: 'Hearing ID', key: 'id' },
    {
      header: 'Case Number',
      render: (row) => (
        <Link to={`/cases/${row.caseId}`}>
          <strong>{row.caseNumber}</strong>
        </Link>
      ),
    },
    { header: 'Court & Bench', render: (row) => `${row.courtName} (${row.courtRoom})` },
    { header: 'Date & Time', render: (row) => `${formatDate(row.hearingDate)} at ${row.hearingTime}` },
    { header: 'Purpose', key: 'purpose' },
    { header: 'Outcome', render: (row) => row.outcome || <em>Pending hearing</em> },
    { header: 'Next Date', render: (row) => formatDate(row.nextHearingDate) },
    {
      header: 'Reschedule Count',
      render: (row) => (row.rescheduleHistory?.length || 0),
    },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Actions',
      render: (row) => (
        <div>
          <Link to={`/hearings/${row.id}`}>View Details</Link>
          {' | '}
          <Link to="/hearings/attendance">Record Attendance</Link>
        </div>
      ),
    },
  ];

  return (
    <article>
      <header>
        <h2>Court Hearing Calendar &amp; Cause List</h2>
        <p>Litigation listings across the High Court and Subordinate Courts of Gujarat</p>
      </header>

      <div>
        <Link to="/hearings/new">
          <button type="button">+ Schedule Hearing</button>
        </Link>
        {' '}
        <Link to="/hearings/attendance">
          <button type="button">Go to Attendance Desk</button>
        </Link>
      </div>

      <br />

      <section>
        <fieldset>
          <legend>Filter by Hearing Status</legend>
          <label htmlFor="status">Status: </label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Hearings</option>
            <option value="SCHEDULED">Upcoming / Scheduled</option>
            <option value="COMPLETED">Completed / Concluded</option>
            <option value="ADJOURNED">Adjourned</option>
          </select>
        </fieldset>
      </section>

      <br />

      <section>
        {loading ? (
          <p>Loading hearing calendar...</p>
        ) : (
          <DataTable columns={columns} data={hearings} />
        )}
      </section>
    </article>
  );
};

export default HearingListPage;
