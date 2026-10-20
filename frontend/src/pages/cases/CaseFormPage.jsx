import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';

export const CaseFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    caseNumber: '',
    title: '',
    courtName: 'High Court of Gujarat',
    courtId: 'CRT-001',
    caseType: 'Special Civil Application',
    department: 'Revenue Department',
    departmentId: 'DEP-001',
    status: 'ACTIVE',
    filingDate: new Date().toISOString().split('T')[0],
    nextHearingDate: '',
    currentStage: 'Initial Notice',
    financialExposure: 0,
    summary: '',
  });

  const [advocates, setAdvocates] = useState([]);
  const [selectedAdvocateId, setSelectedAdvocateId] = useState('');
  const [assignedAdvocates, setAssignedAdvocates] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const advList = await api.getAdvocates();
        setAdvocates(advList);
        if (advList.length > 0) setSelectedAdvocateId(advList[0].id);

        if (isEdit) {
          const existing = await api.getCaseById(id);
          if (existing) {
            setFormData(existing);
            setAssignedAdvocates(existing.assignedAdvocates || []);
          }
        }
      } catch (err) {
        setError('Failed to load initial form data.');
      }
    };
    init();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'financialExposure' ? Number(value) : value,
    }));
  };

  const handleAddAdvocate = () => {
    const found = advocates.find((a) => a.id === selectedAdvocateId);
    if (!found) return;
    if (assignedAdvocates.some((a) => a.id === found.id)) {
      alert('This advocate is already assigned to this case docket.');
      return;
    }
    setAssignedAdvocates((prev) => [
      ...prev,
      {
        id: found.id,
        name: found.name,
        role: found.designation,
        assignedDate: new Date().toISOString().split('T')[0],
      },
    ]);
  };

  const handleRemoveAdvocate = (advId) => {
    setAssignedAdvocates((prev) => prev.filter((a) => a.id !== advId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.caseNumber.trim()) {
      setError('Case Number is required (e.g. SCA/1024/2024).');
      return;
    }
    if (!formData.title.trim()) {
      setError('Title / Parties information is required.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        assignedAdvocates,
      };

      if (isEdit) {
        await api.updateCase(id, payload);
        navigate(`/cases/${id}`);
      } else {
        const created = await api.createCase(payload);
        navigate(`/cases/${created.id}`);
      }
    } catch (err) {
      setError(err.message || 'Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <article>
      <header>
        <div>
          <Link to="/cases">&larr; Back to Case Register</Link>
        </div>
        <h2>{isEdit ? 'Edit Case Docket' : 'Register New Legal Case'}</h2>
        <p>Litigation Entry &amp; Assignment Form</p>
      </header>

      {error && (
        <aside role="alert">
          <p>
            <strong>Validation Error:</strong> {error}
          </p>
        </aside>
      )}

      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>Primary Case Details</legend>

          <div>
            <label htmlFor="caseNumber">Case Number / CNR: </label>
            <br />
            <input
              id="caseNumber"
              name="caseNumber"
              type="text"
              placeholder="e.g. SCA/2048/2024"
              value={formData.caseNumber}
              onChange={handleChange}
              required
            />
          </div>

          <br />

          <div>
            <label htmlFor="title">Parties / Case Caption: </label>
            <br />
            <input
              id="title"
              name="title"
              type="text"
              placeholder="e.g. State of Gujarat vs XYZ Infrastructure Ltd"
              value={formData.title}
              onChange={handleChange}
              required
            />
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
            <label htmlFor="caseType">Case Type / Classification: </label>
            <br />
            <select
              id="caseType"
              name="caseType"
              value={formData.caseType}
              onChange={handleChange}
            >
              <option value="Special Civil Application">Special Civil Application (SCA)</option>
              <option value="Letters Patent Appeal">Letters Patent Appeal (LPA)</option>
              <option value="Civil Revision Application">Civil Revision Application (CRA)</option>
              <option value="First Appeal">First Appeal (FA)</option>
              <option value="Criminal Appeal">Criminal Appeal (CRLA)</option>
              <option value="Special Leave Petition">Special Leave Petition (SLP)</option>
            </select>
          </div>

          <br />

          <div>
            <label htmlFor="department">Nodal Government Department: </label>
            <br />
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
            >
              <option value="Revenue Department">Revenue Department</option>
              <option value="Industries and Mines Department">Industries &amp; Mines Department</option>
              <option value="Home Department">Home Department</option>
              <option value="Urban Development & Urban Housing">Urban Development &amp; Housing</option>
              <option value="Roads and Buildings Department">Roads and Buildings Department</option>
            </select>
          </div>

          <br />

          <div>
            <label htmlFor="financialExposure">Financial Exposure (INR): </label>
            <br />
            <input
              id="financialExposure"
              name="financialExposure"
              type="number"
              min="0"
              step="1000"
              value={formData.financialExposure}
              onChange={handleChange}
            />
          </div>

          <br />

          <div>
            <label htmlFor="filingDate">Filing / Institution Date: </label>
            <br />
            <input
              id="filingDate"
              name="filingDate"
              type="date"
              value={formData.filingDate}
              onChange={handleChange}
              required
            />
          </div>

          <br />

          <div>
            <label htmlFor="currentStage">Current Procedural Stage: </label>
            <br />
            <input
              id="currentStage"
              name="currentStage"
              type="text"
              placeholder="e.g. Admission Hearing, Filing Counter, Final Hearing"
              value={formData.currentStage}
              onChange={handleChange}
            />
          </div>

          <br />

          <div>
            <label htmlFor="summary">Brief Summary of Dispute: </label>
            <br />
            <textarea
              id="summary"
              name="summary"
              rows="4"
              cols="50"
              placeholder="State department position and key legal contentions..."
              value={formData.summary}
              onChange={handleChange}
            />
          </div>
        </fieldset>

        <br />

        <fieldset>
          <legend>Advocate Roster Assignment</legend>
          <label htmlFor="advSelect">Select Advocate from Approved Panel: </label>
          <select
            id="advSelect"
            value={selectedAdvocateId}
            onChange={(e) => setSelectedAdvocateId(e.target.value)}
          >
            {advocates.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.designation} - {a.court})
              </option>
            ))}
          </select>
          {' '}
          <button type="button" onClick={handleAddAdvocate}>
            Assign to Case
          </button>

          <h4>Assigned Advocates:</h4>
          {assignedAdvocates.length === 0 ? (
            <p>
              <em>No advocates assigned yet. Please assign at least one standing counsel.</em>
            </p>
          ) : (
            <ul>
              {assignedAdvocates.map((adv) => (
                <li key={adv.id}>
                  <strong>{adv.name}</strong> - {adv.role} (Assigned: {adv.assignedDate}){' '}
                  <button type="button" onClick={() => handleRemoveAdvocate(adv.id)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </fieldset>

        <br />

        <div>
          <button type="submit" disabled={loading}>
            {loading ? 'Saving Case Docket...' : isEdit ? 'Update Case Docket' : 'Register Case'}
          </button>
          {' '}
          <Link to="/cases">
            <button type="button">Cancel</button>
          </Link>
        </div>
      </form>
    </article>
  );
};

export default CaseFormPage;
