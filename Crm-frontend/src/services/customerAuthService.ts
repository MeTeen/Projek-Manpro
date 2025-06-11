import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export interface CustomerLoginRequest {
  email: string;
  password: string;
}

export interface CustomerLoginResponse {
  success: boolean;
  message: string;
  token?: string;
  customer?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  requirePasswordChange?: boolean;
  customerId?: number;
}

export interface ChangePasswordRequest {
  customerId: number;
  currentPassword: string;
  newPassword: string;
}

export interface CustomerProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  avatarUrl?: string;
  totalSpent: string;
  purchaseCount: number;
  createdAt: string;
  updatedAt: string;
}

class CustomerAuthService {
  private getAuthHeader() {
    const token = localStorage.getItem('customerToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async login(credentials: CustomerLoginRequest): Promise<CustomerLoginResponse> {
    try {
      const response = await axios.post(`${API_URL}/customer/auth/login`, credentials);
      
      if (response.data.success && response.data.token) {
        localStorage.setItem('customerToken', response.data.token);
        localStorage.setItem('customerData', JSON.stringify(response.data.customer));
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      throw error;
    }
  }

  async changePassword(data: ChangePasswordRequest): Promise<CustomerLoginResponse> {
    try {
      const response = await axios.post(`${API_URL}/customer/auth/change-password`, data);
      
      if (response.data.success && response.data.token) {
        localStorage.setItem('customerToken', response.data.token);
        localStorage.setItem('customerData', JSON.stringify(response.data.customer));
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      throw error;
    }
  }

  async getProfile(): Promise<{ success: boolean; data?: CustomerProfile; message?: string }> {
    try {
      const response = await axios.get(`${API_URL}/customer/auth/profile`, {
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

  logout(): void {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerData');
  }

  getCurrentCustomer(): any {
    const customerData = localStorage.getItem('customerData');
    return customerData ? JSON.parse(customerData) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('customerToken');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}

export default new CustomerAuthService();
