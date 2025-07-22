
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Authentication helper function
async function authenticateWithGizmo() {
  const baseUrl = 'https://5f86bd85fd1c.ngrok-free.app';
  const adminCredentials = { username: 'admin', password: '123455' };
  
  // Test different authentication endpoints with provided credentials
  const authEndpoints = [
    { path: '/api/auth', method: 'POST', description: 'API Auth' },
    { path: '/api/authenticate', method: 'POST', description: 'API Authenticate' },
    { path: '/login', method: 'POST', description: 'Login' },
    { path: '/admin/login', method: 'POST', description: 'Admin Login' },
    { path: '/auth/login', method: 'POST', description: 'Auth Login' },
    { path: '/Account/Login', method: 'POST', description: 'Account Login' }
  ];

  const results = [];
  let authToken = null;
  let authCookies = null;

  for (const endpoint of authEndpoints) {
    try {
      // Try form data
      const formData = new URLSearchParams();
      formData.append('username', adminCredentials.username);
      formData.append('password', adminCredentials.password);
      formData.append('UseName', adminCredentials.username);
      formData.append('Password', adminCredentials.password);
      
      const response = await fetch(`${baseUrl}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'ngrok-skip-browser-warning': 'true'
        },
        body: formData.toString()
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
        data = text.length > 500 ? text.substring(0, 500) + '...' : text;
      }

      const cookies = response.headers.get('set-cookie');
      
      results.push({
        endpoint: endpoint.path,
        description: endpoint.description,
        credentials: adminCredentials,
        status: response.status,
        statusText: response.statusText,
        contentType,
        success: response.ok,
        data: data,
        cookies: cookies,
        headers: Object.fromEntries(response.headers.entries())
      });

      // If successful, store auth info
      if (response.ok && cookies) {
        authToken = data?.token || null;
        authCookies = cookies;
      }
      
      // Also try JSON payload
      if (!response.ok) {
        try {
          const jsonResponse = await fetch(`${baseUrl}${endpoint.path}`, {
            method: endpoint.method,
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify(adminCredentials)
          });

          if (jsonResponse.ok) {
            const jsonData = await jsonResponse.json();
            const jsonCookies = jsonResponse.headers.get('set-cookie');
            
            results.push({
              endpoint: endpoint.path + ' (JSON)',
              description: endpoint.description + ' - JSON format',
              credentials: adminCredentials,
              status: jsonResponse.status,
              statusText: jsonResponse.statusText,
              contentType: jsonResponse.headers.get('content-type'),
              success: true,
              data: jsonData,
              cookies: jsonCookies,
              headers: Object.fromEntries(jsonResponse.headers.entries())
            });

            if (jsonCookies) {
              authToken = jsonData?.token || null;
              authCookies = jsonCookies;
            }
          }
        } catch (e) {
          // Ignore JSON attempt errors
        }
      }
    } catch (error) {
      results.push({
        endpoint: endpoint.path,
        description: endpoint.description,
        credentials: adminCredentials,
        status: null,
        statusText: null,
        contentType: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return { results, authToken, authCookies };
}

async function testGizmoAuthentication() {
  const baseUrl = 'https://5f86bd85fd1c.ngrok-free.app';
  
  // First authenticate
  const authResult = await authenticateWithGizmo();
  
  // Test authenticated endpoints if we have auth info
  if (authResult.authCookies) {
    const authenticatedEndpoints = [
      { path: '/api/users', method: 'GET', description: 'Users List' },
      { path: '/api/members', method: 'GET', description: 'Members List' },
      { path: '/api/users/dogukan', method: 'GET', description: 'Dogukan User Info' },
      { path: '/api/users/dogukan/balance', method: 'GET', description: 'Dogukan Balance' },
      { path: '/users/dogukan', method: 'GET', description: 'Dogukan User (Alt)' },
      { path: '/users', method: 'GET', description: 'Users (Alt)' }
    ];

    for (const endpoint of authenticatedEndpoints) {
      try {
        const headers: any = {
          'Cookie': authResult.authCookies,
          'ngrok-skip-browser-warning': 'true'
        };
        
        if (authResult.authToken) {
          headers['Authorization'] = `Bearer ${authResult.authToken}`;
        }
        
        const response = await fetch(`${baseUrl}${endpoint.path}`, {
          method: endpoint.method,
          headers
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

        authResult.results.push({
          endpoint: endpoint.path,
          description: endpoint.description + ' (Authenticated)',
          credentials: { username: 'admin', password: '123455' },
          status: response.status,
          statusText: response.statusText,
          contentType,
          success: response.ok,
          data: data,
          cookies: null,
          headers: Object.fromEntries(response.headers.entries())
        });
      } catch (error) {
        authResult.results.push({
          endpoint: endpoint.path,
          description: endpoint.description + ' (Authenticated)',
          credentials: { username: 'admin', password: '123455' },
          status: null,
          statusText: null,
          contentType: null,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  return authResult;
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await testGizmoAuthentication();
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      gizmoApiUrl: 'https://5f86bd85fd1c.ngrok-free.app',
      adminCredentials: { username: 'admin', password: '123455' },
      authToken: authResult.authToken,
      authCookies: authResult.authCookies,
      authenticated: !!authResult.authCookies,
      summary: {
        total: authResult.results.length,
        successful: authResult.results.filter(r => r.success).length,
        failed: authResult.results.filter(r => !r.success).length,
        authenticated: authResult.results.filter(r => r.description?.includes('Authenticated')).length
      },
      results: authResult.results
    });
  } catch (error) {
    console.error('Gizmo auth test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
