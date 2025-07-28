import { API_ENDPOINTS } from '../config/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

/**
 * Helper function to make API calls with consistent configuration
 * @param endpoint - The API endpoint path (e.g., '/calendar/events')
 * @param options - Fetch options with additional params support
 * @returns Promise with the response
 */
export async function apiCall<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;
  
  // Build URL with params if provided
  let url = endpoint;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url = `${endpoint}?${searchParams.toString()}`;
  }
  
  // Ensure credentials are included for authentication
  const finalOptions: RequestInit = {
    ...fetchOptions,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  };
  
  const response = await fetch(url, finalOptions);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `API call failed: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Helper to construct full API URLs
 * @param service - The service name from API_ENDPOINTS
 * @param path - Additional path segments
 * @returns Full API URL
 */
export function getApiUrl(service: keyof typeof API_ENDPOINTS, path: string = ''): string {
  const baseUrl = API_ENDPOINTS[service];
  return path ? `${baseUrl}${path}` : baseUrl;
}

/**
 * Common API methods with proper error handling
 */
export const api = {
  get: <T = any>(endpoint: string, params?: Record<string, string>) => 
    apiCall<T>(endpoint, { method: 'GET', params }),
    
  post: <T = any>(endpoint: string, data?: any) => 
    apiCall<T>(endpoint, { 
      method: 'POST', 
      body: data ? JSON.stringify(data) : undefined 
    }),
    
  put: <T = any>(endpoint: string, data?: any) => 
    apiCall<T>(endpoint, { 
      method: 'PUT', 
      body: data ? JSON.stringify(data) : undefined 
    }),
    
  delete: <T = any>(endpoint: string) => 
    apiCall<T>(endpoint, { method: 'DELETE' }),
    
  patch: <T = any>(endpoint: string, data?: any) => 
    apiCall<T>(endpoint, { 
      method: 'PATCH', 
      body: data ? JSON.stringify(data) : undefined 
    }),
};

