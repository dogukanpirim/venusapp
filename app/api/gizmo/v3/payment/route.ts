// POST /api/gizmo/v3/payment
// Gizmo v3 QR para yükleme — qrImage + nativeQrImage döndürür
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGizmoClient } from '@/lib/gizmo/client';

export const dynamic = 'force-dynamic';

// POST — Yeni ödeme intent'i oluştur (QR kod üret)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gizmoUserId, amount, paymentMethodId = 1 } = await request.json();

    if (!gizmoUserId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'gizmoUserId ve amount (> 0) gereklidir' },
        { status: 400 },
      );
    }

    const client = getGizmoClient();
    const result = await client.payments.createIntent({
      userId: Number(gizmoUserId),
      amount: Number(amount),
      paymentMethodId: Number(paymentMethodId),
    });

    return NextResponse.json({
      success: true,
      paymentIntent: result.paymentIntent,
      paymentUrl: result.paymentUrl,
      qrImage: result.qrImage,         // base64 — doğrudan <img src="data:image/png;base64,...">
      nativeQrImage: result.nativeQrImage,
      provider: result.provider,
    });
  } catch (err) {
    console.error('[/api/gizmo/v3/payment] POST error:', err);
    return NextResponse.json({ error: 'Ödeme intent oluşturulamadı' }, { status: 500 });
  }
}

// GET /api/gizmo/v3/payment?intent=GUID — ödeme durumu sorgula
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const intent = request.nextUrl.searchParams.get('intent');
    if (!intent) {
      return NextResponse.json({ error: 'intent parametresi gereklidir' }, { status: 400 });
    }

    const client = getGizmoClient();
    const status = await client.payments.getIntent(intent);

    return NextResponse.json({ success: true, ...status });
  } catch (err) {
    console.error('[/api/gizmo/v3/payment] GET error:', err);
    return NextResponse.json({ error: 'Ödeme durumu alınamadı' }, { status: 500 });
  }
}
