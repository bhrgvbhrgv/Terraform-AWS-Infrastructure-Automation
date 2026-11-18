const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Fetch health status of backend API
 */
export async function getHealth() {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) {
    throw new Error(`Failed to fetch health: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch all services
 */
export async function getServices() {
  const response = await fetch(`${API_BASE}/services`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch services: ${response.status}`);
  }
  const result = await response.json();
  return result.data || [];
}

/**
 * Fetch a single service by ID with history
 */
export async function getServiceById(id) {
  const response = await fetch(`${API_BASE}/services/${id}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch service #${id}: ${response.status}`);
  }
  const result = await response.json();
  return result.data;
}

/**
 * Update service status
 */
export async function updateServiceStatus(id, status) {
  const response = await fetch(`${API_BASE}/services/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to update status: ${response.status}`);
  }

  const result = await response.json();
  return result;
}

