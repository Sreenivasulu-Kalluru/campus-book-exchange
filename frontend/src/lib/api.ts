// src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + '/api',
  // baseURL:
  //   (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api',
});

export default api;
