import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export interface CustomerTicket {
  id: number;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'complaint' | 'inquiry' | 'delivery_issue' | 'payment_issue' | 'warranty_claim' | 'return_refund' | 'other';
  createdAt: string;
  updatedAt: string;
  customer: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  purchase?: {
    id: number;
    purchaseDate: string;
    quantity: number;
    price: string;
    product: {
      id: number;
      name: string;
      category: string;
      description: string;
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
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'complaint' | 'inquiry' | 'delivery_issue' | 'payment_issue' | 'warranty_claim' | 'return_refund' | 'other';
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
    category: string;
    description: string;
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
  }

  async createTicket(ticketData: CreateTicketRequest) {
    try {
      const response = await axios.post(`${API_URL}/customer/tickets`, ticketData, {
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

  async getMyTickets(filters: TicketFilters = {}) {
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
      const response = await axios.get(`${API_URL}/customer/tickets/purchases`, {
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
