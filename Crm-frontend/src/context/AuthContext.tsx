import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';
import { AuthResponse, UserData } from '../types/auth';
import axios from 'axios';

export type AuthContextType = {
  user: UserData | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string, role?: 'admin' | 'super_admin') => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth state from localStorage...');
        
        // Call the authService's initializeAuth method to properly set up headers
        const isValid = authService.initializeAuth();
        
        // Now get the current data
        const storedUser = authService.getCurrentUser();
        const storedToken = authService.getToken();
        
        console.log('Auth data from localStorage:', { 
          user: storedUser?.email, 
          hasToken: !!storedToken,
          tokenValid: isValid
        });
        
        if (storedUser && storedToken && isValid) {
          setUser(storedUser);
          setToken(storedToken);
          setIsAuthenticated(true);
          
          // Double-check axios headers are set
          if (!axios.defaults.headers.common['Authorization'] && storedToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            console.log('Re-applied auth token to axios headers');
          }
        } else {
          console.log('No valid stored auth data found - user is not authenticated');
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);
          
          // Clean up any incomplete state
          if (!isValid || (storedToken === null && storedUser !== null)) {
            console.log('Cleaning up incomplete auth state');
            authService.logout();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        authService.logout(); // Clean up on error
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      const response = await authService.login({ email, password });
      console.log('Login successful:', response);
      
      // Make sure we got a valid response with token and user
      if (!response.token) {
        throw new Error('Login failed: No token received');
      }
      
      // Set states
      setUser(response.user);
      setToken(response.token);
      setIsAuthenticated(true);
      
      // Verify token was properly stored in localStorage
      const storedToken = authService.getToken();
      if (!storedToken) {
        console.error('Critical auth error: Login succeeded but token not in localStorage');
        throw new Error('Authentication failed: Could not store token');
      }
      
      console.log('Auth state updated after login:', { 
        user: response.user, 
        hasToken: !!response.token,
        isAuthenticated: true 
      });
    } catch (error) {
      console.error('Login failed:', error);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const signup = async (username: string, email: string, password: string, role?: 'admin' | 'super_admin') => {
    try {
      console.log('Attempting signup for:', { username, email, role });
      const response = await authService.signup({ username, email, password, role });
      console.log('Signup successful:', response);
      
      setUser(response.user);
      setToken(response.token);
      setIsAuthenticated(true);
      
      console.log('Auth state updated after signup:', { 
        user: response.user, 
        hasToken: !!response.token,
        isAuthenticated: true 
      });
    } catch (error) {
      console.error('Signup failed:', error);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = () => {
    try {
      console.log('Logging out user:', user);
      authService.logout(); // This already removes from localStorage
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      console.log('Auth state cleared after logout');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  console.log('Current auth state:', { 
    isAuthenticated, 
    user: user?.email, 
    hasToken: !!token,
    isInitialized
  });

  // Show a minimal loading state while auth is initializing
  if (!isInitialized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Initializing authentication...
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        signup,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 