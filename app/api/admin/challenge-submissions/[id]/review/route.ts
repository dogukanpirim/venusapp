
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const submissionId = params.id;
    const body = await request.json();
    const { status, reviewNotes, reviewedById } = body;

    // Validate status
    if (!['APPROVED', 'REJECTED', 'UNDER_REVIEW'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be APPROVED, REJECTED, or UNDER_REVIEW' },
        { status: 400 }
      );
    }

    // Check if submission exists
    const submission = await prisma.challengeSubmission.findUnique({
      where: { id: submissionId },
      include: {
        challenge: true,
        player: true
      }
    });

    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Update submission with review
    const updatedSubmission = await prisma.challengeSubmission.update({
      where: { id: submissionId },
      data: {
        status,
        reviewNotes: reviewNotes || null,
        reviewedById: reviewedById || null,
        reviewedAt: new Date()
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

    // If approved, award the rewards to the player
    if (status === 'APPROVED') {
      await prisma.player.update({
        where: { id: submission.playerId },
        data: {
          totalPoints: {
            increment: submission.challenge.pointsReward
          }
        }
      });

      // You could also track credits/rewards in a separate table if needed
      // For now, we're just updating the player's total points
    }

    return NextResponse.json({
      success: true,
      data: updatedSubmission,
      message: `Submission ${status.toLowerCase()} successfully`
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to review submission' 
      },
      { status: 500 }
    );
  }
}

// Get specific submission details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const submissionId = params.id;

    const submission = await prisma.challengeSubmission.findUnique({
      where: { id: submissionId },
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

    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

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
