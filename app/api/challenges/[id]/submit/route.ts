
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const challengeId = params.id;
    const body = await request.json();
    const { playerId, screenshotUrls, description, metadata } = body;

    // Validate required fields
    if (!playerId) {
      return NextResponse.json(
        { success: false, error: 'Player ID is required' },
        { status: 400 }
      );
    }

    // Check if challenge exists and is MANUAL
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: { game: true }
    });

    if (!challenge) {
      return NextResponse.json(
        { success: false, error: 'Challenge not found' },
        { status: 404 }
      );
    }

    if (challenge.category !== 'MANUAL') {
      return NextResponse.json(
        { success: false, error: 'This challenge does not accept manual submissions' },
        { status: 400 }
      );
    }

    if (challenge.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Challenge is not active' },
        { status: 400 }
      );
    }

    // Check if challenge has expired
    if (new Date() > challenge.endDate) {
      return NextResponse.json(
        { success: false, error: 'Challenge has expired' },
        { status: 400 }
      );
    }

    // Validate screenshot URLs
    if (!screenshotUrls || !Array.isArray(screenshotUrls) || screenshotUrls.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one screenshot is required' },
        { status: 400 }
      );
    }

    // Check required proof count
    if (screenshotUrls.length < challenge.requiredProofCount) {
      return NextResponse.json(
        { 
          success: false, 
          error: `This challenge requires ${challenge.requiredProofCount} screenshot(s), but only ${screenshotUrls.length} provided` 
        },
        { status: 400 }
      );
    }

    // Check if player already submitted
    const existingSubmission = await prisma.challengeSubmission.findUnique({
      where: {
        challengeId_playerId: {
          challengeId,
          playerId
        }
      }
    });

    if (existingSubmission) {
      return NextResponse.json(
        { success: false, error: 'You have already submitted for this challenge' },
        { status: 400 }
      );
    }

    // Create submission
    const submission = await prisma.challengeSubmission.create({
      data: {
        challengeId,
        playerId,
        screenshotUrls,
        description: description || null,
        metadata: metadata || null,
        status: 'PENDING'
      },
      include: {
        challenge: {
          include: {
            game: true
          }
        },
        player: true
      }
    });

    return NextResponse.json({
      success: true,
      data: submission,
      message: 'Submission created successfully. It will be reviewed by an admin.'
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create submission' 
      },
      { status: 500 }
    );
  }
}

// Get submission status for a challenge and player
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const challengeId = params.id;
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId');

    if (!playerId) {
      return NextResponse.json(
        { success: false, error: 'Player ID is required' },
        { status: 400 }
      );
    }

    const submission = await prisma.challengeSubmission.findUnique({
      where: {
        challengeId_playerId: {
          challengeId,
          playerId
        }
      },
      include: {
        challenge: {
          include: {
            game: true
          }
        },
        player: true,
        reviewedBy: true
      }
    });

    return NextResponse.json({
      success: true,
      data: submission
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch submission' 
      },
      { status: 500 }
    );
  }
}
