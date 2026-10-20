import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

export const AdvocateManagementPage = () => {
  const [advocates, setAdvocates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    barRegistrationNumber: '',
    designation: 'Standing Counsel',
    court: 'High Court of Gujarat',
    email: '',
    phone: '',
    pan: '',
    status: 'ACTIVE',
  });
  const [msg, setMsg] = useState('');

  const loadAdvocates = async () => {
    try {
      setLoading(true);
      const data = await api.getAdvocates();
      setAdvocates(data);
    } catch (err) {
      console.error('Error fetching advocates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdvocates();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const created = await api.createAdvocate(formData);
      setAdvocates((prev) => [...prev, created]);
      setMsg(`Advocate ${created.name} added to state empanelled roster.`);
      setFormData({
        name: '',
        barRegistrationNumber: '',
        designation: 'Standing Counsel',
        court: 'High Court of Gujarat',
        email: '',
        phone: '',
        pan: '',
        status: 'ACTIVE',
      });
    } catch (err) {
      alert('Failed to empanel advocate');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Remove advocate record ${id}?`)) return;
    try {
      await api.deleteAdvocate(id);
      setAdvocates((prev) => prev.filter((a) => a.id !== id));
      setMsg('Advocate removed from roster.');
    } catch (err) {
      alert('Failed to delete advocate');
    }
  };

  const columns = [
    { header: 'ID', key: 'id' },
    { header: 'Advocate Name', render: (row) => <strong>{row.name}</strong> },
    { header: 'Bar Council Reg No', key: 'barRegistrationNumber' },
    { header: 'Designation / Panel', key: 'designation' },
    { header: 'Primary Court', key: 'court' },
    { header: 'PAN Number', key: 'pan' },
    { header: 'Email & Contact', render: (row) => `${row.email} | ${row.phone}` },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Action',
      render: (row) => (
        <button type="button" onClick={() => handleDelete(row.id)}>
          Remove
        </button>
      ),
    },
  ];

  return (
    <article>
      <header>
        <h2>Government Pleader &amp; Advocate Panel Master</h2>
        <p>Empanelment register of Government Pleaders, Standing Counsels, and Public Prosecutors</p>
      </header>

      {msg && (
        <aside>
          <p>
            <strong>Notice:</strong> {msg}
          </p>
        </aside>
      )}

      {/* Form */}
      <section>
        <form onSubmit={handleCreate}>
          <fieldset>
            <legend>Empanel New Advocate to State Panel</legend>

            <div>
              <label htmlFor="aname">Advocate Full Name: </label>
              <input
                id="aname"
                name="name"
                type="text"
                placeholder="e.g. Shri Vikram R. Shah"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {' '}
              <label htmlFor="barNo">Bar Registration Number: </label>
              <input
                id="barNo"
                name="barRegistrationNumber"
                type="text"
                placeholder="e.g. G/987/2015"
                value={formData.barRegistrationNumber}
                onChange={handleChange}
                required
              />
            </div>

            <br />

            <div>
              <label htmlFor="desig">Empaneled Designation: </label>
              <select id="desig" name="designation" value={formData.designation} onChange={handleChange}>
                <option value="Senior Standing Counsel">Senior Standing Counsel</option>
                <option value="Government Pleader">Government Pleader</option>
                <option value="Assistant Government Pleader">Assistant Government Pleader</option>
                <option value="Additional Public Prosecutor">Additional Public Prosecutor</option>
                <option value="Special Counsel">Special Counsel</option>
              </select>
              {' '}
              <label htmlFor="court">Assigned Primary Court: </label>
              <input
                id="court"
                name="court"
                type="text"
                value={formData.court}
                onChange={handleChange}
                required
              />
            </div>

            <br />

            <div>
              <label htmlFor="aemail">Official Email: </label>
              <input
                id="aemail"
                name="email"
                type="email"
                placeholder="e.g. vikram.shah@adv.gujarat.gov.in"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {' '}
              <label htmlFor="aphone">Mobile Phone: </label>
              <input
                id="aphone"
                name="phone"
                type="text"
                placeholder="e.g. 9825098765"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              {' '}
              <label htmlFor="apan">PAN Number: </label>
              <input
                id="apan"
                name="pan"
                type="text"
                placeholder="e.g. ABCDE1234F"
                value={formData.pan}
                onChange={handleChange}
                required
              />
            </div>

            <br />

            <button type="submit">Empanel Advocate</button>
          </fieldset>
        </form>
      </section>

      <br />

      {/* Table */}
      <section>
        <header>
          <h3>Empaneled Legal Roster</h3>
        </header>
        {loading ? <p>Loading advocate panel...</p> : <DataTable columns={columns} data={advocates} />}
      </section>
    </article>
  );
};

export default AdvocateManagementPage;
