import React, { useState, useEffect } from 'react';
import { api, formatINR } from '../../services/api';
import DataTable from '../../components/DataTable';

export const DepartmentManagementPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    nodalOfficer: '',
    contactEmail: '',
    budgetAllocated: 10000000,
    activeCases: 0,
  });
  const [msg, setMsg] = useState('');

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await api.getDepartments();
      setDepartments(data);
    } catch (err) {
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'budgetAllocated' || name === 'activeCases' ? Number(value) : value,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const created = await api.createDepartment(formData);
      setDepartments((prev) => [...prev, created]);
      setMsg(`Department ${created.name} registered successfully.`);
      setFormData({
        name: '',
        code: '',
        nodalOfficer: '',
        contactEmail: '',
        budgetAllocated: 10000000,
        activeCases: 0,
      });
    } catch (err) {
      alert('Failed to register department');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete department record ${id}?`)) return;
    try {
      await api.deleteDepartment(id);
      setDepartments((prev) => prev.filter((d) => d.id !== id));
      setMsg('Department entry removed.');
    } catch (err) {
      alert('Failed to delete department');
    }
  };

  const columns = [
    { header: 'ID', key: 'id' },
    { header: 'Department Name', render: (row) => <strong>{row.name}</strong> },
    { header: 'Short Code', key: 'code' },
    { header: 'Nodal Legal Officer', key: 'nodalOfficer' },
    { header: 'Contact Email', key: 'contactEmail' },
    { header: 'Sanctioned Budget', render: (row) => formatINR(row.budgetAllocated) },
    { header: 'Active Dockets', key: 'activeCases' },
    {
      header: 'Actions',
      render: (row) => (
        <button type="button" onClick={() => handleDelete(row.id)}>
          Delete
        </button>
      ),
    },
  ];

  return (
    <article>
      <header>
        <h2>Administrative Department Master</h2>
        <p>Maintain government secretariats, nodal officers, and default litigation budget thresholds</p>
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
            <legend>Register Government Department</legend>

            <div>
              <label htmlFor="dname">Department Name: </label>
              <input
                id="dname"
                name="name"
                type="text"
                placeholder="e.g. Health and Family Welfare Department"
                value={formData.name}
                onChange={handleChange}
                size="40"
                required
              />
              {' '}
              <label htmlFor="dcode">Code: </label>
              <input
                id="dcode"
                name="code"
                type="text"
                placeholder="e.g. HFWD"
                value={formData.code}
                onChange={handleChange}
                required
              />
            </div>

            <br />

            <div>
              <label htmlFor="nodal">Nodal Officer Name: </label>
              <input
                id="nodal"
                name="nodalOfficer"
                type="text"
                placeholder="e.g. Shri K. M. Solanki"
                value={formData.nodalOfficer}
                onChange={handleChange}
                required
              />
              {' '}
              <label htmlFor="demail">Official Email: </label>
              <input
                id="demail"
                name="contactEmail"
                type="email"
                placeholder="e.g. nodal.hfwd@gujarat.gov.in"
                value={formData.contactEmail}
                onChange={handleChange}
                required
              />
            </div>

            <br />

            <div>
              <label htmlFor="dbudget">Initial Annual Budget (INR): </label>
              <input
                id="dbudget"
                name="budgetAllocated"
                type="number"
                min="0"
                step="500000"
                value={formData.budgetAllocated}
                onChange={handleChange}
                required
              />
            </div>

            <br />

            <button type="submit">Register Department</button>
          </fieldset>
        </form>
      </section>

      <br />

      {/* Table */}
      <section>
        <header>
          <h3>Secretariats &amp; Line Departments</h3>
        </header>
        {loading ? <p>Loading departments...</p> : <DataTable columns={columns} data={departments} />}
      </section>
    </article>
  );
};

export default DepartmentManagementPage;
