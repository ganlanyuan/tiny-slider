import { NextResponse, type NextRequest } from 'next/server';

import { SESSION_COOKIE, verifySession } from '@/lib/session';

/**
 * Gate the dashboard at the edge so an unauthenticated request never reaches a
 * page that would render private numbers. Per-capability checks still happen in
 * every API route — this is the outer door, not the whole lock.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);

  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.search = `?next=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Someone already signed in has no use for the sign-in or sign-up pages.
  if ((pathname === '/login' || pathname === '/signup') && session) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Invitation links are deliberately left out: a signed-in user may still need
  // to open one, and the page itself explains what to do about it.
  matcher: ['/dashboard/:path*', '/login', '/signup'],
};
