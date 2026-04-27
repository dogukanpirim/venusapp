// ============================================================
// Gizmo ↔ Local User Linker
// ============================================================
// Resolves a Gizmo numeric userId to a local User.id (cuid).
//
// Three resolution paths in order:
//   1. User.gizmoUserId is already set → instant lookup
//   2. Player.gamertag matches Gizmo username → backfill gizmoUserId
//   3. Neither match → create a "shadow" User + Player
//      (claimable later when the customer registers on the website)

import { prisma } from '@/lib/db';
import { getGizmoClient } from './client';
import type { GizmoUser } from './types';

export interface LinkedUser {
  /** Local User.id (cuid). */
  userId: string;

  /** Gizmo numeric ID. */
  gizmoUserId: number;

  /** Gizmo username. */
  username: string;

  /** True if this user was just created (shadow account). */
  isShadow: boolean;

  /** Email if known (real or generated). */
  email: string;
}

/**
 * Find or create a local User row for a given Gizmo user.
 * `gizmoUser` should be the GizmoUser model returned by /api/v3.0/users.
 * If only the numeric ID is known, fetch the full record first.
 */
export async function linkGizmoUser(input: {
  gizmoUserId: number;
  gizmoUser?: GizmoUser;
}): Promise<LinkedUser> {
  const { gizmoUserId } = input;

  // ── Path 1: existing link ──────────────────────────────────
  let user = await prisma.user.findUnique({
    where: { gizmoUserId },
    select: { id: true, email: true },
  });

  if (user) {
    // Cheapest path — already linked
    const player = await prisma.player.findUnique({
      where: { userId: user.id },
      select: { gamertag: true },
    });
    return {
      userId: user.id,
      gizmoUserId,
      username: player?.gamertag ?? '',
      isShadow: false,
      email: user.email,
    };
  }

  // ── Need Gizmo profile data for paths 2 & 3 ────────────────
  let profile = input.gizmoUser ?? null;
  if (!profile) {
    try {
      profile = await getGizmoClient().users.get(gizmoUserId);
    } catch {
      profile = null;
    }
  }

  if (!profile) {
    // Hard failure — Gizmo unreachable. Skip linking; caller should retry next cycle.
    throw new Error(`Cannot fetch Gizmo user ${gizmoUserId}`);
  }

  const username = profile.username;
  const email = profile.email || `${username}@gizmo.local`;
  const displayName =
    [profile.firstName, profile.lastName].filter(Boolean).join(' ') || username;

  // ── Path 2: gamertag-based match (backfill gizmoUserId) ────
  const playerByTag = await prisma.player.findUnique({
    where: { gamertag: username },
    select: { userId: true },
  });

  if (playerByTag?.userId) {
    await prisma.user.update({
      where: { id: playerByTag.userId },
      data: { gizmoUserId },
    });
    const linked = await prisma.user.findUnique({
      where: { id: playerByTag.userId },
      select: { id: true, email: true },
    });
    return {
      userId: linked!.id,
      gizmoUserId,
      username,
      isShadow: false,
      email: linked!.email,
    };
  }

  // ── Path 3: shadow account ─────────────────────────────────
  // Create minimal User + Player so events can flow.
  // User can later "claim" by registering through the website.
  const created = await prisma.$transaction(async (tx) => {
    // Edge case: a User with that email may already exist without gizmoUserId
    const existingByEmail = await tx.user.findUnique({
      where: { email },
      select: { id: true },
    });

    let userId: string;
    if (existingByEmail) {
      await tx.user.update({
        where: { id: existingByEmail.id },
        data: { gizmoUserId },
      });
      userId = existingByEmail.id;
    } else {
      const u = await tx.user.create({
        data: {
          email,
          password: 'shadow_account',  // not usable for password login
          name: displayName,
          isAdmin: false,
          gizmoUserId,
        },
        select: { id: true },
      });
      userId = u.id;
    }

    // Ensure Player exists
    await tx.player.upsert({
      where: { gamertag: username },
      update: { userId },
      create: {
        userId,
        gamertag: username,
        displayName,
        email,
        isActive: true,
      },
    });

    // Ensure GizmoProfile exists (for stats rollup)
    const player = await tx.player.findUnique({
      where: { gamertag: username },
      select: { id: true },
    });
    if (player) {
      await tx.gizmoProfile.upsert({
        where: { gizmoUserId },
        update: { playerId: player.id, username },
        create: {
          playerId: player.id,
          gizmoUserId,
          username,
          firstName: profile!.firstName,
          lastName: profile!.lastName,
          phone: profile!.phone || profile!.mobilePhone || null,
        },
      });
    }

    return { userId, email };
  });

  return {
    userId: created.userId,
    gizmoUserId,
    username,
    isShadow: true,
    email: created.email,
  };
}
