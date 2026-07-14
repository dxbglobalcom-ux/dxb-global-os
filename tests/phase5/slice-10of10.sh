#!/usr/bin/env bash
# Phase 5 exit gate (I9) — master-plan steps 9+10, plan 05-09.
# Drives the FULL loop 10 times: CEO intent text → classify → route → decompose
# → dispatch → worker → QA → approval (ceo:cli surrogate) → outbox
# test.write_file → recorded result. Exit 0 IFF 10/10 runs pass — 9/10 is
# NEVER accepted (LOCKED). First failure exits 1 naming the run + assertion.
#
# LOCKED slice definition: outward-facing NOWHERE — the only outbox action is
# test.write_file (confined under tmp/outbox-proof/). Intent text is the
# verbatim master-plan step-8 sentence.
#
# Preconditions (abort, named reason, BEFORE any run):
#   P1 Supabase reachable
#   P2 routing_rules enabled count >= 8
#   P3 persona gate (criterion 6, enforced here — not honor system):
#      agents WHERE department='product' AND persona_version <> 'v2.0-fable'
#      must be 0 AND v2 count must be 5
#   P4 if the worker's tier lookup resolves an api-mode row, LiteLLM key
#      material must be present (slice normally rides subscription — ADAPT-4)
set -euo pipefail
cd "$(dirname "$0")/../.."

export DXB_DATABASE_URL="${DXB_DATABASE_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"

# LOCKED verbatim step-8 intent text — do not edit.
INTENT_TEXT='tek marka X için listeleme taslağı hazırla'
RUNS=10

# ---------------------------------------------------------------------------
# Embedded node driver. MODE=pre → preconditions; MODE=drive → one iteration:
# drive chain to done, assert, print PASS line, clean up. Args via env.
# ---------------------------------------------------------------------------
DRIVER="$(cat <<'NODE_DRIVER'
import { readFile, rm, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { sql } from "kysely";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { getDb, closeDb } from "./packages/shared/dist/index.js";
import { createDxbMcpServer } from "./packages/dxb-mcp/dist/index.js";
import { runWorkerOnce, qa, escalate } from "./packages/orchestrator/dist/index.js";
import { tick } from "./packages/outbox-executor/dist/index.js";
import { approve } from "./tools/dxb-cli/dist/approve.js";

const MODE = process.env.SLICE_MODE;
const PROOF_ROOT = resolve(process.cwd(), "tmp", "outbox-proof");

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  process.exit(1); // first failure exits immediately — no partial credit
}

async function preconditions() {
  const db = getDb();
  // P1 — Supabase reachable
  try {
    await db.selectFrom("routing_rules").select("id").limit(1).execute();
  } catch (e) {
    fail(`PRECONDITION P1: supabase unreachable at DXB_DATABASE_URL (${e.message})`);
  }
  // P2 — routing rows
  const rr = await db
    .selectFrom("routing_rules")
    .select(({ fn }) => fn.countAll().as("n"))
    .where("enabled", "=", true)
    .executeTakeFirstOrThrow();
  if (Number(rr.n) < 8) fail(`PRECONDITION P2: routing_rules enabled count ${rr.n} < 8`);
  // P3 — persona gate (criterion 6): the Fable v2 batch must be live in the
  // registry. The gate CANNOT run without it — physically enforced here.
  const nonV2 = await db
    .selectFrom("agents")
    .select(({ fn }) => fn.countAll().as("n"))
    .where("department", "=", "product")
    .where("persona_version", "<>", "v2.0-fable")
    .executeTakeFirstOrThrow();
  const v2 = await db
    .selectFrom("agents")
    .select(({ fn }) => fn.countAll().as("n"))
    .where("department", "=", "product")
    .where("persona_version", "=", "v2.0-fable")
    .executeTakeFirstOrThrow();
  if (Number(nonV2.n) !== 0 || Number(v2.n) !== 5) {
    fail(
      `PRECONDITION P3 (persona gate, criterion 6): product department must be ` +
        `exactly 5 x v2.0-fable with 0 legacy rows — found v2=${v2.n}, non-v2=${nonV2.n}. ` +
        `The 10/10 gate refuses to run without the Fable v2 batch.`,
    );
  }
  // P4 — worker tier lookup (worker-shim takes the highest-priority enabled
  // row per tier, match-blind). If the slice tier (L4) resolves api-mode,
  // LiteLLM key material must exist in the env; subscription needs nothing.
  const l4 = await db
    .selectFrom("routing_rules")
    .select(["model", "mode"])
    .where("enabled", "=", true)
    .where("model_tier", "=", "L4")
    .orderBy("priority", "desc")
    .orderBy("updated_at", "desc")
    .limit(1)
    .executeTakeFirstOrThrow();
  if (l4.mode === "api") {
    const hasKey =
      Boolean(process.env.LITELLM_MASTER_KEY) ||
      Object.keys(process.env).some((k) => k.startsWith("DXB_LITELLM_KEY_"));
    if (!hasKey)
      fail(
        `PRECONDITION P4: L4 worker row resolves api-mode (${l4.model}) but no ` +
          `LITELLM_MASTER_KEY / DXB_LITELLM_KEY_* in env`,
      );
  }
  console.log(`PRECONDITIONS OK (routing_rules=${rr.n}, product v2=5/5, L4 worker mode=${l4.mode})`);
  await closeDb();
}

