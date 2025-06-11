import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export interface CustomerTicket {
  id: number;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'Delivery' | 'Product Quality' | 'Payment' | 'General' | 'Refund' | 'Exchange';
  createdAt: string;
  updatedAt: string;
  customer: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };  purchase?: {
    id: number;
    purchaseDate: string;
    quantity: number;
    price: string;
    product: {
      id: number;
      name: string;
      dimensions?: string;
    };
  };
  admin?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface CreateTicketRequest {
  subject: string;
  message: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  category: 'Delivery' | 'Product Quality' | 'Payment' | 'General' | 'Refund' | 'Exchange';
  purchaseId?: number;
}

export interface CustomerPurchase {
  id: number;
  quantity: number;
  price: string;
  purchaseDate: string;
  product: {
    id: number;
    name: string;
    dimensions?: string;
  };
}

export interface TicketFilters {
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

class CustomerTicketService {
  private getAuthHeader() {
    const token = localStorage.getItem('customerToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }  async createTicket(ticketData: CreateTicketRequest) {
    try {
      console.log('🎫 Creating ticket with data:', ticketData);
      console.log('🔑 Auth header:', this.getAuthHeader());
      
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

  async getMyTickets(filters: TicketFilters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });      const response = await axios.get(`${API_URL}/customer?${params.toString()}`, {
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

  async getTicketById(id: number) {
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

  async getMyPurchases() {
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
