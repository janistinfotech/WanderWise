const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

function getAuthHeader() {
  const token = localStorage.getItem('wanderwise_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({ success: false, message: 'Invalid response from server' }));

  if (!res.ok) {
    if (res.status === 401 && !endpoint.includes('/auth/login')) {
      localStorage.removeItem('wanderwise_token');
      localStorage.removeItem('wanderwise_user');
    }
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  // Auth
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    getMe: () => request('/auth/me'),
  },

  // Users
  users: {
    updateProfile: (profileData) => request('/users/profile', { method: 'PUT', body: JSON.stringify(profileData) }),
  },

  // Dashboard
  dashboard: {
    getStats: () => request('/dashboard/stats'),
  },

  // Trips
  trips: {
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      if (params.status) query.append('status', params.status);
      if (params.search) query.append('search', params.search);
      const qs = query.toString() ? `?${query.toString()}` : '';
      return request(`/trips${qs}`);
    },
    getById: (id) => request(`/trips/${id}`),
    create: (tripData) => request('/trips', { method: 'POST', body: JSON.stringify(tripData) }),
    update: (id, tripData) => request(`/trips/${id}`, { method: 'PUT', body: JSON.stringify(tripData) }),
    delete: (id) => request(`/trips/${id}`, { method: 'DELETE' }),
  },

  // Itinerary
  itinerary: {
    getByTrip: (tripId) => request(`/itineraries/trip/${tripId}`),
    createActivity: (activityData) => request('/itineraries/activities', { method: 'POST', body: JSON.stringify(activityData) }),
    updateActivity: (id, activityData) => request(`/itineraries/activities/${id}`, { method: 'PUT', body: JSON.stringify(activityData) }),
    deleteActivity: (id) => request(`/itineraries/activities/${id}`, { method: 'DELETE' }),
  },

  // Budget
  budget: {
    getSummary: (tripId) => request(`/budget/trip/${tripId}`),
    addExpense: (expenseData) => request('/budget/expenses', { method: 'POST', body: JSON.stringify(expenseData) }),
    updateExpense: (id, expenseData) => request(`/budget/expenses/${id}`, { method: 'PUT', body: JSON.stringify(expenseData) }),
    deleteExpense: (id) => request(`/budget/expenses/${id}`, { method: 'DELETE' }),
  },

  // Destinations
  destinations: {
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      if (params.region) query.append('region', params.region);
      if (params.search) query.append('search', params.search);
      const qs = query.toString() ? `?${query.toString()}` : '';
      return request(`/destinations${qs}`);
    },
    getFavorites: () => request('/destinations/favorites'),
    toggleFavorite: (id) => request(`/destinations/${id}/favorite`, { method: 'POST' }),
  },
};
