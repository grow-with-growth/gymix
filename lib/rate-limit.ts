import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory store for rate limiting
// In production, use Redis or another distributed store
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Rate limiting middleware
 * @param request The Next.js request object
 * @param limit Maximum number of requests allowed in the window
 * @param window Time window in seconds
 * @param identifier Function to extract the identifier from the request (defaults to IP)
 * @returns NextResponse or undefined to continue
 */
export function rateLimit(
  request: NextRequest,
  limit: number = 5,
  window: number = 60,
  identifier: (req: NextRequest) => string = (req) => req.ip || '127.0.0.1'
): NextResponse | undefined {
  const id = identifier(request);
  const now = Date.now();
  
  // Clean up expired entries
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
  
  // Initialize or get current count
  if (!store[id] || store[id].resetTime < now) {
    store[id] = {
      count: 1,
      resetTime: now + window * 1000
    };
    return undefined; // Allow the request
  }
  
  // Increment count
  store[id].count++;
  
  // Check if limit exceeded
  if (store[id].count > limit) {
    const retryAfter = Math.ceil((store[id].resetTime - now) / 1000);
    
    return NextResponse.json(
      { error: 'Too many requests, please try again later' },
      { 
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(store[id].resetTime / 1000).toString()
        }
      }
    );
  }
  
  return undefined; // Allow the request
}

/**
 * Rate limiting specifically for authentication endpoints
 * More strict limits for login attempts
 */
export function authRateLimit(request: NextRequest): NextResponse | undefined {
  // Stricter limits for authentication: 5 attempts per minute
  return rateLimit(request, 5, 60);
}