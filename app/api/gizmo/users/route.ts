
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

    // Use the robust Gizmo request function
    const result = await makeRobustGizmoRequest('/api/users', {
      method: 'GET'
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        authenticated: true,
        endpoint: '/api/users',
        fromCache: result.fromCache,
        fallback: result.fallback,
        retryCount: result.retryCount,
        ...(result.fromCache && { cacheStatus: 'HIT' }),
        ...(result.fallback && { fallbackReason: result.error })
      });
    } else {
      // Even on failure, return structured error with debug info
      return NextResponse.json({
        success: false,
        error: result.error,
        status: result.status,
        authenticated: true,
        endpoint: '/api/users',
        retryCount: result.retryCount,
        fallback: result.fallback,
        ...(result.fromCache && { cacheStatus: 'MISS' })
      }, { status: result.status || 500 });
    }
  } catch (error) {
    console.error('Gizmo users API error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
