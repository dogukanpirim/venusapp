
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
    const max = searchParams.get('max') || '50';
    const skip = searchParams.get('skip') || '0';
    const category = searchParams.get('category');

    // Build query parameters
    const params = new URLSearchParams();
    params.append('max', max);
    params.append('skip', skip);

    const queryString = params.toString();
    const endpoint = `/api/products${queryString ? `?${queryString}` : ''}`;

    const result = await makeRobustGizmoRequest(endpoint, {
      method: 'GET'
    });

    if (result.success) {
      let products = result.data;
      
      // Filter by category if specified
      if (category && Array.isArray(products)) {
        products = products.filter((product: any) => 
          product.category?.toLowerCase().includes(category.toLowerCase()) ||
          product.name?.toLowerCase().includes(category.toLowerCase())
        );
      }

      return NextResponse.json({
        success: true,
        data: products,
        total: Array.isArray(products) ? products.length : 0,
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
    console.error('Products API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
