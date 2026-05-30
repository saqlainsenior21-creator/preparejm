const BASE = '/api';

async function req(path: string, opts: RequestInit = {}, token?: string | null) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const r = await fetch(`${BASE}${path}`, { ...opts, headers: { ...headers, ...(opts.headers as object || {}) } });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
  return data;
}

export const api = {
  // Auth
  register: (body: object) => req('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: object) => req('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: (token: string) => req('/auth/me', {}, token),
  updateMe: (body: object, token: string) => req('/auth/me', { method: 'PATCH', body: JSON.stringify(body) }, token),

  // Alerts
  getAlerts: (parish?: string) => req(`/alerts${parish ? `?parish=${parish}` : ''}`),
  getAllAlerts: (token: string) => req('/alerts/all', {}, token),
  createAlert: (body: object, token: string) => req('/alerts', { method: 'POST', body: JSON.stringify(body) }, token),
  updateAlert: (id: string, body: object, token: string) => req(`/alerts/${id}`, { method: 'PATCH', body: JSON.stringify(body) }, token),
  deleteAlert: (id: string, token: string) => req(`/alerts/${id}`, { method: 'DELETE' }, token),

  // Shelters
  getShelters: (parish?: string) => req(`/shelters${parish ? `?parish=${parish}` : ''}`),
  updateOccupancy: (id: string, occupancy: number, token: string) =>
    req(`/shelters/${id}/occupancy`, { method: 'PATCH', body: JSON.stringify({ occupancy }) }, token),
  addShelter: (body: object, token: string) => req('/shelters', { method: 'POST', body: JSON.stringify(body) }, token),
  getEvacRoutes: (parish?: string) => req(`/shelters/evacuation${parish ? `?parish=${parish}` : ''}`),

  // Check-ins
  checkin: (body: object, token: string) => req('/checkins', { method: 'POST', body: JSON.stringify(body) }, token),
  myCheckins: (token: string) => req('/checkins/me', {}, token),
  allCheckins: (token: string) => req('/checkins', {}, token),
  getContacts: (token: string) => req('/checkins/contacts', {}, token),
  addContact: (body: object, token: string) => req('/checkins/contacts', { method: 'POST', body: JSON.stringify(body) }, token),
  deleteContact: (id: string, token: string) => req(`/checkins/contacts/${id}`, { method: 'DELETE' }, token),

  // Health
  health: () => req('/health'),
};
