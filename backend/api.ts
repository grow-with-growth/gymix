// API utilities for the application
// This file provides helper functions for API route handlers

import { ApiResponse } from './types';
import { initializeDatabase, dbConnection } from './db';

// Initialize the database when the API module is imported
let dbInitialized = false;
const ensureDatabaseConnection = async () => {
  if (!dbInitialized) {
    dbInitialized = await initializeDatabase();
  }
  return dbInitialized;
};

// Generic API response handler
export const createApiResponse = <T>(
  data?: T,
  success: boolean = true,
  statusCode: number = 200,
  error?: string
): ApiResponse<T> => {
  return {
    success,
    data,
    error,
    statusCode
  };
};

// Error response helper
export const createErrorResponse = (
  message: string,
  statusCode: number = 500
): ApiResponse<null> => {
  return createApiResponse(null, false, statusCode, message);
};

// Wrapper for API handlers to handle errors consistently
export const withErrorHandling = <T, P>(
  handler: (params: P) => Promise<T>
) => {
  return async (params: P): Promise<ApiResponse<T>> => {
    try {
      // Ensure database is connected
      const isConnected = await ensureDatabaseConnection();
      if (!isConnected) {
        return createErrorResponse('Database connection failed', 503) as ApiResponse<T>;
      }

      // Execute the handler
      const result = await handler(params);
      return createApiResponse(result);
    } catch (error) {
      console.error('API Error:', error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      return createErrorResponse(message) as ApiResponse<T>;
    }
  };
};

// API rate limiting (simple in-memory implementation)
const requestCounts: Record<string, { count: number, timestamp: number }> = {};

export const rateLimiter = (
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): boolean => {
  const now = Date.now();
  
  // Clean up old entries
  Object.keys(requestCounts).forEach(key => {
    if (now - requestCounts[key].timestamp > windowMs) {
      delete requestCounts[key];
    }
  });
  
  // Initialize or update the request count
  if (!requestCounts[identifier]) {
    requestCounts[identifier] = { count: 1, timestamp: now };
    return true;
  }
  
  // Check if the rate limit is exceeded
  if (requestCounts[identifier].count >= maxRequests) {
    return false;
  }
  
  // Increment the request count
  requestCounts[identifier].count++;
  return true;
};

// Export the database connection for direct access
export { dbConnection };