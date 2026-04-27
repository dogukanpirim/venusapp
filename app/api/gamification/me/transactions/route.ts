// GET /api/gamification/me/transactions?limit=20&cursor=...&source=session_duration
// Sayfalanabilir coin işlem geçmişi
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const params = req.nextUrl.searchParams;
  const limit = Math.min(100, Number(params.get('limit') ?? 20));
  const cursor = params.get('cursor');
  const source = params.get('source');
  const type = params.get('type'); // EARN | SPEND

  const transactions = await prisma.coinTransaction.findMany({
    where: {
      userId,
      ...(source && { source }),
      ...(type && { type: type as any }),
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor && { skip: 1, cursor: { id: cursor } }),
    select: {
      id: true,
      type: true,
      amount: true,
      balanceAfter: true,
      source: true,
      sourceId: true,
      description: true,
      gizmoTransactionId: true,
      syncedToGizmo: true,
      createdAt: true,
    },
  });

  const hasMore = transactions.length > limit;
  const data = hasMore ? transactions.slice(0, -1) : transactions;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return NextResponse.json({ success: true, data, nextCursor });
}
