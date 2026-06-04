import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',
  timeout: 15000,
  headers: {
    // Let axios set the content-type automatically based on the request body
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      // Do not send the token for login or signup requests
      const isAuthPath = config.url?.includes('/api/login/') || config.url?.includes('/api/signup/');
      
      if (token && !isAuthPath) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }
    
    console.error('API Error:', error.response?.data || error.message);
    
    if (!error.response && error.message === 'Network Error') {
      console.error('Connection error. Please ensure the backend server is running.');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
