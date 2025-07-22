
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function testGizmoEndpoint(url: string, method: string = 'GET', headers: any = {}) {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'ngrok-skip-browser-warning': 'true',
        ...headers
      }
    });

    const contentType = response.headers.get('content-type');
    let data = null;
    
    if (contentType?.includes('application/json')) {
      try {
        data = await response.json();
      } catch (e) {
        data = 'Invalid JSON response';
      }
    } else {
      const text = await response.text();
      data = text.length > 1000 ? text.substring(0, 1000) + '...' : text;
    }

    return {
      url,
      method,
      status: response.status,
      statusText: response.statusText,
      contentType,
      headers: Object.fromEntries(response.headers.entries()),
      success: response.ok,
      data
    };
  } catch (error) {
    return {
      url,
      method,
      status: null,
      statusText: null,
      contentType: null,
      headers: {},
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function analyzeGizmoAPI() {
  const baseUrl = 'https://5f86bd85fd1c.ngrok-free.app';
  const results = [];

  // Test root and common endpoints including reservations
  const endpoints = [
    { path: '/', method: 'GET', description: 'Root page' },
    { path: '/memberregistration', method: 'GET', description: 'Member registration form' },
    { path: '/memberregistration/complete', method: 'POST', description: 'Member registration submit' },
    { path: '/login', method: 'GET', description: 'Login page' },
    { path: '/api', method: 'GET', description: 'API root' },
    { path: '/api/auth', method: 'GET', description: 'Auth endpoint' },
    { path: '/api/authenticate', method: 'POST', description: 'Authentication' },
    { path: '/api/users', method: 'GET', description: 'Users API' },
    { path: '/api/members', method: 'GET', description: 'Members API' },
    { path: '/api/balance', method: 'GET', description: 'Balance API' },
    { path: '/api/sessions', method: 'GET', description: 'Sessions API' },
    { path: '/api/transactions', method: 'GET', description: 'Transactions API' },
    { path: '/api/hosts', method: 'GET', description: 'Hosts API' },
    { path: '/api/reservations', method: 'GET', description: 'Reservations API' },
    { path: '/api/booking', method: 'GET', description: 'Booking API' },
    { path: '/api/schedule', method: 'GET', description: 'Schedule API' },
    { path: '/api/hostgroup', method: 'GET', description: 'Host Groups API' },
    { path: '/api/hostgroupreservations', method: 'GET', description: 'Host Group Reservations API' },
    { path: '/api/hostgroupsessions', method: 'GET', description: 'Host Group Sessions API' },
    { path: '/admin', method: 'GET', description: 'Admin panel' },
    { path: '/admin/users', method: 'GET', description: 'Admin users' },
    { path: '/admin/members', method: 'GET', description: 'Admin members' },
    { path: '/admin/reservations', method: 'GET', description: 'Admin reservations' },
    { path: '/dashboard', method: 'GET', description: 'Dashboard' },
    { path: '/users', method: 'GET', description: 'Users page' },
    { path: '/members', method: 'GET', description: 'Members page' },
    { path: '/reservations', method: 'GET', description: 'Reservations page' },
    { path: '/booking', method: 'GET', description: 'Booking page' },
    { path: '/users/dogukan', method: 'GET', description: 'Dogukan user profile' },
    { path: '/members/dogukan', method: 'GET', description: 'Dogukan member profile' },
    { path: '/balance/dogukan', method: 'GET', description: 'Dogukan balance' },
    { path: '/api/users/dogukan', method: 'GET', description: 'Dogukan user API' },
    { path: '/api/members/dogukan', method: 'GET', description: 'Dogukan member API' },
    { path: '/api/balance/dogukan', method: 'GET', description: 'Dogukan balance API' },
    { path: '/api/users/dogukan/reservations', method: 'GET', description: 'Dogukan reservations' },
    { path: '/api/members/dogukan/reservations', method: 'GET', description: 'Dogukan member reservations' },
  ];

  for (const endpoint of endpoints) {
    const result = await testGizmoEndpoint(
      `${baseUrl}${endpoint.path}`,
      endpoint.method,
      endpoint.method === 'POST' ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}
    );
    
    results.push({
      ...result,
      description: endpoint.description
    });
  }

  return results;
}

export async function GET(request: NextRequest) {
  try {
    const results = await analyzeGizmoAPI();
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      gizmoApiUrl: 'https://5f86bd85fd1c.ngrok-free.app',
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        unauthorized: results.filter(r => r.status === 401).length,
        notFound: results.filter(r => r.status === 404).length
      },
      results
    });
  } catch (error) {
    console.error('Gizmo explore API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
