import axios from 'axios';
import type { AuthResponse } from '../types';

// Determine API base URL with fallback to localhost
const apiUrl = import.meta.env.VITE_API_URL;
console.log('Using API URL:', apiUrl); // Debug log to verify URL

const api = axios.create({
  baseURL: `${apiUrl}/api/v1`,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const signup = async (data: { email: string; password: string }): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/user/signup', data);
  return res.data;
};

export const signin = async (data: { email: string; password: string }): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/user/signin', data);
  return res.data;
};

export const fetchVideoInfo = async (url: string) => {
  try {
    const res = await api.post('/video/info', { url });
    return res.data;
  } catch (error) {
    console.error('Error fetching video info:', error);
    throw error;
  }
};

export const downloadVideo = async (params: { url: string; formatId: string; ext: string }) => {
  try {
    const res = await api.get('/video/download', {
      params,
      responseType: 'blob',
      timeout: 60000 // Increase timeout for large files
    });
    return res.data;
  } catch (error) {
    console.error('Error downloading video:', error);
    throw error;
  }
};

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error);
      throw new Error('Network error - please check your connection');
    }
    
    // Log error details
    console.error('API error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    
    // Handle backend errors
    throw error.response?.data?.message || error;
  }
);

export default api; 