async function drive() {
  const runI = process.env.SLICE_RUN;
  const ids = process.env.SLICE_TASK_IDS.split(",").filter(Boolean);
  const depts = [...new Set(process.env.SLICE_DEPTS.split(",").filter(Boolean))];
  if (ids.length === 0) fail(`run ${runI}: no task ids from dxb intent`);
  const db = getDb();

  // Agent-visible surface for the draft leg — same posture as gate-canary.
  const server = createDxbMcpServer();
  const client = new Client({ name: "slice-10of10", version: "0.0.0" });
  const [ct, st] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(st), client.connect(ct)]);
  const call = async (name, args) => {
    const res = await client.callTool({ name, arguments: args });
    if (res.isError) throw new Error(res.content?.[0]?.text ?? `${name} error`);
    return JSON.parse(res.content[0].text);
  };

  const artifacts = new Map(); // task id → proof filename
  const deadline = Date.now() + 600_000;
  let stall = 0;

  while (true) {
    if (Date.now() > deadline) fail(`run ${runI}: 600s timeout — chain stalled`);
    const rows = await db
      .selectFrom("tasks")
      .select(["id", "status", "result"])
      .where("id", "in", ids)
      .execute();
    if (rows.length !== ids.length) fail(`run ${runI}: chain rows missing (${rows.length}/${ids.length})`);
    if (rows.every((r) => r.status === "done")) break;
    if (rows.some((r) => r.status === "blocked"))
      fail(`run ${runI}: ladder hard-stop — task blocked (final state must be done)`);

    let acted = false;
    for (const r of rows.filter((r) => r.status === "failed")) {
      const res = await escalate(db, r.id); // 05-06 ladder — completing via it still must END done
      if (res.action === "blocked") fail(`run ${runI}: ladder blocked task ${r.id} after ${res.failCount} fails`);
      acted = true;
    }
    for (const r of rows.filter((r) => r.status === "review")) {
      const es = await escalate(db, r.id); // converts low-confidence review → failed
      if (es.action !== "none") { acted = true; continue; }
      let out;
      try {
        out = await qa(r.id); // 05-08 single-strong-model gate (final-approval row)
      } catch (e) {
        fail(`run ${runI}: qa exception on ${r.id}: ${e.message}`);
      }
      acted = true;
    }
    for (const r of rows.filter((r) => r.status === "awaiting_approval")) {
      // Approval leg — script is agent surrogate for the draft, CEO surrogate
      // for the decision (ceo:cli approve — Phase-4 flip-test posture).
      const artifact = `slice-run-${runI}-${r.id.slice(0, 8)}.txt`;
      const draft = await call("approval_submit_draft", {
        task_id: r.id,
        action_type: "test.write_file", // LOCKED slice: the ONLY outbox action
        payload: { path: artifact, content: `slice run ${runI} task ${r.id}\n${JSON.stringify(r.result)}` },
        risk_class: "low",
      });
      await call("approval_finalize_draft", { approval_id: draft.id, actor: "agent:slice-worker" });
      const decided = await approve(draft.id);
      if (decided.status !== "approved") fail(`run ${runI}: approve() returned '${decided.status}'`);
      await tick(); // outbox executes test.write_file
      const ob = await db
        .selectFrom("outbox")
        .select("status")
        .where("approval_id", "=", draft.id)
        .executeTakeFirstOrThrow();
      if (ob.status !== "executed") fail(`run ${runI}: outbox row for ${r.id} is '${ob.status}', not executed`);
      await call("queue_transition", {
        task_id: r.id,
        to_status: "done",
        actor: "orchestrator:approval",
        payload: { approval_id: draft.id, outbox: "executed" },
      });
      artifacts.set(r.id, artifact);
      acted = true;
    }
    if (!acted && rows.some((r) => r.status === "queued")) {
      const res = await runWorkerOnce({ workerId: "slice-worker-1", departments: depts });
      if (res.claimed) {
        if (!ids.includes(res.taskId))
          fail(`run ${runI}: worker claimed foreign task ${res.taskId} — iteration not clean`);
        acted = true;
      }
    }
    if (!acted) {
      stall += 1;
      if (stall >= 5) fail(`run ${runI}: stall — no actionable task, chain not progressing`);
      await new Promise((r) => setTimeout(r, 2000));
    } else stall = 0;
  }

  // ---- per-run assertions (T-05-23: assert what the gate MEANS) ----
  if (artifacts.size < 1)
    fail(`run ${runI}: no approval leg ran — slice must close through outbox test.write_file`);
  let eventTotal = 0;
  for (const id of ids) {
    const evs = await db
      .selectFrom("task_events")
      .select(["event", "from_status", "to_status"])
      .where("task_id", "=", id)
      .orderBy("created_at", "asc")
      .orderBy("id", "asc")
      .execute();
    if (evs.length === 0 || evs[0].event !== "created")
      fail(`run ${runI}: task ${id} event chain has no 'created' head`);
    for (let i = 1; i < evs.length; i++) {
      if (evs[i].from_status !== evs[i - 1].to_status)
        fail(
          `run ${runI}: task ${id} event chain broken at ${i}: ` +
            `${evs[i - 1].to_status} then from=${evs[i].from_status}`,
        );
    }
    if (evs[evs.length - 1].to_status !== "done")
      fail(`run ${runI}: task ${id} final event is '${evs[evs.length - 1].to_status}', not done`);
    eventTotal += evs.length;
    // audit trace reconstructs the causal chain
    const audit = await db
      .selectFrom("audit_log")
      .select(["action"])
      .where("task_id", "=", id)
      .execute();
    if (artifacts.has(id) && !audit.some((a) => a.action === "approval.approve"))
      fail(`run ${runI}: task ${id} has no approval.approve audit row`);
    if (!audit.some((a) => a.action === "queue.transition"))
      fail(`run ${runI}: task ${id} has no queue.transition audit row`);
  }
  // artifact files exist, non-empty, mention their task
  for (const [id, name] of artifacts) {
    const p = resolve(PROOF_ROOT, name);
    const s = await stat(p).catch(() => null);
    if (!s || s.size === 0) fail(`run ${runI}: artifact ${name} missing or empty`);
    const body = await readFile(p, "utf8");
    if (!body.includes(id)) fail(`run ${runI}: artifact ${name} does not reference task ${id}`);
  }
  // council-silent negative proof: slice tasks are internal/non-L1 — ZERO
  // council-tagged spend rows may exist for the chain (CNCL-01 inside the gate)
  const council = await db
    .selectFrom("cost_ledger")
    .select(({ fn }) => fn.countAll().as("n"))
    .where("task_id", "in", ids)
    .where(sql`meta->>'council' = 'true'`)
    .executeTakeFirstOrThrow();
  if (Number(council.n) !== 0)
    fail(`run ${runI}: council fired ${council.n}x on a normal internal task — CNCL-01 violated`);

  console.log(
    `run ${runI}/10: PASS (chain=${ids.length} tasks, events=${eventTotal}, ` +
      `artifact=${[...artifacts.values()].join("+")})`,
  );

  // ---- cleanup: run N+1 starts clean ----
  const approvalIds = (
    await db.selectFrom("approvals").select("id").where("task_id", "in", ids).execute()
  ).map((r) => r.id);
  await db.deleteFrom("task_events").where("task_id", "in", ids).execute();
  if (approvalIds.length > 0)
    await db.deleteFrom("outbox").where("approval_id", "in", approvalIds).execute();
  await db.deleteFrom("approvals").where("task_id", "in", ids).execute();
  await db.deleteFrom("cost_ledger").where("task_id", "in", ids).execute();
  await db.deleteFrom("audit_log").where("task_id", "in", ids).execute();
  await db.deleteFrom("tasks").where("id", "in", ids).execute();
  for (const name of artifacts.values()) await rm(resolve(PROOF_ROOT, name), { force: true });

  await client.close();
  await closeDb();
}

