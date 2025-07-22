
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - Get specific zone details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const zone = await prisma.zone.findUnique({
      where: { id: params.id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            duration: true,
            isActive: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!zone) {
      return NextResponse.json({ error: 'Zone not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: zone,
    });
  } catch (error) {
    console.error('Admin zone GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update zone
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json();
    const {
      name,
      description,
      image,
      features,
      capacity,
      equipment,
      pricePerHour,
      specialOffers,
      isActive,
    } = body;

    // Check if zone exists
    const existingZone = await prisma.zone.findUnique({
      where: { id: params.id },
    });

    if (!existingZone) {
      return NextResponse.json({ error: 'Zone not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (features !== undefined) updateData.features = features;
    if (capacity !== undefined) updateData.capacity = parseInt(capacity);
    if (equipment !== undefined) updateData.equipment = equipment;
    if (pricePerHour !== undefined) updateData.pricePerHour = parseFloat(pricePerHour);
    if (specialOffers !== undefined) updateData.specialOffers = specialOffers;
    if (isActive !== undefined) updateData.isActive = isActive;

    const zone = await prisma.zone.update({
      where: { id: params.id },
      data: updateData,
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
    });

    return NextResponse.json({
      success: true,
      data: zone,
      message: 'Zone updated successfully',
    });
  } catch (error) {
    console.error('Admin zone PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
