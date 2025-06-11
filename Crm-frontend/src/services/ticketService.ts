import axios from 'axios';
import { API_CONFIG } from '../config/api';

export interface Ticket {
  id: number;
  customerId: number;
  purchaseId?: number | null;
  subject: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  category: 'Delivery' | 'Product Quality' | 'Payment' | 'General' | 'Refund' | 'Exchange';
  assignedTo?: number | null;
  resolution?: string | null;
  attachmentUrls?: string[] | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  customer?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
  };
  purchase?: {
    id: number;
    quantity: number;
    price: number;
    purchaseDate: string;
    product?: {
      id: number;
      name: string;
      imageUrl?: string;
      description?: string;
    };
  };
  assignedAdmin?: {
    id: number;
    username: string;
    email: string;
  };
}

export interface TicketStats {
  overview: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
  };
  priority: {
    urgent: number;
    high: number;
  };
  categories: Array<{
    category: string;
    count: number;
  }>;
  recent: number;
}

export interface Admin {
  id: number;
  username: string;
  email: string;
}

export interface TicketFilters {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  category?: string;
  assignedTo?: number;
  search?: string;
}

export interface CreateTicketData {
  customerId: number;
  purchaseId?: number | null;
  subject: string;
  message: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  category: 'Delivery' | 'Product Quality' | 'Payment' | 'General' | 'Refund' | 'Exchange';
  attachmentUrls?: string[] | null;
}

export interface UpdateTicketData {
  status?: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  assignedTo?: number | null;
  resolution?: string;
}

class TicketService {
  // Helper method to get auth headers
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
  }

  // Get all tickets with filters and pagination
  async getAllTickets(filters: TicketFilters = {}) {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.category) params.append('category', filters.category);
    if (filters.assignedTo) params.append('assignedTo', filters.assignedTo.toString());
    if (filters.search) params.append('search', filters.search);

    const response = await axios.get(`${API_CONFIG.BASE_URL}/admin/tickets?${params.toString()}`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  // Get ticket by ID
  async getTicketById(id: number) {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/admin/tickets/${id}`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  // Update ticket
  async updateTicket(id: number, data: UpdateTicketData) {
    const response = await axios.patch(`${API_CONFIG.BASE_URL}/admin/tickets/${id}`, data, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  // Get ticket statistics
  async getTicketStats() {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/admin/tickets/stats`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  // Get admins for assignment
  async getAdminsForAssignment() {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/admin/tickets/admins`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  // Create ticket (admin can create on behalf of customer)
  async createTicket(data: CreateTicketData) {
    const response = await axios.post(`${API_CONFIG.BASE_URL}/admin/tickets`, data, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  // Helper methods for status and priority labels
  getStatusColor(status: string): string {
    switch (status) {
      case 'Open': return '#ef4444'; // red
      case 'In Progress': return '#f59e0b'; // yellow
      case 'Resolved': return '#10b981'; // green
      case 'Closed': return '#6b7280'; // gray
      default: return '#6b7280';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'Urgent': return '#dc2626'; // dark red
      case 'High': return '#ea580c'; // orange
      case 'Medium': return '#0891b2'; // cyan
      case 'Low': return '#059669'; // green
      default: return '#6b7280';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Open': return '🔓';
      case 'In Progress': return '⏳';
      case 'Resolved': return '✅';
      case 'Closed': return '🔒';
      default: return '❓';
    }
  }

  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'Urgent': return '🚨';
      case 'High': return '⚠️';
      case 'Medium': return '📋';
      case 'Low': return '📌';
      default: return '❓';
    }
  }
}

export default new TicketService();
