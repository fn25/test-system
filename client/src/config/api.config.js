/**
 * Get the API base URL based on environment
 * This function provides a fallback mechanism for API URL detection
 */
export const getApiUrl = () => {
  // 1. Check if REACT_APP_API_URL is set (build time or runtime)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // 2. Check if running in production (deployed)
  if (process.env.NODE_ENV === 'production') {
    // If hostname contains render.com, use Render backend URL
    if (window.location.hostname.includes('render.com')) {
      return 'https://test-system-1-yiph.onrender.com/api';
    }
    
    // If hostname contains vercel, netlify, etc., use Render backend URL
    if (window.location.hostname.includes('vercel.app') || 
        window.location.hostname.includes('netlify.app')) {
      return 'https://test-system-1-yiph.onrender.com/api';
    }
    
    // Default production URL
    return 'https://test-system-1-yiph.onrender.com/api';
  }

  // 3. Development fallback
  return 'http://localhost:10000/api';
};

export const API_CONFIG = {
  baseURL: getApiUrl(),
  timeout: 30000, // 30 seconds for production (Render cold starts can be slow)
  headers: {
    'Content-Type': 'application/json'
  }
};

export default API_CONFIG;
