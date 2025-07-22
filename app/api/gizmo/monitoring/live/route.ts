
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { makeRobustGizmoRequest } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch multiple data sources for live monitoring
    const [hostsResult, sessionsResult, usersResult] = await Promise.allSettled([
      makeRobustGizmoRequest('/api/hostcomputers'),
      makeRobustGizmoRequest('/api/usersessions'),
      makeRobustGizmoRequest('/api/users')
    ]);

    const liveData: any = {
      timestamp: new Date().toISOString(),
      status: 'online'
    };

    // Process hosts data
    if (hostsResult.status === 'fulfilled' && hostsResult.value.success) {
      const hosts = hostsResult.value.data || [];
      liveData.hosts = {
        total: hosts.length,
        online: hosts.filter((h: any) => h.state === 'Online' || h.state === 'Available').length,
        offline: hosts.filter((h: any) => h.state !== 'Online' && h.state !== 'Available').length,
        inUse: hosts.filter((h: any) => h.currentUser).length,
        available: hosts.filter((h: any) => (h.state === 'Online' || h.state === 'Available') && !h.currentUser).length,
        details: hosts.map((h: any) => ({
          id: h.id,
          name: h.name || h.hostname,
          status: h.state || 'Unknown',
          user: h.currentUser?.username || null,
          ipAddress: h.ipAddress,
          uptime: h.uptime || 0
        }))
      };
    }

    // Process sessions data
    if (sessionsResult.status === 'fulfilled' && sessionsResult.value.success) {
      const sessions = sessionsResult.value.data || [];
      const activeSessions = sessions.filter((s: any) => !s.endTime);
      
      liveData.sessions = {
        active: activeSessions.length,
        total: sessions.length,
        details: activeSessions.map((s: any) => ({
          id: s.id,
          userId: s.userId,
          username: s.username,
          hostId: s.hostId,
          startTime: s.startTime,
          duration: s.duration || 0,
          type: s.type || 'Gaming'
        }))
      };
    }

    // Process users data
    if (usersResult.status === 'fulfilled' && usersResult.value.success) {
      const users = usersResult.value.data || [];
      liveData.users = {
        total: users.length,
        online: users.filter((u: any) => u.isOnline).length,
        active: users.filter((u: any) => u.isEnabled !== false).length,
        recentLogins: users
          .filter((u: any) => u.lastLogin)
          .sort((a: any, b: any) => new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime())
          .slice(0, 10)
          .map((u: any) => ({
            username: u.username,
            lastLogin: u.lastLogin,
            isOnline: u.isOnline
          }))
      };
    }

    // Calculate system load and health
    const totalHosts = liveData.hosts?.total || 0;
    const onlineHosts = liveData.hosts?.online || 0;
    const inUseHosts = liveData.hosts?.inUse || 0;
    const activeSessions = liveData.sessions?.active || 0;

    liveData.systemHealth = {
      overallStatus: onlineHosts > 0 ? 'healthy' : 'critical',
      hostAvailability: totalHosts > 0 ? (onlineHosts / totalHosts) * 100 : 0,
      utilization: onlineHosts > 0 ? (inUseHosts / onlineHosts) * 100 : 0,
      loadLevel: activeSessions > totalHosts * 0.8 ? 'high' : 
                 activeSessions > totalHosts * 0.5 ? 'medium' : 'low'
    };

    return NextResponse.json({
      success: true,
      data: liveData,
      meta: {
        refreshInterval: 10000, // 10 seconds
        dataPoints: ['hosts', 'sessions', 'users', 'systemHealth']
      }
    });

  } catch (error) {
    console.error('Live monitoring API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
