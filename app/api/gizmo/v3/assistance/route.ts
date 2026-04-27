// POST /api/gizmo/v3/assistance  — yardım talebi oluştur
// GET  /api/gizmo/v3/assistance  — bekleyen talepleri listele (admin)
// PUT  /api/gizmo/v3/assistance  — talebi kabul/reddet (admin)
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGizmoClient } from '@/lib/gizmo/client';

export const dynamic = 'force-dynamic';

// Müşteri yardım talebi oluşturur
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { hostId, gizmoUserId, note, assistanceRequestTypeId = 1 } = await request.json();

    const client = getGizmoClient();
    const result = await client.assistance.create({
      assistanceRequestTypeId: Number(assistanceRequestTypeId),
      userId: gizmoUserId ? Number(gizmoUserId) : undefined,
      hostId: hostId ? Number(hostId) : undefined,
      note,
    });

    return NextResponse.json({ success: true, id: result.id });
  } catch (err) {
    console.error('[/api/gizmo/v3/assistance] POST error:', err);
    return NextResponse.json({ error: 'Yardım talebi gönderilemedi' }, { status: 500 });
  }
}

// Admin: Tüm bekleyen talepleri listele
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: 'Admin yetkisi gereklidir' }, { status: 403 });
  }

  try {
    const client = getGizmoClient();
    const requests = await client.assistance.list({ limit: 50 });
    return NextResponse.json({ success: true, ...requests });
  } catch (err) {
    console.error('[/api/gizmo/v3/assistance] GET error:', err);
    return NextResponse.json({ error: 'Talepler alınamadı' }, { status: 500 });
  }
}

// Admin: Talebi kabul veya reddet
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: 'Admin yetkisi gereklidir' }, { status: 403 });
  }

  try {
    const { id, action } = await request.json();
    if (!id || !action) {
      return NextResponse.json({ error: 'id ve action (accept|reject) gereklidir' }, { status: 400 });
    }

    const client = getGizmoClient();
    if (action === 'accept') {
      await client.assistance.accept(Number(id));
    } else if (action === 'reject') {
      await client.assistance.reject(Number(id));
    } else {
      return NextResponse.json({ error: 'action accept veya reject olmalıdır' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[/api/gizmo/v3/assistance] PUT error:', err);
    return NextResponse.json({ error: 'İşlem gerçekleştirilemedi' }, { status: 500 });
  }
}
