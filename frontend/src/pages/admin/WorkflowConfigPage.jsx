import React, { useState, useEffect } from 'react';
import { api, formatINR } from '../../services/api';

export const WorkflowConfigPage = () => {
  const [stages, setStages] = useState([]);
  const [partialPaymentAllowed, setPartialPaymentAllowed] = useState(true);
  const [authorityLimits, setAuthorityLimits] = useState({
    VERIFIER: 0,
    APPROVER: 100000,
    DEPARTMENT_HEAD: 500000,
    FINANCE_SECRETARY: 5000000,
  });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        const data = await api.getWorkflowConfig();
        setStages(data);
      } catch (err) {
        console.error('Error fetching workflow config:', err);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.saveWorkflowConfig(stages);
      setMsg('Workflow stages and authority limits saved successfully.');
    } catch (err) {
      alert('Failed to save configuration');
    }
  };

  const handleStageChange = (idx, field, value) => {
    setStages((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  return (
    <article>
      <header>
        <h2>Workflow Stages &amp; Approval Authority Limits Configuration</h2>
        <p>Set statutory approval delegations, sequence orders, and partial payment policies</p>
      </header>

      {msg && (
        <aside>
          <p>
            <strong>Success:</strong> {msg}
          </p>
        </aside>
      )}

      <form onSubmit={handleSave}>
        {/* Global Flags */}
        <section>
          <fieldset>
            <legend>Voucher Disbursement Policy</legend>
            <label>
              <input
                type="checkbox"
                checked={partialPaymentAllowed}
                onChange={(e) => setPartialPaymentAllowed(e.target.checked)}
              />{' '}
              <strong>Enable Partial Sanction / Partial Payments:</strong> Allows approvers to sanction
              a reduced amount from the total claimed.
            </label>
          </fieldset>
        </section>

        <br />

        {/* Financial Delegation Limits */}
        <section>
          <fieldset>
            <legend>Executive Financial Sanction Ceilings (INR)</legend>
            <table border="1" cellPadding="6" cellSpacing="0" width="100%">
              <thead>
                <tr>
                  <th>Sanctioning Authority Role</th>
                  <th>Maximum Single Voucher Sanction Limit (INR)</th>
                  <th>Escalation Trigger Beyond Limit</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>VERIFIER</strong>
                  </td>
                  <td>₹0 (Scrutiny Only - No Financial Sanction Authority)</td>
                  <td>Forward to Approver</td>
                </tr>
                <tr>
                  <td>
                    <strong>APPROVER (Under Secretary / Dy Sec Legal)</strong>
                  </td>
                  <td>
                    <input
                      type="number"
                      value={authorityLimits.APPROVER}
                      onChange={(e) =>
                        setAuthorityLimits((prev) => ({
                          ...prev,
                          APPROVER: Number(e.target.value),
                        }))
                      }
                    />
                  </td>
                  <td>Vouchers above ₹1,00,000 route to Department Head</td>
                </tr>
                <tr>
                  <td>
                    <strong>DEPARTMENT_HEAD (Pr. Secretary Legal)</strong>
                  </td>
                  <td>
                    <input
                      type="number"
                      value={authorityLimits.DEPARTMENT_HEAD}
                      onChange={(e) =>
                        setAuthorityLimits((prev) => ({
                          ...prev,
                          DEPARTMENT_HEAD: Number(e.target.value),
                        }))
                      }
                    />
                  </td>
                  <td>Vouchers above ₹5,00,000 route to Finance Department</td>
                </tr>
              </tbody>
            </table>
          </fieldset>
        </section>

        <br />

        {/* Workflow Sequence Stages */}
        <section>
          <fieldset>
            <legend>Workflow Pipeline Stages</legend>
            {loading ? (
              <p>Loading workflow pipeline...</p>
            ) : (
              <table border="1" cellPadding="6" cellSpacing="0" width="100%">
                <thead>
                  <tr>
                    <th>Stage ID</th>
                    <th>Stage Title</th>
                    <th>Allowed Role</th>
                    <th>Sequence Order</th>
                    <th>Mandatory Documents Required</th>
                    <th>SLA Turnaround (Hours)</th>
                  </tr>
                </thead>
                <tbody>
                  {stages.map((stg, idx) => (
                    <tr key={stg.stageId}>
                      <td>{stg.stageId}</td>
                      <td>
                        <input
                          type="text"
                          value={stg.stageName}
                          onChange={(e) => handleStageChange(idx, 'stageName', e.target.value)}
                        />
                      </td>
                      <td>
                        <code>{stg.roleAllowed}</code>
                      </td>
                      <td>{stg.sequenceOrder}</td>
                      <td>
                        <input
                          type="checkbox"
                          checked={stg.requiresMandatoryDocuments}
                          onChange={(e) =>
                            handleStageChange(idx, 'requiresMandatoryDocuments', e.target.checked)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={stg.slaHours}
                          onChange={(e) =>
                            handleStageChange(idx, 'slaHours', Number(e.target.value))
                          }
                          size="5"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </fieldset>
        </section>

        <br />

        <button type="submit">Save Workflow &amp; Delegation Rules</button>
      </form>
    </article>
  );
};

export default WorkflowConfigPage;
