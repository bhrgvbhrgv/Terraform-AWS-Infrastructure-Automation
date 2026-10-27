import React from 'react';
import StatusBadge from './StatusBadge';

export default function ServiceCard({ service, onSelect, isSelected }) {
  const formattedDate = service.updated_at
    ? new Date(service.updated_at).toLocaleString()
    : 'Unknown';

  return (
    <article
      className={`service-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(service)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(service);
        }
      }}
      aria-label={`View details for ${service.name}`}
    >
      <div className="card-header">
        <h3 className="card-title">{service.name}</h3>
        <StatusBadge status={service.status} />
      </div>

      <p className="card-desc">{service.description}</p>

      <div className="card-footer">
        <span>Last updated:</span>
        <time dateTime={service.updated_at}>{formattedDate}</time>
      </div>
    </article>
  );
}

