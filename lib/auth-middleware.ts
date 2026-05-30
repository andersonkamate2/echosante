import { cookies } from 'next/headers';
import { verifyAuthToken } from './auth-utils';
import { getLocalAdminById } from './prisma/auth';
import { DatabaseProvider } from './database/provider';

const database = DatabaseProvider.getInstance();
const useProdSupabaseAuth = database.useSupabase;

export interface CurrentUser {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('app_session_id')?.value;
  if (!token) {
    return null;
  }

  const payload = verifyAuthToken(token);
  if (!payload) {
    return null;
  }

  if (useProdSupabaseAuth) {
    return { id: payload.userId, email: payload.email, role: payload.role };
  }

  const user = await getLocalAdminById(payload.userId);
  return user ? { id: user.id, email: user.email, role: 'admin' } : null;
}

export async function requireAdminUser() {
  const user = await getCurrentUser();
  return user?.role === 'admin' ? user : null;
}
