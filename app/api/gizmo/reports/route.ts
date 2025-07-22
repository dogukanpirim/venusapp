
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

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'summary';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const period = searchParams.get('period') || 'today'; // today, week, month, year

    // Calculate date range if not provided
    const now = new Date();
    let dateRange = { start: '', end: '' };

    switch (period) {
      case 'today':
        dateRange.start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        dateRange.end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
        break;
      case 'week':
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        dateRange.start = weekStart.toISOString();
        dateRange.end = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'month':
        dateRange.start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        dateRange.end = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
        break;
      case 'year':
        dateRange.start = new Date(now.getFullYear(), 0, 1).toISOString();
        dateRange.end = new Date(now.getFullYear() + 1, 0, 1).toISOString();
        break;
    }

    // Use provided dates if available
    if (startDate) dateRange.start = startDate;
    if (endDate) dateRange.end = endDate;

    const reportData: any = {
      type: reportType,
      period: period,
      dateRange: dateRange,
      timestamp: new Date().toISOString()
    };

    try {
      // Fetch multiple data sources concurrently
      const [usersResult, sessionsResult, transactionsResult, hostsResult] = await Promise.allSettled([
        makeRobustGizmoRequest('/api/users'),
        makeRobustGizmoRequest('/api/usersessions'),
        makeRobustGizmoRequest('/api/transactions'),
        makeRobustGizmoRequest('/api/hostcomputers')
      ]);

      // Process users data
      if (usersResult.status === 'fulfilled' && usersResult.value.success) {
        const users = usersResult.value.data || [];
        reportData.users = {
          total: users.length,
          active: users.filter((u: any) => u.isEnabled !== false).length,
          disabled: users.filter((u: any) => u.isEnabled === false).length,
          online: users.filter((u: any) => u.isOnline).length
        };
      }

      // Process sessions data
      if (sessionsResult.status === 'fulfilled' && sessionsResult.value.success) {
        const sessions = sessionsResult.value.data || [];
        const activeSessions = sessions.filter((s: any) => !s.endTime);
        const endedSessions = sessions.filter((s: any) => s.endTime);
        const totalDuration = endedSessions.reduce((sum: number, s: any) => sum + (s.duration || 0), 0);
        
        reportData.sessions = {
          total: sessions.length,
          active: activeSessions.length,
          ended: endedSessions.length,
          totalDuration: totalDuration,
          averageDuration: endedSessions.length > 0 ? totalDuration / endedSessions.length : 0
        };
      }

      // Process transactions data
      if (transactionsResult.status === 'fulfilled' && transactionsResult.value.success) {
        const transactions = transactionsResult.value.data || [];
        const totalRevenue = transactions.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
        
        reportData.transactions = {
          total: transactions.length,
          totalRevenue: totalRevenue,
          averageTransaction: transactions.length > 0 ? totalRevenue / transactions.length : 0
        };
      }

      // Process hosts data
      if (hostsResult.status === 'fulfilled' && hostsResult.value.success) {
        const hosts = hostsResult.value.data || [];
        reportData.hosts = {
          total: hosts.length,
          online: hosts.filter((h: any) => h.state === 'Online' || h.state === 'Available').length,
          offline: hosts.filter((h: any) => h.state !== 'Online' && h.state !== 'Available').length,
          inUse: hosts.filter((h: any) => h.currentUser).length
        };
      }

      return NextResponse.json({
        success: true,
        data: reportData,
        meta: {
          generatedAt: new Date().toISOString(),
          reportType: reportType,
          period: period
        }
      });

    } catch (error) {
      console.error('Error generating report:', error);
      return NextResponse.json({
        success: false,
        error: 'Error generating report',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Reports API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
