/**
 * THE DASHBOARD REFUSES TO SERVE UNLESS IT WAS STARTED PROPERLY.
 *
 * Next.js calls `register()` once, in the server process, before the first
 * request is handled. It is the only place in this application that runs before
 * anything can go wrong at request time, and that is exactly what this gate
 * needs to be.
 *
 * WHY IT EXISTS — measured, 2026-08-24 evening, not imagined. B36 Block 4 took
 * the company's address out of `src/app/api/voice/call/route.ts`, which had been
 * inventing one for itself with `process.env.DXB_DATABASE_URL ??= "…:54322/…"`.
 * `scripts/dashboard.sh` was written the same hour to hand the address in
 * instead. Then the auditor asked the obvious question — is the LIVE dashboard
 * actually being started that way? — and the answer was no:
 *
 *     $ ps  → next-server (v16.2.10) pid 3785656, up 6h50m
 *     $ parent chain → pnpm --filter ./apps/dashboard dev, from a session shell
 *     $ tr '\0' '\n' < /proc/3785656/environ | grep -c '^DXB_DATABASE_URL='
 *     0
 *
 * The running dashboard carried no address at all. Nothing said so; the voice
 * line would simply have failed on the CEO's next call. A wrapper nobody is
 * forced to use is a note, not a gate — so the server now checks, at startup,
 * that it was started by the wrapper AND that it really holds an address, and
 * stops with a named reason if either is missing.
 *
 * WHAT IT DOES NOT DO. It does not run during `next build` (NEXT_PHASE says so):
 * a build renders pages, it does not serve them, and several specs use
 * `pnpm --filter @dxb/dashboard build` as their own gate. It does not run in the
 * edge runtime, which has no process to stop. And it never prints the address.
 */

export interface LaunchEnv {
  DXB_DASHBOARD_LAUNCHER?: string | undefined;
  DXB_DATABASE_URL?: string | undefined;
}

export type LaunchVerdict =
  | { ok: true; launcher: string }
  | { ok: false; reason: string };

/**
 * The judgement, as a pure function, so it can be shown to refuse before it is
 * believed when it allows. `tests/ops/dashboard-launcher.host.test.ts` runs it
 * over every shape without starting a server.
 */
export function judgeLaunch(env: LaunchEnv): LaunchVerdict {
  const launcher = env.DXB_DASHBOARD_LAUNCHER?.trim();
  const url = env.DXB_DATABASE_URL?.trim();

  if (!launcher) {
    return {
      ok: false,
      reason:
        "this dashboard was not started by scripts/dashboard.sh. Start it with " +
        "`pnpm dashboard` (or `pnpm dashboard:start` after a build). A bare " +
        "`next dev` / `pnpm --filter @dxb/dashboard dev` gives the server no " +
        "company address, and the voice-call route then fails on the first " +
        "request instead of at startup — measured live on 2026-08-24.",
    };
  }
  if (!url) {
    return {
      ok: false,
      reason:
        `started by ${launcher}, but DXB_DATABASE_URL is empty. The wrapper maps ` +
        "DXB_COMPANY_DATABASE_URL from .env.daemon onto it; if that file has no " +
        "company address, run scripts/systemd/install.sh (db/README.md §Environment).",
    };
  }
  return { ok: true, launcher };
}

export async function register(): Promise<void> {
  // A build is not a server. Several specs gate on `next build` and it must not
  // start failing because nobody exported a launcher variable to compile a page.
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  // The edge runtime has no process to stop and never touches the database.
  if (process.env.NEXT_RUNTIME && process.env.NEXT_RUNTIME !== "nodejs") return;

  const verdict = judgeLaunch(process.env as LaunchEnv);
  if (verdict.ok) {
    console.log(`[dashboard] started by ${verdict.launcher}; the company address is in hand.`);
    return;
  }

  console.error(`[dashboard] REFUSING TO SERVE — ${verdict.reason}`);
  process.exit(2);
}
