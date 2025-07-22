
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - Get specific challenge details
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

    const challenge = await prisma.challenge.findUnique({
      where: { id: params.id },
      include: {
        game: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        submissions: {
          include: {
            player: {
              select: {
                id: true,
                gamertag: true,
                displayName: true,
              },
            },
          },
        },
        _count: {
          select: {
            submissions: true,
            registrations: true,
          },
        },
      },
    });

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: challenge,
    });
  } catch (error) {
    console.error('Admin challenge GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update challenge
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
      status,
      image,
    } = body;

    // Check if challenge exists
    const existingChallenge = await prisma.challenge.findUnique({
      where: { id: params.id },
    });

    if (!existingChallenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // Validate dates if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start >= end) {
        return NextResponse.json(
          { error: 'End date must be after start date' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (gameId !== undefined) updateData.gameId = gameId;
    if (type !== undefined) updateData.type = type;
    if (category !== undefined) updateData.category = category;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (target !== undefined) updateData.target = target;
    if (targetValue !== undefined) updateData.targetValue = parseInt(targetValue);
    if (gizmoTrackingKey !== undefined) updateData.gizmoTrackingKey = gizmoTrackingKey;
    if (autoCompleteRule !== undefined) updateData.autoCompleteRule = autoCompleteRule;
    if (submissionInstructions !== undefined) updateData.submissionInstructions = submissionInstructions;
    if (exampleImages !== undefined) updateData.exampleImages = exampleImages;
    if (requiredProofCount !== undefined) updateData.requiredProofCount = parseInt(requiredProofCount);
    if (pointsReward !== undefined) updateData.pointsReward = parseInt(pointsReward);
    if (creditsReward !== undefined) updateData.creditsReward = parseFloat(creditsReward);
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (status !== undefined) updateData.status = status;
    if (image !== undefined) updateData.image = image;

    const challenge = await prisma.challenge.update({
      where: { id: params.id },
      data: updateData,
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
      message: 'Challenge updated successfully',
    });
  } catch (error) {
    console.error('Admin challenge PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete challenge
export async function DELETE(
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

    // Check if challenge exists
    const existingChallenge = await prisma.challenge.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            submissions: true,
            registrations: true,
          },
        },
      },
    });

    if (!existingChallenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // Prevent deletion if there are active submissions or registrations
    if (existingChallenge._count.submissions > 0 || existingChallenge._count.registrations > 0) {
      return NextResponse.json(
        { error: 'Cannot delete challenge with existing submissions or registrations' },
        { status: 400 }
      );
    }

    await prisma.challenge.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Challenge deleted successfully',
    });
  } catch (error) {
    console.error('Admin challenge DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
