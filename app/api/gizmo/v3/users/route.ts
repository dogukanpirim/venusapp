// GET  /api/gizmo/v3/users          — kullanıcı ara / listele
// GET  /api/gizmo/v3/users?id=N     — tek kullanıcı
// GET  /api/gizmo/v3/users?balance=N — kullanıcı bakiye
// POST /api/gizmo/v3/users          — yeni kullanıcı kayıt
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGizmoClient } from '@/lib/gizmo/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const params = request.nextUrl.searchParams;
  const id = params.get('id');
  const balance = params.get('balance');
  const search = params.get('search');
  const limit = Number(params.get('limit') ?? 20);

  try {
    const client = getGizmoClient();

    if (id && balance !== null) {
      // Bakiye sorgusu
      const userBalance = await client.users.getBalance(Number(id));
      return NextResponse.json({ success: true, ...userBalance });
    }

    if (id) {
      // Tek kullanıcı
      const user = await client.users.get(Number(id));
      return NextResponse.json({ success: true, user });
    }

    if (search) {
      // Arama
      const results = await client.users.search(search, { limit });
      return NextResponse.json({ success: true, ...results });
    }

    // Kullanıcı listesi
    const isLoggedIn = params.get('isLoggedIn');
    const users = await client.users.list({
      limit,
      isLoggedIn: isLoggedIn === '1' ? true : undefined,
      searchValue: params.get('q') ?? undefined,
    });
    return NextResponse.json({ success: true, ...users });
  } catch (err) {
    console.error('[/api/gizmo/v3/users] GET error:', err);
    return NextResponse.json({ error: 'Kullanıcı bilgisi alınamadı' }, { status: 500 });
  }
}

// Admin: Yeni kullanıcı kayıt
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: 'Admin yetkisi gereklidir' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const client = getGizmoClient();
    const result = await client.users.create(body);
    return NextResponse.json({ success: true, gizmoUserId: result.id });
  } catch (err) {
    console.error('[/api/gizmo/v3/users] POST error:', err);
    return NextResponse.json({ error: 'Kullanıcı oluşturulamadı' }, { status: 500 });
  }
}
