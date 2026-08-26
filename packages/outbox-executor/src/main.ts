// Production entrypoint for the ONE resident scheduler process (04-01
// decision; SYSTEM_ARCHITECTURE R5). R2.1 (audit F-01): before this file the
// scheduler was a library nothing launched — the tasks queue had no
// production consumer. Run it with:
//
//   DXB_DATABASE_URL=postgres://... node packages/outbox-executor/dist/main.js
//   (repo shortcut: pnpm scheduler — session-mode port 5432/54322 ONLY,
//   never a transaction pooler; pg-boss study card CRITICAL pitfall)
//
// Shutdown: SIGINT/SIGTERM → pg-boss graceful stop (in-flight jobs finish,
// self-chain jobs stay persisted in pgboss.job). On the next boot every
// chain re-arms via singletonKey bootstrap sends — restart continuity is
// startScheduler's construction, not this file's job.
import { closeDb } from "@dxb/shared";
import { hostOpsLiveCollector } from "./ops-live-host.js";
import { startScheduler, stopScheduler } from "./scheduler.js";

async function main(): Promise<void> {
  const boss = await startScheduler();
  // B38: the ops:live debounce collector has no service of its own — EVENT_MODEL
  // §26 (R5) put it inside this loop deliberately ("yeni servis AÇILMAZ"), and
  // until 2026-08-26 nothing here started it, so the CEO's Live Operations page
  // listened to a channel with no producer.
  const opsLive = await hostOpsLiveCollector({ log: (line) => console.error(line) });
  console.log("[scheduler] resident scheduler up — queues live, chains armed, ops:live hosted");

  let stopping = false;
  const shutdown = (signal: string) => {
    if (stopping) return;
    stopping = true;
    console.log(`[scheduler] ${signal} — graceful stop`);
    void opsLive
      .stop()
      .then(() => stopScheduler(boss))
      .then(() => closeDb())
      .then(() => process.exit(0))
      .catch((err) => {
        console.error("[scheduler] graceful stop failed:", err);
        process.exit(1);
      });
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("[scheduler] fatal boot error:", err);
  process.exit(1);
});
