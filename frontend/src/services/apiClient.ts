const API_BASE = '/api/v1';

function getToken(): string | null {
  return localStorage.getItem('cloudops_token');
}

export function setToken(token: string): void {
  localStorage.setItem('cloudops_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('cloudops_token');
}

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    clearToken();
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error?.message || 'API Request Failed');
  }

  return json;
}
