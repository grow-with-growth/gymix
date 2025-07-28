import crypto from 'crypto';

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function validateCsrfToken(token: string, sessionToken: string): boolean {
  return token === sessionToken;
}

