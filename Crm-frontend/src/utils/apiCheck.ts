import axios from 'axios';
import { debugLog, debugError } from './debug';

// Function to verify API connection
export const checkApiConnection = async (url: string): Promise<boolean> => {
  try {
    debugLog('APICheck', `Testing connection to ${url}`);
    
    // For health check, we need to use the root URL (without /api)
    // The health endpoint is at the server root, not under /api
    let checkUrl: string;
    if (url.endsWith('/health')) {
      checkUrl = url;
    } else {
      // Remove /api from the URL for health check since health is at root level
      const rootUrl = url.replace('/api', '');
      checkUrl = `${rootUrl}/health`;
    }
    
    // Set a short timeout to quickly identify connectivity issues
    const response = await axios.get(checkUrl, { 
      timeout: 5000,
      validateStatus: () => true // Accept any status to check connectivity
    });
    
    const success = response.status >= 200 && response.status < 500;
    
    if (success) {
      debugLog('APICheck', `Connection to ${url} successful with status ${response.status}`);
    } else {
      debugError('APICheck', `Connection to ${url} failed with status ${response.status}`);
    }
    
    return success;
  } catch (error) {
    debugError('APICheck', `Connection to ${url} failed:`, error);
    return false;
  }
};

// Simplified check that doesn't actually make a network request
// Useful to verify API_URL is correctly set
export const verifyApiUrl = (url: string): boolean => {
  if (!url) {
    debugError('APICheck', 'API URL is empty');
    return false;
  }
  
  try {
    // Handle relative paths (starting with /)
    if (url.startsWith('/')) {
      debugLog('APICheck', `API URL is a relative path: ${url}`);
      return true;
    }
    
    // Check if URL is valid for absolute URLs
    new URL(url);
    debugLog('APICheck', `API URL format is valid: ${url}`);
    return true;
  } catch {
    debugError('APICheck', `API URL format is invalid: ${url}`);
    return false;
  }
};

export default {
  checkApiConnection,
  verifyApiUrl
}; 