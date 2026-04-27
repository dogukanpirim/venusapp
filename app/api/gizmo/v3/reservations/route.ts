// GET  /api/gizmo/v3/reservations              — müsait PC'leri listele
// POST /api/gizmo/v3/reservations              — rezervasyon oluştur
// GET  /api/gizmo/v3/reservations?list=1       — mevcut rezervasyonları listele
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGizmoClient } from '@/lib/gizmo/client';

export const dynamic = 'force-dynamic';

// Müsait PC'leri veya mevcut rezervasyonları getir
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const params = request.nextUrl.searchParams;
  const listExisting = params.get('list') === '1';

  try {
    const client = getGizmoClient();

    if (listExisting) {
      const userId = params.get('userId');
      const reservations = await client.reservations.list({
        userId: userId ? Number(userId) : undefined,
        limit: Number(params.get('limit') ?? 20),
      });
      return NextResponse.json({ success: true, ...reservations });
    }

    // Müsaitlik sorgula
    const start = params.get('start');
    const duration = params.get('duration');

    if (!start || !duration) {
      return NextResponse.json(
        { error: 'start (ISO tarih) ve duration (dakika) gereklidir' },
        { status: 400 },
      );
    }

    const available = await client.reservations.availability({
      start,
      duration: Number(duration),
      branchId: params.get('branchId') ? Number(params.get('branchId')) : undefined,
      limit: Number(params.get('limit') ?? 50),
    });

    return NextResponse.json({ success: true, ...available });
  } catch (err) {
    console.error('[/api/gizmo/v3/reservations] GET error:', err);
    return NextResponse.json({ error: 'Rezervasyon bilgisi alınamadı' }, { status: 500 });
  }
}

// Yeni rezervasyon oluştur
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { gizmoUserId, date, duration, contactPhone, contactEmail, note, hosts } = body;

    if (!date || !duration) {
      return NextResponse.json(
        { error: 'date (ISO) ve duration (dakika) gereklidir' },
        { status: 400 },
      );
    }

    const client = getGizmoClient();
    const result = await client.reservations.create({
      userId: gizmoUserId ? Number(gizmoUserId) : undefined,
      date,
      duration: Number(duration),
      contactPhone,
      contactEmail,
      note,
      hosts,
    });

    return NextResponse.json({
      success: true,
      reservationId: result.id,
      pin: result.pin, // 4 haneli rezervasyon PIN'i
    });
  } catch (err) {
    console.error('[/api/gizmo/v3/reservations] POST error:', err);
    return NextResponse.json({ error: 'Rezervasyon oluşturulamadı' }, { status: 500 });
  }
}

// Rezervasyon iptal
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'id gereklidir' }, { status: 400 });

    const client = getGizmoClient();
    await client.reservations.delete(Number(id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[/api/gizmo/v3/reservations] DELETE error:', err);
    return NextResponse.json({ error: 'Rezervasyon iptal edilemedi' }, { status: 500 });
  }
}
