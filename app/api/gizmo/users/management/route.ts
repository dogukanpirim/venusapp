
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
    const search = searchParams.get('search');
    const status = searchParams.get('status'); // 'active', 'disabled', 'all'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query parameters
    const params = new URLSearchParams();
    const skip = (page - 1) * limit;
    params.append('max', limit.toString());
    params.append('skip', skip.toString());

    const queryString = params.toString();
    const endpoint = `/api/users${queryString ? `?${queryString}` : ''}`;

    const result = await makeRobustGizmoRequest(endpoint, {
      method: 'GET'
    });

    if (result.success) {
      let users = result.data || [];
      
      // Filter by search term if specified
      if (search && Array.isArray(users)) {
        const searchTerm = search.toLowerCase();
        users = users.filter((user: any) => 
          user.username?.toLowerCase().includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm) ||
          user.firstName?.toLowerCase().includes(searchTerm) ||
          user.lastName?.toLowerCase().includes(searchTerm)
        );
      }

      // Filter by status if specified
      if (status && status !== 'all' && Array.isArray(users)) {
        switch (status) {
          case 'active':
            users = users.filter((user: any) => user.isEnabled !== false);
            break;
          case 'disabled':
            users = users.filter((user: any) => user.isEnabled === false);
            break;
        }
      }

      // Calculate user statistics
      const totalUsers = users.length;
      const activeUsers = users.filter((u: any) => u.isEnabled !== false).length;
      const disabledUsers = users.filter((u: any) => u.isEnabled === false).length;
      const onlineUsers = users.filter((u: any) => u.isOnline).length;

      return NextResponse.json({
        success: true,
        data: users,
        total: totalUsers,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalUsers / limit),
          hasNextPage: page * limit < totalUsers,
          hasPrevPage: page > 1
        },
        summary: {
          total: totalUsers,
          active: activeUsers,
          disabled: disabledUsers,
          online: onlineUsers
        },
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
    console.error('Users management API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
