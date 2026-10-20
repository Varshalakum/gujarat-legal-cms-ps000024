import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

export const BudgetDimensionPage = () => {
  const [dimensions, setDimensions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    financialHead: '2014-Administration of Justice',
    status: 'ACTIVE',
  });
  const [msg, setMsg] = useState('');

  const loadDimensions = async () => {
    try {
      setLoading(true);
      const data = await api.getBudgetDimensions();
      setDimensions(data);
    } catch (err) {
      console.error('Error fetching budget dimensions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDimensions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const newDim = {
        ...formData,
        id: `DIM-${Date.now().toString().slice(-4)}`,
      };
      const updated = [...dimensions, newDim];
      await api.saveBudgetDimensions(updated);
      setDimensions(updated);
      setMsg(`Budget Dimension "${newDim.name}" added successfully.`);
      setFormData({
        code: '',
        name: '',
        description: '',
        financialHead: '2014-Administration of Justice',
        status: 'ACTIVE',
      });
    } catch (err) {
      alert('Failed to add budget dimension');
    }
  };

  const columns = [
    { header: 'Dimension ID', key: 'id' },
    { header: 'Accounting Code', render: (row) => <code>{row.code}</code> },
    { header: 'Dimension Title', render: (row) => <strong>{row.name}</strong> },
    { header: 'Major / Minor Financial Head', key: 'financialHead' },
    { header: 'Description / Purpose', key: 'description' },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <article>
      <header>
        <h2>Budget Accounting Dimensions &amp; Heads Master</h2>
        <p>Maintain state financial accounting code classifications for legal disbursements</p>
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
            <legend>Register New Budget Accounting Dimension</legend>

            <div>
              <label htmlFor="dimCode">Accounting Code: </label>
              <input
                id="dimCode"
                name="code"
                type="text"
                placeholder="e.g. 2014-00-114-04"
                value={formData.code}
                onChange={handleChange}
                required
              />
              {' '}
              <label htmlFor="dimName">Dimension Title: </label>
              <input
                id="dimName"
                name="name"
                type="text"
                placeholder="e.g. Supreme Court Special Senior Advocates"
                value={formData.name}
                onChange={handleChange}
                size="40"
                required
              />
            </div>

            <br />

            <div>
              <label htmlFor="fHead">Major Financial Head: </label>
              <input
                id="fHead"
                name="financialHead"
                type="text"
                value={formData.financialHead}
                onChange={handleChange}
                size="40"
                required
              />
            </div>

            <br />

            <div>
              <label htmlFor="dimDesc">Statutory Description / Budget Line: </label>
              <br />
              <textarea
                id="dimDesc"
                name="description"
                rows="2"
                cols="60"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <br />

            <button type="submit">Register Budget Dimension</button>
          </fieldset>
        </form>
      </section>

      <br />

      {/* Table */}
      <section>
        <header>
          <h3>Configured Budget Dimensions</h3>
        </header>
        {loading ? (
          <p>Loading dimensions...</p>
        ) : (
          <DataTable columns={columns} data={dimensions} />
        )}
      </section>
    </article>
  );
};

export default BudgetDimensionPage;
