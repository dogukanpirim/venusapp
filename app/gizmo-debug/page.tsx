
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCw, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Database,
  User,
  DollarSign,
  Activity,
  Settings
} from 'lucide-react';

interface EndpointResult {
  endpoint: string;
  description: string;
  status: number | null;
  statusText: string | null;
  contentType: string | null;
  success: boolean;
  data?: any;
  error?: string;
}

interface DebugResponse {
  success: boolean;
  gizmoApiUrl: string;
  timestamp: string;
  endpoints: EndpointResult[];
}

export default function GizmoDebugPage() {
  const [debugData, setDebugData] = useState<DebugResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchUser, setSearchUser] = useState('dogukan');
  const [userBalance, setUserBalance] = useState<any>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [usersList, setUsersList] = useState<any>(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [authData, setAuthData] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [registrationTest, setRegistrationTest] = useState({
    username: 'testuser',
    password: 'testpass',
    confirmPassword: 'testpass',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com'
  });
  const [registrationResult, setRegistrationResult] = useState<any>(null);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [authStatusLoading, setAuthStatusLoading] = useState(false);
  const [robustDebug, setRobustDebug] = useState<any>(null);
  const [robustDebugLoading, setRobustDebugLoading] = useState(false);
  const [robustTestEndpoint, setRobustTestEndpoint] = useState('/api/users');
  const [robustSimulateFailure, setRobustSimulateFailure] = useState(false);

  const fetchDebugData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gizmo/debug');
      const data = await response.json();
      setDebugData(data);
    } catch (error) {
      console.error('Error fetching debug data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthData = async () => {
    setAuthLoading(true);
    try {
      const response = await fetch('/api/gizmo/auth-test');
      const data = await response.json();
      setAuthData(data);
    } catch (error) {
      console.error('Error fetching auth data:', error);
      setAuthData({ success: false, error: 'Failed to fetch auth data' });
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchUserBalance = async (username: string) => {
    setBalanceLoading(true);
    try {
      const response = await fetch(`/api/gizmo/balance/${username}`);
      const data = await response.json();
      setUserBalance(data);
    } catch (error) {
      console.error('Error fetching user balance:', error);
      setUserBalance({ success: false, error: 'Failed to fetch balance' });
    } finally {
      setBalanceLoading(false);
    }
  };

  const fetchUsersList = async () => {
    setUsersLoading(true);
    try {
      const response = await fetch('/api/gizmo/users-list');
      const data = await response.json();
      setUsersList(data);
    } catch (error) {
      console.error('Error fetching users list:', error);
      setUsersList({ success: false, error: 'Failed to fetch users' });
    } finally {
      setUsersLoading(false);
    }
  };

  const testRegistration = async () => {
    setRegistrationLoading(true);
    try {
      const response = await fetch('/api/gizmo/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationTest),
      });
      const data = await response.json();
      setRegistrationResult(data);
    } catch (error) {
      console.error('Error testing registration:', error);
      setRegistrationResult({ success: false, error: 'Failed to test registration' });
    } finally {
      setRegistrationLoading(false);
    }
  };

  const fetchAuthStatus = async (clearCache = false) => {
    setAuthStatusLoading(true);
    try {
      const url = clearCache ? '/api/gizmo/auth-status?clearCache=true' : '/api/gizmo/auth-status';
      const response = await fetch(url);
      const data = await response.json();
      setAuthStatus(data);
    } catch (error) {
      console.error('Error fetching auth status:', error);
      setAuthStatus({ success: false, error: 'Failed to fetch auth status' });
    } finally {
      setAuthStatusLoading(false);
    }
  };

  const fetchRobustDebug = async (clearCache = false) => {
    setRobustDebugLoading(true);
    try {
      const params = new URLSearchParams({
        endpoint: robustTestEndpoint,
        simulateFailure: robustSimulateFailure.toString()
      });
      
      if (clearCache) {
        params.append('clearCache', 'true');
      }
      
      const url = `/api/gizmo/robust-debug?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();
      setRobustDebug(data);
    } catch (error) {
      console.error('Error fetching robust debug data:', error);
      setRobustDebug({ success: false, error: 'Failed to fetch robust debug data' });
    } finally {
      setRobustDebugLoading(false);
    }
  };

  useEffect(() => {
    fetchDebugData();
  }, []);

  const getStatusBadge = (success: boolean, status: number | null) => {
    if (success) {
      return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Success</Badge>;
    } else if (status === null) {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Error</Badge>;
    } else {
      return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Gizmo API Debug Dashboard</h1>
        <p className="text-muted-foreground">Debug and test Gizmo API integration</p>
      </div>

      <Tabs defaultValue="robust-debug" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="robust-debug">
            <Activity className="w-4 h-4 mr-2" />
            Robust Debug
          </TabsTrigger>
          <TabsTrigger value="auth-status">
            <CheckCircle className="w-4 h-4 mr-2" />
            Auth Status
          </TabsTrigger>
          <TabsTrigger value="auth">
            <Settings className="w-4 h-4 mr-2" />
            Authentication
          </TabsTrigger>
          <TabsTrigger value="endpoints">
            <Settings className="w-4 h-4 mr-2" />
            Endpoints
          </TabsTrigger>
          <TabsTrigger value="users">
            <User className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="balance">
            <DollarSign className="w-4 h-4 mr-2" />
            Balance
          </TabsTrigger>
          <TabsTrigger value="registration">
            <Database className="w-4 h-4 mr-2" />
            Registration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="robust-debug" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Robust Gizmo API Client Debug
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <select 
                  value={robustTestEndpoint} 
                  onChange={(e) => setRobustTestEndpoint(e.target.value)}
                  className="px-3 py-1 border rounded text-sm"
                >
                  <option value="/api/users">Users</option>
                  <option value="/api/hosts">Hosts</option>
                  <option value="/api/members">Members</option>
                  <option value="/api/users/dogukan">User Dogukan</option>
                  <option value="/api/users/dogukan/balance">Dogukan Balance</option>
                </select>
                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={robustSimulateFailure}
                    onChange={(e) => setRobustSimulateFailure(e.target.checked)}
                    className="rounded"
                  />
                  Simulate Failure (6 attempts)
                </label>
                <Button onClick={() => fetchRobustDebug()} disabled={robustDebugLoading}>
                  {robustDebugLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Test Robust API
                </Button>
                <Button onClick={() => fetchRobustDebug(true)} disabled={robustDebugLoading} variant="outline">
                  Clear Cache & Test
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {robustDebug ? (
                <div className="space-y-4">
                  {/* Test Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">Test Configuration</h4>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">Endpoint:</span> {robustDebug.testConfiguration?.endpoint}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Test Count:</span> {robustDebug.testConfiguration?.testCount}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Simulate Failure:</span> {robustDebug.testConfiguration?.simulateFailure ? 'Yes' : 'No'}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">Test Results</h4>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">Total:</span> {robustDebug.summary?.total || 0}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Successful:</span> {robustDebug.summary?.successful || 0}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Failed:</span> {robustDebug.summary?.failed || 0}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Avg Response:</span> {robustDebug.summary?.averageResponseTime?.toFixed(0) || 0}ms
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">Cache & Retry Stats</h4>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">From Cache:</span> {robustDebug.summary?.fromCache || 0}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Fallback:</span> {robustDebug.summary?.fallback || 0}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Retried:</span> {robustDebug.summary?.retried || 0}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">Circuit Breaker</h4>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">State:</span> {robustDebug.systemStatus?.final?.circuitBreaker?.state || 'CLOSED'}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Failures:</span> {robustDebug.systemStatus?.final?.circuitBreaker?.failures || 0}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Changed:</span> {robustDebug.systemStatus?.circuitBreakerChanged ? 'Yes' : 'No'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Authentication Status */}
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Authentication Status</h4>
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="font-medium">Status:</span> {robustDebug.authSession?.authenticated ? 
                          <Badge variant="default" className="ml-2 bg-green-500">Authenticated</Badge> : 
                          <Badge variant="destructive" className="ml-2">Failed</Badge>
                        }
                      </div>
                      {robustDebug.authSession?.authenticated && (
                        <div className="text-sm">
                          <span className="font-medium">Session:</span> {new Date(robustDebug.authSession.timestamp).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Detailed Test Results */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Detailed Test Results</h4>
                    {robustDebug.testResults?.map((result: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">Attempt {result.attempt}</Badge>
                            <code className="bg-muted px-2 py-1 rounded text-sm">{result.endpoint}</code>
                            <span className="text-xs text-muted-foreground">{result.timestamp}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(result.success, result.status)}
                            <span className="text-xs text-muted-foreground">{result.responseTime}ms</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                          <div className="text-sm">
                            <span className="font-medium">Status:</span> {result.status || 'N/A'}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">From Cache:</span> {result.fromCache ? 'Yes' : 'No'}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Fallback:</span> {result.fallback ? 'Yes' : 'No'}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Retries:</span> {result.retryCount || 0}
                          </div>
                        </div>
                        
                        {result.success && result.data && (
                          <div className="bg-green-50 p-3 rounded text-sm">
                            <strong>Response Data:</strong>
                            <pre className="whitespace-pre-wrap overflow-x-auto mt-2 max-h-40">
                              {typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}
                            </pre>
                          </div>
                        )}
                        
                        {result.error && (
                          <div className="bg-red-50 p-3 rounded text-sm text-red-700">
                            <strong>Error:</strong> {result.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* System Status Changes */}
                  {robustDebug.systemStatus && (
                    <div className="space-y-4">
                      <h4 className="font-semibold">System Status Changes</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <h5 className="font-semibold text-sm mb-2">Initial State</h5>
                          <div className="text-sm space-y-1">
                            <div><strong>Circuit Breaker:</strong> {robustDebug.systemStatus.initial?.circuitBreaker?.state} ({robustDebug.systemStatus.initial?.circuitBreaker?.failures} failures)</div>
                            <div><strong>Cache Size:</strong> {robustDebug.systemStatus.initial?.cache?.dataCacheSize || 0} entries</div>
                            <div><strong>Auth Cached:</strong> {robustDebug.systemStatus.initial?.cache?.authCached ? 'Yes' : 'No'}</div>
                          </div>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <h5 className="font-semibold text-sm mb-2">Final State</h5>
                          <div className="text-sm space-y-1">
                            <div><strong>Circuit Breaker:</strong> {robustDebug.systemStatus.final?.circuitBreaker?.state} ({robustDebug.systemStatus.final?.circuitBreaker?.failures} failures)</div>
                            <div><strong>Cache Size:</strong> {robustDebug.systemStatus.final?.cache?.dataCacheSize || 0} entries</div>
                            <div><strong>Auth Cached:</strong> {robustDebug.systemStatus.final?.cache?.authCached ? 'Yes' : 'No'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Click "Test Robust API" to test the retry mechanism and fallback strategy</p>
                  <p className="text-sm mt-2">• Select an endpoint to test</p>
                  <p className="text-sm">• Enable "Simulate Failure" to test circuit breaker</p>
                  <p className="text-sm">• Clear cache to test authentication retry</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auth-status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                New Authentication System Status
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button onClick={() => fetchAuthStatus()} disabled={authStatusLoading}>
                  {authStatusLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Test Authentication
                </Button>
                <Button onClick={() => fetchAuthStatus(true)} disabled={authStatusLoading} variant="outline">
                  Clear Cache & Test
                </Button>
                {authStatus && (
                  <div className="text-sm text-muted-foreground">
                    Admin: admin:123455 | Status: {authStatus.authenticated ? 'Authenticated' : 'Failed'}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {authStatus ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">Authentication Status</h4>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">Status:</span> {authStatus.authenticated ? 
                            <Badge variant="default" className="bg-green-500">Authenticated</Badge> : 
                            <Badge variant="destructive">Failed</Badge>
                          }
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Admin User:</span> {authStatus.adminCredentials?.username}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Has Cookies:</span> {authStatus.authSession?.hasCookies ? 'Yes' : 'No'}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Has Token:</span> {authStatus.authSession?.hasToken ? 'Yes' : 'No'}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">Test Summary</h4>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">Total Tests:</span> {authStatus.summary?.total || 0}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Successful:</span> {authStatus.summary?.successful || 0}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Failed:</span> {authStatus.summary?.failed || 0}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">Session Info</h4>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">Timestamp:</span> {authStatus.authSession?.timestamp ? new Date(authStatus.authSession.timestamp).toLocaleString() : 'N/A'}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Cache:</span> {authStatus.cleared ? 'Cleared' : 'Active'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Authenticated Endpoint Tests</h4>
                    {authStatus.testResults?.map((result: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <code className="bg-muted px-2 py-1 rounded text-sm">{result.endpoint}</code>
                            <span className="text-sm text-muted-foreground">
                              {result.authenticated ? 'Authenticated Request' : 'Unauthenticated'}
                            </span>
                          </div>
                          {getStatusBadge(result.success, result.status)}
                        </div>
                        {result.success && result.data && (
                          <div className="bg-muted p-3 rounded text-sm">
                            <pre className="whitespace-pre-wrap overflow-x-auto max-h-40">
                              {typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}
                            </pre>
                          </div>
                        )}
                        {result.error && (
                          <div className="bg-red-50 p-3 rounded text-sm text-red-700">
                            Error: {result.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Click "Test Authentication" to verify the new authentication system</p>
                  <p className="text-sm mt-2">This will authenticate with admin:123455 and test all endpoints</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Gizmo API Authentication Test
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button onClick={fetchAuthData} disabled={authLoading}>
                  {authLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Test Authentication
                </Button>
                {authData && (
                  <div className="text-sm text-muted-foreground">
                    Admin: admin:123455 | Authenticated: {authData.authenticated ? 'Yes' : 'No'}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {authData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">Authentication Status</h4>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">Status:</span> {authData.authenticated ? 
                            <Badge variant="default" className="bg-green-500">Authenticated</Badge> : 
                            <Badge variant="destructive">Not Authenticated</Badge>
                          }
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Admin User:</span> {authData.adminCredentials?.username}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Auth Token:</span> {authData.authToken ? 'Yes' : 'No'}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">Test Summary</h4>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">Total Tests:</span> {authData.summary?.total || 0}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Successful:</span> {authData.summary?.successful || 0}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Authenticated:</span> {authData.summary?.authenticated || 0}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">Dogukan User</h4>
                      <div className="space-y-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => fetchUserBalance('dogukan')}
                          disabled={balanceLoading}
                        >
                          {balanceLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                          Check Balance
                        </Button>
                        {userBalance && userBalance.username === 'dogukan' && (
                          <div className="text-sm mt-2">
                            {userBalance.success ? 
                              <Badge variant="default" className="bg-green-500">Balance Found</Badge> : 
                              <Badge variant="destructive">Balance Not Found</Badge>
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Detailed Test Results</h4>
                    {authData.results?.map((result: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <code className="bg-muted px-2 py-1 rounded text-sm">{result.endpoint}</code>
                            <span className="text-sm text-muted-foreground">{result.description}</span>
                            {result.description?.includes('Authenticated') && <span className="text-xs text-blue-600">(Authenticated)</span>}
                          </div>
                          {getStatusBadge(result.success, result.status)}
                        </div>
                        {result.success && result.data && (
                          <div className="bg-muted p-3 rounded text-sm">
                            <pre className="whitespace-pre-wrap overflow-x-auto max-h-40">
                              {typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}
                            </pre>
                          </div>
                        )}
                        {result.error && (
                          <div className="bg-red-50 p-3 rounded text-sm text-red-700">
                            Error: {result.error}
                          </div>
                        )}
                        {result.cookies && (
                          <div className="bg-blue-50 p-3 rounded text-sm text-blue-700 mt-2">
                            <strong>Auth Cookies:</strong> {result.cookies.substring(0, 100)}...
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Click "Test Authentication" to verify admin credentials and authenticate with Gizmo API
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Gizmo API Endpoints Test
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button onClick={fetchDebugData} disabled={loading}>
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Refresh
                </Button>
                {debugData && (
                  <div className="text-sm text-muted-foreground">
                    Last updated: {new Date(debugData.timestamp).toLocaleString()}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {debugData ? (
                <div className="space-y-4">
                  <div className="text-sm">
                    <strong>Gizmo API URL:</strong> {debugData.gizmoApiUrl}
                  </div>
                  <div className="grid gap-4">
                    {debugData.endpoints.map((endpoint, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <code className="bg-muted px-2 py-1 rounded text-sm">{endpoint.endpoint}</code>
                            <span className="text-sm text-muted-foreground">{endpoint.description}</span>
                          </div>
                          {getStatusBadge(endpoint.success, endpoint.status)}
                        </div>
                        {endpoint.success && endpoint.data && (
                          <div className="bg-muted p-3 rounded text-sm">
                            <pre className="whitespace-pre-wrap overflow-x-auto">
                              {typeof endpoint.data === 'string' ? endpoint.data : JSON.stringify(endpoint.data, null, 2)}
                            </pre>
                          </div>
                        )}
                        {endpoint.error && (
                          <div className="bg-red-50 p-3 rounded text-sm text-red-700">
                            Error: {endpoint.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Click refresh to test Gizmo API endpoints
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Users List (Direct API - No Auth)
              </CardTitle>
              <Button onClick={fetchUsersList} disabled={usersLoading}>
                {usersLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Fetch Users
              </Button>
            </CardHeader>
            <CardContent>
              {usersList ? (
                <div className="space-y-4">
                  {usersList.success ? (
                    <div>
                      <div className="mb-4 space-y-2">
                        <div><strong>Working Endpoint:</strong> <code>{usersList.endpoint}</code></div>
                        <div><strong>Method:</strong> <code>{usersList.method}</code></div>
                        <div><strong>Authentication:</strong> {usersList.authenticated ? 
                          <Badge variant="default" className="bg-green-500">Yes</Badge> : 
                          <Badge variant="outline" className="bg-blue-100 text-blue-700">No (Direct API)</Badge>
                        }</div>
                      </div>
                      
                      {/* Dogukan User Status */}
                      {usersList.dogukanFound !== undefined && (
                        <div className="mb-4">
                          <strong>Dogukan User Status:</strong>
                          <div className="mt-2 p-3 bg-yellow-50 rounded border border-yellow-200">
                            <div className="flex items-center gap-2">
                              {usersList.dogukanFound ? (
                                <>
                                  <Badge variant="default" className="bg-green-500">Found!</Badge>
                                  <span className="text-sm">{usersList.dogukanNote}</span>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => fetchUserBalance('dogukan')}
                                    disabled={balanceLoading}
                                  >
                                    Check Balance
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Badge variant="outline" className="bg-yellow-100 text-yellow-700">Not Found</Badge>
                                  <span className="text-sm">{usersList.dogukanNote}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="bg-muted p-4 rounded">
                        <strong>Users Data:</strong>
                        <pre className="whitespace-pre-wrap overflow-x-auto mt-2">
                          {typeof usersList.data === 'string' ? usersList.data : JSON.stringify(usersList.data, null, 2)}
                        </pre>
                      </div>
                      
                      {usersList.allResults && (
                        <div className="mt-4">
                          <strong>All Tested Endpoints:</strong>
                          <div className="space-y-2 mt-2">
                            {usersList.allResults.map((result: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <code className="text-sm">{result.endpoint}</code>
                                {getStatusBadge(result.success, result.status)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-red-50 p-4 rounded text-red-700">
                      <strong>Error:</strong> {usersList.error}
                      <div className="mt-2">
                        <strong>Authentication Status:</strong> <Badge variant="outline" className="bg-blue-100 text-blue-700">No Auth (Direct API)</Badge>
                      </div>
                      {usersList.note && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-blue-700">
                          <strong>Note:</strong> {usersList.note}
                        </div>
                      )}
                      {usersList.testedEndpoints && (
                        <div className="mt-2">
                          <strong>Tested endpoints:</strong>
                          <ul className="list-disc ml-4">
                            {usersList.testedEndpoints.map((endpoint: string, index: number) => (
                              <li key={index}><code>{endpoint}</code></li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {usersList.allResults && (
                        <div className="mt-2">
                          <strong>All Test Results:</strong>
                          <div className="space-y-1 mt-1">
                            {usersList.allResults.map((result: any, index: number) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <code>{result.endpoint}</code>
                                <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                                  {result.success ? 'Success' : `Error: ${result.error || result.status}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Click "Fetch Users" to get the users list from Gizmo API</p>
                  <p className="text-sm mt-2">This uses direct API calls WITHOUT authentication</p>
                  <p className="text-sm mt-1">Will search for "dogukan" user in the results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                User Balance Lookup (Direct API - No Auth)
              </CardTitle>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Username"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="max-w-xs"
                />
                <Button onClick={() => fetchUserBalance(searchUser)} disabled={balanceLoading || !searchUser}>
                  {balanceLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Search
                </Button>
                {searchUser === 'dogukan' && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    Target User
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {userBalance ? (
                <div className="space-y-4">
                  {userBalance.success ? (
                    <div>
                      <div className="mb-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <strong>User:</strong> {userBalance.username}
                          {userBalance.username === 'dogukan' && (
                            <Badge variant="default" className="bg-green-500">Target User Found!</Badge>
                          )}
                          {userBalance.dogukanUser && (
                            <Badge variant="default" className="bg-green-500">Dogukan User!</Badge>
                          )}
                        </div>
                        <div><strong>Working Endpoint:</strong> <code>{userBalance.endpoint}</code></div>
                        <div><strong>Method:</strong> <code>{userBalance.method}</code></div>
                        <div><strong>Authentication:</strong> {userBalance.authenticated ? 
                          <Badge variant="default" className="bg-green-500">Yes</Badge> : 
                          <Badge variant="outline" className="bg-blue-100 text-blue-700">No (Direct API)</Badge>
                        }</div>
                        {userBalance.note && (
                          <div><strong>Note:</strong> <span className="text-sm text-blue-600">{userBalance.note}</span></div>
                        )}
                        {userBalance.dogukanNote && (
                          <div><strong>Dogukan Note:</strong> <span className="text-sm text-green-600">{userBalance.dogukanNote}</span></div>
                        )}
                      </div>
                      <div className="bg-muted p-4 rounded">
                        <strong>Balance Data:</strong>
                        <pre className="whitespace-pre-wrap overflow-x-auto mt-2">
                          {typeof userBalance.data === 'string' ? userBalance.data : JSON.stringify(userBalance.data, null, 2)}
                        </pre>
                      </div>
                      {userBalance.allResults && (
                        <div className="mt-4">
                          <strong>All Tested Endpoints:</strong>
                          <div className="space-y-2 mt-2">
                            {userBalance.allResults.map((result: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <code className="text-sm">{result.endpoint}</code>
                                {getStatusBadge(result.success, result.status)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-red-50 p-4 rounded text-red-700">
                      <strong>Error:</strong> {userBalance.error}
                      <div className="mt-2">
                        <strong>Authentication Status:</strong> <Badge variant="outline" className="bg-blue-100 text-blue-700">No Auth (Direct API)</Badge>
                      </div>
                      {userBalance.note && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-blue-700">
                          <strong>Note:</strong> {userBalance.note}
                        </div>
                      )}
                      {userBalance.testedEndpoints && (
                        <div className="mt-2">
                          <strong>Tested endpoints:</strong>
                          <ul className="list-disc ml-4">
                            {userBalance.testedEndpoints.map((endpoint: string, index: number) => (
                              <li key={index}><code>{endpoint}</code></li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {userBalance.allResults && (
                        <div className="mt-2">
                          <strong>All Test Results:</strong>
                          <div className="space-y-1 mt-1">
                            {userBalance.allResults.map((result: any, index: number) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <code>{result.endpoint}</code>
                                <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                                  {result.success ? 'Success' : `Error: ${result.error || result.status}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Enter a username and click "Search" to get balance information</p>
                  <p className="text-sm mt-2">This uses direct API calls WITHOUT authentication</p>
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => fetchUserBalance('dogukan')}
                      disabled={balanceLoading}
                    >
                      {balanceLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      Quick Search: dogukan
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Registration Test
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Test the registration endpoint to identify why users aren't being saved to database
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Username"
                    value={registrationTest.username}
                    onChange={(e) => setRegistrationTest({...registrationTest, username: e.target.value})}
                  />
                  <Input
                    placeholder="Password"
                    type="password"
                    value={registrationTest.password}
                    onChange={(e) => setRegistrationTest({...registrationTest, password: e.target.value})}
                  />
                  <Input
                    placeholder="Confirm Password"
                    type="password"
                    value={registrationTest.confirmPassword}
                    onChange={(e) => setRegistrationTest({...registrationTest, confirmPassword: e.target.value})}
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={registrationTest.email}
                    onChange={(e) => setRegistrationTest({...registrationTest, email: e.target.value})}
                  />
                  <Input
                    placeholder="First Name"
                    value={registrationTest.firstName}
                    onChange={(e) => setRegistrationTest({...registrationTest, firstName: e.target.value})}
                  />
                  <Input
                    placeholder="Last Name"
                    value={registrationTest.lastName}
                    onChange={(e) => setRegistrationTest({...registrationTest, lastName: e.target.value})}
                  />
                </div>
                <Button onClick={testRegistration} disabled={registrationLoading}>
                  {registrationLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                  Test Registration
                </Button>
                
                {registrationResult && (
                  <div className="space-y-4">
                    <div className={`p-4 rounded ${registrationResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      <strong>Result:</strong> {registrationResult.message}
                    </div>
                    <div className="bg-muted p-4 rounded">
                      <pre className="whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(registrationResult, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
