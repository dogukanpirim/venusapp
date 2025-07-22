
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { GameTitle } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const gameTitle = searchParams.get('game') as GameTitle | null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'COMPLETED';

    // Get player
    const player = await prisma.player.findUnique({
      where: { userId: (session.user as any).id },
    });

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      playerId: player.id,
      status,
    };

    if (gameTitle) {
      whereClause.gameTitle = gameTitle;
    }

    // Get matches with pagination
    const [matches, totalCount] = await Promise.all([
      prisma.overwolfMatch.findMany({
        where: whereClause,
        orderBy: { startedAt: 'desc' },
        skip,
        take: limit,
        include: {
          events: {
            take: 5,
            orderBy: { timestamp: 'desc' },
          },
          highlights: {
            take: 3,
            orderBy: { timestamp: 'desc' },
          },
        },
      }),
      prisma.overwolfMatch.count({
        where: whereClause,
      }),
    ]);

    // Calculate additional stats for each match
    const enrichedMatches = matches.map(match => {
      const kdaRatio = (match.deaths || 0) > 0 ? 
        ((match.kills || 0) + (match.assists || 0)) / (match.deaths || 1) : 
        (match.kills || 0) + (match.assists || 0);

      const headShotPercentage = (match.kills || 0) > 0 ? 
        ((match.headshots || 0) / (match.kills || 1)) * 100 : 0;

      return {
        id: match.id,
        gameTitle: match.gameTitle,
        gameMode: match.gameMode,
        mapName: match.mapName,
        duration: match.duration,
        status: match.status,
        won: match.won,
        score: match.score,
        playerScore: match.playerScore,
        rank: match.rank,
        
        // Combat Stats
        kills: match.kills,
        deaths: match.deaths,
        assists: match.assists,
        kda: parseFloat(kdaRatio.toFixed(2)),
        headshots: match.headshots,
        headshotPercentage: parseFloat(headShotPercentage.toFixed(1)),
        accuracy: match.accuracy,
        damage: match.damage,
        
        // Game-specific stats
        plants: match.plants,
        defuses: match.defuses,
        firstBloods: match.firstBloods,
        aces: match.aces,
        clutches: match.clutches,
        cs: match.cs, // LoL creep score
        gold: match.gold, // LoL gold
        level: match.level, // LoL level
        wardsPlaced: match.wardsPlaced,
        wardsDestroyed: match.wardsDestroyed,
        
        // Points and rewards
        basePoints: match.basePoints,
        bonusPoints: match.bonusPoints,
        totalPoints: match.totalPoints,
        pointsAwarded: match.pointsAwarded,
        
        // Team info
        teamName: match.teamName,
        teammates: match.teammates,
        opponents: match.opponents,
        
        // Timestamps
        startedAt: match.startedAt,
        endedAt: match.endedAt,
        
        // Related data
        events: match.events?.map(event => ({
          id: event.id,
          eventType: event.eventType,
          eventValue: event.eventValue,
          timestamp: event.timestamp,
          matchTime: event.matchTime,
          roundNumber: event.roundNumber,
          weapon: event.weapon,
          victim: event.victim,
          location: event.location,
          pointsEarned: event.pointsEarned,
        })) || [],
        highlights: match.highlights?.map(highlight => ({
          id: highlight.id,
          type: highlight.type,
          title: highlight.title,
          description: highlight.description,
          screenshotUrl: highlight.screenshotUrl,
          timestamp: highlight.timestamp,
        })) || [],
      };
    });

    // Calculate summary stats
    const summary = {
      totalMatches: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      gamesPlayed: matches.length,
      wins: matches.filter(m => m.won === true).length,
      losses: matches.filter(m => m.won === false).length,
      totalKills: matches.reduce((sum, m) => sum + (m.kills || 0), 0),
      totalDeaths: matches.reduce((sum, m) => sum + (m.deaths || 0), 0),
      totalAssists: matches.reduce((sum, m) => sum + (m.assists || 0), 0),
      totalPoints: matches.reduce((sum, m) => sum + (m.totalPoints || 0), 0),
      avgKDA: 0,
      winRate: 0,
    };

    if (summary.gamesPlayed > 0) {
      const totalDeaths = summary.totalDeaths || 1;
      summary.avgKDA = parseFloat(((summary.totalKills + summary.totalAssists) / totalDeaths).toFixed(2));
      summary.winRate = parseFloat(((summary.wins / summary.gamesPlayed) * 100).toFixed(1));
    }

    return NextResponse.json({
      matches: enrichedMatches,
      summary,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: summary.totalPages,
        hasNext: page < summary.totalPages,
        hasPrev: page > 1,
      },
    });

  } catch (error) {
    console.error('Matches API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
