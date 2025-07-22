
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const gizmoApiUrl = 'https://5f86bd85fd1c.ngrok-free.app';
    
    // Try endpoints WITHOUT authentication first (based on logs showing 200 OK)
    const endpoints = [
      '/api/users',
      '/users',
      '/api/members',
      '/members',
      '/api/users/list',
      '/users/list'
    ];

    const results = [];
    let successfulResult = null;

    console.log('Trying Gizmo API endpoints without authentication...');

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${gizmoApiUrl}${endpoint}`);
        
        const response = await fetch(`${gizmoApiUrl}${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          }
        });

        const result: any = {
          endpoint,
          status: response.status,
          statusText: response.statusText,
          success: response.ok
        };

        if (response.ok) {
          try {
            const data = await response.json();
            result.data = data;
            
            // If this endpoint worked, use it as the main result
            if (!successfulResult) {
              // Look for "dogukan" user in the data
              const dataStr = JSON.stringify(data).toLowerCase();
              const dogukanFound = dataStr.includes('dogukan');
              
              successfulResult = {
                success: true,
                endpoint: endpoint,
                data: data,
                authenticated: false,
                method: 'Direct API call (no auth)',
                dogukanFound: dogukanFound,
                dogukanNote: dogukanFound ? 'Found "dogukan" user in the data' : 'No "dogukan" user found in the data'
              };
            }
          } catch (e) {
            const text = await response.text();
            result.data = text.length > 500 ? text.substring(0, 500) + '...' : text;
            result.responseType = 'text';
          }
        } else {
          console.log(`Endpoint ${endpoint} failed with status: ${response.status}`);
          result.error = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        results.push(result);
      } catch (error) {
        console.log(`Endpoint ${endpoint} failed with error:`, error);
        results.push({
          endpoint,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // If we found a successful result, return it
    if (successfulResult) {
      return NextResponse.json({
        ...successfulResult,
        allResults: results
      });
    }

    // If direct API calls failed, return error with details
    return NextResponse.json({ 
      success: false,
      error: 'No working user endpoint found (direct API calls)',
      authenticated: false,
      testedEndpoints: endpoints,
      allResults: results,
      note: 'Tried direct API calls without authentication based on logs showing 200 OK'
    }, { status: 404 });

  } catch (error) {
    console.error('Gizmo users API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
