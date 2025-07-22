
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { makeRobustGizmoRequest } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { action, sessionId, sessionIds, userId, reason } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action required' }, { status: 400 });
    }

    // Handle single session or multiple sessions
    const targetSessions = sessionIds || (sessionId ? [sessionId] : []);
    
    const results: any[] = [];

    // Handle user-based actions
    if (action === 'end-user-sessions' && userId) {
      const userSessionsResult = await makeRobustGizmoRequest(`/api/users/${userId}/sessions`);
      
      if (userSessionsResult.success) {
        const activeSessions = (userSessionsResult.data || []).filter((s: any) => !s.endTime);
        
        for (const userSession of activeSessions) {
          try {
            const endResult = await makeRobustGizmoRequest(`/api/usersessions/${userSession.id}/end`, {
              method: 'POST',
              body: JSON.stringify({
                reason: reason || 'Session ended by administrator'
              })
            });

            results.push({
              sessionId: userSession.id,
              userId: userId,
              action: 'end',
              success: endResult.success,
              data: endResult.data,
              error: endResult.error
            });
          } catch (error) {
            results.push({
              sessionId: userSession.id,
              userId: userId,
              action: 'end',
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }
      }
    } else {
      // Handle specific session actions
      if (targetSessions.length === 0) {
        return NextResponse.json({ error: 'Session ID(s) required' }, { status: 400 });
      }

      for (const targetSessionId of targetSessions) {
        try {
          let endpoint = '';
          let requestBody: any = {};

          switch (action) {
            case 'end':
              endpoint = `/api/usersessions/${targetSessionId}/end`;
              requestBody = {
                reason: reason || 'Session ended by administrator'
              };
              break;

            case 'pause':
              endpoint = `/api/usersessions/${targetSessionId}/pause`;
              requestBody = {
                reason: reason || 'Session paused by administrator'
              };
              break;

            case 'resume':
              endpoint = `/api/usersessions/${targetSessionId}/resume`;
              break;

            case 'extend':
              endpoint = `/api/usersessions/${targetSessionId}/extend`;
              requestBody = {
                minutes: body.minutes || 60,
                reason: reason || 'Session extended by administrator'
              };
              break;

            case 'add-time':
              endpoint = `/api/usersessions/${targetSessionId}/addtime`;
              requestBody = {
                minutes: body.minutes || 30,
                reason: reason || 'Time added by administrator'
              };
              break;

            case 'get-info':
              endpoint = `/api/usersessions/${targetSessionId}`;
              break;

            default:
              results.push({
                sessionId: targetSessionId,
                success: false,
                error: 'Invalid action'
              });
              continue;
          }

          const method = action === 'get-info' ? 'GET' : 'POST';
          const result = await makeRobustGizmoRequest(endpoint, {
            method: method,
            ...(method === 'POST' && { body: JSON.stringify(requestBody) })
          });

          results.push({
            sessionId: targetSessionId,
            action: action,
            success: result.success,
            data: result.data,
            error: result.error
          });

        } catch (error) {
          results.push({
            sessionId: targetSessionId,
            action: action,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: successCount > 0,
      data: {
        results: results,
        summary: {
          total: results.length,
          successful: successCount,
          failed: failureCount,
          action: action
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        executedBy: session.user.email
      }
    });

  } catch (error) {
    console.error('Session control API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
