import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware for route protection
 * - Redirects unauthenticated users trying to access protected routes
 * - All admin routes (/admin/*) are protected by this middleware
 * - All user routes (/user/*) are protected by this middleware
 * - All organization routes (/organization/*) are protected by this middleware
 *
 * Note: JWT token validation and role checking is done client-side via useRouteProtection hook
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get('auth_token')?.value;

  // Allow admin login page without authentication
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Protect user routes
  if (pathname.startsWith('/user')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect organization routes
  if (pathname.startsWith('/organization')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

/**
 * Configure which routes should be protected by middleware
 */
export const config = {
  matcher: ['/admin/:path*', '/user/:path*', '/organization/:path*'],
};
