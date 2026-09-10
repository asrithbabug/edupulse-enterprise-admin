const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('edupulse_token');
}

function getHeaders() {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const config = {
    headers: getHeaders(),
    ...options,
  };

  try {
    const res = await fetch(url, config);
    if (res.status === 401) {
      if (endpoint.includes('/api/auth/')) {
        const error = await res.json().catch(() => ({ error: 'Invalid credentials' }));
        const err = new Error(error.error || 'Invalid credentials');
        err.code = error.code || null;
        throw err;
      }
      if (typeof window !== 'undefined') {
        localStorage.removeItem('edupulse_token');
        localStorage.removeItem('edupulse_user');
        window.location.href = '/enterprise';
      }
      throw new Error('Unauthorized');
    }
    if (res.status === 403) {
      const error = await res.json().catch(() => ({ error: 'Access denied' }));
      const errMsg = error.error || 'Access denied';
      const err = new Error(errMsg);
      err.code = error.code || null;
      throw err;
    }
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Request failed' }));
      const errMsg = error.error || error.message || 'Request failed';
      const err = new Error(errMsg);
      err.code = error.code || null;
      throw err;
    }
    return await res.json();
  } catch (err) {
    if (err.message === 'Unauthorized') throw err;
    if (endpoint.includes('/api/auth/') || options.method === 'POST' || options.method === 'PUT' || options.method === 'DELETE') {
      throw err;
    }
    console.warn(`API request failed: ${endpoint}`, err.message);
    return null;
  }
}

async function loginWithRole(data) {
  const role = data?.role;
  const preferredEndpoints = role === 'enterprise_admin'
    ? ['/api/auth/enterprise/login', '/api/auth/login']
    : ['/api/auth/login'];

  let lastError = new Error('Login failed');

  for (const endpoint of preferredEndpoints) {
    try {
      return await request(endpoint, { method: 'POST', body: JSON.stringify(data) });
    } catch (err) {
      lastError = err;
      if (endpoint === '/api/auth/login') break;
    }
  }

  throw lastError;
}

export const api = {
// Generic HTTP methods
  get: (endpoint) => request(endpoint),
  post: (endpoint, data) => request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data) => request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),

  // Auth
  login: (data) => loginWithRole(data),
  enterpriseLogin: (data) => loginWithRole({ ...data, role: 'enterprise_admin' }),

  // Password Management
  verifyPasswordToken: (token) => request(`/api/password/verify-token/${token}`),
  setPassword: (data) => request('/api/password/set', { method: 'POST', body: JSON.stringify(data) }),
  requestPasswordReset: (data) => request('/api/password/reset-request', { method: 'POST', body: JSON.stringify(data) }),
  resendSetupLink: (userId) => request('/api/password/resend-setup', { method: 'POST', body: JSON.stringify({ userId }) }),

  // Enterprise - Dashboard
  getEnterpriseDashboard: () => request('/api/enterprise/dashboard'),

  // Enterprise - Schools
  getSchools: () => request('/api/enterprise/schools'),
  updateSchoolStatus: (id, status) => request(`/api/enterprise/schools/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Enterprise - Subscriptions
  getSubscriptions: () => request('/api/enterprise/subscriptions'),
  getPlans: () => request('/api/enterprise/plans'),
  assignPlan: (schoolId, planId) => request('/api/enterprise/subscriptions/assign', { method: 'POST', body: JSON.stringify({ schoolId, planId }) }),

  // Enterprise - Analytics
  getAnalytics: () => request('/api/enterprise/analytics'),

  // Enterprise - Tickets
  getTickets: () => request('/api/enterprise/tickets'),
  updateTicketStatus: (id, status) => request(`/api/enterprise/tickets/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

export default api;
