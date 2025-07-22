
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const gizmoApiUrl = process.env.GIZMO_API_URL;
    if (!gizmoApiUrl) {
      return NextResponse.json({ error: 'Gizmo API URL not configured' }, { status: 500 });
    }

    // Test connection to Gizmo API
    const testResults = {
      gizmoApiUrl,
      timestamp: new Date().toISOString(),
      tests: [] as any[],
    };

    // Test base URL
    try {
      const baseResponse = await fetch(gizmoApiUrl, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });
      testResults.tests.push({
        endpoint: 'base',
        status: baseResponse.status,
        statusText: baseResponse.statusText,
        success: baseResponse.ok,
      });
    } catch (error) {
      testResults.tests.push({
        endpoint: 'base',
        status: 'error',
        statusText: (error as Error).message,
        success: false,
      });
    }

    // Test users endpoint
    try {
      const usersResponse = await fetch(`${gizmoApiUrl}/api/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...(process.env.GIZMO_API_KEY && {
            'Authorization': `Bearer ${process.env.GIZMO_API_KEY}`
          }),
        },
      });
      testResults.tests.push({
        endpoint: 'users',
        status: usersResponse.status,
        statusText: usersResponse.statusText,
        success: usersResponse.ok,
      });
    } catch (error) {
      testResults.tests.push({
        endpoint: 'users',
        status: 'error',
        statusText: (error as Error).message,
        success: false,
      });
    }

    // Test hosts endpoint
    try {
      const hostsResponse = await fetch(`${gizmoApiUrl}/api/hosts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...(process.env.GIZMO_API_KEY && {
            'Authorization': `Bearer ${process.env.GIZMO_API_KEY}`
          }),
        },
      });
      testResults.tests.push({
        endpoint: 'hosts',
        status: hostsResponse.status,
        statusText: hostsResponse.statusText,
        success: hostsResponse.ok,
      });
    } catch (error) {
      testResults.tests.push({
        endpoint: 'hosts',
        status: 'error',
        statusText: (error as Error).message,
        success: false,
      });
    }

    return NextResponse.json(testResults);
  } catch (error) {
    console.error('Gizmo test API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
