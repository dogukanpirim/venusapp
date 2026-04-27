// GET  /api/admin/quests          — tüm görevleri listele (admin)
// POST /api/admin/quests          — yeni görev oluştur
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const VALID_TARGETS = [
  'daily_login',
  'session_minutes',
  'session_milestones',
  'spend_try',
  'reservation',
  'match_won',
  'match_played',
  'match_event:kill',
  'match_event:ace',
  'match_event:clutch',
  'match_event:headshot',
  'match_event:mvp',
];

const VALID_TYPES = ['daily', 'weekly', 'special'];
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard', 'expert'];

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const tasks = await prisma.gamificationTask.findMany({
    orderBy: [{ isActive: 'desc' }, { type: 'asc' }, { createdAt: 'desc' }],
    include: {
      _count: { select: { completions: { where: { completed: true } } } },
    },
  });

  return NextResponse.json({ success: true, data: tasks });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      title,
      description,
      icon,
      type = 'daily',
      difficulty = 'easy',
      category = 'general',
      target,
      targetValue,
      xpReward = 0,
      creditsReward = 0,
      startDate,
      endDate,
      isActive = true,
      isRepeatable = true,
    } = body;

    if (!title || !description || !target || !targetValue) {
      return NextResponse.json(
        { error: 'title, description, target, targetValue zorunludur' },
        { status: 400 },
      );
    }
    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: `type: ${VALID_TYPES.join('|')}` }, { status: 400 });
    }
    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      return NextResponse.json(
        { error: `difficulty: ${VALID_DIFFICULTIES.join('|')}` },
        { status: 400 },
      );
    }
    if (!VALID_TARGETS.includes(target)) {
      return NextResponse.json(
        { error: `target geçersiz. Geçerli olanlar: ${VALID_TARGETS.join(', ')}` },
        { status: 400 },
      );
    }
    if (Number(targetValue) <= 0) {
      return NextResponse.json({ error: 'targetValue > 0 olmalıdır' }, { status: 400 });
    }

    const task = await prisma.gamificationTask.create({
      data: {
        title,
        description,
        icon: icon ?? null,
        type,
        difficulty,
        category,
        target,
        targetValue: Number(targetValue),
        xpReward: Number(xpReward),
        creditsReward: Number(creditsReward),
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        isActive,
        isRepeatable,
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (err) {
    console.error('[/api/admin/quests] POST error:', err);
    return NextResponse.json({ error: 'Görev oluşturulamadı' }, { status: 500 });
  }
}
