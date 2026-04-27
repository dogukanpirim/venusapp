// ============================================================
// Gizmo v3 TypeScript Types
// OpenAPI: v3.0 — https://www.gizmopowered.net
// ============================================================

// ─── Auth ────────────────────────────────────────────────────
export interface AuthTokenResult {
  token: string;
  refreshToken: string;
}

// ─── Pagination ──────────────────────────────────────────────
export interface PagedList<T> {
  data: T[];
  nextCursor: string | null;
  prevCursor: string | null;
}

export interface PaginationParams {
  limit?: number;
  sortBy?: string;
  isAsc?: boolean;
  isScroll?: boolean;
  cursor?: string;
}

// ─── Users ───────────────────────────────────────────────────
export interface GizmoUser {
  id: number;
  guid: string;
  isGuest: boolean;
  username: string;
  email: string;
  userGroupId: number;
  isNegativeBalanceAllowed: boolean;
  isPersonalInfoRequested: boolean;
  enableDate: string | null;
  disabledDate: string | null;
  firstName: string | null;
  lastName: string | null;
  birthDate: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  postCode: string | null;
  phone: string | null;
  mobilePhone: string | null;
  sex: number;
  isDeleted: boolean;
  isDisabled: boolean;
  smartCardUid: string | null;
  identification: string | null;
  registrationDate: string;
  isVerified: boolean;
  hasNotes: boolean;
  hasCheckedOutAssets: boolean;
  reservedHostId: number | null;
  reservedSlot: number | null;
  isJoined: boolean;
  billingOptions: number;
}

export interface CreateUserBody {
  username: string;
  password: string;
  email?: string;
  userGroupId?: number;
  firstName?: string;
  lastName?: string;
  phone?: string;
  mobilePhone?: string;
  birthDate?: string;
  address?: string;
  city?: string;
  country?: string;
  sex?: number;
  isNegativeBalanceAllowed?: boolean;
  smartCardUid?: string;
}

export interface UserBalance {
  balance: number;      // monetary balance (TL)
  points: number;       // gamification points
  deposits: number;     // total deposited
  time: number;         // remaining time (minutes)
  creditedTime: number; // credited/bonus time (minutes)
}

export interface UserLoginResult {
  loginResult: number; // 0 = success
}

// ─── Sessions ────────────────────────────────────────────────
export interface GizmoUserSession {
  id: number;
  userId: number;
  hostId: number;
  slot: number;
  state: number; // 0=active, 1=paused, 2=ended
  span: number;  // minutes
}

// ─── Hosts ───────────────────────────────────────────────────
export interface GizmoHost {
  id: number;
  number: number;
  name: string;
  hostGroupId: number;
  state: number; // 0=available, 1=in-use, 2=reserved, 3=offline
  isLocked: boolean;
  isOutOfOrder: boolean;
  isInMaintenance: boolean;
}

// ─── Host Computer Control ────────────────────────────────────
export interface ScreenCapture {
  data: string;   // base64 image
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface AlertBody {
  type: number;       // 0=info, 1=warning, 2=error
  title: string;
  message: string;
  waitForAcknowledged: boolean;
}

export interface ClientConnection {
  hostId: number;
  isConnected: boolean;
  version: string | null;
}

export interface ProcessInfo {
  id: number;
  name: string;
  executablePath: string | null;
}

// ─── Payments ────────────────────────────────────────────────
export interface PaymentIntentCreateBody {
  userId: number;
  amount: number;
  paymentMethodId: number;
}

export interface PaymentIntentResult {
  paymentIntent: string; // GUID — use to poll /wait
  paymentUrl: string;
  qrImage: string;        // base64 encoded QR
  nativeQrImage: string;  // provider-native QR
  provider: string;
}

export interface DepositPaymentBody {
  amount: number;
  paymentMethodId: number;
  disableReceiptPrinting?: boolean;
}

export interface DepositPaymentResult {
  depositPaymentId: number;
  paymentId: number;
  receiptPrintStatus: number;
}

export interface PaymentMethod {
  id: number;
  name: string;
  isEnabled: boolean;
}

// ─── Points / Gamification ────────────────────────────────────
/** type: 0=add, 1=subtract */
export interface PointsTransactionBody {
  userId: number;
  type: 0 | 1;
  amount: number;
}

export interface PointsTransaction {
  id: number;
  date: string;
  balance: number;
  operatorId: number | null;
  shiftId: number | null;
  registerId: number | null;
  isVoided: boolean;
  userId: number;
  type: number;
  amount: number;
}

// ─── Reservations ─────────────────────────────────────────────
export interface CreateReservationBody {
  userId?: number;
  contactPhone?: string;
  contactEmail?: string;
  note?: string;
  date: string;         // ISO datetime
  duration: number;     // minutes
  branchId?: number;
  hosts?: number[];     // specific host IDs
  users?: number[];     // additional user IDs
}

export interface ReservationResult {
  id: number;
  pin: string;
}

export interface AvailableHost {
  hostId: number;
  hostName: string;
  hostGroupId: number;
  slots: number[];
}

// ─── Assistance Requests ──────────────────────────────────────
export interface AssistanceRequestBody {
  assistanceRequestTypeId: number;
  userId?: number;
  hostId?: number;
  note?: string;
}

// ─── Promotions & Discounts ───────────────────────────────────
export interface Promotion {
  id: number;
  name: string;
  description: string | null;
  isEnabled: boolean;
  startDate: string | null;
  endDate: string | null;
}

export interface Discount {
  id: number;
  name: string;
  value: number;
  isEnabled: boolean;
  type: number; // 0=percentage, 1=fixed
}

// ─── Events / Streaming ───────────────────────────────────────
export interface GizmoEvent {
  entityType: string;
  entityId: number;
  eventType: number; // 0=create, 1=delete, 2=modify
  data?: Record<string, unknown>;
}

// ─── Notifications ────────────────────────────────────────────
export interface TimedNotificationBody {
  userId: number;
  minutes: number; // notify when X minutes remain
}
