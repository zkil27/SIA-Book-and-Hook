import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

/**
 * Next 16 proxy (formerly middleware). Runs the edge-safe `authorized`
 * callback for /admin and /staff: signed-out → /login, wrong role →
 * /login?denied=1. Layouts, pages and every server action re-check the role
 * server-side as a second line of defence.
 */
const { auth } = NextAuth(authConfig);

export const proxy = auth;
export default auth;

export const config = {
  matcher: ['/admin/:path*', '/staff/:path*'],
};
