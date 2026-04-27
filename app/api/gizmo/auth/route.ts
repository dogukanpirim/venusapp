// Gizmo v3 auth endpoint
// Called by NextAuth CredentialsProvider and directly from client tests
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { GizmoClient, GizmoError } from '@/lib/gizmo/client';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Kullanıcı adı ve şifre gereklidir', success: false },
        { status: 400 },
      );
    }

    const client = new GizmoClient();

    // ── 1. Gizmo v3 user auth ──────────────────────────────────
    let gizmoToken: string;
    try {
      const authResult = await client.getUserToken(username, password);
      gizmoToken = authResult.token;
    } catch (err) {
      if (err instanceof GizmoError && err.statusCode === 401) {
        return NextResponse.json(
          { error: 'Geçersiz kullanıcı adı veya şifre', success: false },
          { status: 401 },
        );
      }
      throw err;
    }

    // ── 2. Fetch user profile from Gizmo ──────────────────────
    let gizmoUser = null;
    try {
      const page = await client.users.list({ username, limit: 1 });
      gizmoUser = page.data?.[0] ?? null;
    } catch {
      // Non-fatal — we can proceed with minimal data
    }

    const email = gizmoUser?.email || `${username}@gizmo.local`;
    const name =
      gizmoUser
        ? [gizmoUser.firstName, gizmoUser.lastName].filter(Boolean).join(' ') ||
          gizmoUser.username
        : username;

    // ── 3. Upsert local user ───────────────────────────────────
    let localUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { email: `${username}@gizmo.local` }],
      },
    });

    if (!localUser) {
      localUser = await prisma.user.create({
        data: {
          email,
          password: 'gizmo_v3',
          name,
          isAdmin: false,
        },
      });

      await prisma.player.upsert({
        where: { gamertag: username },
        update: { userId: localUser.id },
        create: {
          userId: localUser.id,
          gamertag: username,
          displayName: name,
          email,
          isActive: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: localUser.id,
        username,
        email: localUser.email,
        name: localUser.name,
        isAdmin: localUser.isAdmin,
        source: 'gizmo_v3',
        gizmoToken,
        gizmoUserId: gizmoUser?.id ?? null,
      },
    });
  } catch (err) {
    console.error('[/api/gizmo/auth] Error:', err);

    if (err instanceof GizmoError) {
      return NextResponse.json(
        { error: 'Gizmo sistemi şu anda kullanılamıyor', success: false },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: 'Sunucu hatası', success: false }, { status: 500 });
  }
}
