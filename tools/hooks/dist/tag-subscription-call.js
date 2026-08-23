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
// @dxb/shared is loaded LATE, on purpose. It is compiled output, and on a
// machine where nobody has run `pnpm typecheck` it does not exist — a static
// import would then kill this file before its own error handling exists, with a
// module-resolution stack trace at the end of the CEO's session. Loaded inside
// main(), a missing build becomes one line and a clean exit. Nothing is written
// either way, which is the property that matters.
let closeDb = null;
/** Read through a call so the compiler cannot narrow it to the null it starts as. */
const closer = () => closeDb;
async function readStdin() {
    const chunks = [];
    for await (const chunk of process.stdin)
        chunks.push(chunk);
    return Buffer.concat(chunks).toString("utf8");
}
async function sumTranscript(path) {
    const perModel = new Map();
    const lines = createInterface({ input: createReadStream(path), crlfDelay: Infinity });
    for await (const line of lines) {
        let obj;
        try {
            obj = JSON.parse(line);
        }
        catch {
            continue;
        }
        if (obj?.type !== "assistant")
            continue;
        const model = obj.message?.model;
        const usage = obj.message?.usage;
        if (!model || !usage)
            continue;
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
function ledgerIdentity() {
    try {
        const f = JSON.parse(readFileSync(new URL("../ledger-identity.json", import.meta.url), "utf8"));
        if (!Array.isArray(f.allowed) || f.allowed.length === 0)
            return null;
        if (f.allowed.some((a) => !a?.sysid || !a?.dboid || !a?.dbname))
            return null;
        // The holding's own identity must be recorded too. Without it Wall 1 cannot
        // fire, and a hand-edited file that dropped `company` while listing it under
        // `allowed` would buy a write — the allow list is the wall, but the deny
        // wall behind it may not simply be absent.
        const c = f.company;
        if (!c?.sysid || !c?.dboid || !c?.dbname)
            return null;
        return f;
    }
    catch {
        return null;
    }
}
/** Same cluster AND (same database oid OR same database name). */
const isSame = (a, b) => !!a && !!b && a.sysid === b.sysid && (a.dboid === b.dboid || a.dbname === b.dbname);
/**
 * Who answered — asked of the server on the handle given, so the answer belongs
 * to that connection and not to some other one from the same pool.
 */
async function whoIsThis(run) {
    const { sql } = await import("kysely");
    const r = await sql `
    select (select system_identifier::text from pg_control_system()) sysid,
           (select oid::text from pg_database where datname = current_database()) dboid,
           current_database() dbname,
           (select array_agg(oid::text || ':' || datname) from pg_database) datmap`.execute(run);
    return r.rows[0];
}
/** The three walls. Returns the reason to refuse, or null to proceed. */
function refusalFor(here, ledger) {
    if (!here?.sysid)
        return "the server would not name its cluster (pg_control_system denied) — refusing to write";
    // WALL 1 — never the holding, even if someone put it on the allow list.
    if (isSame(here, ledger.company))
        return (`DXB_CONSTRUCTION_DATABASE_URL reaches the company database ` +
            `(cluster ${here.sysid}, database ${here.dbname}) — refusing to write`);
    // WALL 2 — the recorded company must still exist as recorded. On the holding's
    // own cluster, a database carrying its name under a DIFFERENT oid means it was
    // rebuilt and Wall 1 is now aiming at something that is gone. The hook says so
    // and stops, instead of trusting a stale record — this is the fail-open a
    // third audit found, closed where it happens rather than where it is noticed.
    const c = ledger.company;
    const namedHere = c
        ? (here.datmap ?? []).find((d) => d.slice(d.indexOf(":") + 1) === c.dbname)
        : undefined;
    if (c && here.sysid === c.sysid && namedHere && namedHere.slice(0, namedHere.indexOf(":")) !== c.dboid)
        return (`the recorded identity of the company is stale — a database named '${c.dbname}' exists on ` +
            `this cluster under a different oid. Refusing to write until ` +
            `scripts/b36/ledger-identity.mjs --set-company is re-run.`);
    // WALL 3 — and it must be one of the databases this hook was told it may
    // write to. Anything not on that list is refused, whatever it is.
    if (!ledger.allowed.some((a) => isSame(here, a)))
        return (`${here.dbname} (cluster ${here.sysid}, oid ${here.dboid}) is not a permitted ` +
            `construction ledger — refusing to write`);
    return null;
}
async function main() {
    const input = JSON.parse(await readStdin());
    const sessionId = input.session_id;
    const transcriptPath = input.transcript_path;
    if (!sessionId || !transcriptPath || !existsSync(transcriptPath))
        return;
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
    if (!constructionUrl)
        return;
    // The guard fails CLOSED. With no allow list there is nothing this hook is
    // permitted to write to, and it writes nothing.
    const ledger = ledgerIdentity();
    if (!ledger) {
        console.error("tag-subscription-call: tools/hooks/ledger-identity.json is missing, unreadable or empty — " +
            "refusing to write (take it with scripts/b36/ledger-identity.mjs)");
        return;
    }
    // A guard that cannot finish never refuses. An address that accepts a
    // connection and never answers used to hang this hook for as long as the
    // socket stayed open; now every leg has a deadline, and the whole hook has one
    // above them all.
    process.env.DXB_DB_CONNECT_TIMEOUT_MS ??= "4000";
    process.env.DXB_DB_STATEMENT_TIMEOUT_MS ??= "8000";
    process.env.DXB_DATABASE_URL = constructionUrl;
    const shared = await import("@dxb/shared");
    closeDb = shared.closeDb;
    const db = shared.getDb();
    const { sql } = await import("kysely");
    // FIRST ANSWER — cheap, and it refuses before a transaction is even opened.
    let here;
    try {
        here = await whoIsThis(db);
    }
    catch (e) {
        console.error(`tag-subscription-call: could not ask the database who it is — refusing to write (${String(e).slice(0, 120)})`);
        return;
    }
    const refusal = refusalFor(here, ledger);
    if (refusal) {
        console.error(`tag-subscription-call: ${refusal}`);
        return;
    }
    const perModel = await sumTranscript(transcriptPath);
    if (perModel.size === 0)
        return;
    const department = process.env.DXB_DEPARTMENT ?? "engineering";
    const taskId = process.env.DXB_TASK_ID ?? null;
    // THE BINDING ANSWER — and the only one that can be trusted. A pool hands out
    // a NEW connection for each statement, and one address can resolve to more
    // than one server (`localhost` alone is 127.0.0.1 and ::1). A check made on
    // one connection therefore says nothing about where the next statement lands.
    //
    // So the write happens inside a transaction, which pins ONE connection, and
    // that connection is asked who it is before it is allowed to insert anything.
    // A refusal throws, the transaction rolls back, and nothing was ever sent.
    try {
        await db.transaction().execute(async (trx) => {
            const onThisConnection = await whoIsThis(trx);
            const stop = refusalFor(onThisConnection, ledger);
            if (stop)
                throw new Error(stop);
            // v1 idempotency: one SessionEnd per session wins (resume/clear can fire
            // the hook again with a longer transcript; refining to incremental rows is
            // a recorded follow-up, not silent double-counting)
            const { sql } = await import("kysely");
            const existing = await trx
                .selectFrom("cost_ledger")
                .select("id")
                .where("mode", "=", "subscription")
                .where(sql `meta->>'session_id' = ${sessionId}`)
                .executeTakeFirst();
            if (existing)
                return;
            await trx
                .insertInto("cost_ledger")
                .values([...perModel.entries()].map(([model, totals]) => ({
                task_id: taskId,
                department,
                model,
                mode: "subscription",
                prompt_tokens: totals.prompt,
                completion_tokens: totals.completion,
                cost_eur: 0,
                source: "hook",
                meta: JSON.stringify({ session_id: sessionId }),
            })))
                .execute();
        });
    }
    catch (e) {
        console.error(`tag-subscription-call: ${String(e instanceof Error ? e.message : e).slice(0, 200)}`);
    }
}
// Nothing this hook does may hold a session open. Above every per-leg deadline
// there is one for the whole run: it fires, says so, and lets the session end.
const watchdog = setTimeout(() => {
    console.error("tag-subscription-call: took too long — giving up without writing");
    process.exit(0);
}, 20_000);
try {
    await main();
}
catch (e) {
    // never block session teardown — report and exit clean
    console.error(`tag-subscription-call: ${String(e).slice(0, 300)}`);
}
finally {
    clearTimeout(watchdog);
    await closer()?.().catch(() => { });
}
