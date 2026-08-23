#!/usr/bin/env node
// SessionEnd hook (KERN-03, 04-04 Task 4): tag subscription-mode Claude Code
// spend into cost_ledger. API-mode rows come from LiteLLM's spend tables; this
// hook covers the calls that never touch the proxy (CLAUDE.md tagging rule).
//
// stdin JSON shape verified 2026-07-08 against live hook docs + a real
// transcript: { session_id, transcript_path, cwd, hook_event_name, source }.
// No hook event carries usage/model, so tokens are summed from the
// transcript's assistant lines (message.model + message.usage).
//
// cost_eur stays 0: subscription calls have no marginal EUR — the row exists
// for per-dept/model/mode accounting (COST-04 view, Phase 8). Token counts
// carry the volume signal.
import { createInterface } from "node:readline";
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { getDb, closeDb } from "@dxb/shared";

interface HookInput {
  session_id?: string;
  transcript_path?: string;
}

interface UsageTotals {
  prompt: number;
  completion: number;
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf8");
}

async function sumTranscript(path: string): Promise<Map<string, UsageTotals>> {
  const perModel = new Map<string, UsageTotals>();
  const lines = createInterface({ input: createReadStream(path), crlfDelay: Infinity });
  for await (const line of lines) {
    let obj: any;
    try {
      obj = JSON.parse(line);
    } catch {
      continue;
    }
    if (obj?.type !== "assistant") continue;
    const model = obj.message?.model;
    const usage = obj.message?.usage;
    if (!model || !usage) continue;
    const totals = perModel.get(model) ?? { prompt: 0, completion: 0 };
    // prompt side includes cache reads/writes — they are real input volume
    totals.prompt +=
      (usage.input_tokens ?? 0) +
      (usage.cache_read_input_tokens ?? 0) +
      (usage.cache_creation_input_tokens ?? 0);
    totals.completion += usage.output_tokens ?? 0;
    perModel.set(model, totals);
  }
  return perModel;
}

/**
 * The holding's own database, taken from the SERVER and not from an address.
 *
 * Why the address is no longer read at all: on 2026-08-23 an independent audit
 * proved that comparing connection STRINGS cannot protect the company. Six
 * spellings that a URL comparison called "some other database" every one landed
 * on the holding's own — measured, each one connected and reported
 * `postgres`:
 *
 *   ?host=127.0.0.1      the driver obeys the query parameter, not the authority
 *   no /database in path libpq then uses the USER name, which is `postgres`
 *   127.1                a short IPv4 the URL parser leaves alone and the OS resolves
 *   2130706433           the same address written as one decimal number
 *   localhost.           a trailing dot is a different string and the same host
 *   127.0.0.2            a different loopback address reaching the same server
 *
 * The parser was not wrong in one place; text is the wrong thing to compare. So
 * the hook asks the server it actually reached who it is — a cluster's
 * `system_identifier`, and the database's own `oid` and name. A connection
 * cannot lie about those: whatever spelling got it there, that is where the next
 * INSERT would land. `tools/hooks/company-fingerprint.json` carries the
 * holding's answer, taken by `scripts/b36/company-fingerprint.mjs`; a test in
 * `tests/b36/` fails if the recorded identity ever stops matching the live one.
 */
interface CompanyFingerprint {
  sysid: string;
  dboid: string;
  dbname: string;
}

