
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { makeRobustGizmoRequest } from '@/lib/utils';

export const dynamic = 'force-dynamic';

// Get all host computers with detailed information
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const endpoint = '/api/hostcomputers';

    const result = await makeRobustGizmoRequest(endpoint, {
      method: 'GET'
    });

    if (result.success) {
      const hosts = result.data || [];
      
      // Enhance host data with status information
      const enhancedHosts = hosts.map((host: any) => ({
        ...host,
        status: host.state || 'Unknown',
        isOnline: host.state === 'Online' || host.state === 'Available',
        uptime: host.uptime || 0,
        lastSeen: host.lastActivity || new Date().toISOString(),
        user: host.currentUser || null,
        session: host.currentSession || null
      }));

      return NextResponse.json({
        success: true,
        data: enhancedHosts,
        total: enhancedHosts.length,
        summary: {
          total: enhancedHosts.length,
          online: enhancedHosts.filter((h: any) => h.isOnline).length,
          offline: enhancedHosts.filter((h: any) => !h.isOnline).length,
          inUse: enhancedHosts.filter((h: any) => h.user).length,
          available: enhancedHosts.filter((h: any) => h.isOnline && !h.user).length
        },
        meta: {
          endpoint,
          fromCache: result.fromCache,
          retryCount: result.retryCount
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        meta: {
          endpoint,
          retryCount: result.retryCount
        }
      }, { status: result.status || 500 });
    }
  } catch (error) {
    console.error('Host management API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
