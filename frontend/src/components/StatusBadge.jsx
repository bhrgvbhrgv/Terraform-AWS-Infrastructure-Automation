import React from 'react';

export default function StatusBadge({ status }) {
  const normalized = (status || 'offline').toLowerCase();

  return (
    <span className={`status-pill ${normalized}`} aria-label={`Status: ${normalized}`}>
      <span className={`status-dot ${normalized}`} aria-hidden="true" />
      <span>{normalized}</span>
    </span>
  );
}

