import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api, formatDate } from '../../services/api';

export const AttendancePage = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [hearings, setHearings] = useState([]);
  const [selectedHearingId, setSelectedHearingId] = useState(searchParams.get('hearingId') || '');
  const [selectedHearing, setSelectedHearing] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [recorderName, setRecorderName] = useState(user?.name || 'Legal Officer');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadHearings = async () => {
      try {
        const data = await api.getHearings();
        setHearings(data);
        const targetId = selectedHearingId || (data.length > 0 ? data[0].id : '');
        setSelectedHearingId(targetId);
      } catch (err) {
        setError('Failed to load hearings.');
      }
    };
    loadHearings();
  }, []);

  useEffect(() => {
    if (!selectedHearingId || hearings.length === 0) return;
    const h = hearings.find((x) => x.id === selectedHearingId);
    if (h) {
      setSelectedHearing(h);
      setAttendances(
        (h.attendances || []).map((att) => ({
          ...att,
          status: att.status || 'NOT_RECORDED',
          verification: att.verification || 'PENDING',
          evidence: att.evidence || '',
          recordedBy: att.recordedBy || `${user?.role || 'OFFICER'} (${user?.name || 'Officer'})`,
        }))
      );
    }
  }, [selectedHearingId, hearings, user]);

  const handleAttendanceChange = (index, field, value) => {
    setAttendances((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');

    try {
      setSaving(true);
      const updatedAttendances = attendances.map((a) => ({
        ...a,
        recordedBy: recorderName,
      }));

      await api.recordAttendance(selectedHearingId, { attendances: updatedAttendances });
      setMsg('Advocate attendance and evidence records saved successfully.');
    } catch (err) {
      setError(err.message || 'Failed to record attendance.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <article>
      <header>
        <h2>Hearing Attendance &amp; Appearance Verification Desk</h2>
        <p>Record and authenticate advocate physical/virtual appearance in court</p>
      </header>

      {msg && (
        <aside>
          <p>
            <strong>Success:</strong> {msg}
          </p>
        </aside>
      )}

      {error && (
        <aside role="alert">
          <p>
            <strong>Error:</strong> {error}
          </p>
        </aside>
      )}

      <section>
        <fieldset>
          <legend>Select Court Hearing</legend>
          <label htmlFor="hSelect">Hearing Docket: </label>
          <select
            id="hSelect"
            value={selectedHearingId}
            onChange={(e) => setSelectedHearingId(e.target.value)}
          >
            {hearings.map((h) => (
              <option key={h.id} value={h.id}>
                {h.id} | {h.caseNumber} - {h.courtName} ({formatDate(h.hearingDate)})
              </option>
            ))}
          </select>
        </fieldset>
      </section>

      <br />

      {selectedHearing && (
        <section>
          <h3>
            Hearing Information: {selectedHearing.caseNumber} ({selectedHearing.caseTitle})
          </h3>
          <p>
            <strong>Court:</strong> {selectedHearing.courtName} | <strong>Bench:</strong>{' '}
            {selectedHearing.courtRoom} | <strong>Date:</strong> {formatDate(selectedHearing.hearingDate)} |{' '}
            <strong>Time:</strong> {selectedHearing.hearingTime}
          </p>

          <form onSubmit={handleSaveAttendance}>
            <fieldset>
              <legend>Certification by Legal Officer / Clerk of the State</legend>
              <label htmlFor="recorder">Official Recording Officer: </label>
              <input
                id="recorder"
                type="text"
                value={recorderName}
                onChange={(e) => setRecorderName(e.target.value)}
                required
              />
            </fieldset>

            <br />

            <fieldset>
              <legend>Advocate Appearance &amp; Evidence Roll</legend>
              {attendances.length === 0 ? (
                <p>
                  <em>No advocates assigned to this case hearing.</em>
                </p>
              ) : (
                <table border="1" cellPadding="6" cellSpacing="0" width="100%">
                  <thead>
                    <tr>
                      <th>Advocate Name</th>
                      <th>Appearance Status</th>
                      <th>Verification Status</th>
                      <th>Evidence / Cause List / Daily Board Slip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendances.map((att, idx) => (
                      <tr key={att.advocateId || idx}>
                        <td>
                          <strong>{att.advocateName}</strong>
                        </td>
                        <td>
                          <select
                            value={att.status}
                            onChange={(e) =>
                              handleAttendanceChange(idx, 'status', e.target.value)
                            }
                          >
                            <option value="NOT_RECORDED">NOT RECORDED</option>
                            <option value="PRESENT">PRESENT</option>
                            <option value="ABSENT">ABSENT</option>
                          </select>
                        </td>
                        <td>
                          <select
                            value={att.verification}
                            onChange={(e) =>
                              handleAttendanceChange(idx, 'verification', e.target.value)
                            }
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="VERIFIED">VERIFIED</option>
                            <option value="REJECTED">REJECTED</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="text"
                            placeholder="e.g. Cause List Item #14 or Appearance Memo"
                            value={att.evidence}
                            onChange={(e) =>
                              handleAttendanceChange(idx, 'evidence', e.target.value)
                            }
                            size="40"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </fieldset>

            <br />

            <div>
              <button type="submit" disabled={saving || attendances.length === 0}>
                {saving ? 'Saving Attendance Records...' : 'Save & Certify Attendance'}
              </button>
              {' '}
              <Link to={`/hearings/${selectedHearing.id}`}>
                <button type="button">View Hearing Docket</button>
              </Link>
            </div>
          </form>
        </section>
      )}
    </article>
  );
};

export default AttendancePage;