function companyFingerprint(): CompanyFingerprint | null {
  try {
    const f = JSON.parse(
      readFileSync(new URL("../company-fingerprint.json", import.meta.url), "utf8"),
    ) as CompanyFingerprint;
    return f.sysid && f.dboid && f.dbname ? f : null;
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  const input = JSON.parse(await readStdin()) as HookInput;
  const sessionId = input.session_id;
  const transcriptPath = input.transcript_path;
  if (!sessionId || !transcriptPath || !existsSync(transcriptPath)) return;

  // B36 (CEO order 2026-08-23, complaint C24/C47). What this hook records is the
  // CONSTRUCTION session's own token burn, and a construction cost is not the
  // holding's spend. Until 2026-08-23 the line here read
  //   process.env.DXB_DATABASE_URL ??= "postgresql://…:54322/postgres"
  // which is the COMPANY database, so every session that ended wrote a row into
  // the CEO's own cost ledger — measured: 950 '<synthetic>' rows plus 282
  // claude-fable-5 and 122 claude-opus-5 rows, the newest landing 2026-08-22.
  // There is no fallback any more: a missing address means the construction has
  // no ledger yet, never that the company's will do.
  const constructionUrl = process.env.DXB_CONSTRUCTION_DATABASE_URL;
  if (!constructionUrl) return;

  // The guard fails CLOSED. With no recorded identity for the holding there is
  // nothing to compare against, and a hook that cannot prove where it is writing
  // does not write.
  const company = companyFingerprint();
  if (!company) {
    console.error(
      "tag-subscription-call: tools/hooks/company-fingerprint.json is missing or unreadable — " +
        "refusing to write (run scripts/b36/company-fingerprint.mjs)",
    );
    return;
  }

  process.env.DXB_DATABASE_URL = constructionUrl;
  const db = getDb();
  const { sql } = await import("kysely");

  // Asked of the server, before a single row is written.
  let here: { sysid: string | null; dboid: string; dbname: string } | undefined;
  try {
    const identity = await sql<{ sysid: string | null; dboid: string; dbname: string }>`
      select (select system_identifier::text from pg_control_system()) sysid,
             (select oid::text from pg_database where datname = current_database()) dboid,
             current_database() dbname`.execute(db);
    here = identity.rows[0];
  } catch (e) {
    console.error(
      `tag-subscription-call: could not ask the database who it is — refusing to write (${String(e).slice(0, 120)})`,
    );
    return;
  }
  if (!here?.sysid) {
    console.error(
      "tag-subscription-call: the server would not name its cluster (pg_control_system denied) — refusing to write",
    );
    return;
  }
  // Same cluster AND (same database oid OR same database name). The name is in
  // the rule because a `supabase db reset` rebuilds the holding's database under
  // a new oid, and the guard must not go blind the moment that happens; the oid
  // is in it because a rename must not open the door either.
  if (here.sysid === company.sysid && (here.dboid === company.dboid || here.dbname === company.dbname)) {
    console.error(
      `tag-subscription-call: DXB_CONSTRUCTION_DATABASE_URL reaches the company database ` +
        `(cluster ${here.sysid}, database ${here.dbname}) — refusing to write`,
    );
    return;
  }

  // v1 idempotency: one SessionEnd per session wins (resume/clear can fire the
  // hook again with a longer transcript; refining to incremental rows is a
  // recorded follow-up, not silent double-counting)
  const existing = await db
    .selectFrom("cost_ledger")
    .select("id")
    .where("mode", "=", "subscription")
    .where(sql<boolean>`meta->>'session_id' = ${sessionId}`)
    .executeTakeFirst();
  if (existing) return;

  const perModel = await sumTranscript(transcriptPath);
  if (perModel.size === 0) return;

  const department = process.env.DXB_DEPARTMENT ?? "engineering";
  const taskId = process.env.DXB_TASK_ID ?? null;

  await db
    .insertInto("cost_ledger")
    .values(
      [...perModel.entries()].map(([model, totals]) => ({
        task_id: taskId,
        department,
        model,
        mode: "subscription",
        prompt_tokens: totals.prompt,
        completion_tokens: totals.completion,
        cost_eur: 0,
        source: "hook",
        meta: JSON.stringify({ session_id: sessionId }),
      })),
    )
    .execute();
}

try {
  await main();
} catch (e) {
  // never block session teardown — report and exit clean
  console.error(`tag-subscription-call: ${String(e).slice(0, 300)}`);
} finally {
  await closeDb().catch(() => {});
}
