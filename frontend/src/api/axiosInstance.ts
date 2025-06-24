// frontend/src/api/axiosInstance.ts
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api', // Your backend API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token; // Attach token as 'x-auth-token'
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors (e.g., 401 Unauthorized)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the error response status is 401 (Unauthorized), redirect to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Using window.location.href to force a full page reload and clear state
      // In a real app, you might use navigate('/') or a global state manager for smoother auth flow
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
