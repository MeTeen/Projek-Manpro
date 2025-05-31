// src/services/activityService.ts
import axios from 'axios';
import authService from './authService';
import { API_CONFIG } from '../config/api';

const API_ROOT_URL = API_CONFIG.ROOT_URL;
const API_BASE_URL = `${API_ROOT_URL}/api/activities`;

const getAuthToken = (): string | null => {
  return authService.getToken();
};

export interface Activity { // Sesuaikan dengan interface ActivityItem di backend
  id: string;
  type: string;
  description: string;
  timestamp: string; // ISO string date
  user?: {
    id: number;
    username: string;
  } | null;
  relatedEntity?: {
    id: number;
    name: string;
    path?: string;
  } | null;
}

const activityService = {
  async getRecentActivities(limit: number = 7): Promise<Activity[]> {
    authService.initializeAuth();
    const token = getAuthToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    try {
      const response = await axios.get(`${API_BASE_URL}/recent?limit=${limit}`, { headers });
      return response.data.data || []; // Pastikan mengembalikan array kosong jika data tidak ada
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      if (axios.isAxiosError(error) && error.response) {
        const backendError = error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
        throw new Error(`API Error: ${error.response.status} - ${backendError}`);
      }
      throw error;
    }
  }
};

export default activityService;