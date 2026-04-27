// GET  /api/gizmo/v3/hosts           — tüm PC'leri listele
// POST /api/gizmo/v3/hosts           — PC'ye komut gönder (lock, alert, reboot, shutdown)
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGizmoClient } from '@/lib/gizmo/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const client = getGizmoClient();
    const limit = Number(request.nextUrl.searchParams.get('limit') ?? 100);
    const cursor = request.nextUrl.searchParams.get('cursor') ?? undefined;

    const hosts = await client.hosts.list({ limit, cursor });

    // Enrich each host with real-time connection status
    const connections = await client.hostComputers.getConnections().catch(() => []);
    const connMap = new Map(connections.map((c) => [c.hostId, c]));

    const enriched = hosts.data.map((h) => ({
      ...h,
      isOnline: connMap.get(h.id)?.isConnected ?? false,
      clientVersion: connMap.get(h.id)?.version ?? null,
    }));

    return NextResponse.json({ success: true, data: enriched, nextCursor: hosts.nextCursor });
  } catch (err) {
    console.error('[/api/gizmo/v3/hosts] GET error:', err);
    return NextResponse.json({ error: 'Host listesi alınamadı' }, { status: 500 });
  }
}

// PC kontrol komutları — sadece admin
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: 'Admin yetkisi gereklidir' }, { status: 403 });
  }

  try {
    const { hostId, action, payload } = await request.json();

    if (!hostId || !action) {
      return NextResponse.json({ error: 'hostId ve action gereklidir' }, { status: 400 });
    }

    const client = getGizmoClient();
    const id = Number(hostId);

    switch (action) {
      case 'lock':
        await client.hostComputers.setInputLock(id, true);
        return NextResponse.json({ success: true, message: `PC ${id} kilitlend` });

      case 'unlock':
        await client.hostComputers.setInputLock(id, false);
        return NextResponse.json({ success: true, message: `PC ${id} kilidi açıldı` });

      case 'alert':
        if (!payload?.message) {
          return NextResponse.json({ error: 'payload.message gereklidir' }, { status: 400 });
        }
        await client.hostComputers.sendAlert(id, {
          type: payload.type ?? 0,
          title: payload.title ?? 'VenusEspor Cafe',
          message: payload.message,
          waitForAcknowledged: payload.waitForAcknowledged ?? false,
        });
        return NextResponse.json({ success: true, message: 'Bildirim gönderildi' });

      case 'reboot':
        await client.hostComputers.reboot(id);
        return NextResponse.json({ success: true, message: `PC ${id} yeniden başlatılıyor` });

      case 'shutdown':
        await client.hostComputers.shutdown(id);
        return NextResponse.json({ success: true, message: `PC ${id} kapatılıyor` });

      case 'maintenance':
        await client.hostComputers.setMaintenance(id, payload?.enabled ?? true);
        return NextResponse.json({ success: true });

      case 'restart_client':
        await client.hostComputers.restartClient(id);
        return NextResponse.json({ success: true, message: `PC ${id} istemcisi yeniden başlatılıyor` });

      case 'screenshot':
        const screen = await client.hostComputers.captureScreen(id);
        return NextResponse.json({ success: true, screen });

      case 'processes':
        const procs = await client.hostComputers.getProcesses(id);
        return NextResponse.json({ success: true, processes: procs });

      default:
        return NextResponse.json(
          { error: `Bilinmeyen action: ${action}` },
          { status: 400 },
        );
    }
  } catch (err) {
    console.error('[/api/gizmo/v3/hosts] POST error:', err);
    return NextResponse.json({ error: 'Komut gönderilemedi' }, { status: 500 });
  }
}
