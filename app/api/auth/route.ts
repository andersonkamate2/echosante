import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { verifyLocalAdmin, getLocalAdminById } from '@/lib/data/auth';
import { createAuthCookie, clearAuthCookie, createAuthToken, verifyAuthToken } from '@/lib/auth-utils';

const ADMIN_ROLE = 'admin';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = String(body.email ?? '').trim();
  const password = String(body.password ?? '').trim();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
  }

  const localUser = await verifyLocalAdmin(email, password);
  if (!localUser) {
    return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
  }

  const token = createAuthToken({ userId: localUser.id, email: localUser.email, role: ADMIN_ROLE });
  const response = NextResponse.json({ data: { session: { user: { id: localUser.id, email: localUser.email, role: ADMIN_ROLE } } }, error: null });
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
