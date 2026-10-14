import axios from 'axios';

// Alamat backend diambil dari variabel lingkungan VITE_API_URL saat build.
// Tanpa variabel itu (pengembangan lokal), dipakai alamat backend lokal.
const API_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
});