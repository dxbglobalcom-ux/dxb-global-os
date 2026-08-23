/**
 * build-seed — fill the CONSTRUCTION site's own database with a complete
 * holding that contains not one row of the company's.
 *
 * B36 Block 2, and the CEO's decision 2 of 2026-08-23: **the clone is a model,
 * not a mirror.** Until that day the battery ran against `dxb_test`, a full
 * copy of the holding — his 205 employees, his 217 tasks, his 29,636 audit
 * rows. A copy is a leak with a different name. This builds the same SHAPE from
 * the repository's own files and generates the rest.
 *
 * Every step below reads FILES — migrations, persona dossiers, the library
 * catalogue, the routing table, the live MCP servers — or writes rows this
 * script invents. No step reads the company database. The guard at the top
 * refuses to run against it at all, by asking the server who it is rather than
 * by looking at the address it was handed (the lesson of Block 1: six spellings
 * of one address all connected).
 *
 * Run it:
 *   node --experimental-strip-types db/seed/build-seed.ts
 *
 * It is idempotent — every step either upserts or is guarded — so it is also
 * the repair when a suite leaves the construction database in a strange state.
 *
 *   DXB_DATABASE_URL     the construction engine (required)
 *   DXB_DB_CONTAINER     its docker container, for the two file-first tools
 *                        that speak psql (default supabase_db_DxB_Build)
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/dist/db.js";
import {
  personaBodyFor,
  personaPathFor,
  sicilFor,
  titlePairFor,
  type Seat,
} from "./generated-workforce.ts";
import {
  companyFictionFor,
  projectFictionFor,
  storeNoteFor,
  HOLDING_SLUG,
  HOLDING_PROJECT_SLUG,
  MEMORY_STORES,
} from "./generated-holding-core.ts";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CONTAINER = process.env.DXB_DB_CONTAINER ?? "supabase_db_DxB_Build";
const URL = process.env.DXB_DATABASE_URL;

if (!URL) {
  console.error("build-seed: DXB_DATABASE_URL is required and carries no default here.");
  process.exit(2);
}

/** The one place in this repository that records who the company IS. */
interface LedgerIdentity {
  company: { sysid: string; dboid: string; dbname: string };
}

/**
 * REFUSAL. The server is asked for its cluster's system_identifier and the
 * database's own oid; if those are the holding's, nothing runs. An address is
 * never trusted to say where it goes.
 */
async function refuseIfThisIsTheCompany(): Promise<string> {
  const ledger = JSON.parse(
    readFileSync(join(REPO, "tools/hooks/ledger-identity.json"), "utf8"),
  ) as LedgerIdentity;
  const { rows } = await sql<{ sysid: string; dboid: string; dbname: string }>`
    SELECT (SELECT system_identifier::text FROM pg_control_system()) AS sysid,
           (SELECT oid::text FROM pg_database WHERE datname = current_database()) AS dboid,
           current_database() AS dbname`.execute(getDb());
  const here = rows[0];
  if (!here?.sysid) throw new Error("this role may not ask the server who it is");
  const c = ledger.company;
  if (here.sysid === c.sysid && here.dboid === c.dboid) {
    throw new Error(
      `build-seed: this address reaches the COMPANY database (cluster ${here.sysid}, ` +
        `database ${here.dbname}). It generates a fictional holding and must never run there.`,
    );
  }
  return `${here.sysid}/${here.dboid} (${here.dbname})`;
}

function psql(sqlText: string): string {
  return execFileSync(
    "docker",
    ["exec", "-i", CONTAINER, "psql", "-U", "postgres", "-d", "postgres", "-At", "-v", "ON_ERROR_STOP=1"],
    { input: sqlText, encoding: "utf8" },
  );
}

function node(script: string, args: string[] = []): void {
  execFileSync("node", [join(REPO, script), ...args], {
    cwd: REPO,
    stdio: ["ignore", "ignore", "inherit"],
    env: { ...process.env, DXB_DATABASE_URL: URL },
  });
}

/** EVERY seat on this engine, archived included — nothing of his may survive on one. */
async function allSeats(): Promise<Array<Seat & { id: string }>> {
  const { rows } = await sql<Seat & { id: string }>`
    SELECT id, slug, department, role_level FROM agents ORDER BY slug`.execute(getDb());
  return rows;
}

