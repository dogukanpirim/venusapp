
'use client';

import { RealTimeBalance } from '@/components/real-time-balance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function BalanceTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-background to-blue-900/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Balance Test Page</CardTitle>
              <CardDescription className="text-center">
                RealTimeBalance Component Test - Open Console to see debug logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-400 mb-4">
                Click the refresh button and check the browser console for debug logs
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle>Full Balance Widget - crazyl0043</CardTitle>
                <CardDescription>
                  Test user with balance data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RealTimeBalance 
                  username="crazyl0043" 
                  compact={false}
                />
              </CardContent>
            </Card>

            <Card className="gaming-card">
              <CardHeader>
                <CardTitle>Compact Balance Widget - admin</CardTitle>
                <CardDescription>
                  Admin user in compact mode
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RealTimeBalance 
                  username="admin" 
                  compact={true}
                />
              </CardContent>
            </Card>

          </div>

          <div className="space-y-4">
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle>Manual API Test</CardTitle>
                <CardDescription>
                  Test balance API directly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <button 
                    onClick={() => {
                      console.log('🧪 Manual API test started');
                      fetch('/api/gizmo/balance/crazyl0043')
                        .then(response => {
                          console.log('🧪 Manual API Response Status:', response.status);
                          return response.json();
                        })
                        .then(data => {
                          console.log('🧪 Manual API Response Data:', data);
                        })
                        .catch(error => {
                          console.error('🧪 Manual API Error:', error);
                        });
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Test API Manually
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
