const API_BASE_URL = 'http://localhost:5000/api';

export const getAuthToken = () => localStorage.getItem('hrga_token');

export const fetchApi = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Terjadi kesalahan pada server.');
  }

  return data;
};

export default API_BASE_URL;
