// Configuration for API endpoints
export const API_BASE_URL = 'http://localhost:5000/api';

// Additional API configuration options can be added here
export const API_TIMEOUT = 10000; // 10 seconds timeout

// Default headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// Helper function to get authenticated headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    ...DEFAULT_HEADERS,
    Authorization: token ? `Bearer ${token}` : '',
  };
}; 