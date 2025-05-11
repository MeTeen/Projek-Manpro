// Debug utility to help troubleshoot network issues
const DEBUG = true;

export const debugLog = (context: string, ...args: unknown[]): void => {
  if (DEBUG) {
    console.log(`[DEBUG:${context}]`, ...args);
  }
};

export const debugError = (context: string, ...args: unknown[]): void => {
  if (DEBUG) {
    console.error(`[ERROR:${context}]`, ...args);
  }
};

// Debug helper for requests
export const logRequest = (method: string, url: string, data?: unknown): void => {
  if (DEBUG) {
    console.log(`[REQUEST] ${method.toUpperCase()} ${url}`);
    if (data) {
      console.log('Request Data:', data);
    }
  }
};

// Debug helper for responses
export const logResponse = (method: string, url: string, response: unknown): void => {
  if (DEBUG) {
    console.log(`[RESPONSE] ${method.toUpperCase()} ${url}`, response);
  }
};

// Debug helper for errors
export const logNetworkError = (method: string, url: string, error: unknown): void => {
  if (DEBUG) {
    console.error(`[NETWORK ERROR] ${method.toUpperCase()} ${url}`);
    if (error && typeof error === 'object') {
      const err = error as any; // Type assertion for accessing properties
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response Status:', err.response.status);
        console.error('Response Headers:', err.response.headers);
        console.error('Response Data:', err.response.data);
      } else if (err.request) {
        // The request was made but no response was received
        console.error('Request made but no response received');
        console.error('Request:', err.request);
      } else if (err.message) {
        // Something happened in setting up the request that triggered an Error
        console.error('Error Message:', err.message);
      }
      if (err.config) {
        console.error('Error Config:', err.config);
      }
    } else {
      console.error('Unknown error:', error);
    }
  }
};

export default {
  debugLog,
  debugError,
  logRequest,
  logResponse,
  logNetworkError
}; 