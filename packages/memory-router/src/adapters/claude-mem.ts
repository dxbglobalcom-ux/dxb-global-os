// claude-mem adapter (study card claude-mem.md, 06-01). LOCKED (MASTER-PLAN
// PHASE-06): claude-mem stays an AUTONOMOUS hook OUTSIDE the router write
// path — this adapter is pointer sync ONLY. The router NEVER writes into
// claude-mem: this module deliberately exports NO write surface toward the
// claude-mem store (enforced by absence; grep-proof in 06-06 verify).
// Card-verbatim read surface:
//   "Read-only SQL over ~/.claude-mem/claude-mem.db `observations` (filter
//    `project`; order `created_at_epoch`). Pointer row in memory_index:
//    store='claude-mem', ref=<observation id>; idempotent by ref."
//   "DB is live-written by hooks (WAL): adapter opens read-only and tolerates
//    busy/locked with retry, never writes, never migrates that schema."
// Card pitfall carried: gated decisions must never cite claude-mem content
// directly — pointer rows are session-observation provenance, and the synced
// facts' contradiction sweep is deferred to the 06-08 compaction cron.
import { DatabaseSync } from "node:sqlite";
import { readlinkSync, realpathSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Kysely } from "kysely";
import type { DB } from "@dxb/shared";

function defaultDbPath(): string {
  // The passwd home, not $HOME (A4): a company call runs with HOME set to the company Claude home.
  return process.env.DXB_CLAUDE_MEM_DB ?? path.join(os.userInfo().homedir, ".claude-mem", "claude-mem.db");
}

function defaultProject(): string {
  return process.env.DXB_CLAUDE_MEM_PROJECT ?? "DxB Global OS";
}

/** The path with every link resolved — through parts that do not exist yet and through a dangling link. */
function realPath(p: string, depth = 0): string {
  try {
    return realpathSync(p);
  } catch {
    // not there (yet), or a link whose target is not there
  }
  if (depth > 40) return p;
  try {
    return realPath(path.resolve(path.dirname(p), readlinkSync(p)), depth + 1);
  } catch {
    // not a link
  }
  const parent = path.dirname(p);
  return parent === p ? p : path.join(realPath(parent, depth + 1), path.basename(p));
}

/** The construction's claude-mem (its sessions' observations) is not the company's memory (CEO
 *  2026-10-03, "ikisine de evet" — isolation-phase3-plan-and-memory-path-2026-10-03). A database that
 *  is ~/.claude-mem/… (the passwd home's, whatever $HOME says), lies inside it or reaches it through
 *  a link is refused before it is opened —
 *  by default, by DXB_CLAUDE_MEM_DB and by an explicit path alike. A database of the company's own
 *  (the suites' fixtures) still reads. Measured before the cut: no runtime caller reached it. */
function companyOwned(dbPath: string): string {
  // The construction is the passwd entry's home, never $HOME (Sol's single pass on phase 3, A4: a
  // company call runs with HOME set to the company's Claude home, and a bar derived from os.homedir()
  // moved with it and let the real database through).
  const theirs = realPath(path.join(os.userInfo().homedir, ".claude-mem"));
  const p = realPath(path.resolve(dbPath));
  if (p === theirs || p.startsWith(`${theirs}${path.sep}`)) {
    throw new Error(`claude-mem adapter: ${dbPath} is the construction's claude-mem (${theirs}) — the company does not read it`);
  }
  return dbPath;
}

/** Read-only open with a small busy/locked retry (WAL is hook-live). */
function openReadOnly(dbPath: string): DatabaseSync {
  companyOwned(dbPath);
  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return new DatabaseSync(dbPath, { readOnly: true });
    } catch (e) {
      lastErr = e;
      if (!/busy|locked/i.test(String(e))) throw e;
    }
  }
  throw lastErr;
}

interface ObservationRow {
  id: number;
  title: string | null;
  subtitle: string | null;
  narrative: string | null;
  facts: string | null;
  text: string | null;
  created_at_epoch: number;
}

/** Compose a recallable body: title/subtitle/narrative/facts — `text` is
 *  usually NULL in current claude-mem schema usage (verified 2026-07-09). */
