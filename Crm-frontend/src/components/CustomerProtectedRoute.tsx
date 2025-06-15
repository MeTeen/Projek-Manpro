import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import customerAuthService from '../services/customerAuthService';

interface CustomerProtectedRouteProps {
  children: React.ReactNode;
}

const CustomerProtectedRoute: React.FC<CustomerProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasShownToast, setHasShownToast] = useState(false);
  
  // Check authentication when component mounts
  useEffect(() => {
    const checkAuth = () => {
      console.log('CustomerProtectedRoute: Checking auth for', location.pathname);
      
      const authenticated = customerAuthService.isAuthenticated();
      const token = customerAuthService.getToken();
      const customer = customerAuthService.getCurrentCustomer();
      
      console.log('CustomerProtectedRoute: Auth status', {
        authenticated,
        hasToken: !!token,
        hasCustomer: !!customer
      });
      
      if (!authenticated) {
        console.log('CustomerProtectedRoute: Not authenticated, will redirect');
        
        // Show toast notification when customer tries to access protected route without authentication
        if (!hasShownToast && location.pathname !== '/customer/login') {
          const routeNames: { [key: string]: string } = {
            '/customer/tickets': 'tickets page',
            '/customer/profile': 'profile page',
            '/customer/orders': 'orders page',
            '/customer/dashboard': 'dashboard'
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
      }
      
      setIsAuthenticated(authenticated);
      setChecking(false);
    };

    checkAuth();
  }, [location.pathname, hasShownToast]);

  // Show loading while checking authentication
  if (checking) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Checking authentication...
      </div>
    );
  }

  // If not authenticated, redirect to customer login with state
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/customer/login" 
        state={{ from: location }}
        replace 
      />
    );
  }

  // If authenticated, render the protected component
  return <>{children}</>;
};

export default CustomerProtectedRoute;
