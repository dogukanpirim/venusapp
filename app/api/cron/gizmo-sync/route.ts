// ============================================================
// Cron Entry: Gizmo Session Sync
// ============================================================
// Trigger this endpoint on a 60-second cadence from any cron host:
//   - Vercel Cron     (vercel.json: "schedule: '*/1 * * * *'")
//   - Netlify Sched   (netlify.toml: schedule = "* * * * *")
//   - GitHub Actions  (workflow with cron + curl)
//   - cron-job.org    (free external cron)
//
// Auth: requires `Authorization: Bearer ${CRON_SECRET}` header.
// (Vercel Cron sends this automatically when CRON_SECRET is set.)

import { NextRequest, NextResponse } from 'next/server';
import { syncGizmoSessions } from '@/lib/gizmo/poller';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // seconds — leave room for slow Gizmo + many sessions

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // No secret configured — local dev only. Reject in production.
    return process.env.NODE_ENV !== 'production';
  }
  const header = req.headers.get('authorization') || '';
  // Accept both "Bearer <secret>" (Vercel Cron) and "<secret>" (manual curl)
  return (
    header === `Bearer ${secret}` ||
    header === secret ||
    req.nextUrl.searchParams.get('secret') === secret
  );
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const summary = await syncGizmoSessions();
    return NextResponse.json({ ok: true, summary });
  } catch (err) {
    // Don't 500 on cron — return JSON so Vercel doesn't mark the cron failed
    // (we'd lose visibility into successive failures). Log instead.
    console.error('[cron/gizmo-sync] failed:', err);
    return NextResponse.json(
      {
        ok: false,
        error: (err as Error).message,
        hint:
          'If Gizmo v3 is not yet released, this is expected. The poller targets v3 endpoints.',
      },
      { status: 200 },
    );
  }
}

// POST also accepted (some cron services prefer POST)
export const POST = GET;
