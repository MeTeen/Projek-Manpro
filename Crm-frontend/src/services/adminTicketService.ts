import axios from 'axios';
import { 
  Ticket, 
  TicketStats, 
  TicketFilters, 
  UpdateTicketRequest,
  Admin,
  ApiResponse,
  PaginationInfo
} from '../types/ticket';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class AdminTicketService {
  private getAuthHeader() {
    const token = localStorage.getItem('adminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  async getAllTickets(filters: TicketFilters = {}): Promise<ApiResponse<Ticket[]> & { pagination: PaginationInfo }> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Handle special case for assignedTo filter
          if (key === 'assignedTo' && value === null) {
            params.append(key, 'unassigned');
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await axios.get(`${API_URL}/admin/tickets?${params.toString()}`, {
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
      const response = await axios.get(`${API_URL}/admin/tickets/${id}`, {
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

  async updateTicket(id: number, updateData: UpdateTicketRequest): Promise<ApiResponse<Ticket>> {
    try {
      const response = await axios.patch(`${API_URL}/admin/tickets/${id}`, updateData, {
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

  async getTicketStats(): Promise<ApiResponse<TicketStats>> {
    try {
      const response = await axios.get(`${API_URL}/admin/tickets/stats`, {
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

  async getAdminsForAssignment(): Promise<ApiResponse<Admin[]>> {
    try {
      const response = await axios.get(`${API_URL}/admin/tickets/admins`, {
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

  async claimTicket(id: number, allowReclaim = false): Promise<ApiResponse<Ticket>> {
    try {
      const response = await axios.post(`${API_URL}/admin/tickets/${id}/claim`, 
        { allowReclaim }, 
        {
          headers: {
            ...this.getAuthHeader(),
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      throw error;
    }
  }

  async releaseTicket(id: number): Promise<ApiResponse<Ticket>> {
    try {
      const response = await axios.post(`${API_URL}/admin/tickets/${id}/release`, {}, {
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

  // Utility functions for UI
  getStatusColor(status: string): string {
    switch (status) {
      case 'open': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'resolved': return '#10b981';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'urgent': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#ca8a04';
      case 'low': return '#65a30d';
      default: return '#6b7280';
    }
  }
}

export default new AdminTicketService();
