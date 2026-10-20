import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

export const CourtManagementPage = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    city: 'Ahmedabad',
    benchType: 'Principal Bench',
    jurisdiction: 'State-wide',
    status: 'ACTIVE',
  });
  const [msg, setMsg] = useState('');

  const loadCourts = async () => {
    try {
      setLoading(true);
      const data = await api.getCourts();
      setCourts(data);
    } catch (err) {
      console.error('Error fetching courts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const created = await api.createCourt(formData);
      setCourts((prev) => [...prev, created]);
      setMsg(`Court ${created.name} registered successfully.`);
      setFormData({
        name: '',
        code: '',
        city: 'Ahmedabad',
        benchType: 'Principal Bench',
        jurisdiction: 'State-wide',
        status: 'ACTIVE',
      });
    } catch (err) {
      alert('Failed to register court');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete court record ${id}?`)) return;
    try {
      await api.deleteCourt(id);
      setCourts((prev) => prev.filter((c) => c.id !== id));
      setMsg('Court entry removed.');
    } catch (err) {
      alert('Failed to delete court');
    }
  };

  const columns = [
    { header: 'Court ID', key: 'id' },
    { header: 'Court Name', render: (row) => <strong>{row.name}</strong> },
    { header: 'Code', key: 'code' },
    { header: 'City / Location', key: 'city' },
    { header: 'Bench Type', key: 'benchType' },
    { header: 'Territorial Jurisdiction', key: 'jurisdiction' },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Actions',
      render: (row) => (
        <button type="button" onClick={() => handleDelete(row.id)}>
          Delete Court
        </button>
      ),
    },
  ];

  return (
    <article>
      <header>
        <h2>Court &amp; Judicial Forum Master</h2>
        <p>Maintain registered judicial establishments across Gujarat and Supreme Court</p>
      </header>

      {msg && (
        <aside>
          <p>
            <strong>Notice:</strong> {msg}
          </p>
        </aside>
      )}

      {/* Form to add court */}
      <section>
        <form onSubmit={handleCreate}>
          <fieldset>
            <legend>Register New Court / Forum</legend>

            <div>
              <label htmlFor="cname">Court Official Name: </label>
              <input
                id="cname"
                name="name"
                type="text"
                placeholder="e.g. Labour Court, Rajkot"
                value={formData.name}
                onChange={handleChange}
                size="40"
                required
              />
              {' '}
              <label htmlFor="ccode">Court Code: </label>
              <input
                id="ccode"
                name="code"
                type="text"
                placeholder="e.g. RAJ-LC"
                value={formData.code}
                onChange={handleChange}
                required
              />
            </div>

            <br />

            <div>
              <label htmlFor="ccity">City / Location: </label>
              <input
                id="ccity"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
                required
              />
              {' '}
              <label htmlFor="cbench">Bench Type: </label>
              <input
                id="cbench"
                name="benchType"
                type="text"
                value={formData.benchType}
                onChange={handleChange}
                required
              />
            </div>

            <br />

            <div>
              <label htmlFor="cjuris">Jurisdiction: </label>
              <input
                id="cjuris"
                name="jurisdiction"
                type="text"
                value={formData.jurisdiction}
                onChange={handleChange}
                required
              />
            </div>

            <br />

            <button type="submit">Save Court Entry</button>
          </fieldset>
        </form>
      </section>

      <br />

      {/* Table */}
      <section>
        <header>
          <h3>Configured Courts Directory</h3>
        </header>
        {loading ? <p>Loading courts master...</p> : <DataTable columns={columns} data={courts} />}
      </section>
    </article>
  );
};

export default CourtManagementPage;
