import axios from 'axios';
import { debugLog, debugError, logRequest, logResponse, logNetworkError } from '../utils/debug';
import { AuthResponse, LoginData, SignUpData, UserData, JwtPayload } from '../types/auth';
import { API_CONFIG } from '../config/api';
import { toast } from 'react-toastify';

// Use centralized API configuration
const API_URL = API_CONFIG.BASE_URL;
// Use env-based storage keys if provided
const TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || 'token';
const USER_KEY = import.meta.env.VITE_USER_DATA_KEY || 'user';

// For debugging purposes
const DEBUG_AUTH = true;

console.log(
  'Loaded ENV → VITE_AUTH_TOKEN_KEY:',
  import.meta.env.VITE_AUTH_TOKEN_KEY,
  'VITE_USER_DATA_KEY:',
  import.meta.env.VITE_USER_DATA_KEY
);

// Debug helper that logs to both console and debug logs
const logAuth = (message: string, data?: Record<string, unknown>) => {
  if (DEBUG_AUTH) {
    console.log(`🔐 Auth: ${message}`, data);
    debugLog('AuthService', message, data);
  }
};

// We use axios directly for auth endpoints to avoid circular dependency with apiClient
const authService = {
  async signup(data: SignUpData): Promise<AuthResponse> {
    try {
      logAuth('Attempting signup for user:', { email: data.email });
      logRequest('POST', `${API_URL}/auth/signup`, { ...data, password: '***' });
      
      const response = await axios.post(`${API_URL}/auth/signup`, {
        ...data,
        role: data.role || 'admin'
      });
      
      logResponse('POST', `${API_URL}/auth/signup`, { 
        ...response.data, 
        token: response.data.token ? '[TOKEN]' : null 
      });
      
      // Store JWT token and user data on successful signup
      if (response.data.token) {
        this.setToken(response.data.token);
        this.setUser(response.data.user);
        logAuth('Signup successful - token saved');
        
        // Setting token on axios default headers for all future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        logAuth('Set token in axios default headers');
      } else {
        logAuth('Signup successful but no token received', { response: response.data });
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          debugError('AuthService', 'Cannot connect to API server. Please check if the server is running.');
        }
      }
      logNetworkError('POST', `${API_URL}/auth/signup`, error);
      logAuth('Signup failed', { error });
      throw error;
    }
  },

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      logAuth('Attempting login for user:', { email: data.email });
      logRequest('POST', `${API_URL}/auth/login`, { email: data.email, password: '***' });
      
      console.log('⚠️ DEBUG LOGIN: About to make API request to', `${API_URL}/auth/login`);
      
      const response = await axios.post(`${API_URL}/auth/login`, data, {
        timeout: 10000, // Add timeout for better error handling
      });
      
      // Debug: log full response so we can see where token lives
      console.log('🔐 AuthService login response data:', JSON.stringify(response.data));
      console.log('🔐 Full response status:', response.status);
      console.log('🔐 Response headers:', JSON.stringify(response.headers));
      
      // Handle specific backend response structure
      if (response.data.success && response.data.data && response.data.data.token) {
        console.log('✅ Found token in expected location: response.data.data.token');
        const token = response.data.data.token;
        const user = {
          id: response.data.data.id,
          username: response.data.data.username,
          email: response.data.data.email,
          role: response.data.data.role
        };
        
        // Clear any previous token first
        localStorage.removeItem(TOKEN_KEY);
        
        // Set new token
        this.setToken(token);
        
        // Double-check the token actually got stored
        const storedToken = localStorage.getItem(TOKEN_KEY);
        if (!storedToken) {
          console.error('🔐 CRITICAL AUTH ERROR: Token was not saved to localStorage!');
          throw new Error('Authentication failed - could not save token');
        }
        
        // Setting token on axios default headers for all future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        logAuth('Set token in axios default headers');
        
        // Save user data
        this.setUser(user);
        logAuth('User data saved', { email: user.email });
        
        return {
          token,
          user,
          message: 'Login successful'
        };
      }
      
      // If not found in expected location, continue with other checks
      logResponse('POST', `${API_URL}/auth/login`, { 
        ...response.data, 
        token: response.data.token ? '[TOKEN RECEIVED]' : (response.data.access_token || response.data.accessToken ? '[TOKEN FIELD ALT]' : '[NO TOKEN]') 
      });
      
      // Determine actual token field - handle different API token field formats
      console.log('🔍 Looking for token in these fields:');
      console.log('- token:', response.data.token);
      console.log('- access_token:', response.data.access_token);
      console.log('- accessToken:', response.data.accessToken);
      console.log('- jwt:', response.data.jwt);
      console.log('- idToken:', response.data.idToken);
      console.log('- id_token:', response.data.id_token);
      console.log('- auth_token:', response.data.auth_token);
      console.log('- authToken:', response.data.authToken);
      
      // Try all common token field names
      const actualToken: string = 
        response.data.token || 
        response.data.access_token || 
        response.data.accessToken || 
        response.data.jwt ||
        response.data.idToken ||
        response.data.id_token ||
        response.data.auth_token ||
        response.data.authToken;
      
      if (actualToken) {
        logAuth('Login successful - token received', { tokenLength: actualToken.length });
        
        // Clear any previous token first
        localStorage.removeItem(TOKEN_KEY);
        
        // Set new token
        this.setToken(actualToken);
        
        // Double-check the token actually got stored
        const storedToken = localStorage.getItem(TOKEN_KEY);
        if (!storedToken) {
          console.error('🔐 CRITICAL AUTH ERROR: Token was not saved to localStorage!');
          throw new Error('Authentication failed - could not save token');
        }
        
        // Setting token on axios default headers for all future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${actualToken}`;
        logAuth('Set token in axios default headers');
        
        // Handle user data
        if (response.data.user) {
          this.setUser(response.data.user);
          logAuth('User data saved', { email: response.data.user.email });
        } else {
          logAuth('No user data in response', { response: response.data });
        }
        
        // Creating a proper response
        return {
          token: actualToken,
          user: response.data.user || { 
            username: data.email.split('@')[0], 
            email: data.email,
            role: 'admin' 
          },
          message: 'Login successful'
        };
      } else {
        console.log('❌ CRITICAL ERROR: No token found in any expected field');
        console.log('🔍 Full response.data fields:', Object.keys(response.data));
        
        // Check if maybe token is nested in another object
        if (response.data.data && typeof response.data.data === 'object') {
          console.log('🔍 Found nested data object, checking for token there...');
          console.log('- data.token:', response.data.data.token);
          console.log('- data.access_token:', response.data.data.access_token);
          console.log('- data.accessToken:', response.data.data.accessToken);
          console.log('- data.jwt:', response.data.data.jwt);
          console.log('- data.idToken:', response.data.data.idToken);
          console.log('- data.id_token:', response.data.data.id_token);
          console.log('- data.auth_token:', response.data.data.auth_token);
          console.log('- data.authToken:', response.data.data.authToken);
          
          const nestedToken = 
            response.data.data.token || 
            response.data.data.access_token || 
            response.data.data.accessToken ||
            response.data.data.jwt ||
            response.data.data.idToken ||
            response.data.data.id_token ||
            response.data.data.auth_token ||
            response.data.data.authToken;
            
          if (nestedToken) {
            console.log('✅ Found token in nested data object!');
            return {
              token: nestedToken,
              user: response.data.data.user || response.data.user || { 
                username: data.email.split('@')[0], 
                email: data.email,
                role: 'admin' 
              },
              message: 'Login successful'
            };
          }
        }
        
        // Also check for token in Authorization header
        const authHeader = response.headers['authorization'] || response.headers['Authorization'];
        if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
          console.log('✅ Found token in Authorization header!');
          const headerToken = authHeader.replace('Bearer ', '');
          return {
            token: headerToken,
            user: response.data.user || { 
              username: data.email.split('@')[0], 
              email: data.email,
              role: 'admin' 
            },
            message: 'Login successful'
          };
        }
        
        // LAST RESORT: Try to find any string that looks like a JWT token (xxx.yyy.zzz)
        const responseStr = JSON.stringify(response.data);
        const jwtRegex = /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/;
        const jwtMatch = responseStr.match(jwtRegex);
        
        if (jwtMatch && jwtMatch[0]) {
          console.log('✅ Found a JWT-like token in the response using regex!');
          console.log('Token:', jwtMatch[0]);
          
          return {
            token: jwtMatch[0],
            user: response.data.user || { 
              username: data.email.split('@')[0], 
              email: data.email,
              role: 'admin' 
            },
            message: 'Login successful (token found via pattern matching)'
          };
        }
        
        // Search for any field name that might contain a token
        for (const key of Object.keys(response.data)) {
          const value = response.data[key];
          if (typeof value === 'string' && value.includes('.') && value.split('.').length === 3) {
            console.log(`✅ Found potential JWT token in field: ${key}`);
            console.log('Token:', value);
            
            return {
              token: value,
              user: response.data.user || { 
                username: data.email.split('@')[0], 
                email: data.email,
                role: 'admin' 
              },
              message: `Login successful (token found in ${key} field)`
            };
          }
        }
        
        logAuth('Login response successful but no token in any field', { response: response.data });
        throw new Error('Authentication failed - no token received from server');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logAuth('Login failed with status:', { status: error.response?.status });
        if (error.code === 'ECONNREFUSED') {
          debugError('AuthService', 'Cannot connect to API server. Please check if the server is running.');
        }
      }
      logNetworkError('POST', `${API_URL}/auth/login`, error);
      logAuth('Login failed', { error });
      throw error;
    }
  },

  logout() {
    try {
      logAuth('Logging out user');
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      
      // Clear the Authorization header
      delete axios.defaults.headers.common['Authorization'];
      logAuth('Cleared token from axios default headers');
      
      logAuth('Logout successful - localStorage cleared');
    } catch (error) {
      debugError('AuthService', 'Logout error:', error);
      logAuth('Logout error', { error });
    }
  },

  getCurrentUser(): UserData | null {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          logAuth('Retrieved current user from localStorage', { email: user.email });
          return user;
        } catch (parseError) {
          logAuth('Error parsing user JSON', { userStr, error: parseError });
          return null;
        }
      }
      logAuth('No user found in localStorage');
      return null;
    } catch (error) {
      debugError('AuthService', 'Error getting current user:', error);
      logAuth('Error getting current user', { error });
      return null;
    }
  },

  getToken(): string | null {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        logAuth('Retrieved token from localStorage', { tokenLength: token.length });
      } else {
        logAuth('No token found in localStorage');
      }
      return token;
    } catch (error) {
      debugError('AuthService', 'Error getting token:', error);
      logAuth('Error getting token', { error });
      return null;
    }
  },
  
  setToken(token: string) {
    try {
      if (!token) {
        logAuth('Attempted to save empty token!');
        return;
      }
      
      // Try with direct assignment first
      localStorage.setItem(TOKEN_KEY, token);
      
      // Verify token was saved - important check
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (!savedToken) {
        logAuth('CRITICAL ERROR: Token failed to save in localStorage!');
        
        // Try one more time with a different method
        window.localStorage.setItem(TOKEN_KEY, token);
        
        // Check again
        const retryToken = localStorage.getItem(TOKEN_KEY);
        if (!retryToken) {
          throw new Error('Failed to save authentication token');
        } else {
          logAuth('Token saved on second attempt', { tokenLength: retryToken.length });
        }
      } else {
        logAuth('Token saved to localStorage', { tokenLength: savedToken.length });
      }
      
      // Also set the token in axios default headers for all future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      logAuth('Set token in axios default headers');
    } catch (error) {
      console.error('CRITICAL: Token storage error:', error);
      logAuth('Error saving token', { error });
      throw new Error('Authentication failed - could not save token');
    }
  },
  
  setUser(user: UserData) {
    try {
      if (!user) {
        logAuth('Attempted to save empty user data!');
        return;
      }
      
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      logAuth('User data saved to localStorage', { email: user.email });
    } catch (error) {
      logAuth('Error saving user data', { error });
    }
  },
  
  // Initialize auth from localStorage (call this on app startup)
  initializeAuth() {
    try {
      const token = this.getToken();
      if (token) {
        // First check basic token format for JWT (should have 3 parts separated by dots)
        if (!token.includes('.') || token.split('.').length !== 3) {
          logAuth('Invalid token format during initialization - clearing token');
          this.logout();
          return false;
        }
        
        // Clear and set the token in axios default headers to ensure it's fresh
        delete axios.defaults.headers.common['Authorization'];
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        logAuth('Initialized auth - set token in axios default headers');
        
        // Verify token without triggering auto-logout
        const payload = this.getTokenPayload();
        if (!payload) {
          logAuth('Could not decode token payload during initialization - clearing token');
          this.logout();
          return false;
        }
        
        // Check token expiration manually
        if (payload.exp) {
          const currentTime = Math.floor(Date.now() / 1000);
          const expiryTime = payload.exp;
          const timeLeft = expiryTime - currentTime;
          
          logAuth('Token expiry check during initialization', { 
            timeLeftSeconds: timeLeft,
            expiresAt: new Date(expiryTime * 1000).toISOString()
          });
            if (timeLeft <= 0) {
            logAuth('Token has expired during initialization - clearing token');
            toast.warning('Your session has expired. Please login again.', {
              position: 'top-right',
              autoClose: 4000,
            });
            this.logout();
            return false;
          } else if (timeLeft < 300) { // Less than 5 minutes left
            logAuth('Token expires soon', { timeLeftSeconds: timeLeft });
            toast.info('Your session will expire soon. Please save your work.', {
              position: 'top-right',
              autoClose: 5000,
            });
          }
        }
        
        logAuth('Token is valid, user is authenticated after initialization');
        return true;
      }
      
      logAuth('No token found during initialization');
      return false;
    } catch (error) {
      logAuth('Error initializing auth', { error });
      this.logout(); // Clear any potentially corrupted state
      return false;
    }
  },
  
  // Decodes the JWT token to get the payload
  getTokenPayload(): JwtPayload | null {
    try {
      const token = this.getToken();
      if (!token) {
        logAuth('Cannot decode payload - no token');
        return null;
      }
      
      // Manual decoding of JWT token
      try {
        const parts = token.split('.');
        if (parts.length !== 3) {
          logAuth('Invalid token format (not a JWT token)', { parts: parts.length });
          return null;
        }
        
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join('')
        );
        
        const payload = JSON.parse(jsonPayload);
        logAuth('Token decoded successfully', { 
          exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'none',
          sub: payload.sub
        });
        return payload;
      } catch (e) {
        debugError('AuthService', 'Error decoding token:', e);
        logAuth('Error decoding token', { error: e });
        return null;
      }
    } catch (error) {
      debugError('AuthService', 'Error processing token payload:', error);
      logAuth('Error processing token payload', { error });
      return null;
    }
  },
  
  /**
   * Check if the user is authenticated by validating the JWT token
   * This is stateless and doesn't require a server call
   */
  isAuthenticated(): boolean {
    try {
      logAuth('Checking authentication status');
      const token = this.getToken();
      if (!token) {
        logAuth('No token found, user is not authenticated');
        return false;
      }
      
      // Check token format
      if (!token.includes('.') || token.split('.').length !== 3) {
        logAuth('Invalid token format (not a JWT token)');
        // Don't logout automatically - just return false
        return false;
      }
      
      // Check token expiration
      const payload = this.getTokenPayload();
      if (!payload) {
        logAuth('Could not decode token, assuming invalid');
        // Don't logout automatically - just return false
        return false;
      }
      
      // Check if token is expired
      if (payload.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        const expiryTime = payload.exp;
        const timeLeft = expiryTime - currentTime;
        
        logAuth('Token expiry check', { 
          currentTime: new Date(currentTime * 1000).toISOString(),
          expiryTime: new Date(expiryTime * 1000).toISOString(),
          timeLeftSeconds: timeLeft
        });
        
        if (timeLeft <= 0) {
          logAuth('Token has expired');
          // Don't logout automatically - just return false
          return false;
        }
        
        // Warn if token is about to expire (less than 5 minutes)
        if (timeLeft < 300) {
          logAuth('Token is about to expire', { timeLeftSeconds: timeLeft });
        }
      } else {
        logAuth('Token has no expiration claim');
      }
      
      // Re-set the token in axios headers in case it was lost
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      logAuth('Token is valid, user is authenticated');
      return true;
    } catch (error) {
      debugError('AuthService', 'Error checking authentication:', error);
      logAuth('Error checking authentication', { error });
      return false;
    }  }
};

