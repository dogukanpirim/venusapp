// GET  /api/gizmo/v3/points?userId=N     — kullanıcı puan geçmişi
// POST /api/gizmo/v3/points              — puan ver / düş (gamification olaylarından çağrılır)
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGizmoClient } from '@/lib/gizmo/client';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = request.nextUrl.searchParams.get('userId');
  const limit = Number(request.nextUrl.searchParams.get('limit') ?? 20);

  try {
    const client = getGizmoClient();
    const transactions = await client.points.list({
      userId: userId ? Number(userId) : undefined,
      limit,
    });

    return NextResponse.json({ success: true, ...transactions });
  } catch (err) {
    console.error('[/api/gizmo/v3/points] GET error:', err);
    return NextResponse.json({ error: 'Puan geçmişi alınamadı' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { gizmoUserId, localUserId, amount, type = 'add', reason } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'amount (> 0) gereklidir' }, { status: 400 });
    }
    if (!gizmoUserId && !localUserId) {
      return NextResponse.json({ error: 'gizmoUserId veya localUserId gereklidir' }, { status: 400 });
    }

    const client = getGizmoClient();

    // ── Gizmo'ya puan yaz ─────────────────────────────────────
    let gizmoResult = null;
    if (gizmoUserId) {
      gizmoResult = type === 'subtract'
        ? await client.points.subtract(Number(gizmoUserId), Number(amount))
        : await client.points.add(Number(gizmoUserId), Number(amount));
    }

    // ── Yerel DB'ye de yaz (Player.totalPoints) ───────────────
    let localResult = null;
    if (localUserId) {
      localResult = await prisma.player.update({
        where: { userId: localUserId },
        data: {
          totalPoints: type === 'subtract'
            ? { decrement: Number(amount) }
            : { increment: Number(amount) },
        },
        select: { totalPoints: true, gamertag: true },
      });
    }

    return NextResponse.json({
      success: true,
      gizmoTransactionId: gizmoResult?.id ?? null,
      localTotalPoints: localResult?.totalPoints ?? null,
      reason,
    });
  } catch (err) {
    console.error('[/api/gizmo/v3/points] POST error:', err);
    return NextResponse.json({ error: 'Puan işlemi başarısız' }, { status: 500 });
  }
}
