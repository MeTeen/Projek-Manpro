// src/services/dashboardService.ts
import axios from 'axios';
import authService from './authService';
import { API_CONFIG } from '../config/api';

const API_ROOT_URL = API_CONFIG.ROOT_URL;
const API_BASE_URL = `${API_ROOT_URL}/api/dashboard`;

const getAuthToken = (): string | null => {
  return authService.getToken();
};

interface KpiData {
  totalRevenue: number;
  customerCount: number;
  transactionCount: number;
  pendingTasksToday: number;
  activePromosCount: number;
  newCustomersToday: number;
}

interface SalesTrendData {
  name: string; // YYYY-MM-DD
  pendapatan: number;
}

export interface DashboardSummaryData {
  kpis: KpiData;
  salesTrendLast7Days: SalesTrendData[];
}

const dashboardService = {
  async getSummary(): Promise<DashboardSummaryData> {
    authService.initializeAuth(); // Jika menggunakan pola ini di service lain
    const token = getAuthToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    try {
      const response = await axios.get(`${API_BASE_URL}/summary`, { headers });
      return response.data.data; // Asumsi backend mengembalikan data di response.data.data
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      if (axios.isAxiosError(error) && error.response) {
        const backendError = error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
        throw new Error(`API Error: ${error.response.status} - ${backendError}`);
      }
      throw error;
    }
  }
};

export default dashboardService;