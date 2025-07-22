
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Check if user is admin (you may want to implement proper session checking)
    // For now, we'll skip auth check but in production you should verify admin status
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const challengeId = searchParams.get('challengeId');
    const limit = searchParams.get('limit');
    const page = searchParams.get('page');

    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (challengeId) {
      where.challengeId = challengeId;
    }

    const pageSize = limit ? parseInt(limit) : 10;
    const currentPage = page ? parseInt(page) : 1;
    const skip = (currentPage - 1) * pageSize;

    const [submissions, totalCount] = await Promise.all([
      prisma.challengeSubmission.findMany({
        where,
        include: {
          challenge: {
            include: {
              game: true
            }
          },
          player: true,
          reviewedBy: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: pageSize
      }),
      prisma.challengeSubmission.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: submissions,
      pagination: {
        total: totalCount,
        page: currentPage,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch challenge submissions' 
      },
      { status: 500 }
    );
  }
}