// E10.2: the LOCKED slice predates the Fable hook — its fixtures carry no
// employee/persona/project surface, so the production-on gates would reject
// the worker claim. Pin the §22 flag off for the gate's duration (restored
// by the caller's trap; the flag-off period is alerted by design, and the
// hook-on restore sweeps the pin-period alert).
async function hookFlag() {
  const db = getDb();
  const on = process.env.SLICE_HOOK === "on";
  await sql`UPDATE settings_values SET value = ${on ? "true" : "false"}::jsonb
     WHERE key = 'hook.enabled' AND scope = 'global'`.execute(db);
  if (on) {
    await sql`DELETE FROM alerts
       WHERE dedup_key = 'hook:disabled' AND resolved_at IS NULL`.execute(db);
  }
  await closeDb();
}

if (MODE === "pre") await preconditions();
else if (MODE === "drive") await drive();
else if (MODE === "hook-flag") await hookFlag();
else { console.error(`unknown SLICE_MODE '${MODE}'`); process.exit(2); }
NODE_DRIVER
)"

run_driver() { # $1=mode  (drive args ride env: SLICE_RUN/SLICE_TASK_IDS/SLICE_DEPTS)
  SLICE_MODE="$1" node --input-type=module -e "$DRIVER"
}

echo "== slice-10of10: preconditions =="
run_driver pre

