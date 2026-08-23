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
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/dist/db.js";

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

/** Every persona dossier in the repository, as repo-relative paths. */
function personaFiles(): string[] {
  return execFileSync("bash", ["-c", "ls personas/*/*.md"], { cwd: REPO, encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
}

function psql(sqlText: string): string {
  return execFileSync(
    "docker",
    ["exec", "-i", CONTAINER, "psql", "-U", "postgres", "-d", "postgres", "-At", "-v", "ON_ERROR_STOP=1"],
    { input: sqlText, encoding: "utf8" },
  );
}

function runFile(file: string): void {
  execFileSync(
    "docker",
    ["exec", "-i", CONTAINER, "psql", "-U", "postgres", "-d", "postgres", "-q", "-v", "ON_ERROR_STOP=1"],
    { input: readFileSync(join(REPO, file), "utf8"), encoding: "utf8", stdio: ["pipe", "inherit", "inherit"] },
  );
}

function node(script: string, args: string[] = []): void {
  execFileSync("node", [join(REPO, script), ...args], {
    cwd: REPO,
    stdio: ["ignore", "ignore", "inherit"],
    env: { ...process.env, DXB_DATABASE_URL: URL },
  });
}

const steps: Array<{ name: string; run: () => void | Promise<void>; measure: () => Promise<string> }> = [
  {
    // The holding itself, its departments' company binding, and its own first
    // project — the dogfood row every workflow test hangs on.
    name: "holding core",
    run: () => runFile("db/seed/20260711_holding_core.sql"),
    measure: async () => `${await one("SELECT count(*) FROM companies")} company · ` +
      `${await one("SELECT count(*) FROM projects")} project(s)`,
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
    // personas/<dept>/<slug>.md → personas. The dossiers are in the repository;
    // nothing is read from the company.
    //
    // ASKED FIRST, then written. The sync script's submit mode opens a NEW
    // version every time it is called, which is right when a dossier has really
    // been edited and wrong for a seed that must be re-runnable: four runs of
    // an earlier draft of this file left 796 versions of 199 personas. Its own
    // `--verify` mode compares the file body's md5 with the newest version in
    // the database and prints DIFF for the ones that differ; only those are
    // submitted. A first run submits all 199, a second submits none.
    name: "personas from the dossier files",
    run: () => {
      const env = { ...process.env, DXB_DB_CONTAINER: CONTAINER, DXB_PERSONA_AUTHOR: "fable-5" };
      // `--verify` exits 1 whenever anything differs, which on a FRESH database
      // is every one of the 199 — that is the answer, not a failure. The output
      // is read whatever the exit code says.
      const probe = spawnSync("bash", [join(REPO, "scripts/sync-personas-to-db.sh"), "--verify"], {
        cwd: REPO,
        encoding: "utf8",
        env,
        maxBuffer: 64 * 1024 * 1024,
      });
      if (probe.error) throw probe.error;
      const verify = probe.stdout ?? "";
      const bySlug = new Map<string, string>();
      for (const f of personaFiles()) bySlug.set(f.replace(/^.*\//, "").replace(/\.md$/, ""), f);
      const stale: string[] = [];
      for (const line of verify.split("\n")) {
        const m = /^DIFF\s+(\S+)/.exec(line);
        const file = m && bySlug.get(m[1]);
        if (file) stale.push(file);
      }
      if (stale.length === 0) return;
      execFileSync("bash", [join(REPO, "scripts/sync-personas-to-db.sh"), ...stale], {
        cwd: REPO,
        stdio: ["ignore", "ignore", "inherit"],
        env,
      });
    },
    measure: async () => `${await one("SELECT count(DISTINCT employee_id) FROM personas")} employee(s) · ` +
      `${await one("SELECT count(*) FROM personas")} version(s)`,
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
    // employee_records (the sicil) is copied VERBATIM out of the same dossier
    // files by the repository's own tool, which authors nothing.
    name: "employee records from the dossiers",
    run: () => {
      const generated = execFileSync("python3", [join(REPO, "scripts/sync-employee-records.py")], {
        cwd: REPO,
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
      });
      psql(generated);
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
