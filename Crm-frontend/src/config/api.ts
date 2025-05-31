// src/config/api.ts
// Centralized API configuration for the CRM application

// Get the base URL from environment variables with fallback
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Remove the '/api' suffix if it's already included in the environment variable
export const API_ROOT_URL = API_BASE_URL.replace('/api', '');

// API configuration options
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ROOT_URL: API_ROOT_URL,
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  RETRY_ATTEMPTS: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || '3'),
};

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// Helper function to get authenticated headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem(import.meta.env.VITE_AUTH_TOKEN_KEY || 'token');
  return {
    ...DEFAULT_HEADERS,
    Authorization: token ? `Bearer ${token}` : '',
  };
};

// Environment info for debugging
export const logApiConfig = () => {
  if (import.meta.env.VITE_ENABLE_LOGGING === 'true') {
    console.log('🔧 API Configuration:', {
      BASE_URL: API_BASE_URL,
      ROOT_URL: API_ROOT_URL,
      TIMEOUT: API_CONFIG.TIMEOUT,
      RETRY_ATTEMPTS: API_CONFIG.RETRY_ATTEMPTS,
      ENVIRONMENT: import.meta.env.MODE,
    });
  }
};

export default API_CONFIG;
