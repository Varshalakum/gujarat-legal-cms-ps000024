import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, formatDate } from '../../services/api';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

export const HearingDetailPage = () => {
  const { id } = useParams();
  const [hearing, setHearing] = useState(null);
  const [outcome, setOutcome] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [status, setStatus] = useState('COMPLETED');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const fetchHearing = async () => {
      try {
        setLoading(true);
        const data = await api.getHearingById(id);
        setHearing(data);
        setOutcome(data.outcome || '');
        setNextDate(data.nextHearingDate || '');
        setStatus(data.status || 'COMPLETED');
      } catch (err) {
        console.error('Error fetching hearing details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHearing();
  }, [id]);

  const handleUpdateOutcome = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.updateHearing(id, {
        outcome,
        nextHearingDate: nextDate,
        status,
      });
      setHearing(updated);
      setMsg('Hearing outcome and next date updated successfully.');
    } catch (err) {
      setMsg('Failed to update hearing outcome.');
    }
  };

  if (loading) return <p>Loading hearing docket details...</p>;
  if (!hearing) return <p>Hearing record not found.</p>;

  return (
    <article>
      <header>
        <div>
          <Link to="/hearings">&larr; Back to Hearing Calendar</Link>
        </div>
        <h2>Hearing Record: {hearing.id}</h2>
        <p>
          Case:{' '}
          <Link to={`/cases/${hearing.caseId}`}>
            <strong>{hearing.caseNumber}</strong> ({hearing.caseTitle})
          </Link>
        </p>
      </header>

      {msg && (
        <aside>
          <p>
            <strong>Status Notice:</strong> {msg}
          </p>
        </aside>
      )}

      {/* Hearing Information */}
      <section>
        <h3>Hearing Information</h3>
        <table border="1" cellPadding="6" cellSpacing="0" width="100%">
          <tbody>
            <tr>
              <th align="left">Court Name</th>
              <td>{hearing.courtName}</td>
              <th align="left">Courtroom / Bench</th>
              <td>{hearing.courtRoom}</td>
            </tr>
            <tr>
              <th align="left">Scheduled Date</th>
              <td>{formatDate(hearing.hearingDate)}</td>
              <th align="left">Hearing Time</th>
              <td>{hearing.hearingTime}</td>
            </tr>
            <tr>
              <th align="left">Purpose of Listing</th>
              <td colSpan="3">{hearing.purpose}</td>
            </tr>
            <tr>
              <th align="left">Status</th>
              <td><StatusBadge status={hearing.status} /></td>
              <th align="left">Next Adjourned Date</th>
              <td>{formatDate(hearing.nextHearingDate)}</td>
            </tr>
            <tr>
              <th align="left">Court Daily Order / Outcome</th>
              <td colSpan="3">{hearing.outcome || <em>Pending court outcome recording</em>}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <br />

      {/* Reschedule History */}
      <section>
        <header>
          <h3>Reschedule History</h3>
        </header>
        {hearing.rescheduleHistory && hearing.rescheduleHistory.length > 0 ? (
          <table border="1" cellPadding="6" cellSpacing="0" width="100%">
            <thead>
              <tr>
                <th>Original Date</th>
                <th>Revised Date</th>
                <th>Reason for Adjournment</th>
              </tr>
            </thead>
            <tbody>
              {hearing.rescheduleHistory.map((r, idx) => (
                <tr key={idx}>
                  <td>{formatDate(r.originalDate)}</td>
                  <td>{formatDate(r.revisedDate)}</td>
                  <td>{r.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>
            <em>No adjournments or reschedules recorded. Listed on scheduled track.</em>
          </p>
        )}
      </section>

      <br />

      {/* Advocate Attendance Log */}
      <section>
        <header>
          <h3>Advocate Attendance &amp; Evidence Certification</h3>
          <p>
            <Link to={`/hearings/attendance?hearingId=${hearing.id}`}>
              &rarr; Open Attendance Desk to modify
            </Link>
          </p>
        </header>

        <DataTable
          keyField="advocateId"
          data={hearing.attendances || []}
          emptyMessage="No advocates mapped to this hearing."
          columns={[
            { header: 'Advocate Name', key: 'advocateName' },
            {
              header: 'Recorded Status',
              render: (row) => <StatusBadge status={row.status} />,
            },
            {
              header: 'Verification State',
              render: (row) => <code>{row.verification || 'PENDING'}</code>,
            },
            {
              header: 'Recorded By',
              render: (row) => row.recordedBy || <em>Unrecorded</em>,
            },
            {
              header: 'Evidence / Cause List Slip',
              render: (row) => row.evidence || <em>No evidence attached</em>,
            },
          ]}
        />
      </section>

      <br />

      {/* Outcome Update Form */}
      <section>
        <form onSubmit={handleUpdateOutcome}>
          <fieldset>
            <legend>Record Hearing Outcome &amp; Next Date</legend>

            <div>
              <label htmlFor="outcome">Court Order Summary / Outcome: </label>
              <br />
              <textarea
                id="outcome"
                rows="3"
                cols="60"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="Enter daily court order notes, arguments heard, interim relief granted, etc."
                required
              />
            </div>

            <br />

            <div>
              <label htmlFor="nextDate">Next Listing Date: </label>
              <input
                id="nextDate"
                type="date"
                value={nextDate}
                onChange={(e) => setNextDate(e.target.value)}
              />
            </div>

            <br />

            <div>
              <label htmlFor="hStatus">Hearing Status: </label>
              <select
                id="hStatus"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="COMPLETED">COMPLETED</option>
                <option value="ADJOURNED">ADJOURNED</option>
                <option value="SCHEDULED">SCHEDULED</option>
              </select>
            </div>

            <br />

            <button type="submit">Save Outcome &amp; Next Listing</button>
          </fieldset>
        </form>
      </section>
    </article>
  );
};

export default HearingDetailPage;
