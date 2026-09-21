// Anti rug-pull hash pinning (MCP-03, master PHASE-07 step 2). A tool's
// description+inputSchema is hashed at approval time; the daily cron re-hashes
// the live inventory and QUARANTINES any drifted tool — audit row in the SAME
// transaction (T-07-03/05). Quarantine is STICKY: nothing in this module ever
// sets quarantined back to false or overwrites an existing pin hash — that is
// an explicit human-path update (dxb CLI / SQL by CEO decision) by design
// (T-07-06). Deterministic hashing only: no model calls, no network — the
// inventory is injected by the caller.
import { createHash } from "node:crypto";
import { sql, type Kysely } from "kysely";
import { type DB } from "@dxb/shared";

const ACTOR = "gateway:pin-check";

export interface ToolInventoryEntry {
  server: string;
  tool: string;
  /** Tool description as served by the MCP server's tools/list. */
  description: string;
  /** JSON Schema of the tool input as served by tools/list. */
  inputSchema: unknown;
}

/** Canonical JSON: object keys recursively sorted, no whitespace — so two
 *  semantically-equal schemas serialize identically regardless of key order
 *  (T-07-04). Arrays keep their order (order is meaningful in JSON Schema,
 *  e.g. enum/required lists are position-stable as served). */
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

/** sha256 hex over the canonical form of {description, inputSchema}. */
export function computeToolHash(tool: Pick<ToolInventoryEntry, "description" | "inputSchema">): string {
  const canonical = canonicalJson({ description: tool.description, inputSchema: tool.inputSchema });
  return createHash("sha256").update(canonical, "utf8").digest("hex");
}

export interface PinAllResult {
  pinned: Array<{ server: string; tool: string }>;
  existing: number;
}

/** First-sight pinning: insert a hash row per unknown (server, tool); rows
 *  that already exist are NEVER touched — a pin is immutable until human
 *  re-approval, so a drifted tool cannot re-legitimize itself by re-pinning. */
export async function pinAll(db: Kysely<DB>, inventory: ToolInventoryEntry[]): Promise<PinAllResult> {
  const pinned: Array<{ server: string; tool: string }> = [];
  let existing = 0;
  for (const entry of inventory) {
    const inserted = await db
      .insertInto("tool_pins")
      .values({
        server: entry.server,
        tool: entry.tool,
        schema_hash: computeToolHash(entry),
      })
      .onConflict((oc) => oc.columns(["server", "tool"]).doNothing())
      .returning(["server", "tool"])
      .executeTakeFirst();
    if (inserted) pinned.push({ server: inserted.server, tool: inserted.tool });
    else existing += 1;
  }
  return { pinned, existing };
}

export interface CheckPinsResult {
  checked: number;
  matched: number;
  /** Freshly quarantined this run (audit row written per tool). */
  quarantined: Array<{ server: string; tool: string }>;
  /** Drifted but already quarantined — short-circuited, no duplicate audit. */
  alreadyQuarantined: number;
  /** Pinned in the table but absent from the live inventory (audited as
   *  tool_missing — disappearance ≠ mutation, no quarantine flip). */
  missing: Array<{ server: string; tool: string }>;
  /** Live tools with no pin row yet — reported, not acted on; pinning new
   *  tools is pinAll's (human-initiated) job, never the cron's. */
  unpinned: Array<{ server: string; tool: string }>;
}

/** Daily drift check: recompute every live tool's hash against its pin.
 *  Mismatch on a non-quarantined tool → quarantined=true + audit row in ONE
 *  transaction. Never un-quarantines, never rewrites schema_hash.
 *  R4.3 `serversInScope`: with external servers in the corpus, a server that
 *  failed to SPAWN this run is unreachable, not tool-less — its pins are
 *  excluded from the missing-sweep so an npx/uvx hiccup cannot spam
 *  tool_missing audits. Omitted = every pinned server is in scope. */
export async function checkPins(
  db: Kysely<DB>,
  inventory: ToolInventoryEntry[],
  serversInScope?: Set<string>,
): Promise<CheckPinsResult> {
  const pins = await db.selectFrom("tool_pins").selectAll().execute();
  const byKey = new Map(pins.map((p) => [`${p.server} ${p.tool}`, p]));
  const liveKeys = new Set(inventory.map((e) => `${e.server} ${e.tool}`));

  const result: CheckPinsResult = {
    checked: 0,
    matched: 0,
    quarantined: [],
    alreadyQuarantined: 0,
    missing: [],
    unpinned: [],
  };

  for (const entry of inventory) {
    const pin = byKey.get(`${entry.server} ${entry.tool}`);
    if (!pin) {
      result.unpinned.push({ server: entry.server, tool: entry.tool });
      continue;
    }
    result.checked += 1;
    const liveHash = computeToolHash(entry);
    if (liveHash === pin.schema_hash) {
      result.matched += 1;
      await db
        .updateTable("tool_pins")
        .set({ last_checked: sql<Date>`now()` })
        .where("id", "=", pin.id)
        .execute();
      continue;
    }
    if (pin.quarantined) {
      // Already quarantined: touch last_checked only — no duplicate audit.
      result.alreadyQuarantined += 1;
      await db
        .updateTable("tool_pins")
        .set({ last_checked: sql<Date>`now()` })
        .where("id", "=", pin.id)
        .execute();
      continue;
    }
    // Fresh drift: quarantine + audit, one transaction (no silent quarantine).
    await db.transaction().execute(async (trx) => {
      await trx
        .updateTable("tool_pins")
        .set({ quarantined: true, last_checked: sql<Date>`now()` })
        .where("id", "=", pin.id)
        .execute();
      await trx
        .insertInto("audit_log")
        .values({
          actor: ACTOR,
          actor_type: "system",
          action: "tool_quarantined",
          task_id: null,
          payload: JSON.stringify({
            server: entry.server,
            tool: entry.tool,
            old_hash: pin.schema_hash,
            new_hash: liveHash,
          }),
        })
        .execute();
    });
    result.quarantined.push({ server: entry.server, tool: entry.tool });
  }

  for (const pin of pins) {
    if (liveKeys.has(`${pin.server} ${pin.tool}`)) continue;
    // R4.3's scope, WHICH THIS LOOP NEVER APPLIED. The parameter has been
    // accepted and documented since R4.3 — "its pins are excluded from the
    // missing-sweep" — and the code above reads it nowhere, so every call
    // stamped every pin of every server it had not even tried to reach.
    // Measured 2026-09-21 on the construction engine: 38,811 `tool_missing`
    // rows, 13,032 of them for `playwright` alone, and one battery run added
    // 228 — exactly the 76 pins on that engine times the three calls
    // `tests/phase7/pin-quarantine` makes with a scope of ONE fixture server.
    // A server that was not reached is unreachable, not tool-less: saying its
    // tools disappeared is a false statement written into the CEO's ledger.
    if (serversInScope && !serversInScope.has(pin.server)) continue;
    result.missing.push({ server: pin.server, tool: pin.tool });
    await db
      .insertInto("audit_log")
      .values({
        actor: ACTOR,
        actor_type: "system",
        action: "tool_missing",
        task_id: null,
        payload: JSON.stringify({ server: pin.server, tool: pin.tool, pinned_hash: pin.schema_hash }),
      })
      .execute();
  }

  return result;
}
