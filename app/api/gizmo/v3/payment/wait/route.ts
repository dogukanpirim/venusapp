// GET /api/gizmo/v3/payment/wait?intent=GUID
// Gizmo v3 long-poll — ödeme tamamlanana kadar bekler
// Kullanım: frontend bu endpoint'i poll eder, Gizmo ödemeyi onaylayınca resolve olur
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGizmoClient } from '@/lib/gizmo/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const intent = request.nextUrl.searchParams.get('intent');
  if (!intent) {
    return NextResponse.json({ error: 'intent parametresi gereklidir' }, { status: 400 });
  }

  try {
    const client = getGizmoClient();
    // Gizmo'nun kendi long-poll endpoint'i — ödeme gelince döner
    const result = await client.payments.waitForIntent(intent);

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error('[/api/gizmo/v3/payment/wait] error:', err);
    return NextResponse.json({ error: 'Bekleme zaman aşımına uğradı', timeout: true }, { status: 408 });
  }
}
