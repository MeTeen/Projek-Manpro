// src/services/promoService.ts
import axios from 'axios';
import authService from './authService'; // Asumsi path benar
import { API_CONFIG } from '../config/api';

const API_URL = `${API_CONFIG.BASE_URL}/promos`; // Use centralized config

// Helper function to get token (bisa di-refactor ke utility jika dipakai banyak service)
const getAuthToken = (): string | null => { /* ... sama seperti di productService ... */  return authService.getToken()};

export interface Promo { // Sesuaikan dengan atribut di backend
  id: number;
  name: string;
  description?: string | null;
  type: 'percentage' | 'fixed_amount';
  value: number;
  startDate?: string | null; // ISO String date
  endDate?: string | null;   // ISO String date
  isActive: boolean;
  eligibleCustomers?: { id: number, firstName: string, lastName: string }[]; // Jika di-include
  createdBy?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PromoInput { // Input untuk create/update
  name: string;
  description?: string | null;
  type: 'percentage' | 'fixed_amount';
  value: number;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean;
  // createdBy?: number;
}

export interface AssignPromoInput {
    customerId: number;
    promoId: number;
}

const promoService = {  async getAllPromos(includeCustomers: boolean = false): Promise<Promo[]> {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication required');
    
    const params = includeCustomers ? '?includeCustomers=true' : '';
    const response = await axios.get(API_URL + params, { 
      headers: { 'Authorization': `Bearer ${token}` } 
    });
    return response.data.data;
  },

  async getPromoById(id: number): Promise<Promo> {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication required');
    const response = await axios.get(`${API_URL}/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
    return response.data.data;
  },

  // Hanya Super Admin
  async createPromo(promoData: PromoInput): Promise<Promo> {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication required');
    const response = await axios.post(API_URL, promoData, { headers: { 'Authorization': `Bearer ${token}` } });
    return response.data.data;
  },

  // Hanya Super Admin
  async updatePromo(id: number, promoData: Partial<PromoInput>): Promise<Promo> {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication required');
    const response = await axios.put(`${API_URL}/${id}`, promoData, { headers: { 'Authorization': `Bearer ${token}` } });
    return response.data.data;
  },

  // Hanya Super Admin
  async deletePromo(id: number): Promise<void> {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication required');
    await axios.delete(`${API_URL}/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
  },

  // Admin & Super Admin
  async assignPromoToCustomer(data: AssignPromoInput): Promise<any> {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication required');
    const response = await axios.post(`${API_URL}/assign`, data, { headers: { 'Authorization': `Bearer ${token}` } });
    return response.data;
  },

  // Admin & Super Admin
  async removePromoFromCustomer(data: AssignPromoInput): Promise<any> { // Asumsi body sama dengan assign
    const token = getAuthToken();
    if (!token) throw new Error('Authentication required');
    // Backend mungkin menggunakan DELETE dengan body atau POST, sesuaikan:
    const response = await axios.post(`${API_URL}/remove`, data, { headers: { 'Authorization': `Bearer ${token}` } });
    return response.data;
  },

  async getAvailablePromosForCustomer(customerId: number): Promise<Promo[]> {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication required');
    const response = await axios.get(`${API_URL}/customer/${customerId}/available`, { headers: { 'Authorization': `Bearer ${token}` } });
    return response.data.data;
  }
};

export default promoService;