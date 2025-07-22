
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category'); // AUTO or MANUAL
    const status = searchParams.get('status');
    const gameSlug = searchParams.get('game');
    const limit = searchParams.get('limit');

    const where: any = {};
    
    if (type) {
      where.type = type;
    }
    
    if (category) {
      where.category = category;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (gameSlug) {
      where.game = {
        slug: gameSlug
      };
    }

    const challenges = await prisma.challenge.findMany({
      where,
      include: {
        game: true,
        registrations: {
          include: {
            player: true
          }
        },
        submissions: {
          include: {
            player: true,
            reviewedBy: true
          }
        }
      },
      orderBy: [
        { category: 'asc' },
        { type: 'asc' },
        { endDate: 'asc' }
      ],
      take: limit ? parseInt(limit) : undefined
    });

    return NextResponse.json({
      success: true,
      data: challenges,
      count: challenges.length
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch challenges' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields for different challenge categories
    if (body.category === 'AUTO') {
      if (!body.gizmoTrackingKey || !body.autoCompleteRule) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'AUTO challenges require gizmoTrackingKey and autoCompleteRule' 
          },
          { status: 400 }
        );
      }
    } else if (body.category === 'MANUAL') {
      if (!body.submissionInstructions) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'MANUAL challenges require submissionInstructions' 
          },
          { status: 400 }
        );
      }
    }
    
    const challenge = await prisma.challenge.create({
      data: {
        ...body,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        exampleImages: body.exampleImages || [],
      },
      include: {
        game: true
      }
    });

    return NextResponse.json({
      success: true,
      data: challenge
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create challenge' 
      },
      { status: 500 }
    );
  }
}
