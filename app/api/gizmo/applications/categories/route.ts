
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
    const limit = searchParams.get('limit') || '50';
    const parentId = searchParams.get('parentId');

    // Build query parameters for v2.0 API
    const params = new URLSearchParams();
    params.append('Pagination.Limit', limit);
    if (parentId) params.append('ParentId', parentId);

    const queryString = params.toString();
    const endpoint = `/api/v2.0/applicationcategories${queryString ? `?${queryString}` : ''}`;

    const result = await makeRobustGizmoRequest(endpoint, {
      method: 'GET'
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data?.items || result.data || [],
        total: result.data?.totalCount || 0,
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
    console.error('Application categories API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
