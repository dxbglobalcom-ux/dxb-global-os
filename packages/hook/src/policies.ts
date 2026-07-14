// Policy loader (§8/§10): DB is the single source; process-local cache with a
// 60 s TTL. The settings-channel Broadcast 'hook_policy.changed' drops the
// cache (invalidatePolicyCache — wired by the consumer, SETTINGS pattern).
//
// §17: a policy whose rule JSON is broken is NEVER silently skipped — it is
// returned in `invalid` and its gate REJECTS with an 'invalid_policy'
// violation. §27: two conflicting policies (same gate + same rule.check with
// different severities) resolve to the MOST RESTRICTIVE severity, and the
// conflict is surfaced as a medium alert (deduped).
import { sql } from "kysely";
import { getDb } from "@dxb/shared";
import type { HookPolicyRow, PolicyLoad } from "./types.js";

const TTL_MS = 60_000;
let cache: { load: PolicyLoad; at: number } | null = null;

export function invalidatePolicyCache(): void {
  cache = null;
}

function ruleIsValid(rule: unknown): rule is Record<string, unknown> {
  return (
    typeof rule === "object" &&
    rule !== null &&
    !Array.isArray(rule) &&
    typeof (rule as Record<string, unknown>).check === "string"
  );
}

/** Most-restrictive-wins conflict resolution (§27). */
function resolveConflicts(rows: HookPolicyRow[]): {
  rows: HookPolicyRow[];
  conflicts: PolicyLoad["conflicts"];
} {
  const byKey = new Map<string, HookPolicyRow[]>();
  for (const row of rows) {
    const key = `${row.gate}:${String(row.rule.check)}`;
    const bucket = byKey.get(key) ?? [];
    bucket.push(row);
    byKey.set(key, bucket);
  }
  const conflicts: PolicyLoad["conflicts"] = [];
  for (const [key, bucket] of byKey) {
    const severities = new Set(bucket.map((r) => r.severity));
    if (severities.size > 1) {
      const [gate, check] = key.split(":");
      conflicts.push({ gate, check, policyIds: bucket.map((r) => r.id) });
      for (const row of bucket) row.severity = "block";
    }
  }
  return { rows, conflicts };
}

/** Best-effort medium alert per conflict (§27) — deduped, never throws. */
async function alertConflicts(conflicts: PolicyLoad["conflicts"]): Promise<void> {
  for (const c of conflicts) {
    try {
      await sql`
        INSERT INTO alerts (level, source, title, affected_area, probable_cause,
                            suggested_action, dedup_key, source_ref)
        VALUES ('attention', 'hook',
                ${"Conflicting hook policies: " + c.policyIds.join(", ")},
                ${c.gate + "-gate"},
                ${"policies disagree on severity for check '" + c.check + "'; most restrictive (block) applied"},
                'Align the policy severities via fn_hook_set_policy',
                ${"hook:conflict:" + c.gate + ":" + c.check},
                ${JSON.stringify({ table: "hook_policies", id: c.policyIds[0] })}::jsonb)
        ON CONFLICT (dedup_key) WHERE resolved_at IS NULL AND dedup_key IS NOT NULL
        DO NOTHING`.execute(getDb());
    } catch (err) {
      console.error("[hook] conflict alert swallowed:", err);
    }
  }
}

/** Load enabled policies. THROWS on DB failure — callers implement §17
 *  fail-closed (spawn stops; the queue holds the work). */
export async function loadPolicies(): Promise<PolicyLoad> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.load;
  const raw = await getDb()
    .selectFrom("hook_policies")
    .selectAll()
    .where("enabled", "=", true)
    .orderBy("standard_no")
    .execute();
  const rows: HookPolicyRow[] = [];
  const invalid: HookPolicyRow[] = [];
  for (const r of raw) {
    const row = r as unknown as HookPolicyRow;
    if (ruleIsValid(row.rule)) rows.push(row);
    else invalid.push(row);
  }
  const resolved = resolveConflicts(rows);
  if (resolved.conflicts.length > 0) await alertConflicts(resolved.conflicts);
  const load: PolicyLoad = { rows: resolved.rows, invalid, conflicts: resolved.conflicts };
  cache = { load, at: Date.now() };
  return load;
}

/** Policies of one gate, in the §6 canonical check order for 'pre'. */
const PRE_ORDER = [
  "permission_bounds",
  "persona_gate",
  "task_completeness",
  "plan_evidence",
  "budget_fit",
  "project_link",
];

export function gatePolicies(load: PolicyLoad, gate: HookPolicyRow["gate"]): HookPolicyRow[] {
  const rows = load.rows.filter((r) => r.gate === gate);
  if (gate !== "pre") return rows;
  return rows.sort((a, b) => {
    const ia = PRE_ORDER.indexOf(String(a.rule.check));
    const ib = PRE_ORDER.indexOf(String(b.rule.check));
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}
