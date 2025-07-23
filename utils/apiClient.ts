// API client utility to handle URLs correctly in dev and production
const getApiUrl = (endpoint: string): string => {
  // In production (deployed), use relative URLs
  if (process.env.NODE_ENV === 'production') {
    return endpoint;
  }
  
  // In development, use relative URLs (Next.js handles this correctly)
  return endpoint;
};

// Helper function for API calls
export const apiCall = async (endpoint: string, options?: RequestInit) => {
  const url = getApiUrl(endpoint);
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  };

  return fetch(url, defaultOptions);
};

export default apiCall; 