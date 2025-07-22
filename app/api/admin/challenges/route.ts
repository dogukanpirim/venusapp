
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - List all challenges with admin details
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

    const challenges = await prisma.challenge.findMany({
      include: {
        game: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        submissions: {
          select: {
            id: true,
            status: true,
          },
        },
        _count: {
          select: {
            submissions: true,
            registrations: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const challengesWithStats = challenges.map(challenge => ({
      ...challenge,
      stats: {
        totalSubmissions: challenge._count.submissions,
        totalRegistrations: challenge._count.registrations,
        pendingSubmissions: challenge.submissions.filter(s => s.status === 'PENDING').length,
        approvedSubmissions: challenge.submissions.filter(s => s.status === 'APPROVED').length,
      },
    }));

    return NextResponse.json({
      success: true,
      data: challengesWithStats,
    });
  } catch (error) {
    console.error('Admin challenges GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new challenge
export async function POST(request: NextRequest) {
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
      title,
      description,
      gameId,
      type,
      category,
      difficulty,
      target,
      targetValue,
      gizmoTrackingKey,
      autoCompleteRule,
      submissionInstructions,
      exampleImages,
      requiredProofCount,
      pointsReward,
      creditsReward,
      startDate,
      endDate,
      image,
    } = body;

    // Validate required fields
    if (!title || !description || !gameId || !type || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Verify game exists
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Create challenge
    const challenge = await prisma.challenge.create({
      data: {
        title,
        description,
        gameId,
        type,
        category,
        difficulty: difficulty || 'Easy',
        target: target || '',
        targetValue: parseInt(targetValue) || 1,
        gizmoTrackingKey: category === 'AUTO' ? gizmoTrackingKey : null,
        autoCompleteRule: category === 'AUTO' ? autoCompleteRule : null,
        submissionInstructions: category === 'MANUAL' ? submissionInstructions : null,
        exampleImages: category === 'MANUAL' && exampleImages ? exampleImages : [],
        requiredProofCount: category === 'MANUAL' ? (parseInt(requiredProofCount) || 1) : 1,
        pointsReward: parseInt(pointsReward) || 0,
        creditsReward: parseFloat(creditsReward) || 0,
        startDate: start,
        endDate: end,
        image: image || null,
        status: 'ACTIVE',
      },
      include: {
        game: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: challenge,
      message: 'Challenge created successfully',
    });
  } catch (error) {
    console.error('Admin challenges POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
