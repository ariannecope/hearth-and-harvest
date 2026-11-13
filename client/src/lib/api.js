// In development Vite proxies /api to the Express server. On Netlify, /api is rewritten
// to a Netlify Function on the same domain. Set VITE_API_URL only if the API lives
// elsewhere (e.g. the Render fallback: https://hearth-harvest-api.onrender.com).
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const FARM_KEY = 'hh.farmId';

export function getFarmId() {
  try {
    return localStorage.getItem(FARM_KEY);
  } catch {
    return null;
  }
}

export function setFarmId(id) {
  try {
    if (id) localStorage.setItem(FARM_KEY, id);
    else localStorage.removeItem(FARM_KEY);
  } catch {
    /* storage unavailable (private mode); farm lasts for this session only */
  }
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// A farm code is the farm's UUID. Anyone holding it can open the farm.
export const FARM_CODE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function farmLink(id) {
  return `${window.location.origin}/open?code=${id}`;
}

async function request(path, { method = 'GET', body, farmId = getFarmId() } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (farmId) headers['X-Farm-Id'] = farmId;

  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError('Could not reach the Hearth & Harvest server. Please check your connection and try again.', 0);
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || `Request failed (${res.status})`, res.status);
  return data;
}

const qs = (params) => {
  const s = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null)).toString();
  return s ? `?${s}` : '';
};

export const api = {
  plants: (params = {}) => request(`/plants${qs(params)}`),
  plant: (id) => request(`/plants/${id}`),
  breeds: (params = {}) => request(`/breeds${qs(params)}`),
  breed: (id) => request(`/breeds/${id}`),
  farm: (farmId) => request('/farm', farmId ? { farmId } : undefined),
  createFarm: (data) => request('/farm', { method: 'POST', body: data }),
  updateFarm: (data) => request('/farm', { method: 'PUT', body: data }),
  plans: (farmId) => request('/farm-plans', farmId ? { farmId } : undefined),
  addPlan: (data) => request('/farm-plans', { method: 'POST', body: data }),
  updatePlan: (type, id, data) => request(`/farm-plans/${type}/${id}`, { method: 'PATCH', body: data }),
  removePlan: (type, id) => request(`/farm-plans/${type}/${id}`, { method: 'DELETE' }),
};
