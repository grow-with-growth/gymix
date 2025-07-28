import { CookieOptions } from 'next/dist/server/web/spec-extension/cookies';

/**
 * Get secure cookie options based on the environment
 * @param maxAge Cookie max age in seconds (default: 7 days)
 * @returns Cookie options object
 */
export function getSecureCookieOptions(maxAge: number = 60 * 60 * 24 * 7): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge,
    // Add additional security options
    ...(process.env.NODE_ENV === 'production' && {
      domain: process.env.COOKIE_DOMAIN, // Set this in your .env file
    })
  };
}

/**
 * Get secure cookie options for authentication cookies
 * @param maxAge Cookie max age in seconds (default: 7 days)
 * @returns Cookie options object
 */
export function getAuthCookieOptions(maxAge: number = 60 * 60 * 24 * 7): CookieOptions {
  return {
    ...getSecureCookieOptions(maxAge),
    // Additional security for auth cookies
    sameSite: 'lax', // Allow cross-site requests for login redirects
  };
}