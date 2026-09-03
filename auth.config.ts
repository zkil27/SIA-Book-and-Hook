import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      
      if (isOnAdmin) {
        if (isLoggedIn) {
          // Additional role check would ideally happen here, but Auth.js v5 edge compatibility
          // with Prisma requires us to handle role checks carefully.
          // For now, if logged in, let them through; we will check roles in the layout/pages.
          // Alternatively, we could check auth.user.role if we extend the session type.
          return true;
        }
        return false; // Redirect unauthenticated users to login page
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
