
import { NextRequest, NextResponse } from 'next/server';
import { makeRobustGizmoRequest } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || '/api/users';
    
    console.log(`Testing Gizmo API endpoint: ${endpoint}`);
    
    const result = await makeRobustGizmoRequest(endpoint, {
      method: 'GET'
    });
    
    return NextResponse.json({
      success: result.success,
      endpoint: endpoint,
      data: result.data,
      error: result.error,
      status: result.status,
      fromCache: result.fromCache,
      fallback: result.fallback,
      retryCount: result.retryCount,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Gizmo debug API error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { endpoint, method = 'GET', body } = await request.json();
    
    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 });
    }
    
    console.log(`Testing Gizmo API endpoint: ${endpoint} with method: ${method}`);
    
    const result = await makeRobustGizmoRequest(endpoint, {
      method,
      ...(body && { body: JSON.stringify(body) })
    });
    
    return NextResponse.json({
      success: result.success,
      endpoint: endpoint,
      method: method,
      data: result.data,
      error: result.error,
      status: result.status,
      fromCache: result.fromCache,
      fallback: result.fallback,
      retryCount: result.retryCount,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Gizmo debug API error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
