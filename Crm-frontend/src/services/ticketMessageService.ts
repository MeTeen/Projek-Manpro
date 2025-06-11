import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export interface TicketMessage {
  id: number;
  ticketId: number;
  senderId: number;
  senderType: 'customer' | 'admin';
  message: string;
  attachmentUrls?: string[] | null;
  createdAt: string;
  updatedAt: string;
  customerSender?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  adminSender?: {
    id: number;
    username: string;
    email: string;
  };
}

export interface CreateMessageRequest {
  message: string;
  attachmentUrls?: string[];
}

export interface TicketMessagesResponse {
  success: boolean;
  data: {
    messages: TicketMessage[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  message?: string;
}

export interface MessageResponse {
  success: boolean;
  data: TicketMessage;
  message?: string;
}

class TicketMessageService {
  private getAuthHeaders() {
    const token = localStorage.getItem('customerToken') || localStorage.getItem('adminToken');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getTicketMessages(ticketId: number, page: number = 1, limit: number = 50): Promise<TicketMessagesResponse> {
    try {
      console.log(`🔄 Fetching messages for ticket ${ticketId}...`);
      
      const response = await axios.get(`${API_URL}/tickets/${ticketId}/messages`, {
        headers: this.getAuthHeaders(),
        params: { page, limit }
      });

      console.log('✅ Messages fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching ticket messages:', error);
      console.error('❌ Response error:', error.response?.status, error.response?.data);
      
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to fetch messages');
      }
      throw new Error('Network error occurred while fetching messages');
    }
  }

  async createMessage(ticketId: number, messageData: CreateMessageRequest): Promise<MessageResponse> {
    try {
      console.log(`🔄 Creating message for ticket ${ticketId}:`, messageData);
      console.log('Auth headers:', this.getAuthHeaders());
      
      const response = await axios.post(`${API_URL}/tickets/${ticketId}/messages`, messageData, {
        headers: this.getAuthHeaders(),
      });

      console.log('✅ Message created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating message:', error);
      console.error('❌ Response error:', error.response?.status, error.response?.data);
      
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to create message');
      }
      throw new Error('Network error occurred while creating message');
    }
  }

  async updateMessage(ticketId: number, messageId: number, messageData: { message: string }): Promise<MessageResponse> {
    try {
      console.log(`🔄 Updating message ${messageId} for ticket ${ticketId}:`, messageData);
      
      const response = await axios.put(`${API_URL}/tickets/${ticketId}/messages/${messageId}`, messageData, {
        headers: this.getAuthHeaders(),
      });

      console.log('✅ Message updated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error updating message:', error);
      console.error('❌ Response error:', error.response?.status, error.response?.data);
      
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to update message');
      }
      throw new Error('Network error occurred while updating message');
    }
  }

  async deleteMessage(ticketId: number, messageId: number): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`🔄 Deleting message ${messageId} for ticket ${ticketId}`);
      
      const response = await axios.delete(`${API_URL}/tickets/${ticketId}/messages/${messageId}`, {
        headers: this.getAuthHeaders(),
      });

      console.log('✅ Message deleted successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error deleting message:', error);
      console.error('❌ Response error:', error.response?.status, error.response?.data);
      
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to delete message');
      }
      throw new Error('Network error occurred while deleting message');
    }
  }
}

const ticketMessageService = new TicketMessageService();
export default ticketMessageService;
