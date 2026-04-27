// ============================================================
// Gizmo v3 API Client
// Base URL: process.env.GIZMO_API_URL (e.g. http://localhost:8080)
// Auth:     Bearer JWT — GET /api/user/v3.0/auth/accesstoken
// ============================================================

import type {
  AuthTokenResult,
  PagedList,
  PaginationParams,
  GizmoUser,
  CreateUserBody,
  UserBalance,
  UserLoginResult,
  GizmoUserSession,
  GizmoHost,
  ScreenCapture,
  AlertBody,
  ClientConnection,
  ProcessInfo,
  PaymentIntentCreateBody,
  PaymentIntentResult,
  DepositPaymentBody,
  DepositPaymentResult,
  PaymentMethod,
  PointsTransactionBody,
  PointsTransaction,
  CreateReservationBody,
  ReservationResult,
  AvailableHost,
  AssistanceRequestBody,
  Promotion,
  Discount,
  GizmoEvent,
} from './types';

// ─── Token Cache ─────────────────────────────────────────────
interface TokenCache {
  token: string;
  refreshToken: string;
  expiresAt: number;
}

let operatorTokenCache: TokenCache | null = null;

// ─── Helpers ─────────────────────────────────────────────────
function buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return q ? `?${q}` : '';
}

function paginationQuery(p?: PaginationParams): Record<string, string | number | boolean | undefined> {
  if (!p) return {};
  return {
    'Pagination.Limit': p.limit,
    'Pagination.SortBy': p.sortBy,
    'Pagination.IsAsc': p.isAsc,
    'Pagination.IsScroll': p.isScroll,
    'Pagination.Cursor': p.cursor,
  };
}

// ─── Core Client ─────────────────────────────────────────────
export class GizmoClient {
  private baseUrl: string;
  private username: string;
  private password: string;

  constructor(baseUrl?: string, username?: string, password?: string) {
    this.baseUrl = (baseUrl ?? process.env.GIZMO_API_URL ?? '').replace(/\/$/, '');
    this.username = username ?? process.env.GIZMO_USERNAME ?? '';
    this.password = password ?? process.env.GIZMO_PASSWORD ?? '';
  }

  // ── Auth ───────────────────────────────────────────────────

  /** Get or refresh operator access token (cached for 55 min) */
  async getOperatorToken(): Promise<string> {
    const now = Date.now();
    if (operatorTokenCache && operatorTokenCache.expiresAt > now) {
      return operatorTokenCache.token;
    }
    const q = buildQuery({ Username: this.username, Password: this.password });
    const res = await this._rawFetch(`/api/v3.0/auth/accesstoken${q}`, { method: 'GET' }, false);
    const data: AuthTokenResult = await res.json();
    operatorTokenCache = {
      token: data.token,
      refreshToken: data.refreshToken,
      expiresAt: now + 55 * 60 * 1000, // 55 min
    };
    return data.token;
  }

  /** Authenticate as a specific user — returns user JWT */
  async getUserToken(username: string, password: string): Promise<AuthTokenResult> {
    const q = buildQuery({ Username: username, Password: password });
    const res = await this._rawFetch(`/api/user/v3.0/auth/accesstoken${q}`, { method: 'GET' }, false);
    if (!res.ok) throw new GizmoError('Auth failed', res.status);
    return res.json();
  }

  // ── Internal fetch ─────────────────────────────────────────

