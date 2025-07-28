import { createHmac } from 'crypto';

const secret = process.env.JWT_SECRET || 'your-secret-key';

function base64UrlEncode(str: string) {
  return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function createJwt(payload: object) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));

  const signature = createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyJwt(token: string) {
  const [encodedHeader, encodedPayload, signature] = token.split('.');

  const expectedSignature = createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  if (signature !== expectedSignature) {
    throw new Error('Invalid signature');
  }

  return JSON.parse(Buffer.from(encodedPayload, 'base64').toString());
}

