import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { verifyLocalAdmin, getLocalAdminById } from '@/lib/prisma/auth';
import { createAuthCookie, clearAuthCookie, createAuthToken, verifyAuthToken } from '@/lib/auth-utils';
import { DatabaseProvider } from '@/lib/database/provider';

const database = DatabaseProvider.getInstance();
const useProdSupabaseAuth = database.useSupabase;
const ADMIN_ROLE = 'admin';

function getSupabaseUserRole(user: any): string | undefined {
  return user?.app_metadata?.role ?? user?.user_metadata?.role;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = String(body.email ?? '').trim();
  const password = String(body.password ?? '').trim();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
  }

  let user: { id: string; email: string; role: string } | null = null;

  if (useProdSupabaseAuth) {
    database.assertSupabaseConfig();
    const { data, error } = await supabaseServer.auth.signInWithPassword({ email, password });
    if (error || !data?.session?.user) {
      return NextResponse.json({ error: error?.message ?? 'Échec de connexion' }, { status: 401 });
    }

    const role = getSupabaseUserRole(data.session.user);
    if (role !== ADMIN_ROLE) {
      return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 });
    }

    user = { id: data.session.user.id, email: data.session.user.email, role };
  } else {
    const localUser = await verifyLocalAdmin(email, password);
    if (!localUser) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }
    user = { id: localUser.id, email: localUser.email, role: ADMIN_ROLE };
  }

  const token = createAuthToken({ userId: user.id, email: user.email, role: user.role as 'admin' });
  const response = NextResponse.json({ data: { session: { user: { id: user.id, email: user.email, role: user.role } } }, error: null });
  response.cookies.set(createAuthCookie(token));
  return response;
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('app_session_id')?.value;
  if (!token) {
    return NextResponse.json({ data: { session: null }, error: null });
  }

  const payload = verifyAuthToken(token);
  if (!payload || payload.role !== ADMIN_ROLE) {
    const response = NextResponse.json({ data: { session: null }, error: null });
    response.cookies.set(clearAuthCookie());
    return response;
  }

  if (useProdSupabaseAuth) {
    return NextResponse.json({ data: { session: { user: { id: payload.userId, email: payload.email, role: payload.role } } }, error: null });
  }

  const user = await getLocalAdminById(payload.userId);
  if (!user) {
    const response = NextResponse.json({ data: { session: null }, error: null });
    response.cookies.set(clearAuthCookie());
    return response;
  }

  return NextResponse.json({ data: { session: { user: { id: user.id, email: user.email, role: ADMIN_ROLE } } }, error: null });
}

export async function DELETE() {
  const response = NextResponse.json({ data: { session: null }, error: null });
  response.cookies.set(clearAuthCookie());
  return response;
}
