import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api';

export const HearingFormPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState(searchParams.get('caseId') || '');
  const [formData, setFormData] = useState({
    courtName: 'High Court of Gujarat',
    courtRoom: 'Courtroom 4, Bench II',
    hearingDate: new Date().toISOString().split('T')[0],
    hearingTime: '10:30',
    purpose: 'Hearing on Interim Relief & Reply',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const cList = await api.getCases();
        setCases(cList);
        if (!selectedCaseId && cList.length > 0) {
          setSelectedCaseId(cList[0].id);
        }
      } catch (err) {
        setError('Failed to fetch case list.');
      }
    };
    fetchCases();
  }, [selectedCaseId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedCaseId) {
      setError('Please select a valid case docket.');
      return;
    }

    const c = cases.find((x) => x.id === selectedCaseId);
    if (!c) {
      setError('Selected case docket not found.');
      return;
    }

    try {
      setLoading(true);
      const attendances = (c.assignedAdvocates || []).map((adv) => ({
        advocateId: adv.id,
        advocateName: adv.name,
        status: 'NOT_RECORDED',
        recordedBy: '',
        verification: 'PENDING',
        evidence: '',
      }));

      const newHearing = await api.createHearing({
        caseId: c.id,
        caseNumber: c.caseNumber,
        caseTitle: c.title,
        courtName: formData.courtName,
        courtRoom: formData.courtRoom,
        hearingDate: formData.hearingDate,
        hearingTime: formData.hearingTime,
        purpose: formData.purpose,
        attendances,
      });

      navigate(`/hearings/${newHearing.id}`);
    } catch (err) {
      setError(err.message || 'Failed to schedule hearing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <article>
      <header>
        <div>
          <Link to="/hearings">&larr; Back to Hearing Calendar</Link>
        </div>
        <h2>Schedule Court Hearing</h2>
        <p>List a case matter before judicial bench</p>
      </header>

      {error && (
        <aside role="alert">
          <p>
            <strong>Error:</strong> {error}
          </p>
        </aside>
      )}

      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>Hearing Particulars</legend>

          <div>
            <label htmlFor="caseSelect">Select Case Docket: </label>
            <br />
            <select
              id="caseSelect"
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              required
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.caseNumber} - {c.title} ({c.courtName})
                </option>
              ))}
            </select>
          </div>

          <br />

          <div>
            <label htmlFor="courtName">Court: </label>
            <br />
            <select
              id="courtName"
              name="courtName"
              value={formData.courtName}
              onChange={handleChange}
            >
              <option value="High Court of Gujarat">High Court of Gujarat</option>
              <option value="City Civil & Sessions Court, Ahmedabad">City Civil Court, Ahmedabad</option>
              <option value="District & Sessions Court, Gandhinagar">District Court, Gandhinagar</option>
              <option value="Supreme Court of India">Supreme Court of India</option>
            </select>
          </div>

          <br />

          <div>
            <label htmlFor="courtRoom">Courtroom / Bench Specification: </label>
            <br />
            <input
              id="courtRoom"
              name="courtRoom"
              type="text"
              placeholder="e.g. Courtroom 4, Bench II or Court 1 (Chief Justice)"
              value={formData.courtRoom}
              onChange={handleChange}
              required
            />
          </div>

          <br />

          <div>
            <label htmlFor="hearingDate">Hearing Date: </label>
            <br />
            <input
              id="hearingDate"
              name="hearingDate"
              type="date"
              value={formData.hearingDate}
              onChange={handleChange}
              required
            />
          </div>

          <br />

          <div>
            <label htmlFor="hearingTime">Hearing Time: </label>
            <br />
            <input
              id="hearingTime"
              name="hearingTime"
              type="time"
              value={formData.hearingTime}
              onChange={handleChange}
              required
            />
          </div>

          <br />

          <div>
            <label htmlFor="purpose">Purpose of Listing: </label>
            <br />
            <select
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
            >
              <option value="Admission & Preliminary Notice">Admission &amp; Preliminary Notice</option>
              <option value="Hearing on Interim Relief & Reply">Hearing on Interim Relief &amp; Reply</option>
              <option value="Cross-examination & Evidence">Cross-examination &amp; Evidence</option>
              <option value="Final Arguments">Final Arguments</option>
              <option value="Pronouncement of Judgment / Order">Pronouncement of Judgment / Order</option>
            </select>
          </div>
        </fieldset>

        <br />

        <div>
          <button type="submit" disabled={loading}>
            {loading ? 'Scheduling...' : 'Confirm & Schedule Listing'}
          </button>
          {' '}
          <Link to="/hearings">
            <button type="button">Cancel</button>
          </Link>
        </div>
      </form>
    </article>
  );
};

export default HearingFormPage;
