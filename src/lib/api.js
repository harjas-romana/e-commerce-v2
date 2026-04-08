// src/lib/api.js
import axios from 'axios';

// Dynamically use the Render backend URL in production, or localhost in development
// Hardcoded the URL in case of no .env file.
const baseURL = import.meta.env.VITE_API_URL || 'https://e-commerce-v2-j5dl.onrender.com' || 'http://localhost:3001/api';

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;// Ready for Render deployment