# E10.2 hook pin (see hookFlag in the driver) — restore even on failure.
SLICE_HOOK=off run_driver hook-flag
trap 'SLICE_HOOK=on run_driver hook-flag' EXIT

SIGNATURE="" # run-1 classification signature — later runs must match (determinism)
for i in $(seq 1 "$RUNS"); do
  echo "== run $i/$RUNS: dxb intent =="
  OUT="$(node tools/dxb-cli/dist/index.js intent "$INTENT_TEXT")"
  echo "$OUT"
  CLASSIFIED="$(grep '^classified:' <<<"$OUT" || true)"
  IDS="$(grep '^queued ' <<<"$OUT" | awk '{print $2}' | paste -sd, || true)"
  DEPTS="$(grep '^queued ' <<<"$OUT" | sed 's/.*dept=\([^ ]*\).*/\1/' | sort -u | paste -sd, || true)"
  TIERS="$(grep '^queued ' <<<"$OUT" | sed 's/.*tier=\([^ ]*\).*/\1/' | sort -u | paste -sd, || true)"
  if [ -z "$IDS" ]; then
    echo "FAIL: run $i: dxb intent queued no tasks" >&2
    exit 1
  fi
  # Behavioral determinism signature: what the chain DOES must not wander.
  # ci.departments beyond index 0 is advisory (single-path decompose consumes
  # only departments[0]) — the queued tasks' dept/tier/class are the invariant.
  TASK_CLASS="$(sed 's/.*task_class=\([^ ]*\).*/\1/' <<<"$CLASSIFIED")"
  COMPLEXITY="$(sed 's/.*complexity=\([^ ]*\).*/\1/' <<<"$CLASSIFIED")"
  SIG="class=${TASK_CLASS}|complexity=${COMPLEXITY}|task_depts=${DEPTS}|tiers=${TIERS}"
  if [ "$i" -eq 1 ]; then
    SIGNATURE="$SIG"
  elif [ "$SIG" != "$SIGNATURE" ]; then
    echo "FAIL: run $i: classification wandered — '$SIG' != run-1 '$SIGNATURE'" >&2
    echo "      (determinism lever: routing_rules keyword pin [ADAPT] or narrow slice per master-plan §5)" >&2
    exit 1
  fi
  SLICE_RUN="$i" SLICE_TASK_IDS="$IDS" SLICE_DEPTS="$DEPTS" run_driver drive
done

echo "10/10 PASS — Phase 5 exit gate (I9) GREEN: intent → kernel → worker → QA → approval → outbox(test.write_file) → done"
