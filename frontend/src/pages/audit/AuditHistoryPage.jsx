import React, { useState, useEffect } from 'react';
import { api, formatDate } from '../../services/api';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

export const AuditHistoryPage = () => {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const loadAudits = async () => {
    try {
      setLoading(true);
      const data = await api.getAuditHistory({
        action: actionFilter,
        role: roleFilter,
      });
      setAudits(data);
    } catch (err) {
      console.error('Error fetching audit history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudits();
  }, [actionFilter, roleFilter]);

  const columns = [
    { header: 'Audit ID', key: 'id' },
    {
      header: 'Timestamp',
      render: (row) => `${formatDate(row.timestamp)} ${new Date(row.timestamp).toLocaleTimeString()}`,
    },
    { header: 'Action Executed', render: (row) => <strong>{row.action}</strong> },
    { header: 'Actor Name', key: 'actor' },
    { header: 'Role', render: (row) => <code>{row.role}</code> },
    { header: 'Entity Target', key: 'entity' },
    {
      header: 'Status Transition',
      render: (row) => (
        <span>
          <StatusBadge status={row.previousStatus} /> &rarr;{' '}
          <StatusBadge status={row.newStatus} />
        </span>
      ),
    },
    { header: 'Statutory Reason / Notes', key: 'reason' },
  ];

  return (
    <article>
      <header>
        <h2>Statutory Audit Trail &amp; Regulatory Log</h2>
        <p>Immutable ledger of all state actions, fee sanctions, disbursements, and stage transitions</p>
      </header>

      <section>
        <fieldset>
          <legend>Filter Audit Events</legend>

          <label htmlFor="actFilter">Action Type: </label>
          <select
            id="actFilter"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="ALL">All Actions</option>
            <option value="BILL_SUBMISSION">BILL_SUBMISSION</option>
            <option value="VERIFICATION_PASSED">VERIFICATION_PASSED</option>
            <option value="BILL_APPROVE">BILL_APPROVE</option>
            <option value="PAYMENT_PROCESSED">PAYMENT_PROCESSED</option>
          </select>

          {' | '}

          <label htmlFor="rlFilter">Actor Role: </label>
          <select
            id="rlFilter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="ADVOCATE">ADVOCATE</option>
            <option value="VERIFIER">VERIFIER</option>
            <option value="APPROVER">APPROVER</option>
            <option value="FINANCE_OFFICER">FINANCE_OFFICER</option>
            <option value="LEGAL_OFFICER">LEGAL_OFFICER</option>
          </select>
        </fieldset>
      </section>

      <br />

      <section>
        {loading ? (
          <p>Retrieving immutable audit records...</p>
        ) : (
          <DataTable
            columns={columns}
            data={audits}
            emptyMessage="No matching audit trail events recorded."
          />
        )}
      </section>
    </article>
  );
};

export default AuditHistoryPage;
