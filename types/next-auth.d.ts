import type { DefaultSession } from 'next-auth';
import type { AppRole } from '@/lib/roles';

declare module 'next-auth' {
  interface User {
    role?: AppRole;
    /** Set only by the dev account switcher: the developer who switched in. */
    devOrigin?: string;
  }
  interface Session {
    user: { id: string; role: AppRole; devOrigin?: string } & DefaultSession['user'];
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    role?: AppRole;
    devOrigin?: string;
  }
}
