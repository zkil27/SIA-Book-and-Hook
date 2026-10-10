import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-safe auth config (no Prisma). The role is copied into the JWT at sign-in
 * (see auth.ts), so route protection here needs no database round trip.
 */
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      if (!nextUrl.pathname.startsWith('/admin')) return true;
      // Signed-out visitors are sent to /login (pages.signIn) by returning false.
      if (!auth?.user) return false;
      // Signed-in customers are rejected from every /admin route.
      if (auth.user.role !== 'ADMIN') {
        return Response.redirect(new URL('/login?denied=1', nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.name = user.name;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
