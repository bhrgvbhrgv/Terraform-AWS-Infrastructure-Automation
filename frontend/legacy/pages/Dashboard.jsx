import React, { useState, useEffect, useCallback } from 'react';
import SummaryCards from '../components/SummaryCards';
import ServiceCard from '../components/ServiceCard';
import ServiceDetailModal from '../components/ServiceDetailModal';
import { getServices } from '../services/api';

export default function Dashboard() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchServicesData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await getServices();
      setServices(data);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend service.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchServicesData();
  }, [fetchServicesData]);

  const handleStatusUpdated = (updatedService) => {
    setServices((prev) =>
      prev.map((s) => (s.id === updatedService.id ? { ...s, ...updatedService } : s))
    );
  };

  return (
    <div className="dashboard-container">
      <header className="header">
        <div className="header-container">
          <div className="logo-group">
            <div className="logo-badge" aria-hidden="true">
              ☁
            </div>
            <div className="title-group">
              <h1>CloudOps Status Dashboard</h1>
              <p>Infrastructure Health & Service Status Monitor</p>
            </div>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => fetchServicesData(true)}
              disabled={loading || isRefreshing}
              aria-label="Refresh Services Data"
            >
              {isRefreshing ? 'Refreshing...' : '↻ Refresh Status'}
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {/* Error notification */}
        {error && (
          <div className="feedback-banner error" role="alert">
            <span><strong>Connection Error:</strong> {error}</span>
            <button
              className="btn btn-outline"
              style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}
              onClick={() => fetchServicesData(true)}
            >
              Retry
            </button>
          </div>
        )}

        {/* Health summary counters */}
        <SummaryCards services={services} />

        {/* Section title */}
        <div className="services-section-header">
          <h2>Monitored Services</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing {services.length} services
          </span>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="state-box" data-testid="loading-state">
            <div className="spinner" />
            <h3>Fetching services status</h3>
            <p>Communicating with CloudOps API endpoints...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && services.length === 0 && (
          <div className="state-box" data-testid="empty-state">
            <h3>No Services Found</h3>
            <p>No services are registered in the status database. Initialize the database seed.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => fetchServicesData(true)}
            >
              Check Again
            </button>
          </div>
        )}

        {/* Service Cards Grid */}
        {!loading && services.length > 0 && (
          <div className="service-grid" data-testid="service-grid">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                isSelected={selectedServiceId === service.id}
                onSelect={(s) => setSelectedServiceId(s.id)}
              />
            ))}
          </div>
        )}

        {/* Modal for detail & update */}
        {selectedServiceId && (
          <ServiceDetailModal
            serviceId={selectedServiceId}
            onClose={() => setSelectedServiceId(null)}
            onStatusUpdated={handleStatusUpdated}
          />
        )}
      </main>

      <footer className="footer">
        <p>DevOps Demonstration Project &bull; AWS VPC & Terraform Infrastructure Architecture Portfolio</p>
      </footer>
    </div>
  );
}

