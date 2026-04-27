// GET /api/gizmo/v3/events?channel=sessions
// Gizmo v3 event streaming — long-poll wrapper
// Frontend bunu 3-5s aralıklarla çağırarak gerçek zamanlı güncellemeler alır
//
// Desteklenen kanallar:
//   sessions  — oturum açma/kapama olayları
//   payments  — ödeme tamamlama olayları
//   hosts     — PC durum değişimleri
//   any       — tüm olaylar
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGizmoClient } from '@/lib/gizmo/client';

export const dynamic = 'force-dynamic';

const ALLOWED_CHANNELS = ['sessions', 'payments', 'hosts', 'any', 'reservations', 'assistance'];

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const channel = request.nextUrl.searchParams.get('channel') ?? 'sessions';
  const filter = request.nextUrl.searchParams.get('filter') ?? undefined;

  if (!ALLOWED_CHANNELS.includes(channel)) {
    return NextResponse.json(
      { error: `Geçersiz kanal. İzin verilenler: ${ALLOWED_CHANNELS.join(', ')}` },
      { status: 400 },
    );
  }

  try {
    const client = getGizmoClient();
    const event = await client.events.next(channel, filter);

    if (!event) {
      // Timeout — yeni event yok, frontend tekrar sorsun
      return NextResponse.json({ event: null, timeout: true });
    }

    return NextResponse.json({ event, timeout: false });
  } catch (err) {
    console.error('[/api/gizmo/v3/events] error:', err);
    return NextResponse.json({ event: null, timeout: true, error: true });
  }
}
