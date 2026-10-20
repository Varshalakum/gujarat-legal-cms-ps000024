import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, formatINR } from '../../services/api';
import DataTable from '../../components/DataTable';

export const BudgetSetupPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [financialYear, setFinancialYear] = useState('2024-2025');
  const [department, setDepartment] = useState('Revenue Department');
  const [dimensionHead, setDimensionHead] = useState('Legal Fees & Retainers (2014-Legal-01)');
  const [allocation, setAllocation] = useState(20000000);
  const [warningThresholdPercent, setWarningThresholdPercent] = useState(80);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [bList, dList] = await Promise.all([
        api.getBudgetSetup(),
        api.getDepartments(),
      ]);
      setBudgets(bList);
      setDepartments(dList);
    } catch (err) {
      console.error('Error fetching budget setups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddBudget = async (e) => {
    e.preventDefault();
    setMsg('');

    const newEntry = {
      id: `BUD-${Date.now().toString().slice(-4)}`,
      financialYear,
      department,
      dimensionHead,
      allocation: Number(allocation),
      paidSpend: 0,
      approvedUnpaid: 0,
      exposure: 0,
      warningThresholdPercent: Number(warningThresholdPercent),
      status: 'ACTIVE',
    };

    const updated = [...budgets, newEntry];
    await api.saveBudgetSetup(updated);
    setBudgets(updated);
    setMsg('Budget head allocation registered successfully.');
  };

  const columns = [
    { header: 'ID', key: 'id' },
    { header: 'Financial Year', key: 'financialYear' },
    { header: 'Department', key: 'department' },
    { header: 'Budget Head / Dimension', key: 'dimensionHead' },
    { header: 'Sanctioned Allocation', render: (row) => formatINR(row.allocation) },
    {
      header: 'Warning Ceiling %',
      render: (row) => `${row.warningThresholdPercent || 80}%`,
    },
    { header: 'Status', key: 'status' },
  ];

  return (
    <article>
      <header>
        <div>
          <Link to="/budget">&larr; Back to Budget Dashboard</Link>
        </div>
        <h2>Budget Setup &amp; Appropriation Entry</h2>
        <p>Define department allocations and statutory expenditure ceilings</p>
      </header>

      {msg && (
        <aside>
          <p>
            <strong>Success:</strong> {msg}
          </p>
        </aside>
      )}

      {/* Form */}
      <section>
        <form onSubmit={handleAddBudget}>
          <fieldset>
            <legend>New Budget Appropriation</legend>

            <div>
              <label htmlFor="fy">Financial Year: </label>
              <br />
              <select
                id="fy"
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
              >
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
                <option value="2026-2027">2026-2027</option>
              </select>
            </div>

            <br />

            <div>
              <label htmlFor="dept">Department: </label>
              <br />
              <select
                id="dept"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <br />

            <div>
              <label htmlFor="dimHead">Budget Dimension / Major Head: </label>
              <br />
              <input
                id="dimHead"
                type="text"
                value={dimensionHead}
                onChange={(e) => setDimensionHead(e.target.value)}
                size="50"
                required
              />
            </div>

            <br />

            <div>
              <label htmlFor="alloc">Sanctioned Allocation (INR): </label>
              <br />
              <input
                id="alloc"
                type="number"
                min="10000"
                step="50000"
                value={allocation}
                onChange={(e) => setAllocation(Number(e.target.value))}
                required
              />
            </div>

            <br />

            <div>
              <label htmlFor="thresh">Warning Alert Threshold (%): </label>
              <br />
              <input
                id="thresh"
                type="number"
                min="50"
                max="95"
                value={warningThresholdPercent}
                onChange={(e) => setWarningThresholdPercent(Number(e.target.value))}
                required
              />
            </div>

            <br />

            <button type="submit">Record Budget Head Allocation</button>
          </fieldset>
        </form>
      </section>

      <br />

      {/* Existing Allocations */}
      <section>
        <header>
          <h3>Configured Departmental Budget Allocations</h3>
        </header>

        {loading ? (
          <p>Loading appropriations...</p>
        ) : (
          <DataTable columns={columns} data={budgets} />
        )}
      </section>
    </article>
  );
};

export default BudgetSetupPage;
