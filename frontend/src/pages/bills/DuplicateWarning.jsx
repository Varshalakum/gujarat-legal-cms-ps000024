import React from 'react';
import { Link } from 'react-router-dom';
import { formatINR, formatDate } from '../../services/api';

export const DuplicateWarning = ({ duplicates = [] }) => {
  if (!duplicates || duplicates.length === 0) return null;

  return (
    <aside role="alert">
      <header>
        <h4>WARNING: Potential Duplicate Fee Claim Detected!</h4>
      </header>
      <p>
        The system detected existing fee voucher(s) submitted for the same advocate and hearing date.
        Please verify to prevent double billing against state funds.
      </p>

      <table border="1" cellPadding="4" cellSpacing="0" width="100%">
        <thead>
          <tr>
            <th>Matching Bill ID</th>
            <th>Bill Reference</th>
            <th>Advocate</th>
            <th>Claimed Amount</th>
            <th>Bill Date</th>
            <th>Current Stage</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {duplicates.map((dup) => (
            <tr key={dup.id}>
              <td>{dup.id}</td>
              <td>{dup.billReference}</td>
              <td>{dup.advocateName}</td>
              <td>{formatINR(dup.totalClaimed)}</td>
              <td>{formatDate(dup.billDate)}</td>
              <td>{dup.currentStage}</td>
              <td>{dup.status}</td>
              <td>
                <Link to={`/bills/${dup.id}`} target="_blank" rel="noreferrer">
                  Inspect Bill
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr />
    </aside>
  );
};

export default DuplicateWarning;
