import type { NextAuthConfig } from 'next-auth';
import { asRole, canOpen, isGated } from './lib/roles';

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
      if (!isGated(nextUrl.pathname)) return true;
      // Signed-out visitors are sent to /login (pages.signIn) by returning false.
      if (!auth?.user) return false;
      // /admin is ADMIN only; /staff/pack, /staff/load and /staff/trip each
      // allow their own staff roles (lib/roles.ts). Anyone else is turned away.
      if (!canOpen(asRole(auth.user.role), nextUrl.pathname)) {
        return Response.redirect(new URL('/login?denied=1', nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.name = user.name;
        // Only the dev account switcher sets this; any normal sign-in clears it.
        token.devOrigin = user.devOrigin;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = asRole(token.role);
        session.user.devOrigin = token.devOrigin;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
