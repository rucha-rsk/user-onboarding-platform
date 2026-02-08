import axios from 'axios';

const API_BASE = import.meta.env.REACT_APP_API_URL || 'http://localhost:3001';
const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (email, password, firstName, lastName) =>
    api.post('/auth/register', { email, password, firstName, lastName }),

  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  validateToken: () =>
    api.post('/auth/validate-token'),
};

export const adminAPI = {
  getPendingUsers: () =>
    api.get('/admin/pending-users'),

  approveUser: (userId) =>
    api.put(`/admin/approve/${userId}`),

  rejectUser: (userId) =>
    api.put(`/admin/reject/${userId}`),

  getStats: () =>
    api.get('/admin/stats'),
};

export const userAPI = {
  getProfile: () =>
    api.get('/user/profile'),

  getStatus: () =>
    api.get('/user/status'),
};

export default api;
