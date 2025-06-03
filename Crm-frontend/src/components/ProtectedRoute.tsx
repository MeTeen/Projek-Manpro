import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { debugLog } from '../utils/debug';
import authService from '../services/authService';
import { toast } from 'react-toastify';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, token, user } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [hasShownToast, setHasShownToast] = useState(false);
  
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
          // Show toast notification when user tries to access protected route without authentication
        if (!hasShownToast && location.pathname !== '/login') {          const routeNames: { [key: string]: string } = {
            '/dashboard': 'dashboard',
            '/customers': 'customers page',
            '/products': 'products page', 
            '/transactions': 'transactions page',
            '/tasksection': 'task page',
            '/promo': 'promo page',
            '/analytics': 'analytics page',
            '/about': 'about page'
          };
          
          const routeName = routeNames[location.pathname] || 'the requested page';
          toast.warning(`Please login first to access ${routeName}`, {
            position: 'top-right',
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          setHasShownToast(true);
        }
        
        setChecking(false);
        return;
      }
      
      // Double-check token is valid by re-checking auth service
      const tokenValid = authService.initializeAuth();
      if (!tokenValid) {
        debugLog('ProtectedRoute', 'Auth service reports token is invalid');
          // Show toast for invalid/expired token
        if (!hasShownToast && location.pathname !== '/login') {
          toast.error('Your session has expired. Please login again.', {
            position: 'top-right',
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          setHasShownToast(true);
        }
        
        setChecking(false);
        return;
      }
      
      // Make sure tokens are synced
      const storedToken = authService.getToken();
      const tokensMatch = !!storedToken && token === storedToken;
      
      if (!tokensMatch) {
        debugLog('ProtectedRoute', 'Token mismatch between context and storage');
          // Show toast for token mismatch
        if (!hasShownToast && location.pathname !== '/login') {
          toast.error('Authentication issue occurred. Please login again.', {
            position: 'top-right',
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          setHasShownToast(true);
        }
        
        setChecking(false);
        return;
      }
      
      debugLog('ProtectedRoute', 'Auth check completed successfully');
      setChecking(false);
    };
    
    // Start check
    checkAuth();
  }, [isAuthenticated, token, user, location.pathname, hasShownToast]);

  // Reset toast flag when user goes to login page or becomes authenticated
  useEffect(() => {
    if (location.pathname === '/login' || isAuthenticated) {
      setHasShownToast(false);
    }
  }, [location.pathname, isAuthenticated]);

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