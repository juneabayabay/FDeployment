import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

httpClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      const refresh = getRefreshToken();
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/users/token/refresh/`, { refresh });
          setTokens(data.access, data.refresh ?? refresh);
          original.headers.Authorization = `Bearer ${data.access}`;
          return httpClient(original);
        } catch {
          clearTokens();
        }
      }
    }
    return Promise.reject(error);
  }
);

export default httpClient;
