import React, { useState, useEffect } from 'react';
import { api, formatINR } from '../../services/api';
import DataTable from '../../components/DataTable';

export const FeeCategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    courtType: 'High Court',
    categoryName: '',
    rateScale: 25000,
    maxHearingsPerDay: 3,
    clerkagePercent: 10,
    effectiveDate: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [msg, setMsg] = useState('');

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await api.getFeeCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching fee categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'rateScale' || name === 'maxHearingsPerDay' || name === 'clerkagePercent'
          ? Number(value)
          : value,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const created = await api.createFeeCategory(formData);
      setCategories((prev) => [...prev, created]);
      setMsg(`Fee Category "${created.categoryName}" added successfully.`);
      setFormData({
        courtType: 'High Court',
        categoryName: '',
        rateScale: 25000,
        maxHearingsPerDay: 3,
        clerkagePercent: 10,
        effectiveDate: new Date().toISOString().split('T')[0],
        description: '',
      });
    } catch (err) {
      alert('Failed to create fee category');
    }
  };

  const columns = [
    { header: 'Rule ID', key: 'id' },
    { header: 'Court Tier', key: 'courtType' },
    { header: 'Fee Category / Item', render: (row) => <strong>{row.categoryName}</strong> },
    { header: 'Standard Scale (INR)', render: (row) => formatINR(row.rateScale) },
    { header: 'Clerkage %', render: (row) => `${row.clerkagePercent}%` },
    { header: 'Daily Hearing Cap', key: 'maxHearingsPerDay' },
    { header: 'Effective Date', key: 'effectiveDate' },
    { header: 'Description', key: 'description' },
  ];

  return (
    <article>
      <header>
        <h2>Advocate Fee Categories &amp; Scale Rules Master</h2>
        <p>Statutory scale rules as sanctioned under Government Resolutions (Legal Department)</p>
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
            <legend>Register Government Scale Fee Category</legend>

            <div>
              <label htmlFor="ctier">Court Tier: </label>
              <select id="ctier" name="courtType" value={formData.courtType} onChange={handleChange}>
                <option value="Supreme Court of India">Supreme Court of India</option>
                <option value="High Court">High Court of Gujarat</option>
                <option value="District & Sessions Court">District &amp; Sessions Court</option>
                <option value="City Civil Court">City Civil Court</option>
                <option value="Tribunals / Special Courts">Tribunals / Special Courts</option>
              </select>
              {' '}
              <label htmlFor="cname">Category Description: </label>
              <input
                id="cname"
                name="categoryName"
                type="text"
                placeholder="e.g. Drafting of Special Leave Petition"
                value={formData.categoryName}
                onChange={handleChange}
                size="35"
                required
              />
            </div>

            <br />

            <div>
              <label htmlFor="rscale">Approved Scale Fee (INR): </label>
              <input
                id="rscale"
                name="rateScale"
                type="number"
                min="500"
                step="500"
                value={formData.rateScale}
                onChange={handleChange}
                required
              />
              {' '}
              <label htmlFor="cpercent">Clerkage %: </label>
              <input
                id="cpercent"
                name="clerkagePercent"
                type="number"
                min="0"
                max="25"
                value={formData.clerkagePercent}
                onChange={handleChange}
                required
              />
              {' '}
              <label htmlFor="mcap">Daily Hearing Cap: </label>
              <input
                id="mcap"
                name="maxHearingsPerDay"
                type="number"
                min="1"
                max="10"
                value={formData.maxHearingsPerDay}
                onChange={handleChange}
                required
              />
            </div>

            <br />

            <div>
              <label htmlFor="desc">Government Resolution / Rule Reference: </label>
              <br />
              <input
                id="desc"
                name="description"
                type="text"
                placeholder="e.g. As per GR No. LGD-2023-441-A dated 01-04-2023"
                value={formData.description}
                onChange={handleChange}
                size="60"
              />
            </div>

            <br />

            <button type="submit">Save Fee Scale Rule</button>
          </fieldset>
        </form>
      </section>

      <br />

      {/* Table */}
      <section>
        <header>
          <h3>Approved Government Fee Scales</h3>
        </header>
        {loading ? <p>Loading fee scales...</p> : <DataTable columns={columns} data={categories} />}
      </section>
    </article>
  );
};

export default FeeCategoryPage;
