
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, CreditCard, Receipt, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function BillingManagement() {
  const [billingData, setBillingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock billing data
    const mockData = {
      daily_revenue: 1250,
      monthly_revenue: 38500,
      pending_payments: 850,
      recent_transactions: Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        user: `player${i + 1}`,
        amount: Math.floor(Math.random() * 100) + 20,
        type: ['session', 'balance_top_up', 'food_order'][Math.floor(Math.random() * 3)],
        status: ['completed', 'pending', 'failed'][Math.floor(Math.random() * 3)],
        timestamp: '2025-01-12 14:30'
      }))
    };
    
    setBillingData(mockData);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-2xl font-bold text-white mb-4">Billing Management</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="gaming-card border-green-400/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Daily Revenue</p>
                  <p className="text-2xl font-bold text-white">₺{billingData?.daily_revenue}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="gaming-card border-blue-400/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-white">₺{billingData?.monthly_revenue}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="gaming-card border-yellow-400/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Pending Payments</p>
                  <p className="text-2xl font-bold text-white">₺{billingData?.pending_payments}</p>
                </div>
                <CreditCard className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="gaming-card border-purple-400/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Receipt className="h-5 w-5 mr-2" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {billingData?.recent_transactions.map((transaction: any, index: number) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                  <div>
                    <div className="font-medium text-white">{transaction.user}</div>
                    <div className="text-sm text-gray-400">{transaction.type} • {transaction.timestamp}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white">₺{transaction.amount}</div>
                    <Badge 
                      variant="outline" 
                      className={
                        transaction.status === 'completed' ? 'border-green-400/50 text-green-400' :
                        transaction.status === 'pending' ? 'border-yellow-400/50 text-yellow-400' :
                        'border-red-400/50 text-red-400'
                      }
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
