import React, { useState, useEffect } from 'react';
import StatusBadge from './StatusBadge';
import { getServiceById, updateServiceStatus } from '../services/api';

const STATUS_OPTIONS = ['operational', 'degraded', 'offline'];

export default function ServiceDetailModal({ serviceId, onClose, onStatusUpdated }) {
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchDetails() {
      try {
        setLoading(true);
        setError(null);
        const data = await getServiceById(serviceId);
        if (isMounted) {
          setService(data);
          setSelectedStatus(data.status);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load service details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (serviceId) {
      fetchDetails();
    }

    return () => {
      isMounted = false;
    };
  }, [serviceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStatus || selectedStatus === service?.status) {
      return;
    }

    try {
      setSubmitting(true);
      setUpdateFeedback(null);
      const response = await updateServiceStatus(service.id, selectedStatus);
      
      setUpdateFeedback({
        type: 'success',
        message: response.message || `Successfully changed status to ${selectedStatus}`,
      });

      // Refresh full details (including new status_history entry)
      const refreshed = await getServiceById(service.id);
      setService(refreshed);
      setSelectedStatus(refreshed.status);

      // Notify parent list to update cards
      if (onStatusUpdated) {
        onStatusUpdated(refreshed);
      }
    } catch (err) {
      setUpdateFeedback({
        type: 'error',
        message: err.message || 'Failed to update status',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="modal-title">
            {service ? service.name : 'Service Details'}
          </h3>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>

        <div className="modal-body">
          {loading && (
            <div className="state-box">
              <div className="spinner" />
              <p>Loading service details...</p>
            </div>
          )}

          {error && (
            <div className="feedback-banner error" role="alert">
              <span>{error}</span>
            </div>
          )}

          {service && !loading && (
            <>
              {updateFeedback && (
                <div
                  className={`feedback-banner ${updateFeedback.type}`}
                  role="status"
                >
                  <span>{updateFeedback.message}</span>
                </div>
              )}

              <div className="detail-section">
                <label>Current Status</label>
                <div>
                  <StatusBadge status={service.status} />
                </div>
              </div>

              <div className="detail-section">
                <label>Description</label>
                <p>{service.description}</p>
              </div>

              <div className="detail-section">
                <label>Last Updated</label>
                <time dateTime={service.updated_at}>
                  {new Date(service.updated_at).toLocaleString()}
                </time>
              </div>

              <div className="detail-section">
                <label>Update Status</label>
                <form className="status-update-form" onSubmit={handleSubmit}>
                  <div className="status-options" role="radiogroup" aria-label="Select new status">
                    {STATUS_OPTIONS.map((st) => (
                      <label
                        key={st}
                        className={`status-radio-label ${selectedStatus === st ? 'active' : ''}`}
                      >
                        <input
                          type="radio"
                          name="status"
                          value={st}
                          checked={selectedStatus === st}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                        />
                        <span style={{ textTransform: 'capitalize' }}>{st}</span>
                      </label>
                    ))}
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={submitting || selectedStatus === service.status}
                    >
                      {submitting ? 'Updating...' : 'Save Status Change'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="detail-section">
                <label>Recent Status History</label>
                {service.history && service.history.length > 0 ? (
                  <div className="history-timeline">
                    {service.history.map((h) => (
                      <div key={h.id} className="history-item">
                        <StatusBadge status={h.status} />
                        <span className="history-date">
                          {new Date(h.changed_at).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                    No recorded status history.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

