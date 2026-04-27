import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/db';
import { GizmoClient, GizmoError } from '@/lib/gizmo/client';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      id: 'gizmo',
      name: 'Gizmo',
      credentials: {
        username: { label: 'Kullanıcı Adı', type: 'text' },
        password: { label: 'Şifre', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        try {
          // ── 1. Authenticate against Gizmo v3 ──────────────────────
          const client = new GizmoClient();
          const authResult = await client.getUserToken(
            credentials.username,
            credentials.password,
          );
          // authResult.token is the user JWT from Gizmo

          // ── 2. Find the user in Gizmo to get their numeric ID ─────
          const operatorClient = new GizmoClient(); // operator auth for user lookup
          const usersPage = await operatorClient.users.list({
            username: credentials.username,
            limit: 1,
          });

          const gizmoUser = usersPage.data?.[0] ?? null;

          // ── 3. Upsert user in local DB ────────────────────────────
          const email = gizmoUser?.email || `${credentials.username}@gizmo.local`;
          const name =
            gizmoUser
              ? [gizmoUser.firstName, gizmoUser.lastName].filter(Boolean).join(' ') ||
                gizmoUser.username
              : credentials.username;

          let localUser = await prisma.user.findFirst({
            where: {
              OR: [
                { email },
                { email: `${credentials.username}@gizmo.local` },
              ],
            },
          });

          if (!localUser) {
            localUser = await prisma.user.create({
              data: {
                email,
                password: 'gizmo_v3', // placeholder — auth via Gizmo
                name,
                isAdmin: false,
              },
            });

            // Create linked Player record
            await prisma.player.upsert({
              where: { gamertag: credentials.username },
              update: { userId: localUser.id },
              create: {
                userId: localUser.id,
                gamertag: credentials.username,
                displayName: name,
                email,
                isActive: true,
              },
            });
          }

          return {
            id: localUser.id,
            email: localUser.email,
            name: localUser.name ?? credentials.username,
            username: credentials.username,
            isAdmin: localUser.isAdmin ?? false,
            source: 'gizmo_v3',
            gizmoToken: authResult.token,
            gizmoUserId: gizmoUser?.id ?? null,
          };
        } catch (err) {
          if (err instanceof GizmoError) {
            console.error('[Auth] Gizmo v3 auth failed:', err.message, err.statusCode);
          } else {
            console.error('[Auth] Unexpected error:', err);
          }
          return null;
        }
      },
    }),
  ],

  session: { strategy: 'jwt' },

  pages: { signIn: '/auth/signin' },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as any).isAdmin;
        token.username = (user as any).username;
        token.source = (user as any).source;
        token.gizmoToken = (user as any).gizmoToken;
        token.gizmoUserId = (user as any).gizmoUserId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).isAdmin = token.isAdmin;
        (session.user as any).username = token.username;
        (session.user as any).source = token.source;
        (session.user as any).gizmoToken = token.gizmoToken;
        (session.user as any).gizmoUserId = token.gizmoUserId;
      }
      return session;
    },
  },
};
