
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
    const operation = searchParams.get('operation') || 'summary';
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    switch (operation) {
      case 'summary':
        // Get billing summary
        const transactionsResult = await makeRobustGizmoRequest('/api/transactions');
        const usersResult = await makeRobustGizmoRequest('/api/users');

        if (transactionsResult.success && usersResult.success) {
          const transactions = transactionsResult.data || [];
          const users = usersResult.data || [];

          // Calculate summary statistics
          const totalRevenue = transactions.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
          const totalTransactions = transactions.length;
          const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
          
          // Group by transaction type
          const byType = transactions.reduce((acc: any, t: any) => {
            const type = t.type || 'Other';
            acc[type] = (acc[type] || 0) + (t.amount || 0);
            return acc;
          }, {});

          // Get user balances
          const userBalances = users.map((u: any) => ({
            userId: u.id,
            username: u.username,
            balance: u.balance || 0,
            credit: u.credit || 0
          }));

          return NextResponse.json({
            success: true,
            data: {
              summary: {
                totalRevenue,
                totalTransactions,
                averageTransaction,
                revenueByType: byType
              },
              userBalances: userBalances.slice(0, 20), // Top 20 users
              period: {
                startDate: startDate || 'All time',
                endDate: endDate || 'Now'
              }
            }
          });
        }
        break;

      case 'user-balance':
        if (!userId) {
          return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const userBalanceResult = await makeRobustGizmoRequest(`/api/users/${userId}/balance`);
        const userTransactionsResult = await makeRobustGizmoRequest(`/api/users/${userId}/transactions`);

        if (userBalanceResult.success) {
          return NextResponse.json({
            success: true,
            data: {
              balance: userBalanceResult.data,
              transactions: userTransactionsResult.success ? userTransactionsResult.data : []
            }
          });
        }
        break;

      default:
        return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });

  } catch (error) {
    console.error('Billing operations API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { operation, userId, amount, type, description } = body;

    if (!operation || !userId) {
      return NextResponse.json({ error: 'Operation and user ID required' }, { status: 400 });
    }

    switch (operation) {
      case 'add-credit':
        if (!amount || amount <= 0) {
          return NextResponse.json({ error: 'Valid amount required' }, { status: 400 });
        }

        const addCreditResult = await makeRobustGizmoRequest(`/api/users/${userId}/addcredit`, {
          method: 'POST',
          body: JSON.stringify({
            amount: amount,
            description: description || 'Admin credit addition'
          })
        });

        return NextResponse.json({
          success: addCreditResult.success,
          data: addCreditResult.data,
          error: addCreditResult.error
        });

      case 'deduct-credit':
        if (!amount || amount <= 0) {
          return NextResponse.json({ error: 'Valid amount required' }, { status: 400 });
        }

        const deductCreditResult = await makeRobustGizmoRequest(`/api/users/${userId}/deductcredit`, {
          method: 'POST',
          body: JSON.stringify({
            amount: amount,
            description: description || 'Admin credit deduction'
          })
        });

        return NextResponse.json({
          success: deductCreditResult.success,
          data: deductCreditResult.data,
          error: deductCreditResult.error
        });

      case 'add-transaction':
        const transactionResult = await makeRobustGizmoRequest('/api/transactions', {
          method: 'POST',
          body: JSON.stringify({
            userId: userId,
            amount: amount,
            type: type || 'Manual',
            description: description || 'Manual transaction'
          })
        });

        return NextResponse.json({
          success: transactionResult.success,
          data: transactionResult.data,
          error: transactionResult.error
        });

      default:
        return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }

  } catch (error) {
    console.error('Billing operations POST API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
