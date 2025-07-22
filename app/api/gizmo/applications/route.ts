
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

    const { searchParams } = new URL(request.url);
    const max = searchParams.get('max');
    const skip = searchParams.get('skip');
    const category = searchParams.get('category');

    // Build query parameters
    const params = new URLSearchParams();
    if (max) params.append('max', max);
    if (skip) params.append('skip', skip);

    const queryString = params.toString();
    const endpoint = `/api/apps${queryString ? `?${queryString}` : ''}`;

    const result = await makeRobustGizmoRequest(endpoint, {
      method: 'GET'
    });

    if (result.success) {
      // Filter by category if specified
      let apps = result.data;
      if (category && Array.isArray(apps)) {
        apps = apps.filter((app: any) => 
          app.category?.toLowerCase().includes(category.toLowerCase()) ||
          app.title?.toLowerCase().includes(category.toLowerCase())
        );
      }

      return NextResponse.json({
        success: true,
        data: apps,
        total: Array.isArray(apps) ? apps.length : 0,
        meta: {
          endpoint,
          fromCache: result.fromCache,
          retryCount: result.retryCount
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        meta: {
          endpoint,
          retryCount: result.retryCount
        }
      }, { status: result.status || 500 });
    }
  } catch (error) {
    console.error('Applications API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
