
import { NextRequest, NextResponse } from 'next/server';
import { 
  makeRobustGizmoRequest, 
  clearAllGizmoCache,
  getCircuitBreakerStatus,
  getCacheStats,
  getGizmoAuthSession
} from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clearCache = searchParams.get('clearCache') === 'true';
    const testEndpoint = searchParams.get('endpoint') || '/api/users';
    const simulateFailure = searchParams.get('simulateFailure') === 'true';
    
    if (clearCache) {
      clearAllGizmoCache();
      return NextResponse.json({ 
        success: true,
        message: 'All caches cleared (auth + data)',
        cleared: true,
        circuitBreakerStatus: getCircuitBreakerStatus(),
        cacheStats: getCacheStats()
      });
    }

    // Get initial system status
    const initialCircuitBreakerStatus = getCircuitBreakerStatus();
    const initialCacheStats = getCacheStats();

    // Test single endpoint with detailed logging
    const testResults = [];
    const testCount = simulateFailure ? 6 : 1; // Test multiple times to trigger circuit breaker
    
    for (let i = 0; i < testCount; i++) {
      const startTime = Date.now();
      
      try {
        const result = await makeRobustGizmoRequest(testEndpoint, {
          method: 'GET'
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        let data = result.data;
        if (typeof data === 'string' && data.length > 300) {
          data = data.substring(0, 300) + '...';
        } else if (typeof data === 'object' && data !== null) {
          const jsonString = JSON.stringify(data);
          if (jsonString.length > 300) {
            data = jsonString.substring(0, 300) + '...';
          }
        }

        testResults.push({
          attempt: i + 1,
          endpoint: testEndpoint,
          status: result.status,
          success: result.success,
          data,
          fromCache: result.fromCache,
          fallback: result.fallback,
          retryCount: result.retryCount,
          error: result.error,
          responseTime,
          timestamp: new Date(startTime).toISOString()
        });
      } catch (error) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        testResults.push({
          attempt: i + 1,
          endpoint: testEndpoint,
          status: null,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          fromCache: false,
          fallback: false,
          retryCount: 0,
          responseTime,
          timestamp: new Date(startTime).toISOString()
        });
      }

      // Add small delay between attempts to see circuit breaker behavior
      if (i < testCount - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Get final system status
    const finalCircuitBreakerStatus = getCircuitBreakerStatus();
    const finalCacheStats = getCacheStats();

    // Test authentication status
    const authSession = await getGizmoAuthSession();

    return NextResponse.json({
      success: true,
      testConfiguration: {
        endpoint: testEndpoint,
        testCount,
        simulateFailure
      },
      authSession: authSession ? {
        authenticated: true,
        hasCookies: !!authSession.cookies,
        hasToken: !!authSession.token,
        timestamp: new Date(authSession.timestamp).toISOString()
      } : {
        authenticated: false
      },
      testResults,
      summary: {
        total: testResults.length,
        successful: testResults.filter(r => r.success).length,
        failed: testResults.filter(r => !r.success).length,
        fromCache: testResults.filter(r => r.fromCache).length,
        fallback: testResults.filter(r => r.fallback).length,
        retried: testResults.filter(r => r.retryCount && r.retryCount > 0).length,
        averageResponseTime: testResults.reduce((sum, r) => sum + r.responseTime, 0) / testResults.length
      },
      systemStatus: {
        initial: {
          circuitBreaker: initialCircuitBreakerStatus,
          cache: initialCacheStats
        },
        final: {
          circuitBreaker: finalCircuitBreakerStatus,
          cache: finalCacheStats
        },
        circuitBreakerChanged: JSON.stringify(initialCircuitBreakerStatus) !== JSON.stringify(finalCircuitBreakerStatus),
        cacheChanged: JSON.stringify(initialCacheStats) !== JSON.stringify(finalCacheStats)
      }
    });
  } catch (error) {
    console.error('Robust debug error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      circuitBreakerStatus: getCircuitBreakerStatus(),
      cacheStats: getCacheStats()
    }, { status: 500 });
  }
}