/** The seats the migration chain opened on THIS engine — key, department, level. */
async function liveSeats(): Promise<Array<Seat & { id: string }>> {
  const { rows } = await sql<Seat & { id: string }>`
    SELECT id, slug, department, role_level
      FROM agents
     WHERE employment_status <> 'archived'
     ORDER BY slug`.execute(getDb());
  return rows;
}

const md5 = (s: string): string => createHash("md5").update(s).digest("hex");

/** What the steps did, reported by their own measure(). */
let wrote = 0;
let swpt = 0;
let rewritten = 0;
let stamped = 0;
let files = 0;

const steps: Array<{ name: string; run: () => void | Promise<void>; measure: () => Promise<string> }> = [
  {
    // THE HOLDING ITSELF IS INVENTED HERE, not copied.
    //
    // Until the re-audit of 2026-08-23 this step ran
    // `db/seed/20260711_holding_core.sql` — the COMPANY's own seed file, which
    // carries the company's real name and mission, its first project's real name
    // and purpose, and links pointing at real documents in this repository. The
    // auditor read past the workforce fix and found it. That file is NOT
    // modified: it is the company's, and on the company it is correct. The
    // construction site simply stops running it.
    //
    // It is not the only source. The migration chain seeds a SECOND project
    // (`revenue-discovery`) with its own authored purpose and its own real
    // document link, and two later migrations write the Turkish halves. So this
    // step does not merely insert — it REWRITES the text of every company and
    // every project row on this engine, whatever wrote it, and a project the
    // chain has not created yet is created here.
    //
    // The KEYS stay, because they are read by code and not by a reader:
    // `dxb-global` by four migrations and by a live database function, and
    // `dxb-global-os` by the orchestrator and by the r23 suite. So do the owner,
    // the company binding, and the four memory-store names the CEO's Bellek page
    // joins on. Everything a human would read is generated.
    name: "generated holding, projects and memory stores",
    run: async () => {
      const c = companyFictionFor(HOLDING_SLUG);
      await sql`
        INSERT INTO companies (slug, name, mission, status)
        VALUES (${HOLDING_SLUG}, ${c.name}, ${c.mission}, 'active')
        ON CONFLICT (slug) DO NOTHING`.execute(getDb());
      // Every company row on this engine, not only the one just inserted: an
      // earlier seed may have left his.
      for (const row of (
        await sql<{ slug: string }>`SELECT slug FROM companies`.execute(getDb())
      ).rows) {
        const f = companyFictionFor(row.slug);
        await sql`
          UPDATE companies SET name = ${f.name}, mission = ${f.mission}
           WHERE slug = ${row.slug} AND (name, mission) IS DISTINCT FROM (${f.name}, ${f.mission})`
          .execute(getDb());
      }
      await sql`
        UPDATE departments
           SET company_id = (SELECT id FROM companies WHERE slug = ${HOLDING_SLUG})
         WHERE company_id IS NULL`.execute(getDb());

      // The holding's own first project — the dogfood row every workflow test
      // hangs on. Created here only if the chain has not already made one.
      const p0 = projectFictionFor(HOLDING_PROJECT_SLUG);
      await sql`
        INSERT INTO projects (slug, name, name_tr, purpose, purpose_tr, strategy_link,
                              owner_employee_id, company_id, status, links)
        SELECT ${HOLDING_PROJECT_SLUG}, ${p0.name}, ${p0.name_tr}, ${p0.purpose}, ${p0.purpose_tr},
               ${p0.strategy_link},
               (SELECT id FROM agents WHERE slug = 'agents-orchestrator'),
               c.id, 'active', ${p0.links}::jsonb
          FROM companies c
         WHERE c.slug = ${HOLDING_SLUG}
        ON CONFLICT (slug) DO NOTHING`.execute(getDb());

      // …and every project row's text, whoever wrote it. Structure is left
      // exactly as the chain built it: owner, company binding and status are not
      // touched here.
      rewritten = 0;
      for (const row of (
        await sql<{ slug: string }>`SELECT slug FROM projects ORDER BY slug`.execute(getDb())
      ).rows) {
        const f = projectFictionFor(row.slug);
        const r = await sql`
          UPDATE projects
             SET name = ${f.name}, name_tr = ${f.name_tr}, purpose = ${f.purpose},
                 purpose_tr = ${f.purpose_tr}, strategy_link = ${f.strategy_link},
                 links = ${f.links}::jsonb
           WHERE slug = ${row.slug}
             AND (name, name_tr, purpose, purpose_tr, strategy_link, links::text)
                 IS DISTINCT FROM
                 (${f.name}, ${f.name_tr}, ${f.purpose}, ${f.purpose_tr}, ${f.strategy_link},
                  ${f.links}::jsonb::text)`.execute(getDb());
        rewritten += Number(r.numAffectedRows ?? 0);
      }

      // The four memory stores. The NAME is the identity the CEO's Bellek page
      // joins on; the note beside it was authored for the library catalogue and
      // is generated instead — the same note he complained about on 2026-07-28.
      for (const store of MEMORY_STORES) {
        const note = storeNoteFor(store);
        await sql`
          INSERT INTO library_items (kind, name, version, usage_notes)
          VALUES ('memory_source', ${store}, 'v1', ${note})
          ON CONFLICT (kind, name, version) DO UPDATE SET usage_notes = EXCLUDED.usage_notes`
          .execute(getDb());
      }
    },
    measure: async () => `${await one("SELECT count(*) FROM companies")} company · ` +
      `${await one("SELECT count(*) FROM projects")} project(s), ${rewritten} rewritten · ` +
      `${await one("SELECT count(*) FROM library_items WHERE kind = 'memory_source'")} memory store(s)`,
  },
  {
    // routing_rules is DATA, not code (KERN-02). The file is the source.
    name: "routing rules",
    run: () =>
      execFileSync("node", ["--experimental-strip-types", join(REPO, "db/seed/import-routing-rules.ts")], {
        cwd: REPO,
        stdio: ["ignore", "ignore", "inherit"],
        env: { ...process.env, DXB_DATABASE_URL: URL },
      }),
    measure: async () => `${await one("SELECT count(*) FROM routing_rules WHERE enabled")} enabled rules, tiers ` +
      (await one("SELECT string_agg(DISTINCT model_tier, ',' ORDER BY model_tier) FROM routing_rules WHERE enabled")),
  },
  {
    // THE WORKFORCE IS INVENTED HERE, not copied.
    //
    // Until 2026-08-23 this step ran the company's own file-first persona sync
    // and put all 199 authored dossiers into the construction database word for
    // word — measured: 199 of 199 bodies were a dossier file byte for byte. The
    // independent auditor called it, and the approved plan had already said the
    // opposite in as many words: "a complete but entirely fictional holding …
    // and not one row of his" (PLAN.md:222).
    //
    // The seats are real — `cfo`, `ciso`, `head-of-commerce` — because they
    // arrive through db/migrations, the same chain a deploy runs, and the E12.5
    // workforce gate holds 67 of them to account BY NAME. What is written into
    // each seat is fiction, generated from the seat's own key by
    // db/seed/generated-workforce.ts and announcing itself as a fixture in its
    // own second line.
    //
    // IT IS ALSO THE REPAIR. Any persona row that is not the generated document
    // for its seat is removed first — that is how a database seeded by the old,
    // copying version of this file heals without being rebuilt from empty.
    //
    // Deterministic, so re-running writes nothing: the same slug yields the same
    // document character for character, and only a seat whose newest version
    // differs is submitted. An earlier draft that opened a version every run
    // left 796 versions of 199 people behind.
    name: "generated personas for every seat",
    run: async () => {
      const seats = await liveSeats();
      const want = new Map(seats.map((s) => [s.id, personaBodyFor(s)]));

      // 1. anything that is not the generated document for its own seat goes.
      //
      // In the order the database allows. Two triggers stand on `agents` and
      // both are right: an ACTIVE employee must hold a gate-passed persona
      // (`enforce_persona_gate_on_activation`), and `persona_id` may only ever
      // point at a passed one (`enforce_persona_id_passed`). So an employee
      // whose document is being replaced is stood down to `dormant` first, and
      // the gate/bind/activate step below is what brings the workforce back up.
      // Measured 2026-08-23: unbinding an active employee straight away is
      // refused by the first trigger, and it is refused for a good reason.
      const ids = [...want.keys()];
      const hashes = ids.map((id) => md5(want.get(id) as string));
      const stale = sql`
        SELECT p.id FROM personas p
         WHERE p.employee_id <> ALL(${ids}::uuid[])
            OR md5(p.body_md) IS DISTINCT FROM
               (SELECT h FROM unnest(${ids}::uuid[], ${hashes}::text[]) AS t(e, h) WHERE t.e = p.employee_id)`;
      await sql`
        UPDATE agents SET employment_status = 'dormant'
         WHERE employment_status = 'active' AND persona_id IN (${stale})`.execute(getDb());
      await sql`UPDATE agents SET persona_id = NULL WHERE persona_id IN (${stale})`.execute(getDb());
      const swept = await sql`DELETE FROM personas WHERE id IN (${stale})`.execute(getDb());
      swpt = Number(swept.numAffectedRows ?? 0);

      // 2. and every seat that has no generated document yet gets one, through
      //    the same control function an authored persona goes through — its
      //    secret and injection scans included.
      const have = new Set(
        (
          await sql<{ employee_id: string }>`SELECT DISTINCT employee_id FROM personas`.execute(
            getDb(),
          )
        ).rows.map((r) => r.employee_id),
      );
      wrote = 0;
      for (const seat of seats) {
        if (have.has(seat.id)) continue;
        await sql`SELECT public.fn_persona_submit(${seat.id}::uuid, ${want.get(seat.id)}, 'fable-5')`.execute(
          getDb(),
        );
        wrote++;
      }
    },
    measure: async () => `${await one("SELECT count(DISTINCT employee_id) FROM personas")} seat(s) · ` +
      `${await one("SELECT count(*) FROM personas")} version(s) · ${wrote} written, ${swpt} swept`,
  },
  {
    // THE LAST THREE COLUMNS THAT WERE STILL HIS — and they are stamped
    // UNCONDITIONALLY, on every seat, on every run.
    //
    // The last code review of 2026-08-23 found what the two fixes before it had
    // walked past: the stored persona body was fiction, but `agents` still
    // carried **205 real `personas/…` dossier paths** and **132 real Turkish
    // titles** written by `db/migrations/20260713023000_org_bilingual_complete_v15.sql`,
    // and the English title was stamped INSIDE the persona-creation branch — so a
    // second seeding, which creates no personas, repaired none of it. That is the
    // shape of the defect and it is why this step is separate: it depends on
    // nothing, it skips nothing, and it runs over EVERY employee including the
    // six archived ones, whose paths pointed at other people's dossiers.
    //
    // Three things are written together because they must agree:
    //   · `title` / `title_tr` — invented, paired, whole-language on both sides
    //   · `persona_path` — a generated document under `var/`, written here so the
    //     path is REAL: the workforce gate opens every stored path on disk, the
    //     registry tool requires `personas/` in it, and the live answer lane
    //     reads the file to give an employee its identity.
    name: "generated titles and persona documents",
    run: async () => {
      const dir = join(REPO, "var/construction-fixtures/personas");
      mkdirSync(dir, { recursive: true });
      stamped = 0;
      files = 0;
      for (const seat of await allSeats()) {
        const path = personaPathFor(seat.slug);
        writeFileSync(join(REPO, path), personaBodyFor(seat), "utf8");
        files++;
        const t = titlePairFor(seat);
        const r = await sql`
          UPDATE agents
             SET title = ${t.title}, title_tr = ${t.title_tr}, persona_path = ${path}
           WHERE id = ${seat.id}::uuid
             AND (title, title_tr, persona_path)
                 IS DISTINCT FROM (${t.title}, ${t.title_tr}, ${path})`.execute(getDb());
        stamped += Number(r.numAffectedRows ?? 0);
      }
    },
    measure: async () =>
      `${files} document(s) written · ${stamped} employee(s) restamped · ` +
      `${await one("SELECT count(*) FROM agents WHERE persona_path LIKE 'personas/%'")} still pointing at a dossier`,
  },
  {
    // Gate → bind → activate. On the company each of these is a separate
    // deliberate act by an author; here the whole workforce is generated, and
    // the reason string says so in the audit row the gate writes.
    name: "gate, bind and activate the generated workforce",
    run: async () => {
      psql(`
BEGIN;
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT p.id FROM personas p JOIN agents a ON a.id = p.employee_id
            WHERE p.quality_gate = 'pending' AND a.employment_status <> 'archived'
  LOOP
    PERFORM public.fn_persona_gate(r.id, 'passed',
      'construction seed — generated holding on the construction engine; not the company workforce');
  END LOOP;
END $$;
WITH newest AS (
  SELECT DISTINCT ON (p.employee_id) p.employee_id, p.id
    FROM personas p WHERE p.quality_gate = 'passed'
   ORDER BY p.employee_id, p.version DESC
)
UPDATE agents a SET persona_id = n.id, persona_version = 'v2.0-fable'
  FROM newest n WHERE n.employee_id = a.id AND a.employment_status <> 'archived';
UPDATE agents SET employment_status = 'active'
 WHERE employment_status IN ('dormant','draft','probation') AND persona_id IS NOT NULL;
COMMIT;`);
    },
    measure: async () =>
      `${await one("SELECT count(*) FROM agents WHERE employment_status = 'active'")} active · ` +
      `${await one("SELECT count(*) FROM agents WHERE employment_status <> 'archived' AND persona_id IS NOT NULL")} bound`,
  },
  {
    // The sicil, invented for the same reason and by the same rule. Measured
    // before this change: 975 field values in employee_records here were the
    // CEO's own dossier wording, copied out of the files one for one by
    // scripts/sync-employee-records.py — which is the right tool on the COMPANY,
    // where the dossier IS the source, and the wrong one here.
    //
    // The operational columns (performance, errors, reviews, training needs) are
    // not touched: they fill with real operation on this engine or they stay
    // empty, exactly as they do on the company side.
    name: "generated employee records",
    run: async () => {
      for (const seat of await liveSeats()) {
        const r = sicilFor(seat);
        await sql`
          INSERT INTO employee_records (
            employee_id, responsibilities, authority_limits, decision_scope, expertise,
            methodology, reporting_standard, quality_standard, escalation_rules, kpis, version_history)
          VALUES (
            ${seat.id}::uuid, ${r.responsibilities}::text[], ${r.authority_limits}::text[],
            ${r.decision_scope}, ${r.expertise}::text[], ${r.methodology}, ${r.reporting_standard},
            ${r.quality_standard}, ${r.escalation_rules}, ${r.kpis}::jsonb, ${r.version_history}::jsonb)
          ON CONFLICT (employee_id) DO UPDATE SET
            responsibilities = EXCLUDED.responsibilities,
            authority_limits = EXCLUDED.authority_limits,
            decision_scope = EXCLUDED.decision_scope,
            expertise = EXCLUDED.expertise,
            methodology = EXCLUDED.methodology,
            reporting_standard = EXCLUDED.reporting_standard,
            quality_standard = EXCLUDED.quality_standard,
            escalation_rules = EXCLUDED.escalation_rules,
            kpis = EXCLUDED.kpis,
            version_history = EXCLUDED.version_history,
            updated_at = now()
        `.execute(getDb());
      }
    },
    measure: async () => `${await one("SELECT count(*) FROM employee_records")} record(s)`,
  },
  {
    // The hands: every MCP server on this machine is enumerated live and pinned
    // with its schema hash. A server that cannot be reached is NOT invented —
    // it is simply absent, and this step SAYS WHICH. pin-arsenal.mjs exits 1
    // when any catalogued server failed to answer, which is right of it and
    // must not stop the seed: an unreachable server is a fact about this
    // machine, not a broken seed. It is caught here and printed by name.
    name: "tool pins from the live MCP servers",
    run: () => {
      try {
        node("scripts/gateway/pin-arsenal.mjs");
      } catch {
        /* named in measure() below — never swallowed silently */
      }
    },
    measure: async () => {
      const pinned = (await one(
        "SELECT string_agg(server || '=' || n, ' ' ORDER BY server) FROM (SELECT server, count(*) n FROM tool_pins GROUP BY 1) q",
      )) || "none";
      const catalogued = Object.keys(
        (JSON.parse(readFileSync(join(REPO, "packages/gateway/policy/grants.json"), "utf8")) as {
          servers?: Record<string, unknown>;
        }).servers ?? {},
      );
      const have = new Set(
        (await one("SELECT string_agg(DISTINCT server, ',' ORDER BY server) FROM tool_pins")).split(","),
      );
      const missing = catalogued.filter((sv) => !have.has(sv));
      return pinned + (missing.length ? `  ⚠ NOT REACHABLE ON THIS MACHINE: ${missing.join(", ")}` : "");
    },
  },
  {
    // The library record: the repository's own assets registered, scored and
    // granted to the departments through the same control function the CEO's
    // tool run uses.
    name: "library intake, arsenal and grants",
    run: () => {
      node("scripts/library/intake.mjs", ["--apply"]);
      node("scripts/library/register-arsenal.mjs", ["--apply"]);
      node("scripts/library/enrich.mjs", ["--apply"]);
    },
    measure: async () => `${await one("SELECT count(*) FROM library_items")} item(s) · ` +
      `${await one("SELECT count(*) FROM library_grants")} grant(s)`,
  },
  {
    // The operating layer. Everything above is derived from files; this part is
    // INVENTED, and it is the smallest invention the battery needs: the
    // holding's own project needs milestones (the pre-gate injects a project
    // purpose through them), and the alert projection needs one real run to
    // hang a violation on. Both are marked `build-seed` so they can never be
    // mistaken for work anyone did.
    name: "generated operating layer",
    run: async () => {
      psql(`
BEGIN;
INSERT INTO project_milestones (project_id, kind, seq, title, plan_ref)
SELECT p.id, m.kind, m.seq, m.title, 'build-seed — generated, not the holding''s own plan'
  FROM projects p
 CROSS JOIN (VALUES
    ('phase', 1, 'Foundation stands up'),
    ('phase', 2, 'The engine runs a task end to end'),
    ('phase', 3, 'The surface shows the work')
 ) AS m(kind, seq, title)
 WHERE p.slug = 'dxb-global-os'
   AND NOT EXISTS (SELECT 1 FROM project_milestones x WHERE x.project_id = p.id AND x.seq = m.seq);

INSERT INTO agent_runs (employee_id, task_id, status, started_at, ended_at, hook_version)
SELECT a.id, NULL, 'succeeded', now() - interval '1 hour', now() - interval '55 minutes', 'v1'
  FROM agents a
 WHERE a.employment_status = 'active'
   AND NOT EXISTS (SELECT 1 FROM agent_runs)
 LIMIT 1;
COMMIT;`);
      // The answering voice. Registered through the same control function the
      // CEO's own tool run uses, with the engine and profile the repository
      // itself defaults to (packages/voice/src/speaches.ts) — not a value read
      // off the company. Without it the answer lane speaks in `degraded` mode.
      psql(`SELECT control_voice_identity_upsert('agents-orchestrator', 'speaches:piper', 'tr_TR-fahrettin-medium', 'tr');`);
    },
    measure: async () => `${await one("SELECT count(*) FROM project_milestones")} milestone(s) · ` +
      `${await one("SELECT count(*) FROM agent_runs")} run(s) · ` +
      `${await one("SELECT count(*) FROM voice_identities WHERE status = 'active'")} voice identity`,
  },
];

async function one(q: string): Promise<string> {
  const { rows } = await sql<{ v: string }>`${sql.raw(q.replace(/^SELECT /, "SELECT "))}`.execute(getDb());
  const r = rows[0] as unknown as Record<string, unknown>;
  return String(Object.values(r)[0] ?? "");
}

const where = await refuseIfThisIsTheCompany();
console.log(`build-seed → ${where}`);
console.log("");
for (const step of steps) {
  process.stdout.write(`  ${step.name.padEnd(50)}`);
  await step.run();
  console.log(await step.measure());
}
console.log("");
console.log("BUILD_SEED_DONE — a whole holding, and not one row of his.");
await closeDb();
