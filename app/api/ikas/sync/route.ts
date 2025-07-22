
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ikasGizmoBridge } from '@/lib/ikas-gizmo-bridge';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const { action } = await request.json();

    switch (action) {
      case 'sync_products':
        const syncResult = await ikasGizmoBridge.syncHardwareToIkas();
        return NextResponse.json({
          success: true,
          message: 'Ürünler İkas\'a aktarıldı',
          data: syncResult
        });

      case 'sync_user':
        const { gizmoUserId, userEmail, userName } = await request.json();
        const customer = await ikasGizmoBridge.syncGizmoUserToIkas(gizmoUserId, userEmail, userName);
        return NextResponse.json({
          success: true,
          message: 'Kullanıcı İkas\'a aktarıldı',
          data: customer
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Geçersiz işlem' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('İkas sync error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Bilinmeyen hata' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    // Return sync status and stats
    return NextResponse.json({
      success: true,
      data: {
        status: 'active',
        lastSync: new Date().toISOString(),
        // Add more sync status info here
      }
    });
  } catch (error) {
    console.error('İkas sync status error:', error);
    return NextResponse.json(
      { success: false, error: 'Sync durumu alınamadı' },
      { status: 500 }
    );
  }
}
