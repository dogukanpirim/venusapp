
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShoppingCart,
  Clock,
  RefreshCw
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface GizmoTransactionHistoryProps {
  transactions: any[];
  showTitle?: boolean;
}

export function GizmoTransactionHistory({ transactions, showTitle = true }: GizmoTransactionHistoryProps) {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return ArrowDownLeft;
      case 'PURCHASE':
      case 'PRODUCT_PURCHASE':
        return ShoppingCart;
      case 'TIME_PURCHASE':
        return Clock;
      case 'REFUND':
        return RefreshCw;
      default:
        return ArrowUpRight;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
      case 'REFUND':
        return 'text-green-400';
      case 'PURCHASE':
      case 'PRODUCT_PURCHASE':
      case 'TIME_PURCHASE':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getTransactionBadgeColor = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return 'bg-green-900/50 text-green-200';
      case 'PURCHASE':
      case 'PRODUCT_PURCHASE':
        return 'bg-blue-900/50 text-blue-200';
      case 'TIME_PURCHASE':
        return 'bg-purple-900/50 text-purple-200';
      case 'REFUND':
        return 'bg-yellow-900/50 text-yellow-200';
      default:
        return 'bg-gray-700/50 text-gray-300';
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels = {
      DEPOSIT: 'Para Yatırma',
      PURCHASE: 'Satın Alma',
      REFUND: 'İade',
      ADJUSTMENT: 'Düzeltme',
      TIME_PURCHASE: 'Süre Satın Alma',
      PRODUCT_PURCHASE: 'Ürün Satın Alma',
      SERVICE_FEE: 'Hizmet Bedeli',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const content = (
    <div className="space-y-4">
      {transactions?.length > 0 ? transactions.map((transaction, index) => {
        const Icon = getTransactionIcon(transaction.type);
        const isIncome = transaction.type === 'DEPOSIT' || transaction.type === 'REFUND';
        
        return (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700 hover:bg-gray-800/70 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-lg ${
                isIncome ? 'bg-green-900/50' : 'bg-red-900/50'
              }`}>
                <Icon className={`h-4 w-4 ${getTransactionColor(transaction.type)}`} />
              </div>
              <div>
                <p className="font-medium text-white">
                  {transaction.productName || transaction.description}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge 
                    variant="secondary" 
                    className={getTransactionBadgeColor(transaction.type)}
                  >
                    {getTransactionTypeLabel(transaction.type)}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${isIncome ? 'text-green-400' : 'text-red-400'}`}>
                {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
              </p>
              {transaction.paymentMethod && (
                <p className="text-xs text-gray-500">
                  {transaction.paymentMethod}
                </p>
              )}
            </div>
          </motion.div>
        );
      }) : (
        <div className="text-center py-8 text-gray-400">
          <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Henüz işlem geçmişi bulunmuyor</p>
        </div>
      )}
    </div>
  );

  if (!showTitle) {
    return content;
  }

  return (
    <Card className="gaming-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>İşlem Geçmişi</span>
        </CardTitle>
        <CardDescription>Son finansal işlemleriniz</CardDescription>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
}
