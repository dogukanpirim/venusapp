
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - List all zones with admin details
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const zones = await prisma.zone.findMany({
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const zonesWithStats = zones.map(zone => ({
      ...zone,
      stats: {
        totalProducts: zone._count.products,
        activeProducts: zone.products.filter(p => p.isActive).length,
        totalRevenue: zone.products.reduce((sum, p) => sum + p.price, 0),
      },
    }));

    return NextResponse.json({
      success: true,
      data: zonesWithStats,
    });
  } catch (error) {
    console.error('Admin zones GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
