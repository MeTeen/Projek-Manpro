import axios from 'axios';
import { TicketMessage, ApiResponse } from '../types/ticket';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class TicketMessageService {
  private getAuthHeader() {
    const customerToken = localStorage.getItem('customerToken');
    const adminToken = localStorage.getItem('token'); // Regular admin token key
    
    console.log('🔍 TicketMessageService - Token check:');
    console.log('- customerToken:', customerToken ? `${customerToken.substring(0, 20)}...` : 'NOT FOUND');
    console.log('- adminToken:', adminToken ? `${adminToken.substring(0, 20)}...` : 'NOT FOUND');
    
    // Prioritize customer token for customer portal
    const token = customerToken || adminToken;
    
    if (!token) {
      console.warn('⚠️ No authentication token found!');
      console.log('📍 Available localStorage keys:', Object.keys(localStorage));
    } else {
      console.log('✅ Using token:', customerToken ? 'CUSTOMER' : 'ADMIN');
    }
    
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getTicketMessages(ticketId: number): Promise<ApiResponse<{ messages: TicketMessage[] }>> {
    try {
      const response = await axios.get(`${API_URL}/tickets/${ticketId}/messages`, {
        headers: this.getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      throw error;
    }
  }

  async createMessage(ticketId: number, messageData: { message: string; attachmentUrls?: string[] }): Promise<ApiResponse<TicketMessage>> {
    try {
      const response = await axios.post(`${API_URL}/tickets/${ticketId}/messages`, messageData, {
        headers: {
          ...this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      throw error;
    }
  }
}

export default new TicketMessageService();
