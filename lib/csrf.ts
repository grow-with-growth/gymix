import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

/**
 * Generate a CSRF token and set it as a cookie
 * @returns The generated CSRF token
 */
export function generateCsrfToken(): string {
  const token = crypto.randomBytes(32).toString('hex');
  cookies().set('csrf_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 // 24 hours
  });
  return token;
}

/**
 * Verify that the CSRF token in the request matches the one in the cookie
 * @param request The Next.js request object
 * @returns True if the token is valid, false otherwise
 */
export function verifyCsrfToken(request: NextRequest): boolean {
  try {
    const cookieToken = request.cookies.get('csrf_token')?.value;
    if (!cookieToken) return false;
    
    // For POST requests, check the token in the request header
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
      const headerToken = request.headers.get('x-csrf-token');
      return headerToken === cookieToken;
    }
    
    return true;
  } catch (error) {
    console.error('CSRF verification error:', error);
    return false;
  }
}

/**
 * Middleware to protect routes from CSRF attacks
 * @param request The Next.js request object
 * @returns NextResponse
 */
export function csrfMiddleware(request: NextRequest) {
  // Skip CSRF check for GET requests and public paths
  if (request.method === 'GET') {
    return NextResponse.next();
  }
  
  // Verify CSRF token for non-GET requests
  if (!verifyCsrfToken(request)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    );
  }
  
  return NextResponse.next();
}

/**
 * Get the CSRF token for the current session
 * @returns The CSRF token or generates a new one if it doesn't exist
 */
export function getCsrfToken(): string {
  const cookieStore = cookies();
  const token = cookieStore.get('csrf_token')?.value;
  
  if (token) {
    return token;
  }
  
  return generateCsrfToken();
}