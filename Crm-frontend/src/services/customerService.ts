import axios from 'axios';
import authService from './authService';
import { API_CONFIG } from '../config/api';

export interface Customer {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  avatarUrl?: string;
  totalSpent?: number;
  purchaseCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Use centralized API configuration
const API_URL = API_CONFIG.BASE_URL;

// Helper function to get token
const getAuthToken = (): string | null => {
  // First check authService which is the source of truth
  const token = authService.getToken();
  
  if (!token) {
    console.warn('No authentication token found in authService');
    // As a fallback, check localStorage directly
    const localToken = localStorage.getItem('token');
    if (localToken) {
      console.log('Found token in localStorage directly');
      return localToken;
    }
    console.error('No authentication token available');
    return null;
  }
  
  return token;
};

class CustomerService {
  private readonly baseUrl = '/customers';

  /**
   * Get basic customer info for dropdowns/selection (optimized)
   * @param fields Specific fields to fetch (default: id, firstName, lastName)
   */
  async getCustomersBasicInfo(fields: string[] = ['id', 'firstName', 'lastName']): Promise<Partial<Customer>[]> {
    try {
      // Ensure auth is initialized before each API call
      authService.initializeAuth();
      
      // Get authentication token
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const fieldsParam = fields.join(',');
      const response = await axios.get(`${API_URL}${this.baseUrl}?fields=${fieldsParam}&limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching basic customer info:', error);
      
      // Fallback to regular method if fields parameter not supported
      try {
        const allCustomers = await this.getAllCustomers();
        return allCustomers.map(customer => {
          const result: any = {};
          fields.forEach(field => {
            if (field in customer) {
              result[field] = customer[field as keyof Customer];
            }
          });
          return result;
        });
      } catch (fallbackError) {
        console.error('Fallback method also failed:', fallbackError);
        throw error;
      }
    }
  }

  async getAllCustomers(): Promise<Customer[]> {
    try {
      // Ensure auth is initialized before each API call
      authService.initializeAuth();
      
      // Get authentication token
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const response = await axios.get(`${API_URL}${this.baseUrl}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  async getCustomerById(id: string): Promise<Customer> {
    try {
      // Ensure auth is initialized before each API call
      authService.initializeAuth();
      
      // Get authentication token
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const response = await axios.get(`${API_URL}${this.baseUrl}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching customer with ID ${id}:`, error);
      throw error;
    }
  }

  async createCustomer(customer: Omit<Customer, 'id' | 'avatarUrl' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    try {
      // Ensure auth is initialized before each API call
      authService.initializeAuth();
      
      // Get authentication token
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const response = await axios.post(`${API_URL}${this.baseUrl}`, customer, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  /**
   * Create a new customer with FormData (with detailed axios implementation)
   * This allows for file uploads and handles multipart/form-data
   */
  async createCustomerWithAxios(formData: FormData): Promise<Customer> {
    try {
      console.log('Making API request to:', `${API_URL}${this.baseUrl}`);
      
      // Ensure auth is initialized
      authService.initializeAuth();
      
      // Get authentication token
      const token = getAuthToken();
      
      if (!token) {
        console.error('No authentication token available');
        throw new Error('Authentication required. Please log in again.');
      }
      
      console.log('Using auth token:', token ? 'Token available' : 'No token');
      
      console.log('FormData contents:');
      // Log FormData contents for debugging
      for (const pair of (formData as FormData).entries()) {
        console.log(`${pair[0]}: ${typeof pair[1] === 'object' ? 'File or Object' : pair[1]}`);
      }

      // Direct axios implementation
      const response = await axios({
        method: 'post',
        url: `${API_URL}${this.baseUrl}`,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`, // Add token to request
        },
        // Add timeout and other options
        timeout: 10000, // 10 seconds
        validateStatus: (status) => status < 500, // Don't reject if status < 500
      });

      console.log('Raw API response:', response);
      
      // Check if request was successful
      if (response.status >= 200 && response.status < 300) {
        console.log('Customer created successfully:', response.data);
        return response.data.data;
      } else if (response.status === 401) {
        // If unauthorized, force logout
        console.error('Authentication failed (401):', response.data);
        authService.logout();
        throw new Error('Authentication failed. Please log in again.');
      } else {
        throw new Error(`API returned status ${response.status}: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('API Error Response Data:', error.response.data);
          console.error('API Error Response Status:', error.response.status);
          
          // Handle auth errors specifically
          if (error.response.status === 401) {
            console.error('Authorization error (401) - logging out');
            authService.logout();
            throw new Error('Authentication failed. Please log in again.');
          }
          
          throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
          // The request was made but no response was received
          console.error('API Error Request:', error.request);
          throw new Error('No response received from server. Please check your network connection.');
        } else {
          // Something happened in setting up the request
          console.error('API Error Message:', error.message);
          throw new Error(`Request setup error: ${error.message}`);
        }
      }
      console.error('Unexpected error:', error);
      throw error;
    }
  }

  // Try alternative API endpoint format
  async createCustomerAlternative(formData: FormData): Promise<Customer> {
    try {      // Try alternate URL structure or parameters
      const url = `${API_CONFIG.BASE_URL}/customers`; // Use centralized config
      console.log('Trying alternative API at:', url);
      
      // Get authentication token
      const token = getAuthToken();
      
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`, // Add token to request
        }
      });
      
      console.log('Alternative API response:', response);
      return response.data.data;
    } catch (error) {
      console.error('Alternative API error:', error);
      throw error;
    }
  }

  // Simpler alternative if you prefer a more direct approach
  async createCustomerRaw(customerData: FormData): Promise<Customer> {
    const response = await axios.post(`${API_URL}${this.baseUrl}`, customerData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    return response.data.data;
  }

  async updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer> {
    try {
      // Ensure auth is initialized before each API call
      authService.initializeAuth();
      
      // Get authentication token
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const response = await axios.put(`${API_URL}${this.baseUrl}/${id}`, customer, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.data;
    } catch (error) {
      console.error(`Error updating customer with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update a customer with FormData (supports file uploads)
   * @param id Customer ID
   * @param formData FormData containing customer data and optional avatar
   */
  async updateCustomerWithFormData(id: string, formData: FormData): Promise<Customer> {
    try {
      // Ensure auth is initialized before each API call
      authService.initializeAuth();
      
      // Get authentication token
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      console.log('Updating customer with FormData. ID:', id);
      
      // Log FormData contents for debugging
      for (const pair of formData.entries()) {
        console.log(`${pair[0]}: ${typeof pair[1] === 'object' ? 'File or Object' : pair[1]}`);
      }
      
      const response = await axios({
        method: 'put',
        url: `${API_URL}${this.baseUrl}/${id}`,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
        timeout: 15000, // 15 seconds
      });
      
      console.log('Customer update response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating customer with ID ${id}:`, error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('API response error:', error.response.data);
        throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  async deleteCustomer(id: string): Promise<void> {
    try {
      // Ensure auth is initialized before each API call
      authService.initializeAuth();
      
      // Get authentication token
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      await axios.delete(`${API_URL}${this.baseUrl}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error(`Error deleting customer with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new customer with a direct token parameter
   * This is useful for temporary token authentication
   */
  async createCustomerWithDirectToken(formData: FormData, token: string): Promise<Customer> {
    try {
      console.log('Making API request with direct token to:', `${API_URL}${this.baseUrl}`);
      console.log('Using token (first few chars):', token.substring(0, 5) + '...');
      
      console.log('FormData contents:');
      // Log FormData contents for debugging
      for (const pair of (formData as FormData).entries()) {
        console.log(`${pair[0]}: ${typeof pair[1] === 'object' ? 'File or Object' : pair[1]}`);
      }

      // Direct axios implementation with explicit token
      const response = await axios({
        method: 'post',
        url: `${API_URL}${this.baseUrl}`,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`, // Use the provided token
        },
        timeout: 10000,
        validateStatus: (status) => status < 500,
      });

      console.log('Raw API response:', response);
      
      // Check if request was successful
      if (response.status >= 200 && response.status < 300) {
        console.log('Customer created successfully:', response.data);
        return response.data.data;
      } else {
        throw new Error(`API returned status ${response.status}: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('API Error Response Data:', error.response.data);
          console.error('API Error Response Status:', error.response.status);
          console.error('API Error Response Headers:', error.response.headers);
          
          // Handle auth errors specifically
          if (error.response.status === 401) {
            throw new Error('Authentication failed. The provided token is invalid or expired.');
          }
          
          throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
          console.error('API Error Request:', error.request);
          throw new Error('No response received from server. Please check your network connection.');
        } else {
          console.error('API Error Message:', error.message);
          throw new Error(`Request setup error: ${error.message}`);
        }
      }
      console.error('Unexpected error:', error);
      throw error;
    }
  }

  /**
   * Alternative endpoint with direct token parameter
   */
  async createCustomerAlternativeWithToken(formData: FormData, token: string): Promise<Customer> {    try {
      const url = `${API_CONFIG.BASE_URL}/customers`; // Use centralized config
      console.log('Trying alternative API with direct token at:', url);
      console.log('Using token (first few chars):', token.substring(0, 5) + '...');
      
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`, // Use the provided token
        }
      });
      
      console.log('Alternative API response:', response);
      return response.data.data;
    } catch (error) {
      console.error('Alternative API error:', error);
      throw error;
    }
  }

  /**
   * Get top spending customers with their total spend and purchase info
   * @param limit Number of customers to return (default: 5)
   */
  async getTopSpendingCustomers(limit: number = 5): Promise<Customer[]> {
    try {
      // Ensure auth is initialized before each API call
      authService.initializeAuth();
      
      // Get authentication token
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const response = await axios.get(`${API_URL}${this.baseUrl}?limit=${limit}&sortBy=totalSpent&order=desc`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching top spending customers:', error);
      
      // For demo: If the endpoint doesn't support the query parameters,
      // fetch all customers and sort them manually
      try {
        const allCustomers = await this.getAllCustomers();
        // Sort by totalSpent in descending order
        const sortedCustomers = allCustomers.sort((a, b) => {
          const spendA = a.totalSpent || 0;
          const spendB = b.totalSpent || 0;
          return spendB - spendA;
        });
        // Return limited number of results
        return sortedCustomers.slice(0, limit);
      } catch (fallbackError) {
        console.error('Fallback method also failed:', fallbackError);
        throw error; // Throw the original error
      }
    }
  }
}

const customerService = new CustomerService();
export default customerService; 