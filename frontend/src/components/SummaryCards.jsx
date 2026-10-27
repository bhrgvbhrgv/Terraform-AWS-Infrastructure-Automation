import React from 'react';

export default function SummaryCards({ services }) {
  const total = services.length;
  const operational = services.filter((s) => s.status === 'operational').length;
  const degraded = services.filter((s) => s.status === 'degraded').length;
  const offline = services.filter((s) => s.status === 'offline').length;

  return (
    <section className="summary-grid" aria-label="Services Health Summary">
      <div className="summary-card total">
        <span className="label">Total Services</span>
        <span className="value" data-testid="count-total">{total}</span>
      </div>
      <div className="summary-card operational">
        <span className="label">Operational</span>
        <span className="value" data-testid="count-operational">{operational}</span>
      </div>
      <div className="summary-card degraded">
        <span className="label">Degraded</span>
        <span className="value" data-testid="count-degraded">{degraded}</span>
      </div>
      <div className="summary-card offline">
        <span className="label">Offline</span>
        <span className="value" data-testid="count-offline">{offline}</span>
      </div>
    </section>
  );
}

