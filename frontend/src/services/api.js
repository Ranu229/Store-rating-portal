// API client with intelligent dual-mode fallback:
// Communicates with real Express backend when available, and seamlessly
// falls back to client mock database on static deployments (like Vercel)

import { mockDb } from './mockDb';

const BASE_URL = '/api';

export const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

const getCurrentUserId = () => {
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const u = JSON.parse(raw);
      return u.id;
    }
  } catch (e) {}
  return null;
};

// Fallback dispatcher when backend server is not hosted or unreachable (e.g. Vercel static)
const handleFallback = (endpoint, method, body) => {
  const [path, queryString] = endpoint.split('?');
  const params = Object.fromEntries(new URLSearchParams(queryString || ''));
  const currentUserId = getCurrentUserId();

  if (path === '/auth/login' && method === 'POST') {
    return mockDb.login(body.email, body.password);
  }
  if (path === '/auth/register' && method === 'POST') {
    return mockDb.register(body);
  }
  if (path === '/auth/me') {
    return mockDb.getMe(currentUserId);
  }
  if (path === '/auth/update-password') {
    return mockDb.updatePassword(currentUserId, body.currentPassword, body.newPassword);
  }
  if (path === '/stores') {
    return mockDb.getStores(currentUserId, params);
  }
  if (path === '/ratings' && method === 'POST') {
    return mockDb.submitRating(currentUserId, body);
  }
  if (path.startsWith('/ratings/') && method === 'PUT') {
    const storeId = path.split('/')[2];
    return mockDb.submitRating(currentUserId, { storeId, rating: body.rating });
  }
  if (path === '/admin/dashboard') {
    return mockDb.getAdminDashboard();
  }
  if (path === '/admin/users') {
    return mockDb.getAdminUsers(params);
  }
  if (path.startsWith('/admin/users/')) {
    const userId = path.split('/')[3];
    return mockDb.getUserDetails(userId);
  }
  if (path === '/admin/stores') {
    if (method === 'POST') return mockDb.createStore(body);
    return mockDb.getStores(null, params);
  }
  if (path === '/owner/dashboard') {
    return mockDb.getOwnerDashboard(currentUserId, params);
  }

  throw new Error(`Endpoint ${endpoint} not supported.`);
};

export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body) : null;

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Check if the backend responded with proper JSON
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();

      if (!response.ok) {
        // Real validation errors from backend (e.g. 400 Bad Request)
        if (response.status === 400) {
          const error = new Error(data.message || 'Validation error');
          error.errors = data.errors || [];
          error.status = 400;
          throw error;
        }

        if (response.status === 401) {
          // If credentials were genuinely invalid
          if (endpoint.includes('/auth/login')) {
            const error = new Error(data.message || 'Invalid email or password.');
            error.status = 401;
            throw error;
          }
          setAuthToken(null);
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            window.location.href = '/login';
          }
        }

        // On 404 or 500, fallback to mockDb
        if (response.status === 404 || response.status >= 500) {
          return handleFallback(endpoint, method, body);
        }

        const error = new Error(data.message || 'Request failed.');
        error.status = response.status;
        throw error;
      }

      return data;
    } else {
      // Backend returned HTML (e.g. 404 page on Vercel static)
      return handleFallback(endpoint, method, body);
    }
  } catch (err) {
    // If it's a known validation error from backend, rethrow it
    if (err.status === 400 || (err.status === 401 && endpoint.includes('/auth/login'))) {
      throw err;
    }

    // On network failure (offline, connection reset, or static host like Vercel)
    console.warn(`[API] Server unavailable for ${endpoint}, using seamless client fallback:`, err.message);
    try {
      return handleFallback(endpoint, method, body);
    } catch (fallbackErr) {
      throw fallbackErr;
    }
  }
};

export const api = {
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint, body) =>
    apiRequest(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) =>
    apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint, body) =>
    apiRequest(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};
