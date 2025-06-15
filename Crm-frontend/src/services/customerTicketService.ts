import axios from 'axios';
import { 
  Ticket, 
  Purchase, 
  CreateTicketRequest, 
  TicketFilters, 
  ApiResponse
} from '../types/ticket';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class CustomerTicketService {
  private getAuthHeader() {
    const customerToken = localStorage.getItem('customerToken');
    const adminToken = localStorage.getItem('token'); // Regular admin token
    
    console.log('🔍 CustomerTicketService - Token check:');
    console.log('- customerToken:', customerToken ? `${customerToken.substring(0, 20)}...` : 'NOT FOUND');
    console.log('- adminToken:', adminToken ? `${adminToken.substring(0, 20)}...` : 'NOT FOUND');
    
    if (!customerToken) {
      console.warn('⚠️ No customerToken found! User might not be logged in as customer.');
      console.log('📍 Available localStorage keys:', Object.keys(localStorage));
    }
    
    return customerToken ? { Authorization: `Bearer ${customerToken}` } : {};
  }

  async createTicket(ticketData: CreateTicketRequest): Promise<ApiResponse<Ticket>> {
    try {
      console.log('🎫 Creating ticket with data:', ticketData);
      
      const response = await axios.post(`${API_URL}/customer/tickets`, ticketData, {
        headers: {
          ...this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });
      
      console.log('✅ Ticket creation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating ticket:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('❌ Response error:', error.response.status, error.response.data);
          throw new Error(error.response.data?.message || `Server error: ${error.response.status}`);
        } else if (error.request) {
          console.error('❌ Network error:', error.request);
          throw new Error('Network error: Could not connect to server');
        } else {
          console.error('❌ Request setup error:', error.message);
          throw new Error(`Request error: ${error.message}`);
        }
      } else {
        console.error('❌ Unknown error:', error);
        throw new Error('Unknown error occurred while creating ticket');
      }
    }
  }

  async getMyTickets(filters: TicketFilters = {}): Promise<ApiResponse<{ tickets: Ticket[] }>> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await axios.get(`${API_URL}/customer/tickets?${params.toString()}`, {
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

  async getTicketById(id: number): Promise<ApiResponse<Ticket>> {
    try {
      const response = await axios.get(`${API_URL}/customer/tickets/${id}`, {
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

  async getMyPurchases(): Promise<ApiResponse<Purchase[]>> {
    try {
      const response = await axios.get(`${API_URL}/customer/purchases`, {
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
}

export default new CustomerTicketService();
