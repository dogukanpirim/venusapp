
import { NextRequest, NextResponse } from 'next/server';
import { makeRobustGizmoRequest } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const hostId = searchParams.get('hostId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Test multiple reservation endpoints
    const endpoints = [
      '/api/reservations',
      '/api/booking',
      '/api/schedule',
      '/api/hostgroup',
      '/api/hostgroupreservations',
      '/api/hostgroupsessions',
      '/admin/reservations',
      '/reservations',
      '/booking'
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        const result = await makeRobustGizmoRequest(endpoint);
        results.push({
          endpoint,
          success: true,
          data: result,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        results.push({
          endpoint,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // If userId is provided, try user-specific reservation endpoints
    if (userId) {
      const userEndpoints = [
        `/api/users/${userId}/reservations`,
        `/api/members/${userId}/reservations`,
        `/users/${userId}/reservations`,
        `/members/${userId}/reservations`
      ];
      
      for (const endpoint of userEndpoints) {
        try {
          const result = await makeRobustGizmoRequest(endpoint);
          results.push({
            endpoint,
            success: true,
            data: result,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          results.push({
            endpoint,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          });
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      totalEndpoints: results.length,
      workingEndpoints: results.filter(r => r.success).length,
      failedEndpoints: results.filter(r => !r.success).length,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Reservations API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, hostId, startTime, endTime, duration } = body;
    
    // Test reservation creation endpoints
    const createEndpoints = [
      { path: '/api/reservations', method: 'POST' },
      { path: '/api/booking', method: 'POST' },
      { path: '/api/hostgroupreservations', method: 'POST' },
      { path: '/admin/reservations', method: 'POST' }
    ];
    
    const results = [];
    
    for (const endpoint of createEndpoints) {
      try {
        // Create reservation data
        const reservationData = {
          userId,
          hostId,
          startTime,
          endTime,
          duration,
          status: 'confirmed'
        };
        
        const result = await makeRobustGizmoRequest(endpoint.path, {
          method: 'POST',
          body: JSON.stringify(reservationData),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        results.push({
          endpoint: endpoint.path,
          method: endpoint.method,
          success: true,
          data: result,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        results.push({
          endpoint: endpoint.path,
          method: endpoint.method,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      action: 'create_reservation',
      totalEndpoints: results.length,
      workingEndpoints: results.filter(r => r.success).length,
      failedEndpoints: results.filter(r => !r.success).length,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create reservation API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
