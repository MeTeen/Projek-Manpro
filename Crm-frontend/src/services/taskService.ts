import axios from 'axios';
import authService from './authService';
import { API_CONFIG } from '../config/api';

// Use centralized API configuration
const API_URL = API_CONFIG.BASE_URL;

export interface Task {
  id: number;
  date: string;
  content: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
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

const taskService = {
  async getTasks(): Promise<Task[]> {
    try {
      // Ensure auth is initialized
      authService.initializeAuth();
      
      // Get token
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const response = await axios.get(`${API_URL}/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  async createTask(taskData: { date: string; content: string }): Promise<Task> {
    try {
      // Ensure auth is initialized
      authService.initializeAuth();
      
      // Get token
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const response = await axios.post(`${API_URL}/tasks`, taskData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  async updateTask(id: number, taskData: { date?: string; content?: string; isCompleted?: boolean }): Promise<Task> {
    try {
      // Ensure auth is initialized
      authService.initializeAuth();
      
      // Get token
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const response = await axios.put(`${API_URL}/tasks/${id}`, taskData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  async deleteTask(id: number): Promise<void> {
    try {
      // Ensure auth is initialized
      authService.initializeAuth();
      
      // Get token
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      await axios.delete(`${API_URL}/tasks/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
};

export default taskService; 