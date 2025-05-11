import axios from 'axios';
import authService from './authService';

// API URL
const API_URL = 'http://localhost:3000/api';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: string;
}

// Helper function to get token
const getAuthToken = (): string | null => {
  // First check authService which is the source of truth
  const token = authService.getToken();
  
  if (!token) {
    console.warn('No authentication token found in authService');
    // As a fallback, check localStorage directly
    const localToken = localStorage.getItem('token');
    if (localToken) {
      console.log('Found token in localStorage directly');
      return localToken;
    }
    console.error('No authentication token available');
    return null;
  }
  
  return token;
};

const userService = {
  async getCurrentUserProfile(): Promise<UserProfile> {
    try {
      // Ensure auth is initialized
      authService.initializeAuth();
      
      // Get token
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const response = await axios.get(`${API_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },
  
  async getDashboardData() {
    try {
      // Ensure auth is initialized
      authService.initializeAuth();
      
      // Get token
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const response = await axios.get(`${API_URL}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }
};

export default userService; 