// Setup axios response interceptor for handling token expiration
let isRedirecting = false; // Prevent multiple redirects

axios.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response) {
      const { status, data } = error.response;
      
      // Check for authentication/authorization errors
      if (status === 401 || status === 403) {
        const currentToken = authService.getToken();
        
        // Only handle if we actually have a token (user was supposed to be authenticated)
        if (currentToken && !isRedirecting) {
          isRedirecting = true;
          
          logAuth('Authentication error - token invalid/expired', { 
            status, 
            message: data?.message || error.message,
            url: error.config?.url 
          });
          
          // Clear invalid token and user data
          authService.logout();
          
          // Show toast notification
          toast.error('Your session has expired. Please login again.', {
            position: 'top-right',
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          
          // Redirect to login page after a short delay to ensure toast is shown
          setTimeout(() => {
            isRedirecting = false;
            // Use window.location to force a full page redirect
            if (window.location.pathname.startsWith('/admin')) {
              window.location.href = '/admin/login';
            } else if (window.location.pathname.startsWith('/customer')) {
              window.location.href = '/customer/login';
            } else {
              window.location.href = '/admin/login'; // Default to admin login
            }
          }, 1000);
        }
      }
    }
    
    // Return the error for other parts of the app to handle
    return Promise.reject(error);
  }
);

// Call initialization on module load
authService.initializeAuth();

export default authService; 