import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export const SlaConfigPage = () => {
  const [slaConfigs, setSlaConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const fetchSla = async () => {
      try {
        setLoading(true);
        const data = await api.getSlaConfig();
        setSlaConfigs(data);
      } catch (err) {
        console.error('Error fetching SLA config:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSla();
  }, []);

  const handleSlaChange = (idx, field, value) => {
    setSlaConfigs((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.saveSlaConfig(slaConfigs);
      setMsg('Service Level Agreement (SLA) & escalation thresholds updated successfully.');
    } catch (err) {
      alert('Failed to save SLA rules');
    }
  };

  return (
    <article>
      <header>
        <h2>Service Level Agreement (SLA) &amp; Escalation Matrix</h2>
        <p>Define statutory turnaround lead times, breach triggers, and escalation hierarchies</p>
      </header>

      {msg && (
        <aside>
          <p>
            <strong>Success:</strong> {msg}
          </p>
        </aside>
      )}

      <form onSubmit={handleSave}>
        <fieldset>
          <legend>Stage SLA Targets &amp; Automatic Escalations</legend>

          {loading ? (
            <p>Loading SLA targets...</p>
          ) : (
            <table border="1" cellPadding="6" cellSpacing="0" width="100%">
              <thead>
                <tr>
                  <th>Litigation / Process Entity</th>
                  <th>Primary Responsible Role</th>
                  <th>Warning Threshold (Hours)</th>
                  <th>Statutory Breach (Hours)</th>
                  <th>Automated Escalation Target Role</th>
                </tr>
              </thead>
              <tbody>
                {slaConfigs.map((cfg, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{cfg.entity}</strong>
                    </td>
                    <td>
                      <code>{cfg.targetRole}</code>
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={cfg.warningHours}
                        onChange={(e) =>
                          handleSlaChange(idx, 'warningHours', Number(e.target.value))
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={cfg.breachHours}
                        onChange={(e) =>
                          handleSlaChange(idx, 'breachHours', Number(e.target.value))
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={cfg.escalationRole}
                        onChange={(e) =>
                          handleSlaChange(idx, 'escalationRole', e.target.value)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </fieldset>

        <br />

        <button type="submit">Save SLA &amp; Escalation Policy</button>
      </form>
    </article>
  );
};

export default SlaConfigPage;
