// Anti rug-pull hash pinning (MCP-03, master PHASE-07 step 2). A tool's
// description+inputSchema is hashed — and since 2026-10-01 kept as text — at
// approval time; the daily cron re-hashes the live inventory. A drifted tool is
// REVIEWED (drift-review.ts, the CEO's order of 2026-10-01): a change that reads
// clean is re-approved, a suspect one is QUARANTINED — audit row and alert in the
// SAME transaction either way (T-07-03/05), so he hears of both. Quarantine is
// STICKY: nothing in this module sets quarantined back to false on a quarantined
// pin — that is an explicit human-path update (SQL by CEO decision) by design
// (T-07-06). Deterministic only: no model calls, no network — the inventory is
// injected by the caller.
import { createHash } from "node:crypto";
import { sql, type Kysely, type Transaction } from "kysely";
import { type DB } from "@dxb/shared";
import { classifyDrift, type DriftVerdict, type ToolText } from "./drift-review.js";

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

/** The approved form a pin keeps: exactly the two fields the hash covers. */
function toolText(entry: Pick<ToolInventoryEntry, "description" | "inputSchema">): ToolText {
  return { description: entry.description, inputSchema: entry.inputSchema };
}

/** A stored pinned_text read back, or null when absent or not the expected shape. */
function storedText(value: unknown): ToolText | null {
  const v = typeof value === "string" ? (JSON.parse(value) as unknown) : value;
  if (v === null || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  if (typeof o.description !== "string" || !("inputSchema" in o)) return null;
  return { description: o.description, inputSchema: o.inputSchema };
}

/** One alert per distinct change of one tool (the dedup key carries the new hash); a duplicate is
 *  skipped inside the transaction instead of aborting it. */
async function raisePinAlert(
  trx: Transaction<DB>,
  kind: "repinned" | "quarantined",
  entry: ToolInventoryEntry,
  liveHash: string,
  review: DriftVerdict,
): Promise<void> {
  const what = review.summary.length ? review.summary.join("; ") : "the text changed";
  await trx
    .insertInto("alerts")
    .values(
      kind === "quarantined"
        ? {
            level: "high",
            source: "gateway",
            title: `Tool locked: ${entry.server}/${entry.tool} changed in a way that needs a human look`,
            affected_area: "tool pins",
            probable_cause: `rules: ${review.rules.join(", ")} — ${what}`.slice(0, 1000),
            suggested_action:
              "Read the change; if it is harmless, re-pin the tool (tool_pins: new hash and text, quarantined=false) on the CEO's word",
            dedup_key: `pin:quarantined:${entry.server}:${entry.tool}:${liveHash.slice(0, 12)}`,
            source_ref: JSON.stringify({ table: "tool_pins", server: entry.server, tool: entry.tool }),
          }
        : {
            level: "informational",
            source: "gateway",
            title: `Tool update approved: ${entry.server}/${entry.tool} changed and the change read clean`,
            affected_area: "tool pins",
            probable_cause: what.slice(0, 1000),
            suggested_action: "Nothing to do; the change is recorded in the audit log",
            dedup_key: `pin:repinned:${entry.server}:${entry.tool}:${liveHash.slice(0, 12)}`,
            source_ref: JSON.stringify({ table: "tool_pins", server: entry.server, tool: entry.tool }),
          },
    )
    .onConflict((oc) => oc.doNothing())
    .execute();
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
        pinned_text: JSON.stringify(toolText(entry)),
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
  /** Freshly quarantined this run (audit row and high alert written per tool). */
  quarantined: Array<{ server: string; tool: string; rules: string[] }>;
  /** Drifted, reviewed clean and re-approved this run (audit row and informational alert per tool). */
  repinned: Array<{ server: string; tool: string }>;
  /** Pins whose approved text was stored this run (the live hash still equalled the approved hash). */
  textStored: number;
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
 *  Mismatch on a non-quarantined tool → drift review: clean → new hash + text,
 *  audit `tool_repinned_auto` and an informational alert; suspect →
 *  quarantined=true, audit `tool_quarantined` and a high alert — each in ONE
 *  transaction. A quarantined pin is never re-approved here.
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
    repinned: [],
    textStored: 0,
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
      // The live text hashes to the approved hash, so it IS the approved text: store it once, so a
      // later drift is judged on the change itself (the self-backfill of 2026-10-01).
      const storeText = pin.pinned_text === null || pin.pinned_text === undefined;
      await db
        .updateTable("tool_pins")
        .set(
          storeText
            ? { last_checked: sql<Date>`now()`, pinned_text: JSON.stringify(toolText(entry)) }
            : { last_checked: sql<Date>`now()` },
        )
        .where("id", "=", pin.id)
        .where("schema_hash", "=", liveHash)
        .execute();
      if (storeText) result.textStored += 1;
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
    // Fresh drift: review the change. Either way one transaction carries the pin, its audit row and
    // the alert, and the update only applies while the pin is still the one that was read.
    const review = classifyDrift(storedText(pin.pinned_text), entry);
    let applied = false;
    if (review.verdict === "clean") {
      await db.transaction().execute(async (trx) => {
        const updated = await trx
          .updateTable("tool_pins")
          .set({
            schema_hash: liveHash,
            pinned_text: JSON.stringify(toolText(entry)),
            pinned_at: sql<Date>`now()`,
            last_checked: sql<Date>`now()`,
          })
          .where("id", "=", pin.id)
          .where("schema_hash", "=", pin.schema_hash)
          .where("quarantined", "=", false)
          .executeTakeFirst();
        if (Number(updated.numUpdatedRows) !== 1) return;
        await trx
          .insertInto("audit_log")
          .values({
            actor: ACTOR,
            actor_type: "system",
            action: "tool_repinned_auto",
            task_id: null,
            payload: JSON.stringify({
              server: entry.server,
              tool: entry.tool,
              old_hash: pin.schema_hash,
              new_hash: liveHash,
              summary: review.summary,
            }),
          })
          .execute();
        await raisePinAlert(trx, "repinned", entry, liveHash, review);
        applied = true;
      });
      if (applied) result.repinned.push({ server: entry.server, tool: entry.tool });
      continue;
    }
    await db.transaction().execute(async (trx) => {
      const updated = await trx
        .updateTable("tool_pins")
        .set({ quarantined: true, last_checked: sql<Date>`now()` })
        .where("id", "=", pin.id)
        .where("quarantined", "=", false)
        .executeTakeFirst();
      if (Number(updated.numUpdatedRows) !== 1) return;
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
            rules: review.rules,
            summary: review.summary,
          }),
        })
        .execute();
      await raisePinAlert(trx, "quarantined", entry, liveHash, review);
      applied = true;
    });
    if (applied) result.quarantined.push({ server: entry.server, tool: entry.tool, rules: review.rules });
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
