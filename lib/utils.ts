import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} dakika`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} saat`;
  }
  
  return `${hours} saat ${remainingMinutes} dakika`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// =================== ROBUST GIZMO API CLIENT ===================

interface GizmoAuthSession {
  cookies: string;
  token?: string;
  authenticated: boolean;
  timestamp: number;
}

interface GizmoApiCacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

interface GizmoApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
  fromCache?: boolean;
  retryCount?: number;
  fallback?: boolean;
  endpoint?: string;
}

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

// Configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableStatusCodes: [401, 429, 500, 502, 503, 504]
};

const CIRCUIT_BREAKER_CONFIG = {
  failureThreshold: 5,
  resetTimeout: 60000, // 1 minute
  halfOpenRetryDelay: 5000 // 5 seconds
};

const CACHE_CONFIG = {
  authDuration: 30 * 60 * 1000, // 30 minutes
  dataDuration: 5 * 60 * 1000, // 5 minutes  
  fallbackDuration: 60 * 60 * 1000 // 1 hour
};

// Global state
let gizmoAuthCache: GizmoAuthSession | null = null;
let gizmoDataCache: Map<string, GizmoApiCacheEntry> = new Map();
let circuitBreaker: CircuitBreakerState = {
  failures: 0,
  lastFailureTime: 0,
  state: 'CLOSED'
};

// Logging utility
function logGizmoRequest(endpoint: string, attempt: number, status?: number, error?: string) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Gizmo API ${endpoint} - Attempt ${attempt} - Status: ${status || 'ERROR'} - ${error || 'OK'}`);
}

// Sleep utility for delays
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Calculate exponential backoff delay
function calculateBackoffDelay(attempt: number): number {
  const delay = Math.min(
    RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1),
    RETRY_CONFIG.maxDelay
  );
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
}

// Circuit breaker functions
function updateCircuitBreaker(success: boolean) {
  const now = Date.now();
  
  if (success) {
    circuitBreaker.failures = 0;
    circuitBreaker.state = 'CLOSED';
  } else {
    circuitBreaker.failures++;
    circuitBreaker.lastFailureTime = now;
    
    if (circuitBreaker.failures >= CIRCUIT_BREAKER_CONFIG.failureThreshold) {
      circuitBreaker.state = 'OPEN';
      console.warn(`Circuit breaker opened after ${circuitBreaker.failures} failures`);
    }
  }
}

function getCircuitBreakerState(): 'CLOSED' | 'OPEN' | 'HALF_OPEN' {
  const now = Date.now();
  
  if (circuitBreaker.state === 'OPEN') {
    if (now - circuitBreaker.lastFailureTime > CIRCUIT_BREAKER_CONFIG.resetTimeout) {
      circuitBreaker.state = 'HALF_OPEN';
      console.log('Circuit breaker moved to HALF_OPEN state');
    }
  }
  
  return circuitBreaker.state;
}

// Cache functions
function getCacheKey(endpoint: string, options?: RequestInit): string {
  const method = options?.method || 'GET';
  const body = options?.body ? JSON.stringify(options.body) : '';
  return `${method}:${endpoint}:${body}`;
}

function getCachedData(cacheKey: string): any | null {
  const cached = gizmoDataCache.get(cacheKey);
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > cached.ttl) {
    gizmoDataCache.delete(cacheKey);
    return null;
  }
  
  return cached.data;
}

function setCachedData(cacheKey: string, data: any, ttl: number = CACHE_CONFIG.dataDuration) {
  gizmoDataCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    ttl
  });
}

// Enhanced authentication with retry
export async function getGizmoAuthSession(forceRefresh = false): Promise<GizmoAuthSession | null> {
  // Check if we have valid cached session
  if (!forceRefresh && gizmoAuthCache && 
      gizmoAuthCache.authenticated && 
      (Date.now() - gizmoAuthCache.timestamp) < CACHE_CONFIG.authDuration) {
    return gizmoAuthCache;
  }

  // Clear expired cache
  gizmoAuthCache = null;

  const baseUrl = process.env.GIZMO_API_URL || 'https://5f86bd85fd1c.ngrok-free.app';
  const adminCredentials = { username: 'admin', password: '123455' };
  const basicAuthCredentials = Buffer.from(`${adminCredentials.username}:${adminCredentials.password}`).toString('base64');
  
  // Retry authentication with exponential backoff
  for (let attempt = 1; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      logGizmoRequest('/api/users', attempt);
      
      const response = await fetch(`${baseUrl}/api/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${basicAuthCredentials}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (response.ok) {
        gizmoAuthCache = {
          cookies: `Basic ${basicAuthCredentials}`,
          token: undefined,
          authenticated: true,
          timestamp: Date.now()
        };
        
        logGizmoRequest('/api/users', attempt, response.status);
        updateCircuitBreaker(true);
        return gizmoAuthCache;
      } else {
        logGizmoRequest('/api/users', attempt, response.status, response.statusText);
        
        // If this is our last attempt, don't retry
        if (attempt === RETRY_CONFIG.maxRetries) {
          updateCircuitBreaker(false);
          return null;
        }
        
        // Wait before retry
        await sleep(calculateBackoffDelay(attempt));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logGizmoRequest('/api/users', attempt, undefined, errorMessage);
      
      // If this is our last attempt, don't retry
      if (attempt === RETRY_CONFIG.maxRetries) {
        updateCircuitBreaker(false);
        return null;
      }
      
      // Wait before retry
      await sleep(calculateBackoffDelay(attempt));
    }
  }

  updateCircuitBreaker(false);
  return null;
}

