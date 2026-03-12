// src/lib/api.js
// ------------------------------------------------------------------
// Single Axios instance used everywhere instead of bare `axios`.
//
// Local dev  → Vite proxy forwards /api/* to localhost:3001
//              (no VITE_API_URL needed)
//
// Production → set VITE_API_URL=https://your-backend.onrender.com
//              in your hosting dashboard / .env.production
// ------------------------------------------------------------------
import axios from 'axios';

const api = axios.create({
  // Falls back to '' so the Vite proxy kicks in locally
  baseURL: 'https://e-commerce-v2-j5dl.onrender.com',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request if one is stored
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error logger (keeps individual catch blocks lean)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error(
      `[API] ${err.config?.method?.toUpperCase()} ${err.config?.url}`,
      err.response?.status,
      err.response?.data?.error ?? err.message
    );
    return Promise.reject(err);
  }
);

export default api;