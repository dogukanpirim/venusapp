// PATCH  /api/admin/quests/[id]   — görev güncelle (toggle active, edit fields)
// DELETE /api/admin/quests/[id]   — görev sil
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const updateData: any = {};

    const editable = [
      'title',
      'description',
      'icon',
      'type',
      'difficulty',
      'category',
      'target',
      'targetValue',
      'xpReward',
      'creditsReward',
      'isActive',
      'isRepeatable',
    ];
    for (const key of editable) {
      if (key in body) updateData[key] = body[key];
    }
    if ('startDate' in body) updateData.startDate = body.startDate ? new Date(body.startDate) : null;
    if ('endDate' in body) updateData.endDate = body.endDate ? new Date(body.endDate) : null;

    const task = await prisma.gamificationTask.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, task });
  } catch (err) {
    console.error('[/api/admin/quests/:id] PATCH error:', err);
    return NextResponse.json({ error: 'Güncellenemedi' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await prisma.gamificationTask.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[/api/admin/quests/:id] DELETE error:', err);
    return NextResponse.json({ error: 'Silinemedi' }, { status: 500 });
  }
}
