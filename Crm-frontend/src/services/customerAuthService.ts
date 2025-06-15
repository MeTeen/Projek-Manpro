import axios from 'axios';
import { toast } from 'react-toastify';

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
    console.log('Customer logging out...');
    
    // Show logout success toast
    toast.success('You have been logged out successfully', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerData');
    console.log('Customer auth data cleared');
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
      const isValid = payload.exp * 1000 > Date.now();
      
      if (!isValid) {
        console.log('Customer token has expired');
        this.logout();
      }
      
      return isValid;
    } catch {
      console.log('Customer token is invalid');
      this.logout();
      return false;
    }
  }
}

// Setup customer-specific axios interceptor for handling token expiration
let isCustomerRedirecting = false; // Prevent multiple redirects

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle customer authentication errors
    if (error.response) {
      const { status, data } = error.response;
      
      // Check for authentication/authorization errors on customer endpoints
      if ((status === 401 || status === 403) && error.config?.url?.includes('/customer/')) {
        const currentToken = customerAuthService.getToken();
        
        // Only handle if we actually have a customer token
        if (currentToken && !isCustomerRedirecting) {
          isCustomerRedirecting = true;
          
          console.log('Customer authentication error - token invalid/expired', { 
            status, 
            message: data?.message || error.message,
            url: error.config?.url 
          });
          
          // Clear invalid token and customer data
          customerAuthService.logout();
          
          // Show toast notification
          toast.error('Your session has expired. Please login again.', {
            position: 'top-right',
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          
          // Redirect to customer login after a short delay
          setTimeout(() => {
            isCustomerRedirecting = false;
            window.location.href = '/customer/login';
          }, 1000);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Create instance  
const customerAuthService = new CustomerAuthService();

export default customerAuthService;
