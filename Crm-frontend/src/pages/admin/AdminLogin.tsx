import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Link,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { debugLog, debugError } from '../../utils/debug';

interface LoginError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
  code?: string;
}

const Login: React.FC = () => {  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const checkAuthAndRedirect = () => {
      debugLog('Login', 'Checking authentication state, isAuthenticated:', isAuthenticated);
      if (isAuthenticated) {
        debugLog('Login', 'User is authenticated, redirecting...');
        
        // Get the page user was trying to access before being redirected to login
        const from = (location.state as any)?.from?.pathname || '/admin/dashboard';
        navigate(from, { replace: true });
      }
    };
    
    // Check on mount and when auth state changes
    checkAuthAndRedirect();
  }, [isAuthenticated, navigate, location.state]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUsername || !password) {
      setError('Please enter both email/username and password.');
      return;
    }
    
    setError('');
    setIsLoading(true);    try {
      debugLog('Login', 'Attempting login...');
      await login(emailOrUsername, password);// Success toast with information about redirect
      const from = (location.state as any)?.from?.pathname;
      if (from && from !== '/admin/dashboard') {
        const routeNames: { [key: string]: string } = {
          '/admin/customers': 'customers page',
          '/admin/products': 'products page', 
          '/admin/transactions': 'transactions page',
          '/admin/tasksection': 'task page',
          '/admin/promo': 'promo page',
          '/admin/analytics': 'analytics page',
          '/admin/tickets': 'tickets page',
          '/admin/about': 'about page'
        };
        const routeName = routeNames[from] || 'the requested page';
        toast.success(`Login successful! Redirecting to ${routeName}...`);
      } else {
        toast.success('Login successful! Welcome back.');
      }
    } catch (error) {
      debugError('Login', 'Login error:', error);
      const loginError = error as LoginError;
      
      if (loginError.code === 'ECONNREFUSED' || loginError.code === 'ECONNABORTED') {
        const message = 'Cannot connect to the server. Please check your network or server status.';
        setError(message);
        toast.error(message);
      } else {
        const message = loginError.response?.data?.message || loginError.message || 'Invalid email or password';
        setError(message);
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >          {/* Show info message if user was redirected from a protected route */}
          {(location.state as any)?.from?.pathname && (location.state as any)?.from?.pathname !== '/admin/dashboard' && (
            <Box
              sx={{
                width: '100%',
                mb: 2,
                p: 2,
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: 1,
                color: '#856404'
              }}
            ><Typography variant="body2" align="center">
                Please login to access the requested page
              </Typography>
            </Box>
          )}
          
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>            <TextField
              margin="normal"
              required
              fullWidth
              id="emailOrUsername"
              label="Email or Username"
              name="emailOrUsername"
              autoComplete="email"
              autoFocus
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              disabled={isLoading}
              placeholder="Enter your email or username"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            {error && (
              <Typography color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>            <Box sx={{ textAlign: 'center' }}>
              <Link href="/admin/signup" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 