import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { debugLog } from '../utils/debug';
import authService from '../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, token, user } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  
  // Check authentication when component mounts
  useEffect(() => {
    const checkAuth = async () => {
      debugLog('ProtectedRoute', 
        `Checking auth for ${location.pathname}`,
        `isAuthenticated (context): ${isAuthenticated}`,
        `Has token: ${!!token}`,
        `Has user: ${!!user}`
      );
      
      // First verify we have valid auth data
      const hasValidData = !!token && !!user && isAuthenticated;
      if (!hasValidData) {
        debugLog('ProtectedRoute', 'Missing auth data, will redirect');
        setChecking(false);
        return;
      }
      
      // Double-check token is valid by re-checking auth service
      const tokenValid = authService.initializeAuth();
      if (!tokenValid) {
        debugLog('ProtectedRoute', 'Auth service reports token is invalid');
        setChecking(false);
        return;
      }
      
      // Make sure tokens are synced
      const storedToken = authService.getToken();
      const tokensMatch = !!storedToken && token === storedToken;
      
      if (!tokensMatch) {
        debugLog('ProtectedRoute', 'Token mismatch between context and storage');
        setChecking(false);
        return;
      }
      
      debugLog('ProtectedRoute', 'Auth check completed successfully');
      setChecking(false);
    };
    
    // Start check
    checkAuth();
  }, [isAuthenticated, token, user, location.pathname]);

  // Show loading state while checking authentication
  if (checking) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Checking authentication...</div>;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    debugLog('ProtectedRoute', 'Not authenticated, redirecting to login');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  debugLog('ProtectedRoute', 'Authenticated, rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute; 