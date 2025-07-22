
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { makeRobustGizmoRequest } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section') || 'all';

    // Get various system configurations
    const configData: any = {
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };

    try {
      // Get general settings
      if (section === 'all' || section === 'general') {
        const settingsResult = await makeRobustGizmoRequest('/api/settings');
        if (settingsResult.success) {
          configData.general = settingsResult.data || {};
        }
      }

      // Get host group configurations
      if (section === 'all' || section === 'hostgroups') {
        const hostGroupsResult = await makeRobustGizmoRequest('/api/hostgroups');
        if (hostGroupsResult.success) {
          configData.hostGroups = hostGroupsResult.data || [];
        }
      }

      // Get user group configurations
      if (section === 'all' || section === 'usergroups') {
        const userGroupsResult = await makeRobustGizmoRequest('/api/usergroups');
        if (userGroupsResult.success) {
          configData.userGroups = userGroupsResult.data || [];
        }
      }

      // Get time offers
      if (section === 'all' || section === 'timeoffers') {
        const timeOffersResult = await makeRobustGizmoRequest('/api/timeoffers');
        if (timeOffersResult.success) {
          configData.timeOffers = timeOffersResult.data || [];
        }
      }

      // Get system attributes
      if (section === 'all' || section === 'attributes') {
        const attributesResult = await makeRobustGizmoRequest('/api/attributes');
        if (attributesResult.success) {
          configData.attributes = attributesResult.data || [];
        }
      }

      return NextResponse.json({
        success: true,
        data: configData,
        meta: {
          section: section,
          lastUpdated: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error fetching system config:', error);
      return NextResponse.json({
        success: false,
        error: 'Error fetching system configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('System config API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
