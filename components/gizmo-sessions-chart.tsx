
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';

interface GizmoSessionsChartProps {
  profileId: string;
}

export function GizmoSessionsChart({ profileId }: GizmoSessionsChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate mock data for the last 30 days
    const generateMockData = () => {
      const data = [];
      const today = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        // More activity on weekends
        const baseSessions = isWeekend ? 2 : 1;
        const sessions = Math.floor(Math.random() * 3 + baseSessions);
        const playTime = sessions * (Math.random() * 120 + 60); // 60-180 minutes per session
        const cost = playTime * (Math.random() * 2 + 1); // 1-3 TL per minute
        
        data.push({
          date: date.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
          fullDate: date.toISOString().split('T')[0],
          sessions,
          playTime: Math.round(playTime),
          cost: Math.round(cost * 100) / 100,
        });
      }
      
      return data;
    };

    setTimeout(() => {
      setChartData(generateMockData());
      setLoading(false);
    }, 500);
  }, [profileId]);

  if (loading) {
    return (
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Oyun Aktivitesi</span>
          </CardTitle>
          <CardDescription>Son 30 günlük oyun verileriniz</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Grafik yükleniyor...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gaming-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Oyun Aktivitesi</span>
        </CardTitle>
        <CardDescription>Son 30 günlük oyun verileriniz</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis 
                dataKey="date" 
                tickLine={false}
                tick={{ fontSize: 10 }}
                axisLine={false}
              />
              <YAxis 
                tickLine={false}
                tick={{ fontSize: 10 }}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'playTime') {
                    return [`${Math.floor(value / 60)}s ${value % 60}dk`, 'Oyun Süresi'];
                  }
                  if (name === 'cost') {
                    return [`${value.toFixed(2)} ₺`, 'Harcama'];
                  }
                  return [value, name === 'sessions' ? 'Oturum' : name];
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '11px' }}
              />
              <Line 
                type="monotone" 
                dataKey="playTime" 
                stroke="#60B5FF" 
                strokeWidth={2}
                dot={{ fill: '#60B5FF', r: 3 }}
                name="Oyun Süresi (dk)"
              />
              <Line 
                type="monotone" 
                dataKey="cost" 
                stroke="#FF9149" 
                strokeWidth={2}
                dot={{ fill: '#FF9149', r: 3 }}
                name="Harcama (₺)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
