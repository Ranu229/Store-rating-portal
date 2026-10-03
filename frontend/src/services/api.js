// API client wrapper for seamless requests and token handling

const BASE_URL = '/api';

export const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (networkErr) {
    const error = new Error('Network connection failed. Unable to reach the server. Please verify the backend is running.');
    error.isNetworkError = true;
    throw error;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      // Clear token if expired or invalid
      setAuthToken(null);
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    const defaultMsg = response.status === 404
      ? 'API endpoint not found on the server.'
      : response.status === 500
      ? 'Internal server error. Please try again later.'
      : 'Request failed. Please check your input.';

    const error = new Error(data.message || defaultMsg);
    error.errors = data.errors || [];
    error.status = response.status;
    throw error;
  }

  return data;
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
