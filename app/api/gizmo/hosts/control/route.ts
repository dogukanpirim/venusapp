
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
    const { action, hostId, hostIds, message, delayMinutes } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action required' }, { status: 400 });
    }

    // Handle single host or multiple hosts
    const targetHosts = hostIds || (hostId ? [hostId] : []);
    if (targetHosts.length === 0) {
      return NextResponse.json({ error: 'Host ID(s) required' }, { status: 400 });
    }

    const results: any[] = [];

    for (const targetHostId of targetHosts) {
      try {
        let endpoint = '';
        let requestBody: any = {};

        switch (action) {
          case 'shutdown':
            endpoint = `/api/hostcomputers/${targetHostId}/shutdown`;
            requestBody = {
              message: message || 'System shutdown initiated by administrator',
              delayMinutes: delayMinutes || 0
            };
            break;

          case 'restart':
            endpoint = `/api/hostcomputers/${targetHostId}/restart`;
            requestBody = {
              message: message || 'System restart initiated by administrator',
              delayMinutes: delayMinutes || 0
            };
            break;

          case 'logoff':
            endpoint = `/api/hostcomputers/${targetHostId}/logoff`;
            requestBody = {
              message: message || 'User logoff initiated by administrator'
            };
            break;

          case 'lock':
            endpoint = `/api/hostcomputers/${targetHostId}/lock`;
            requestBody = {
              message: message || 'System locked by administrator'
            };
            break;

          case 'unlock':
            endpoint = `/api/hostcomputers/${targetHostId}/unlock`;
            break;

          case 'enable':
            endpoint = `/api/hostcomputers/${targetHostId}/enable`;
            break;

          case 'disable':
            endpoint = `/api/hostcomputers/${targetHostId}/disable`;
            requestBody = {
              message: message || 'Host disabled by administrator'
            };
            break;

          case 'send-message':
            endpoint = `/api/hostcomputers/${targetHostId}/message`;
            requestBody = {
              message: message || 'Message from administrator'
            };
            break;

          default:
            results.push({
              hostId: targetHostId,
              success: false,
              error: 'Invalid action'
            });
            continue;
        }

        const result = await makeRobustGizmoRequest(endpoint, {
          method: 'POST',
          body: JSON.stringify(requestBody)
        });

        results.push({
          hostId: targetHostId,
          action: action,
          success: result.success,
          data: result.data,
          error: result.error
        });

      } catch (error) {
        results.push({
          hostId: targetHostId,
          action: action,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
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
    console.error('Host control API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
