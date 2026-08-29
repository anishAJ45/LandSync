import axios from 'axios';

// Resolve API base URL: defaults to relative /api in container fullstack mode or VITE_API_URL if configured
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT bearer token into Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('landsync_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 Unauthorized globally by clearing stale session
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if already on login or landing page
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/' && currentPath !== '/register') {
        localStorage.removeItem('landsync_token');
        localStorage.removeItem('landsync_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
