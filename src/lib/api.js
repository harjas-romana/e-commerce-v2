// src/lib/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://e-commerce-v2-j5dl.onrender.com',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;