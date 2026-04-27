// ============================================================
// Event Dispatcher — Type Definitions
// ============================================================
// All gamification events flow through dispatchEvent({...})
// Every event has a unique externalId for idempotency.

/** Canonical list of every event type the dispatcher knows how to handle. */
export type EventType =
  // ─── Gizmo Session Events (Phase A) ──────────────────────
  | 'SESSION_STARTED'      // poller detected a brand-new Gizmo session
  | 'SESSION_ENDED'        // poller saw a session disappear
  | 'HOUR_MILESTONE'       // every N minutes inside an active session
  | 'DAILY_LOGIN'          // first session of the calendar day
  | 'STREAK_MILESTONE'     // 3/7/30/100 day streak achieved

  // ─── Spend / Wallet Events ───────────────────────────────
  | 'SPEND'                // user paid Gizmo invoice / bought product
  | 'DEPOSIT'              // user topped up cafe balance via QR

  // ─── Reservation Events ──────────────────────────────────
  | 'RESERVATION_COMPLETED'

  // ─── Match Events (Phase B — Overwolf) ───────────────────
  | 'MATCH_STARTED'
  | 'MATCH_ENDED'
  | 'MATCH_EVENT'          // kill, ace, clutch, etc.

  // ─── Manual / Admin ──────────────────────────────────────
  | 'CHALLENGE_APPROVED'   // admin approved a manual challenge submission
  | 'ADMIN_GRANT'          // admin manually awarded coins/xp/lootbox
  | 'LOOTBOX_OPENED';      // user opened a lootbox (audit only — no XP grant)

// ─── Payload Shapes ──────────────────────────────────────────

export interface SessionStartedPayload {
  gizmoSessionId: number;       // numeric ID from Gizmo
  localSessionId: string;       // our DB GizmoSession cuid
  gizmoUserId: number;
  hostId: number;
  startedAt: string;            // ISO
}

export interface SessionEndedPayload {
  gizmoSessionId: number;
  localSessionId: string;
  gizmoUserId: number;
  hostId: number;
  durationMinutes: number;
  startedAt: string;
  endedAt: string;
}

export interface HourMilestonePayload {
  gizmoSessionId: number;
  hourNumber: number;           // 1, 2, 3... (each represents a 30-min block by default)
  cumulativeMinutes: number;
}

export interface DailyLoginPayload {
  date: string;                 // YYYY-MM-DD
  gizmoSessionId: number;
  hostId: number;
  isFirstEverLogin: boolean;
}

export interface StreakMilestonePayload {
  streakDays: number;           // 3, 7, 30, 100
  achievedDate: string;
}

export interface SpendPayload {
  gizmoInvoiceId: number;
  amountTRY: number;            // Turkish Lira
  itemDescription?: string;
}

export interface DepositPayload {
  gizmoTransactionId: number;
  amountTRY: number;
  paymentMethod: string;
}

export interface ReservationCompletedPayload {
  gizmoReservationId: number;
  durationMinutes: number;
}

export interface MatchStartedPayload {
  matchId: string;              // OverwolfMatch.id
  gameTitle: string;
}

export interface MatchEndedPayload {
  matchId: string;
  gameTitle: string;
  won: boolean;
  durationMinutes: number;
  kills: number;
  deaths: number;
  assists: number;
  mvp: boolean;
}

export interface MatchEventPayload {
  matchId: string;
  gameTitle: string;
  eventName: string;            // KILL, ACE, CLUTCH, HEADSHOT, ROUND_WIN, etc.
  eventValue?: number;
  weapon?: string;
}

export interface ChallengeApprovedPayload {
  challengeId: string;
  submissionId: string;
  pointsReward: number;
}

export interface AdminGrantPayload {
  reason: string;
  xp?: number;
  coins?: number;
  lootboxes?: number;
  adminUserId: string;
}

export interface LootboxOpenedPayload {
  openingId: string;
  rewardId: string;
  rarity: string;
}

// ─── Discriminated Union ─────────────────────────────────────

export type EventPayload =
  | { type: 'SESSION_STARTED';        data: SessionStartedPayload }
  | { type: 'SESSION_ENDED';          data: SessionEndedPayload }
  | { type: 'HOUR_MILESTONE';         data: HourMilestonePayload }
  | { type: 'DAILY_LOGIN';            data: DailyLoginPayload }
  | { type: 'STREAK_MILESTONE';       data: StreakMilestonePayload }
  | { type: 'SPEND';                  data: SpendPayload }
  | { type: 'DEPOSIT';                data: DepositPayload }
  | { type: 'RESERVATION_COMPLETED';  data: ReservationCompletedPayload }
  | { type: 'MATCH_STARTED';          data: MatchStartedPayload }
  | { type: 'MATCH_ENDED';            data: MatchEndedPayload }
  | { type: 'MATCH_EVENT';            data: MatchEventPayload }
  | { type: 'CHALLENGE_APPROVED';     data: ChallengeApprovedPayload }
  | { type: 'ADMIN_GRANT';            data: AdminGrantPayload }
  | { type: 'LOOTBOX_OPENED';         data: LootboxOpenedPayload };

// ─── Dispatch Input ──────────────────────────────────────────

export interface DispatchInput {
  /** Local User.id (cuid). Required for almost all event types. */
  userId: string;

  /** Event type + payload (discriminated union). */
  event: EventPayload;

  /**
   * Globally unique key for this event. Same key = same event.
   * Format: "<source>:<entityId>:<phase>"
   * Examples: "gizmo_session:1001:end", "daily_login:cuid:2026-04-25"
   */
  externalId: string;
}

// ─── Dispatch Result ─────────────────────────────────────────

export interface DispatchResult {
  /** True if event was processed for the first time. False if duplicate (skipped). */
  processed: boolean;

  /** Set when processed=false to indicate why. */
  duplicateOf?: string;

  /** Cumulative effect of running all handlers. */
  effects: {
    xpAwarded: number;
    coinAwarded: number;
    lootboxesGranted: number;
    achievementsUnlocked: string[];      // Achievement ids
    questsCompleted: string[];           // GamificationTask ids
    challengesCompleted: string[];       // Challenge ids
    streakUpdate?: { previous: number; current: number };
    levelUp?: { previous: number; current: number };
  };

  /** Per-handler error messages (handlers are isolated — one fail doesn't kill the rest). */
  warnings: string[];
}
