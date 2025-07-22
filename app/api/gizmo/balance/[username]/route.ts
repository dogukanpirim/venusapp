
import { NextRequest, NextResponse } from 'next/server';
import { makeRobustGizmoRequest } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    
    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    console.log(`Fetching balance for user: ${username}`);

    // First try to get all users to find the user ID
    const usersResult = await makeRobustGizmoRequest('/api/users', { method: 'GET' });
    
    if (!usersResult.success) {
      console.error('Failed to fetch users:', usersResult.error);
      return NextResponse.json({ 
        success: false,
        error: 'Failed to fetch users from Gizmo API',
        details: usersResult.error
      }, { status: 500 });
    }

    // Find the user by username - handle Gizmo API response format
    let users = [];
    if (usersResult.data && usersResult.data.result) {
      users = Array.isArray(usersResult.data.result) ? usersResult.data.result : [];
    } else if (Array.isArray(usersResult.data)) {
      users = usersResult.data;
    }
    
    const user = users.find((u: any) => 
      u.username?.toLowerCase() === username.toLowerCase() || 
      u.userName?.toLowerCase() === username.toLowerCase() ||
      u.name?.toLowerCase() === username.toLowerCase()
    );

    if (!user) {
      console.log(`User ${username} not found in Gizmo system`);
      return NextResponse.json({ 
        success: false,
        error: `User '${username}' not found in Gizmo system`,
        availableUsers: users.map((u: any) => u.username || u.userName || u.name).filter(Boolean)
      }, { status: 404 });
    }

    console.log(`Found user: ${user.username || user.userName || user.name} (ID: ${user.id})`);

    // Get detailed balance information from the balance endpoint
    let balanceData = null;
    try {
      const balanceResult = await makeRobustGizmoRequest(`/api/users/${user.id}/balance`, { method: 'GET' });
      if (balanceResult.success && balanceResult.data?.result) {
        balanceData = balanceResult.data.result;
        console.log(`Retrieved balance data for user ${user.id}:`, balanceData);
      }
    } catch (e) {
      console.log('Could not fetch detailed balance info, using fallback data');
    }

    // Extract balance information using the correct balance endpoint data
    const balance = {
      userId: user.id,
      username: user.username || user.userName || user.name,
      currentBalance: balanceData?.balance || 0,
      availableBalance: balanceData?.balance || 0,
      depositAmount: balanceData?.deposits || 0,
      timeBalance: balanceData?.availableTime || balanceData?.timeProduct || 0,
      currency: 'TRY',
      lastUpdated: new Date().toISOString(),
      accountState: user.accountState || user.state || 'ACTIVE',
      membershipType: user.membershipType || user.userGroup || 'STANDARD',
      // Additional user info
      fullName: user.fullName || (user.firstName && user.lastName ? user.firstName + ' ' + user.lastName : null) || user.name,
      email: user.email,
      phoneNumber: user.phoneNumber || user.phone,
      registrationDate: user.registrationDate || user.createdTime,
      lastLoginDate: user.lastLoginDate || user.lastLogin,
      isActive: user.isActive !== false,
      isEnabled: user.isEnabled !== false,
      // Additional balance info from Gizmo API
      points: balanceData?.points || 0,
      onInvoices: balanceData?.onInvoices || 0,
      onInvoicedUsage: balanceData?.onInvoicedUsage || 0,
      onUninvoicedUsage: balanceData?.onUninvoicedUsage || 0,
      timeProductBalance: balanceData?.timeProductBalance || 0,
      usageBalance: balanceData?.usageBalance || 0,
      totalOutstanding: balanceData?.totalOutstanding || 0,
      availableCreditedTime: balanceData?.availableCreditedTime || 0
    };

    return NextResponse.json({
      success: true,
      balance,
      user: user,
      source: 'gizmo_api',
      authenticated: true,
      timestamp: new Date().toISOString(),
      fromCache: usersResult.fromCache
    });

  } catch (error) {
    console.error('Gizmo balance API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
