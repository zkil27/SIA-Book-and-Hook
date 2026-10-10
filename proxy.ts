import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

/**
 * Next 16 proxy (formerly middleware). Runs the edge-safe `authorized`
 * callback for /admin: signed-out → /login, CUSTOMER → /login?denied=1.
 * Admin layouts re-check the role server-side as a second line of defence.
 */
export const { auth: proxy } = NextAuth(authConfig);

export const config = {
  matcher: ['/admin/:path*'],
};