  private async _rawFetch(
    path: string,
    init: RequestInit,
    withAuth = true,
  ): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init.headers as Record<string, string>),
    };
    if (withAuth) {
      const token = await this.getOperatorToken();
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${this.baseUrl}${path}`, { ...init, headers });
    return res;
  }

  async fetch<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await this._rawFetch(path, init);
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new GizmoError(`Gizmo v3 error: ${res.status} ${path} — ${body}`, res.status);
    }
    // 204 No Content
    if (res.status === 204) return undefined as T;
    return res.json();
  }

  // ── Users ──────────────────────────────────────────────────

  readonly users = {
    list: (params?: PaginationParams & {
      username?: string;
      isGuest?: boolean;
      isDisabled?: boolean;
      isLoggedIn?: boolean;
      searchValue?: string;
      userGroupId?: number;
    }) => this.fetch<PagedList<GizmoUser>>(
      `/api/v3.0/users${buildQuery({ ...paginationQuery(params), ...params })}`,
    ),

    search: (searchValue: string, params?: PaginationParams) =>
      this.fetch<PagedList<GizmoUser>>(
        `/api/v3.0/users/search${buildQuery({ ...paginationQuery(params), SearchValue: searchValue })}`,
      ),

    get: (id: number) =>
      this.fetch<GizmoUser>(`/api/v3.0/users/${id}`),

    create: (body: CreateUserBody) =>
      this.fetch<{ id: number }>('/api/v3.0/users', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    update: (body: Partial<GizmoUser> & { id: number }) =>
      this.fetch<void>('/api/v3.0/users', {
        method: 'PUT',
        body: JSON.stringify(body),
      }),

    delete: (id: number) =>
      this.fetch<void>(`/api/v3.0/users/${id}`, { method: 'DELETE' }),

    getBalance: (id: number, preferCache = false) =>
      this.fetch<UserBalance>(`/api/v3.0/users/${id}/balance${buildQuery({ preferCache })}`),

    login: (userId: number, hostId: number, slot = 0) =>
      this.fetch<UserLoginResult>(
        `/api/v3.0/users/${userId}/login/${hostId}/slot/${slot}`,
        { method: 'POST' },
      ),
  };

  // ── Sessions ───────────────────────────────────────────────

  readonly sessions = {
    list: (params?: PaginationParams & {
      userId?: number;
      hostId?: number;
      state?: number;
      dateFrom?: string;
      dateTo?: string;
    }) => this.fetch<PagedList<GizmoUserSession>>(
      `/api/v3.0/usersessions${buildQuery({ ...paginationQuery(params), ...params })}`,
    ),

    get: (id: number) =>
      this.fetch<GizmoUserSession>(`/api/v3.0/usersessions/${id}`),
  };

  // ── Hosts ──────────────────────────────────────────────────

  readonly hosts = {
    list: (params?: PaginationParams) =>
      this.fetch<PagedList<GizmoHost>>(
        `/api/v3.0/hosts${buildQuery(paginationQuery(params))}`,
      ),

    get: (id: number) =>
      this.fetch<GizmoHost>(`/api/v3.0/hosts/${id}`),

    setLock: (id: number, locked: boolean) =>
      this.fetch<void>(`/api/v3.0/hosts/${id}/lock/${locked}`, { method: 'POST' }),

    setOutOfOrder: (id: number, value: boolean) =>
      this.fetch<void>(`/api/v3.0/hosts/${id}/outoforder/${value}`, { method: 'POST' }),

    turnOn: (id: number) =>
      this.fetch<void>(`/api/v3.0/hosts/${id}/on`, { method: 'POST' }),

    turnOff: (id: number) =>
      this.fetch<void>(`/api/v3.0/hosts/${id}/off`, { method: 'POST' }),
  };

  // ── Host Computers (PC Control) ────────────────────────────

  readonly hostComputers = {
    /** Capture live screenshot — returns base64 image data */
    captureScreen: (hostId: number) =>
      this.fetch<ScreenCapture>(`/api/v3.0/hostcomputers/${hostId}/screen`),

    lastScreen: (hostId: number) =>
      this.fetch<ScreenCapture>(`/api/v3.0/hostcomputers/${hostId}/screen/last`),

    reboot: (hostId: number) =>
      this.fetch<void>(`/api/v3.0/hostcomputers/${hostId}/reboot`, { method: 'POST' }),

    shutdown: (hostId: number) =>
      this.fetch<void>(`/api/v3.0/hostcomputers/${hostId}/shutdown`, { method: 'POST' }),

    /** Lock or unlock keyboard + mouse */
    setInputLock: (hostId: number, locked: boolean) =>
      this.fetch<void>(`/api/v3.0/hostcomputers/${hostId}/input/lock/${locked}`, { method: 'POST' }),

    getInputLock: (hostId: number) =>
      this.fetch<{ value: boolean }>(`/api/v3.0/hostcomputers/${hostId}/input/lock`),

    setMaintenance: (hostId: number, enabled: boolean) =>
      this.fetch<void>(`/api/v3.0/hostcomputers/${hostId}/maintenance/${enabled}`, { method: 'POST' }),

    getMaintenance: (hostId: number) =>
      this.fetch<{ value: boolean }>(`/api/v3.0/hostcomputers/${hostId}/maintenance`),

    setOutOfOrder: (hostId: number, enabled: boolean) =>
      this.fetch<void>(`/api/v3.0/hostcomputers/${hostId}/outoforder/${enabled}`, { method: 'POST' }),

    restartClient: (hostId: number) =>
      this.fetch<void>(`/api/v3.0/hostcomputers/${hostId}/client/restart`, { method: 'POST' }),

    /** Send a popup alert to the PC screen */
    sendAlert: (hostId: number, body: AlertBody) =>
      this.fetch<void>(`/api/v3.0/hostcomputers/${hostId}/notifications/alert`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    getConnections: () =>
      this.fetch<ClientConnection[]>('/api/v3.0/hostcomputers/client/connections'),

    getConnection: (hostId: number) =>
      this.fetch<ClientConnection>(`/api/v3.0/hostcomputers/${hostId}/client/connection`),

    getCpuUsage: (hostId: number) =>
      this.fetch<{ value: number }>(`/api/v3.0/hostcomputers/${hostId}/cpu/usage`),

    getProcesses: (hostId: number) =>
      this.fetch<ProcessInfo[]>(`/api/v3.0/hostcomputers/${hostId}/processes`),

    killProcess: (hostId: number, processId: number) =>
      this.fetch<void>(`/api/v3.0/hostcomputers/${hostId}/processes/${processId}`, { method: 'DELETE' }),
  };

  // ── Payments ───────────────────────────────────────────────

  readonly payments = {
    /** Create deposit intent — returns QR codes for payment */
    createIntent: (body: PaymentIntentCreateBody) =>
      this.fetch<PaymentIntentResult>('/api/v3.0/paymentintents/deposit', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    /** Long-poll: resolves when payment is captured (timeout ~30s) */
    waitForIntent: (intentId: string) =>
      this.fetch<{ status: string }>(`/api/v3.0/paymentintents/${intentId}/wait`),

    getIntent: (intentId: string) =>
      this.fetch<{ status: string; amount: number }>(`/api/v3.0/paymentintents/${intentId}`),

    /** Direct cash deposit (operator-initiated) */
    deposit: (userId: number, body: DepositPaymentBody) =>
      this.fetch<DepositPaymentResult>(`/api/v3.0/depositpayments/user/${userId}`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    getMethods: () =>
      this.fetch<PagedList<PaymentMethod>>('/api/v3.0/paymentmethods'),
  };

  // ── Points / Gamification ──────────────────────────────────

  readonly points = {
    /** Add (type=0) or subtract (type=1) points for a user */
    transact: (body: PointsTransactionBody) =>
      this.fetch<{ id: number }>('/api/v3.0/pointstransactions', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    list: (params?: PaginationParams & {
      userId?: number;
      type?: number;
      dateFrom?: string;
      dateTo?: string;
    }) => this.fetch<PagedList<PointsTransaction>>(
      `/api/v3.0/pointstransactions${buildQuery({ ...paginationQuery(params), ...params })}`,
    ),

    /** Shorthand: add points */
    add: (userId: number, amount: number) =>
      this.points.transact({ userId, type: 0, amount }),

    /** Shorthand: subtract points */
    subtract: (userId: number, amount: number) =>
      this.points.transact({ userId, type: 1, amount }),
  };

  // ── Reservations ───────────────────────────────────────────

  readonly reservations = {
    create: (body: CreateReservationBody) =>
      this.fetch<ReservationResult>('/api/v3.0/reservations', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    availability: (params: {
      start: string;
      duration: number;
      branchId?: number;
      userGroups?: number[];
      limit?: number;
    }) => this.fetch<PagedList<AvailableHost>>(
      `/api/v3.0/reservations/availability${buildQuery({
        Start: params.start,
        Duration: params.duration,
        BranchId: params.branchId,
        'Pagination.Limit': params.limit ?? 50,
      })}`,
    ),

    list: (params?: PaginationParams & { userId?: number }) =>
      this.fetch<PagedList<Record<string, unknown>>>(
        `/api/v3.0/reservations${buildQuery({ ...paginationQuery(params), ...params })}`,
      ),

    complete: (id: number) =>
      this.fetch<void>(`/api/v3.0/reservations/${id}/complete`, { method: 'PUT' }),

    delete: (id: number) =>
      this.fetch<void>(`/api/v3.0/reservations/${id}`, { method: 'DELETE' }),
  };

  // ── Event Streaming ────────────────────────────────────────

  readonly events = {
    /**
     * Long-poll for the next event on a named channel.
     * Channel names: "sessions", "payments", "hosts", or any custom name.
     * Returns the next event or null on timeout.
     */
    next: async (channel: string, filter?: string): Promise<GizmoEvent | null> => {
      const q = buildQuery({ filter });
      try {
        const data = await this.fetch<GizmoEvent | null>(
          `/api/v3.0/events/channel/${encodeURIComponent(channel)}${q}`,
        );
        return data ?? null;
      } catch {
        return null;
      }
    },

    /** Release a channel when done listening */
    release: (channel: string) =>
      this.fetch<void>(`/api/v3.0/events/channel/${encodeURIComponent(channel)}`, {
        method: 'DELETE',
      }),
  };

  // ── Assistance Requests ────────────────────────────────────

  readonly assistance = {
    create: (body: AssistanceRequestBody) =>
      this.fetch<{ id: number }>('/api/v3.0/assistancerequests', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    list: (params?: PaginationParams) =>
      this.fetch<PagedList<Record<string, unknown>>>(
        `/api/v3.0/assistancerequests${buildQuery(paginationQuery(params))}`,
      ),

    accept: (id: number) =>
      this.fetch<void>(`/api/v3.0/assistancerequests/${id}/accept`, { method: 'PUT' }),

    reject: (id: number) =>
      this.fetch<void>(`/api/v3.0/assistancerequests/${id}/reject`, { method: 'PUT' }),
  };

  // ── Notifications ──────────────────────────────────────────

  readonly notifications = {
    /** Alert user when X minutes remain in their session */
    sessionRemaining: (userId: number, minutes: number) =>
      this.fetch<void>('/api/v3.0/notifications/timed/remaining', {
        method: 'POST',
        body: JSON.stringify({ userId, minutes }),
      }),

    /** Alert user before reservation starts */
    reservationReminder: (userId: number, minutes: number) =>
      this.fetch<void>('/api/v3.0/notifications/timed/reservation', {
        method: 'POST',
        body: JSON.stringify({ userId, minutes }),
      }),
  };

  // ── Promotions ─────────────────────────────────────────────

  readonly promotions = {
    list: (params?: PaginationParams) =>
      this.fetch<PagedList<Promotion>>(
        `/api/v3.0/promotions${buildQuery(paginationQuery(params))}`,
      ),

    get: (id: number) =>
      this.fetch<Promotion>(`/api/v3.0/promotions/${id}`),

    create: (body: Partial<Promotion>) =>
      this.fetch<{ id: number }>('/api/v3.0/promotions', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    update: (id: number, body: Partial<Promotion>) =>
      this.fetch<void>(`/api/v3.0/promotions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),

    delete: (id: number) =>
      this.fetch<void>(`/api/v3.0/promotions/${id}`, { method: 'DELETE' }),

    setEnabled: (id: number, enabled: boolean) =>
      this.fetch<void>(`/api/v3.0/promotions/${id}/${enabled ? 'enable' : 'disable'}`, {
        method: 'PUT',
      }),
  };

  // ── Discounts ──────────────────────────────────────────────

  readonly discounts = {
    list: (params?: PaginationParams) =>
      this.fetch<PagedList<Discount>>(
        `/api/v3.0/discounts${buildQuery(paginationQuery(params))}`,
      ),

    get: (id: number) =>
      this.fetch<Discount>(`/api/v3.0/discounts/${id}`),

    create: (body: Partial<Discount>) =>
      this.fetch<{ id: number }>('/api/v3.0/discounts', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    setEnabled: (id: number, enabled: boolean) =>
      this.fetch<void>(`/api/v3.0/discounts/${id}/${enabled ? 'enable' : 'disable'}`, {
        method: 'PUT',
      }),
  };

  // ── Products ───────────────────────────────────────────────

  readonly products = {
    list: (params?: PaginationParams & { searchValue?: string }) =>
      this.fetch<PagedList<Record<string, unknown>>>(
        `/api/v3.0/products${buildQuery({ ...paginationQuery(params), ...params })}`,
      ),

    get: (id: number) =>
      this.fetch<Record<string, unknown>>(`/api/v3.0/products/${id}`),
  };

  // ── SMS / Verification ─────────────────────────────────────

  readonly verification = {
    sendSms: (mobilePhone: string) =>
      this.fetch<void>(`/api/v3.0/verifications/mobilephone/${encodeURIComponent(mobilePhone)}`, {
        method: 'POST',
      }),

    completeSmsVerification: (token: string, code: string) =>
      this.fetch<void>(`/api/v3.0/verifications/mobilephone/${token}/${code}/complete`, {
        method: 'POST',
      }),

    sendEmail: (email: string) =>
      this.fetch<void>(`/api/v3.0/verifications/email/${encodeURIComponent(email)}`, {
        method: 'POST',
      }),
  };
}

// ─── Error Class ─────────────────────────────────────────────
export class GizmoError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = 'GizmoError';
  }
}

// ─── Singleton ───────────────────────────────────────────────
let _client: GizmoClient | null = null;

export function getGizmoClient(): GizmoClient {
  if (!_client) {
    _client = new GizmoClient();
  }
  return _client;
}

export default getGizmoClient;
