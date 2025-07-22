
import { NextRequest, NextResponse } from 'next/server';
import { makeRobustGizmoRequest } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Public access - no authentication required for PC status
    
    // Use the robust Gizmo request function
    const result = await makeRobustGizmoRequest('/api/hosts', {
      method: 'GET'
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        public: true,
        endpoint: '/api/hosts',
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
        public: true,
        endpoint: '/api/hosts',
        retryCount: result.retryCount,
        fallback: result.fallback,
        ...(result.fromCache && { cacheStatus: 'MISS' })
      }, { status: result.status || 500 });
    }
  } catch (error) {
    console.error('Gizmo hosts API error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
