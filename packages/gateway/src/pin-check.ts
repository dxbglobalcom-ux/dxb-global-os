// Anti rug-pull hash pinning (MCP-03, master PHASE-07 step 2). A tool's
// description+inputSchema is hashed — and since 2026-10-01 kept as text — at
// approval time; the daily cron re-hashes the live inventory. A drifted tool is
// REVIEWED (drift-review.ts, the CEO's order of 2026-10-01): re-approved only when
// the repository vouches for the exact new text (our own dxb-mcp source, or the
// reviewed tool manifest), otherwise QUARANTINED — audit row (old and new text)
// and alert in the SAME transaction either way (T-07-03/05), so he hears of both.
// Quarantine is STICKY: nothing in this module sets quarantined back to false on a
// quarantined pin — that is an explicit human-path update (SQL by CEO decision) by
// design (T-07-06). Deterministic only: no model calls, no network — the inventory
// is injected by the caller.
import { createHash } from "node:crypto";
import { sql, type Kysely, type Transaction } from "kysely";
import { type DB } from "@dxb/shared";
import {
  approvedCorpus,
  describeDrift,
  judgeDrift,
  readManifestEntries,
  type ApprovedCorpus,
  type DriftDescription,
  type DriftVerdict,
  type ToolText,
} from "./drift-review.js";
import { DXB_MCP_SERVER_NAME } from "./inventory.js";

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

/** A stored pinned_text read back — only when it IS the approved text: the right shape AND hashing to
 *  the pin's approved hash. A text left behind by a hand re-pin that changed only the hash is stale
 *  and is not used as the baseline. */
