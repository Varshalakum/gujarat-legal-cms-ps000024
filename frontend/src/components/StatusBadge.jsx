import React from 'react';

export const StatusBadge = ({ status }) => {
  if (!status) return <span>-</span>;

  const normalized = String(status).toUpperCase();

  // Pure HTML semantic representation
  return (
    <code>
      <strong>[{normalized}]</strong>
    </code>
  );
};

export default StatusBadge;