function observationBody(row: ObservationRow): string {
  let facts = "";
  if (row.facts) {
    try {
      const parsed = JSON.parse(row.facts) as unknown;
      facts = Array.isArray(parsed) ? parsed.map((f) => `- ${String(f)}`).join("\n") : row.facts;
    } catch {
      facts = row.facts;
    }
  }
  return [
    row.title ?? "",
    row.subtitle ?? "",
    "",
    row.narrative ?? row.text ?? "",
    facts ? `Facts:\n${facts}` : "",
  ]
    .filter((part, i) => part !== "" || i === 2)
    .join("\n")
    .trim();
}

export interface SyncClaudeMemOpts {
  /** Only observations with created_at_epoch strictly greater than this. */
  since?: number;
  /** Test seam / ops override; default ~/.claude-mem/claude-mem.db (card). */
  dbPath?: string;
  /** Test seam / ops override; default this repo's project slug. */
  project?: string;
}

export interface SyncClaudeMemResult {
  scanned: number;
  inserted: number;
  skipped: number;
}

/** Pointer-sync claude-mem observations into memory_index. Idempotent by ref
 *  (observation id is stable, card). Inserts pointer METADATA only — the body
 *  stays in claude-mem (T-06-18). Exported for the 06-08 hourly cron. */
export async function syncClaudeMem(
  db: Kysely<DB>,
  opts: SyncClaudeMemOpts = {},
): Promise<SyncClaudeMemResult> {
  const sqlite = openReadOnly(opts.dbPath ?? defaultDbPath());
  let observations: Array<{ id: number }>;
  try {
    const where = ["project = ?"];
    const params: Array<string | number> = [opts.project ?? defaultProject()];
    if (opts.since !== undefined) {
      where.push("created_at_epoch > ?");
      params.push(opts.since);
    }
    observations = sqlite
      .prepare(
        `SELECT id FROM observations WHERE ${where.join(" AND ")} ORDER BY created_at_epoch`,
      )
      .all(...params) as Array<{ id: number }>;
  } finally {
    sqlite.close();
  }

  const scanned = observations.length;
  if (scanned === 0) return { scanned: 0, inserted: 0, skipped: 0 };

  const refs = observations.map((o) => String(o.id));
  const existing = new Set(
    (
      await db
        .selectFrom("memory_index")
        .select("ref")
        .where("store", "=", "claude-mem")
        .where("ref", "in", refs)
        .execute()
    ).map((r) => r.ref),
  );
  const fresh = refs.filter((ref) => !existing.has(ref));

  for (let i = 0; i < fresh.length; i += 500) {
    const chunk = fresh.slice(i, i + 500);
    await db
      .insertInto("memory_index")
      .values(
        chunk.map((ref) => ({
          kind: "fact",
          store: "claude-mem",
          ref,
          provenance: JSON.stringify({
            agent: "claude-mem-hook",
            task_id: null,
            origin: "agent",
            source: "claude-mem",
          }),
          trust_tier: "trusted", // agent-origin per rule 1
          expires_at: null, // pointer follows the observation's own lifetime
        })),
      )
      .execute();
  }

  return { scanned, inserted: fresh.length, skipped: scanned - fresh.length };
}

/** Resolve an observation body for recall by its pointer ref. Loud on a
 *  missing observation (broken pointer must never read as empty memory). */
export function readObservationByRef(ref: string, dbPath?: string): string {
  const id = Number(ref);
  if (!Number.isInteger(id)) throw new Error(`claude-mem adapter: ref is not an observation id: ${ref}`);
  const sqlite = openReadOnly(dbPath ?? defaultDbPath());
  try {
    const row = sqlite
      .prepare(
        "SELECT id, title, subtitle, narrative, facts, text, created_at_epoch FROM observations WHERE id = ?",
      )
      .get(id) as ObservationRow | undefined;
    if (!row) throw new Error(`claude-mem adapter: observation ${ref} not found (broken pointer)`);
    return observationBody(row);
  } finally {
    sqlite.close();
  }
}
