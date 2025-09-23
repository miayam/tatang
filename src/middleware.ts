// middleware.ts (in root directory)
import { getIronSession } from 'iron-session';
import { NextRequest, NextResponse } from 'next/server';

import { SessionData, sessionOptions } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Get session from request
  const session = await getIronSession<SessionData>(
    request,
    response,
    sessionOptions
  );

  const { pathname } = request.nextUrl;

  // Public routes that don't need authentication
  const publicRoutes = ['/login'];

  if (publicRoutes.includes(pathname)) {
    return response;
  }

  // Protected routes
  if (!session.isLoggedIn) {
    // Redirect to login if not authenticated
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
