import { useState, useEffect } from 'react';
import { checkApiConnection, verifyApiUrl } from '../utils/apiCheck';
import { debugLog } from '../utils/debug';
import { API_CONFIG } from '../config/api';

// Use centralized API configuration
const API_URL = API_CONFIG.BASE_URL;

interface ApiDebuggerProps {
  isVisible?: boolean;
}

const ApiDebugger: React.FC<ApiDebuggerProps> = ({ isVisible = false }) => {
  const [apiStatus, setApiStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [message, setMessage] = useState<string>('Checking API connection...');

  useEffect(() => {
    const checkApi = async () => {
      debugLog('ApiDebugger', 'Starting API checks');
      
      // First check if API_URL is valid
      const isValidUrl = verifyApiUrl(API_URL);
      if (!isValidUrl) {
        setApiStatus('error');
        setMessage(`API URL format is invalid: ${API_URL}`);
        return;
      }
      
      // Check if we're using a relative path
      const isRelativePath = API_URL.startsWith('/');
      const fullUrl = isRelativePath 
        ? `${window.location.origin}${API_URL}`
        : API_URL;
      
      // Then check API connectivity
      const isConnected = await checkApiConnection(fullUrl);
      if (!isConnected) {
        setApiStatus('error');
        setMessage(`Cannot connect to API at ${API_URL}. Please check your network and server.`);
        return;
      }
      
      setApiStatus('ok');
      setMessage(`API connection successful to ${API_URL}`);
    };
    
    checkApi();
  }, []);
  
  if (!isVisible) {
    return null;
  }
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      left: '10px',
      padding: '10px',
      background: apiStatus === 'error' ? '#ffebee' : apiStatus === 'ok' ? '#e8f5e9' : '#e3f2fd',
      border: `1px solid ${apiStatus === 'error' ? '#ef5350' : apiStatus === 'ok' ? '#66bb6a' : '#90caf9'}`,
      borderRadius: '4px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      maxWidth: '400px',
      zIndex: 9999
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
        API Status: {apiStatus.toUpperCase()}
      </div>
      <div>{message}</div>
      <div style={{ marginTop: '10px', fontSize: '12px' }}>
        Check browser console for more details.
      </div>
    </div>
  );
};

export default ApiDebugger; 