// Enhanced request function with retry, circuit breaker, and fallback
export async function makeRobustGizmoRequest<T = any>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<GizmoApiResponse<T>> {
  const cacheKey = getCacheKey(endpoint, options);
  const baseUrl = process.env.GIZMO_API_URL || 'https://5f86bd85fd1c.ngrok-free.app';
  
  // Check circuit breaker state
  const circuitState = getCircuitBreakerState();
  if (circuitState === 'OPEN') {
    console.warn(`Circuit breaker is OPEN, returning cached data for ${endpoint}`);
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return {
        success: true,
        data: cachedData,
        fromCache: true,
        fallback: true,
        endpoint
      };
    }
    return {
      success: false,
      error: 'Circuit breaker is open and no cached data available',
      endpoint
    };
  }

  // Try to get fresh data with retry mechanism
  for (let attempt = 1; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      // Get or refresh authentication
      const authSession = await getGizmoAuthSession(attempt > 1); // Force refresh on retry
      
      if (!authSession) {
        // If auth failed, try cached data
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          return {
            success: true,
            data: cachedData,
            fromCache: true,
            fallback: true,
            error: 'Authentication failed, using cached data',
            endpoint
          };
        }
        
        return {
          success: false,
          error: 'Authentication failed and no cached data available',
          endpoint
        };
      }

      logGizmoRequest(endpoint, attempt);
      
      const headers: any = {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Authorization': authSession.cookies,
        ...options.headers
      };

      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        let data: any;
        
        if (contentType?.includes('application/json')) {
          try {
            data = await response.json();
          } catch (e) {
            data = await response.text();
          }
        } else {
          data = await response.text();
        }

        // Cache successful response
        setCachedData(cacheKey, data);
        
        logGizmoRequest(endpoint, attempt, response.status);
        updateCircuitBreaker(true);
        
        return {
          success: true,
          data,
          status: response.status,
          retryCount: attempt - 1,
          endpoint
        };
      } else if (response.status === 401) {
        // Authentication failed, clear cache and try again
        gizmoAuthCache = null;
        logGizmoRequest(endpoint, attempt, response.status, 'Authentication failed, clearing cache');
        
        // Don't immediately fail on 401, let it retry with fresh auth
        if (attempt < RETRY_CONFIG.maxRetries) {
          await sleep(calculateBackoffDelay(attempt));
          continue;
        }
      } else if (RETRY_CONFIG.retryableStatusCodes.includes(response.status)) {
        logGizmoRequest(endpoint, attempt, response.status, 'Retryable error');
        
        if (attempt < RETRY_CONFIG.maxRetries) {
          await sleep(calculateBackoffDelay(attempt));
          continue;
        }
      }

      // Non-retryable error or last attempt
      logGizmoRequest(endpoint, attempt, response.status, 'Non-retryable error or final attempt');
      
      // Try to get cached data as fallback
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        return {
          success: true,
          data: cachedData,
          fromCache: true,
          fallback: true,
          error: `API error (${response.status}), using cached data`,
          status: response.status,
          retryCount: attempt - 1,
          endpoint
        };
      }

      updateCircuitBreaker(false);
      return {
        success: false,
        error: `API error: ${response.status} ${response.statusText}`,
        status: response.status,
        retryCount: attempt - 1,
        endpoint
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logGizmoRequest(endpoint, attempt, undefined, errorMessage);
      
      // If this is our last attempt, try cached data
      if (attempt === RETRY_CONFIG.maxRetries) {
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          return {
            success: true,
            data: cachedData,
            fromCache: true,
            fallback: true,
            error: `Network error: ${errorMessage}, using cached data`,
            retryCount: attempt - 1,
            endpoint
          };
        }
        
        updateCircuitBreaker(false);
        return {
          success: false,
          error: `Network error: ${errorMessage}`,
          retryCount: attempt - 1,
          endpoint
        };
      }
      
      // Wait before retry
      await sleep(calculateBackoffDelay(attempt));
    }
  }

  // This should never be reached, but just in case
  return {
    success: false,
    error: 'Maximum retries exceeded',
    retryCount: RETRY_CONFIG.maxRetries,
    endpoint
  };
}

// Legacy compatibility functions (deprecated but maintained for existing code)
export async function makeAuthenticatedGizmoRequest(
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> {
  const result = await makeRobustGizmoRequest(endpoint, options);
  
  if (result.success) {
    // Create a mock Response object for compatibility
    return new Response(JSON.stringify(result.data), {
      status: result.status || 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    throw new Error(result.error || 'Request failed');
  }
}

// Helper functions for cache management
export function clearGizmoAuthCache() {
  gizmoAuthCache = null;
}

export function clearGizmoDataCache() {
  gizmoDataCache.clear();
}

export function clearAllGizmoCache() {
  clearGizmoAuthCache();
  clearGizmoDataCache();
}

// Circuit breaker status
export function getCircuitBreakerStatus() {
  return {
    state: circuitBreaker.state,
    failures: circuitBreaker.failures,
    lastFailureTime: circuitBreaker.lastFailureTime
  };
}

// Cache statistics
export function getCacheStats() {
  return {
    authCached: !!gizmoAuthCache,
    authTimestamp: gizmoAuthCache?.timestamp,
    dataCacheSize: gizmoDataCache.size,
    dataCacheKeys: Array.from(gizmoDataCache.keys())
  };
}