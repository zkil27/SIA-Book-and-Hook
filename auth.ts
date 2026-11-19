import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { isDevEmail } from '@/lib/dev/emails';
import { readSwitchToken } from '@/lib/dev/switch-token';

export const { auth, signIn, signOut, handlers: { GET, POST } } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user) return null;
        if (!(await bcrypt.compare(password, user.passwordHash))) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
    /**
     * Dev account switcher (docs/dev-tools.md): sign in as another account
     * without its password. Accepts only a 60-second ticket signed with
     * AUTH_SECRET (lib/dev/switch-token.ts), and the developer who asked for
     * it must still be an ADMIN on the DEV_EMAILS allowlist. Fails closed.
     */
    Credentials({
      id: 'dev-switch',
      name: 'Dev account switch',
      credentials: { token: {} },
      async authorize(credentials) {
        const claim = readSwitchToken(String(credentials?.token ?? ''));
        if (!claim) return null;
        const [origin, target] = await Promise.all([
          prisma.user.findUnique({ where: { id: claim.originUserId }, select: { id: true, email: true, role: true } }),
          prisma.user.findUnique({ where: { id: claim.targetUserId }, select: { id: true, email: true, name: true, role: true } }),
        ]);
        if (!origin || origin.role !== 'ADMIN' || !isDevEmail(origin.email) || !target) return null;
        return {
          id: target.id,
          email: target.email,
          name: target.name,
          role: target.role,
          // Switching back to yourself clears the "viewing as" marker.
          devOrigin: target.id === origin.id ? undefined : origin.id,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
});