function storedText(value: unknown, approvedHash: string): ToolText | null {
  let v: unknown = value;
  if (typeof v === "string") {
    try {
      v = JSON.parse(v) as unknown;
    } catch {
      return null;
    }
  }
  if (v === null || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  if (typeof o.description !== "string" || !("inputSchema" in o)) return null;
  const text = { description: o.description, inputSchema: o.inputSchema };
  return computeToolHash(text) === approvedHash ? text : null;
}

/** What the repository vouches for, read from the reviewed tool manifest (drift-review.ts). The
 *  scheduler's daily job passes this to checkPins. */
export function loadApprovedCorpus(manifestPath?: string): ApprovedCorpus {
  return approvedCorpus(readManifestEntries(manifestPath), new Set([DXB_MCP_SERVER_NAME]), computeToolHash);
}

/** The alert texts are a finite vocabulary on purpose: the dashboard localizes each pattern
 *  (apps/dashboard/src/lib/alert-title.ts), and the change itself — old and new text, what was added
 *  — lives in the audit row the alert links to, not in free text on his screen. */
const AUTHORITY_TEXT: Record<string, string> = {
  "repository-source": "the repository's own source",
  "tool-manifest": "the repository's reviewed tool manifest",
};

/** One alert per distinct change of one tool (the dedup key carries the kind and the new hash).
 *  Informational: a duplicate is skipped. High: a duplicate (the same change of the same tool still
 *  unresolved from an earlier lock) is raised again — unacknowledged, unmuted, escalated — so the
 *  lock is never silent. */
async function raisePinAlert(
  trx: Transaction<DB>,
  kind: "repinned" | "quarantined",
  entry: ToolInventoryEntry,
  liveHash: string,
  auditId: number,
  verdict: DriftVerdict,
  description: DriftDescription,
): Promise<void> {
  const name = `${entry.server}/${entry.tool}`;
  const sourceRef = JSON.stringify({ table: "audit_log", audit_id: auditId, server: entry.server, tool: entry.tool });
  if (kind === "repinned") {
    await trx
      .insertInto("alerts")
      .values({
        level: "informational",
        source: "gateway",
        title: `Tool updated without a lock: ${name} changed to the text the repository vouches for`,
        affected_area: "tool pins",
        probable_cause: `The new text equals ${AUTHORITY_TEXT[verdict.authority ?? ""] ?? "an approved text"}`,
        suggested_action: `Nothing to do; the old and the new text are kept in audit record ${auditId}`,
        dedup_key: `pin:repinned:${entry.server}:${entry.tool}:${liveHash.slice(0, 12)}`,
        source_ref: sourceRef,
      })
      .onConflict((oc) => oc.doNothing())
      .execute();
    return;
  }
  const signals = description.signals.length ? description.signals.join(", ") : "none";
  await trx
    .insertInto("alerts")
    .values({
      level: "high",
      source: "gateway",
      title: `Tool locked: ${name} changed to a text the repository does not vouch for`,
      affected_area: "tool pins",
      probable_cause: `The new text is neither the approved one nor the one the repository's tool manifest carries. Signals: ${signals}`,
      suggested_action: `The tool is out of every profile until a person reads the change in audit record ${auditId} and re-pins it`,
      dedup_key: `pin:quarantined:${entry.server}:${entry.tool}:${liveHash.slice(0, 12)}`,
      source_ref: sourceRef,
    })
    .onConflict((oc) =>
      oc
        .column("dedup_key")
        .where("resolved_at", "is", null)
        .where("dedup_key", "is not", null)
        .doUpdateSet({
          level: "high",
          acknowledged_at: null,
          muted_until: null,
          escalated_at: sql<Date>`now()`,
          source_ref: sourceRef,
        }),
    )
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
  quarantined: Array<{ server: string; tool: string; signals: string[] }>;
  /** Drifted to a text the repository vouches for and re-approved this run (audit row and
   *  informational alert per tool). */
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
 *  Mismatch on a non-quarantined tool → drift review (judgeDrift): the repository vouches for the
 *  new text → new hash + text, audit `tool_repinned_auto` and an informational alert; it does not →
 *  quarantined=true, audit `tool_quarantined` and a high alert — each in ONE transaction that first
 *  locks the pin row and acts only if it is still the pin that was judged (two concurrent runs make
 *  one transition, never undo a lock). A quarantined pin is never re-approved here.
 *  `approved` defaults to the repository's manifest (loadApprovedCorpus).
 *  R4.3 `serversInScope`: with external servers in the corpus, a server that
 *  failed to SPAWN this run is unreachable, not tool-less — its pins are
 *  excluded from the missing-sweep so an npx/uvx hiccup cannot spam
 *  tool_missing audits. Omitted = every pinned server is in scope. */
export async function checkPins(
  db: Kysely<DB>,
  inventory: ToolInventoryEntry[],
  serversInScope?: Set<string>,
  approved: ApprovedCorpus = loadApprovedCorpus(),
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
      // The live text hashes to the approved hash, so it IS the approved text: keep it, so a later
      // drift can be shown as a change (the self-backfill of 2026-10-01). Written when no verified
      // text is kept yet (none, or a stale one left by a hand re-pin), and only while the row's hash
      // still equals the live hash at write time.
      const needsText = storedText(pin.pinned_text, pin.schema_hash) === null;
      const updated = await db
        .updateTable("tool_pins")
        .set(
          needsText
            ? { last_checked: sql<Date>`now()`, pinned_text: JSON.stringify(toolText(entry)) }
            : { last_checked: sql<Date>`now()` },
        )
        .where("id", "=", pin.id)
        .where("schema_hash", "=", liveHash)
        .executeTakeFirst();
      if (needsText && Number(updated.numUpdatedRows) === 1) result.textStored += 1;
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
    // Fresh drift. The verdict rests on the repository's word alone; the description is for the
    // person who reads the audit row.
    const verdict = judgeDrift(entry.server, entry.tool, liveHash, approved);
    const oldText = storedText(pin.pinned_text, pin.schema_hash);
    const description = describeDrift(oldText, entry);
    const applied = await db.transaction().execute(async (trx) => {
      // Lock the row and act only if it is still the pin that was judged: same approved hash, not
      // quarantined. A concurrent run that got here first has already made the transition.
      const current = await trx
        .selectFrom("tool_pins")
        .select(["schema_hash", "quarantined"])
        .where("id", "=", pin.id)
        .forUpdate()
        .executeTakeFirst();
      if (!current || current.quarantined || current.schema_hash !== pin.schema_hash) return false;
      const clean = verdict.verdict === "clean";
      await trx
        .updateTable("tool_pins")
        .set(
          clean
            ? {
                schema_hash: liveHash,
                pinned_text: JSON.stringify(toolText(entry)),
                pinned_at: sql<Date>`now()`,
                last_checked: sql<Date>`now()`,
              }
            : { quarantined: true, last_checked: sql<Date>`now()` },
        )
        .where("id", "=", pin.id)
        .execute();
      // The audit row keeps both texts, whole: after a re-approval the old one is gone from the pin,
      // and after a lock the server may quietly restore its text — the record must still show it.
      const audit = await trx
        .insertInto("audit_log")
        .values({
          actor: ACTOR,
          actor_type: "system",
          action: clean ? "tool_repinned_auto" : "tool_quarantined",
          task_id: null,
          payload: JSON.stringify({
            server: entry.server,
            tool: entry.tool,
            old_hash: pin.schema_hash,
            new_hash: liveHash,
            authority: verdict.authority,
            signals: description.signals,
            summary: description.summary,
            old_text: oldText,
            new_text: toolText(entry),
          }),
        })
        .returning("id")
        .executeTakeFirstOrThrow();
      await raisePinAlert(trx, clean ? "repinned" : "quarantined", entry, liveHash, Number(audit.id), verdict, description);
      return true;
    });
    if (!applied) continue;
    if (verdict.verdict === "clean") result.repinned.push({ server: entry.server, tool: entry.tool });
    else result.quarantined.push({ server: entry.server, tool: entry.tool, signals: description.signals });
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
