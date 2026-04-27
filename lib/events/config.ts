// ============================================================
// Reward Rules — How much XP / coin / lootbox each event gives
// ============================================================
// All values are defaults. Admin panel can override these via
// LootBoxConfig key/value table in the future.

import type { EventType } from './types';

// ─── Coin Rules ──────────────────────────────────────────────
export const COIN_RULES = {
  // Daily login: base + streak bonus
  DAILY_LOGIN_BASE: 20,

  // Streak milestone bonuses (one-time per achievement)
  STREAK_BONUSES: {
    3: 50,
    7: 200,
    14: 500,
    30: 1000,
    100: 5000,
  } as Record<number, number>,

  // Per-minute coin earn during active session (paid out on SESSION_ENDED)
  COIN_PER_MINUTE: 0.33,         // ~10 coin per 30 min, ~20 per hour
  MAX_COIN_PER_SESSION: 200,     // anti-AFK cap

  // Half-hour milestone reward (paid live, at each :30 mark)
  HOUR_MILESTONE_COIN: 10,
  MAX_MILESTONES_PER_DAY: 8,     // = 4 hours of milestone earn

  // Spend: 1 coin per X TRY
  TRY_PER_COIN: 10,              // 10 TL spent → 1 coin
  MAX_SPEND_COIN_PER_DAY: 100,

  // Reservation
  RESERVATION_COMPLETED: 30,

  // Match (Phase B)
  MATCH_WIN: 50,
  MATCH_MVP_BONUS: 30,
  MATCH_ACE_BONUS: 100,
  MATCH_CLUTCH_BONUS: 25,
} as const;

// ─── XP Rules ────────────────────────────────────────────────
export const XP_RULES = {
  DAILY_LOGIN: 50,
  XP_PER_MINUTE: 1,              // 1 XP per minute played
  MAX_XP_PER_SESSION: 600,       // 10 hour cap
  HOUR_MILESTONE: 10,            // bonus on top of duration XP

  RESERVATION_COMPLETED: 25,
  CHALLENGE_APPROVED: 100,       // base — actual amount comes from Challenge.pointsReward

  MATCH_WIN: 100,
  MATCH_LOSS: 25,
  MATCH_MVP_BONUS: 50,
  MATCH_ACE_BONUS: 200,
} as const;

// ─── Level Curve ─────────────────────────────────────────────
/**
 * Level required for a given total XP.
 * Curve: each level needs progressively more XP (quadratic).
 * Level 1 = 0–99, Level 2 = 100–299, Level 3 = 300–599, ...
 */
export function levelFromXP(totalXP: number): number {
  if (totalXP < 100) return 1;
  // L = floor(sqrt(totalXP / 100)) + 1
  return Math.floor(Math.sqrt(totalXP / 100)) + 1;
}

export function xpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.pow(level - 1, 2) * 100;
}

// ─── Lootbox Grant Rules ─────────────────────────────────────
export const LOOTBOX_RULES = {
  // Streak milestones that grant lootboxes (in addition to coin bonuses)
  STREAK_LOOTBOX: {
    7: 1,    // 1 common box
    30: 2,   // 2 boxes (e.g. 1 epic)
    100: 5,  // 5 boxes (legendary tier)
  } as Record<number, number>,

  // Level-up grants
  LEVEL_UP_LOOTBOX_EVERY: 5,     // 1 box every 5 levels (5, 10, 15, ...)

  // Special triggers
  FIRST_LOGIN_EVER: 1,           // welcome bonus
} as const;

// ─── Helper: Should event grant any reward? ──────────────────
const SILENT_EVENT_TYPES: EventType[] = [
  'LOOTBOX_OPENED',     // audit only — no rewards (rewards are in the box itself)
  'MATCH_STARTED',      // just a marker
  'SESSION_STARTED',    // just a marker — DAILY_LOGIN is the reward event
];
export const SILENT_EVENTS: ReadonlySet<EventType> = new Set<EventType>(SILENT_EVENT_TYPES);
