import crypto from 'crypto';
import { COOKIE_NAME, ONE_YEAR_MS } from '../shared/const';

const AUTH_COOKIE_SECRET = process.env.AUTH_COOKIE_SECRET ?? process.env.NEXTAUTH_SECRET ?? 'dev-secret';
const MAX_AGE_SECONDS = 60 * 60 * 24; // 1 day

export interface AuthPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  exp: number;
}

export function createAuthToken(payload: Omit<AuthPayload, 'exp'>) {
  const exp = Date.now() + ONE_YEAR_MS;
  const body = `${payload.userId}|${payload.email}|${payload.role}|${exp}`;
  const signature = crypto.createHmac('sha256', AUTH_COOKIE_SECRET).update(body).digest('hex');
  return `${body}|${signature}`;
}

export function verifyAuthToken(token: string): AuthPayload | null {
  const parts = token.split('|');
  if (parts.length !== 5) return null;

  const [userId, email, role, expString, signature] = parts;
  const body = `${userId}|${email}|${role}|${expString}`;
  const expectedSignature = crypto.createHmac('sha256', AUTH_COOKIE_SECRET).update(body).digest('hex');
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  const exp = Number(expString);
  if (Number.isNaN(exp) || exp < Date.now()) {
    return null;
  }

  return { userId, email, role: role as AuthPayload['role'], exp };
}

export function createAuthCookie(value: string) {
  return {
    name: COOKIE_NAME,
    value,
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: MAX_AGE_SECONDS,
  };
}

export function clearAuthCookie() {
  return {
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 0,
  };
}
