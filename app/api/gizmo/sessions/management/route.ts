
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { makeRobustGizmoRequest } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'active', 'ended', 'all'
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query parameters
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const queryString = params.toString();
    const endpoint = `/api/usersessions${queryString ? `?${queryString}` : ''}`;

    const result = await makeRobustGizmoRequest(endpoint, {
      method: 'GET'
    });

    if (result.success) {
      let sessions = result.data || [];
      
      // Filter by status if specified
      if (status && Array.isArray(sessions)) {
        switch (status) {
          case 'active':
            sessions = sessions.filter((s: any) => !s.endTime);
            break;
          case 'ended':
            sessions = sessions.filter((s: any) => s.endTime);
            break;
          default:
            // Return all sessions
            break;
        }
      }

      // Calculate session statistics
      const activeSessions = sessions.filter((s: any) => !s.endTime);
      const endedSessions = sessions.filter((s: any) => s.endTime);
      const totalDuration = endedSessions.reduce((sum: number, s: any) => {
        const duration = s.duration || 0;
        return sum + duration;
      }, 0);

      return NextResponse.json({
        success: true,
        data: sessions,
        total: sessions.length,
        summary: {
          total: sessions.length,
          active: activeSessions.length,
          ended: endedSessions.length,
          totalDuration: totalDuration,
          averageDuration: endedSessions.length > 0 ? totalDuration / endedSessions.length : 0
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
    console.error('Sessions management API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
