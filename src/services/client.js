import axios from 'axios';

let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Strip trailing /api or /api/ since service paths hardcode /api
if (API_URL.endsWith('/api')) {
  API_URL = API_URL.slice(0, -4);
} else if (API_URL.endsWith('/api/')) {
  API_URL = API_URL.slice(0, -5);
}

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization JWT token automatically
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle unauthenticated 401 errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;

