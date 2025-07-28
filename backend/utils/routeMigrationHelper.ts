import { Request, Response, NextFunction } from 'express';

/**
 * Helper utilities for migrating Next.js API routes to Express
 */

// Convert Next.js style JSON response to Express
export const jsonResponse = (res: Response, data: any, status: number = 200) => {
  return res.status(status).json(data);
};

// Error response helper
export const errorResponse = (res: Response, error: string, details?: any, status: number = 500) => {
  return res.status(status).json({ 
    error, 
    ...(details && { details })
  });
};

// Async handler wrapper to catch errors
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Parse search params from Express request
export const getSearchParams = (req: Request): URLSearchParams => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  return url.searchParams;
};

// Get query parameters
export const getQueryParams = (req: Request) => {
  return req.query;
};

// Authentication middleware placeholder
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  // TODO: Implement actual auth check using cookies/session
  const authHeader = req.headers.authorization;
  const authCookie = req.cookies?.pb_auth;
  
  if (!authHeader && !authCookie) {
    return errorResponse(res, 'Unauthorized', null, 401);
  }
  
  // TODO: Validate token/session
  next();
};

