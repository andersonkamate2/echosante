import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuthToken } from '@/lib/auth-utils';

const ADMIN_LOGIN_PATH = '/admin/login';
const ADMIN_BASE_PATH = '/admin';
const ADMIN_ROLE = 'admin';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!pathname.startsWith(ADMIN_BASE_PATH)) {
    return NextResponse.next();
  }

  const token = request.cookies.get('app_session_id')?.value;
  const payload = token ? verifyAuthToken(token) : null;
  const isAdmin = payload?.role === ADMIN_ROLE;

  if (pathname === ADMIN_LOGIN_PATH) {
    if (isAdmin) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/admin/dashboard';
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  if (!isAdmin) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = ADMIN_LOGIN_PATH;
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
