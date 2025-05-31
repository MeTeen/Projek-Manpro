import axios from 'axios';
import authService from './authService';
import { API_CONFIG } from '../config/api';

// Use centralized API configuration
const API_URL = API_CONFIG.BASE_URL;

export interface Product {
  id: number;
  name: string;
  stock: number;
  price: number;
  dimensions: string;
  created_at: string;
  updated_at: string;
}

export interface ProductInput {
  name: string;
  stock: number;
  price: number;
  dimensions: string;
}

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

const productService = {
  async getAllProducts(): Promise<Product[]> {
    try {
      // Ensure auth is initialized
      authService.initializeAuth();
      
      // Get token
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const response = await axios.get(`${API_URL}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async getProductsForDropdown(): Promise<Product[]> {
    try {
      // Ensure auth is initialized
      authService.initializeAuth();
      
      // Get token
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const response = await axios.get(`${API_URL}/products/dropdown`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching products for dropdown:', error);
      throw error;
    }
  },

  async getProductById(id: number): Promise<Product> {
    try {
      // Ensure auth is initialized
      authService.initializeAuth();
      
      // Get token
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const response = await axios.get(`${API_URL}/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      throw error;
    }
  },

  async createProduct(productData: ProductInput): Promise<Product> {
    try {
      console.log('Starting createProduct with data:', JSON.stringify(productData));
      
      // Ensure auth is initialized
      authService.initializeAuth();
      console.log('Auth initialized');
      
      // Get token
      const token = getAuthToken();
      console.log('Token retrieved:', token ? 'Token present' : 'No token found');
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      // Validate incoming data
      if (typeof productData.stock !== 'number') {
        productData.stock = Number(productData.stock) || 0;
      }
      
      if (typeof productData.price !== 'number') {
        productData.price = Number(productData.price) || 0;
      }
      
      // Convert dimensions to string if needed
      if (productData.dimensions && typeof productData.dimensions !== 'string') {
        productData.dimensions = String(productData.dimensions);
      }
      
      console.log('Making API request to:', `${API_URL}/products`);
      console.log('With data:', JSON.stringify(productData));
      
      try {
        const response = await axios.post(`${API_URL}/products`, productData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          timeout: 10000 // 10 second timeout
        });
        
        console.log('Product created successfully:', response.data);
        return response.data.data;
      } catch (axiosError: unknown) {
        // Handle axios specific errors
        if (axios.isAxiosError(axiosError)) {
          console.error('Axios error details:', {
            status: axiosError.response?.status,
            statusText: axiosError.response?.statusText,
            data: axiosError.response?.data,
            headers: axiosError.response?.headers
          });
          
          // Check if we have a detailed error message from the server
          if (axiosError.response?.data?.error) {
            console.error('Server error details:', axiosError.response.data.error);
            throw new Error(`Server error: ${axiosError.response.data.error}`);
          }
          
          // Handle specific status codes
          if (axiosError.response?.status === 401) {
            throw new Error('Authentication required. Please log in again.');
          } else if (axiosError.response?.status === 500) {
            throw new Error('Server error. Please try again later or contact support.');
          }
        }
        
        // Rethrow the original error if not handled above
        throw axiosError;
      }
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  async updateProduct(id: number, productData: Partial<ProductInput>): Promise<Product> {
    try {
      // Ensure auth is initialized
      authService.initializeAuth();
      
      // Get token
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const response = await axios.put(`${API_URL}/products/${id}`, productData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.data;
    } catch (error) {
      console.error(`Error updating product with ID ${id}:`, error);
      throw error;
    }
  },

  async deleteProduct(id: number): Promise<void> {
    try {
      // Ensure auth is initialized
      authService.initializeAuth();
      
      // Get token
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      await axios.delete(`${API_URL}/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error(`Error deleting product with ID ${id}:`, error);
      throw error;
    }
  }
};

export default productService; 