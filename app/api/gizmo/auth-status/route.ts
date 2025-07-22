
import { NextRequest, NextResponse } from 'next/server';
import { 
  getGizmoAuthSession, 
  makeRobustGizmoRequest, 
  clearAllGizmoCache,
  getCircuitBreakerStatus,
  getCacheStats
} from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clearCache = searchParams.get('clearCache') === 'true';
    
    if (clearCache) {
      clearAllGizmoCache();
      return NextResponse.json({ 
        success: true,
        message: 'All caches cleared (auth + data)',
        cleared: true 
      });
    }

    // Get system status
    const circuitBreakerStatus = getCircuitBreakerStatus();
    const cacheStats = getCacheStats();

    // Test authentication
    const authSession = await getGizmoAuthSession();
    
    if (!authSession) {
      return NextResponse.json({ 
        success: false,
        authenticated: false,
        error: 'Failed to authenticate with Gizmo API',
        adminCredentials: { username: 'admin', password: '123455' },
        circuitBreakerStatus,
        cacheStats
      });
    }

    // Test authenticated endpoints with robust system
    const testEndpoints = [
      '/api/users',
      '/api/hosts',
      '/api/members',
      '/api/users/dogukan',
      '/api/users/dogukan/balance'
    ];

    const testResults = [];
    
    for (const endpoint of testEndpoints) {
      try {
        const result = await makeRobustGizmoRequest(endpoint, {
          method: 'GET'
        });

        let data = result.data;
        if (typeof data === 'string' && data.length > 200) {
          data = data.substring(0, 200) + '...';
        } else if (typeof data === 'object' && data !== null) {
          // Truncate object for display
          const jsonString = JSON.stringify(data);
          if (jsonString.length > 200) {
            data = jsonString.substring(0, 200) + '...';
          }
        }

        testResults.push({
          endpoint,
          status: result.status,
          success: result.success,
          data,
          authenticated: true,
          fromCache: result.fromCache,
          fallback: result.fallback,
          retryCount: result.retryCount,
          error: result.error
        });
      } catch (error) {
        testResults.push({
          endpoint,
          status: null,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          authenticated: false,
          fromCache: false,
          fallback: false,
          retryCount: 0
        });
      }
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      authSession: {
        hasCookies: !!authSession.cookies,
        hasToken: !!authSession.token,
        timestamp: new Date(authSession.timestamp).toISOString()
      },
      adminCredentials: { username: 'admin', password: '123455' },
      testResults,
      summary: {
        total: testResults.length,
        successful: testResults.filter(r => r.success).length,
        failed: testResults.filter(r => !r.success).length,
        fromCache: testResults.filter(r => r.fromCache).length,
        fallback: testResults.filter(r => r.fallback).length,
        retried: testResults.filter(r => r.retryCount && r.retryCount > 0).length
      },
      circuitBreakerStatus,
      cacheStats
    });
  } catch (error) {
    console.error('Gizmo auth status error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
