import { execFile } from "node:child_process";
import { mkdtempSync, renameSync, rmSync, writeFileSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, createListenClient, getDb } from "@dxb/shared";

// B36 — the SessionEnd hook may never write into the company's ledger.
//
// What it used to do (measured 2026-08-23, complaint C24 reopened): line 66 of
// tools/hooks/src/tag-subscription-call.ts read
//   process.env.DXB_DATABASE_URL ??= "postgresql://…:54322/postgres"
// which is the COMPANY database, so every construction session that ended
// inserted its own token burn into the CEO's cost ledger — 950 '<synthetic>'
// rows, 282 claude-fable-5, 122 claude-opus-5, the newest on 2026-08-22 18:11.
//
// The contract now: the hook writes ONLY where DXB_CONSTRUCTION_DATABASE_URL
// points, writes NOTHING when that is unset, and refuses when that address
// REACHES the holding's own database — decided by asking the server who it is,
// never by reading the address.
//
// WHY THE ADDRESS IS NOT READ ANY MORE. The first guard compared the two URLs as
// text; a second compared them as `server:port/database`. An independent audit
// broke the first, and the six cases below broke the second — every one of them
// was run against the live engine on 2026-08-23 and every one CONNECTED TO THE
// COMPANY while the parser called it a different database. They are permanent
// cases now.
//
// This suite drives the COMPILED hook the way Claude Code drives it — stdin
// JSON, a real transcript file — because the compiled file is what runs at
// session end. Nothing here writes to the company: the escape cases all end in a
// refusal, and the only reads of the company are SELECTs (CLAUDE.md §5).

const run = promisify(execFile);

const HOOK = join(process.cwd(), "tools/hooks/dist/tag-subscription-call.js");
const CONSTRUCTION_URL = "postgresql://postgres:postgres@127.0.0.1:54322/dxb_test";
const FINGERPRINT = join(process.cwd(), "tools/hooks/company-fingerprint.json");

// The holding's own database. It appears here as the ATTACK, never as a
// fallback: no line in this file binds it to DXB_DATABASE_URL, and every case
// that hands it to the hook asserts a refusal.
const COMPANY_URL = "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

// Six spellings of that one database. Each was measured connecting to it.
const ESCAPES: [string, string][] = [
  // the driver obeys ?host=, the URL parser reads the authority
  ["a host= query parameter", "postgresql://postgres:postgres@example.invalid:54322/postgres?host=127.0.0.1"],
  // libpq falls back to the USER name for the database, and the user is postgres
  ["no database in the path", "postgresql://postgres:postgres@127.0.0.1:54322"],
  ["a short IPv4", "postgresql://postgres:postgres@127.1:54322/postgres"],
  ["an IPv4 written as one number", "postgresql://postgres:postgres@2130706433:54322/postgres"],
  ["a hostname with a trailing dot", "postgresql://postgres:postgres@localhost.:54322/postgres"],
  ["another address on the same loopback", "postgresql://postgres:postgres@127.0.0.2:54322/postgres"],
];

const MODEL = "b36t-model";
const db = () => getDb();

let tmp: string;
let transcript: string;

function hookEnv(extra: Record<string, string | undefined>): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env };
  delete env.DXB_DATABASE_URL;
  delete env.DXB_CONSTRUCTION_DATABASE_URL;
  for (const [k, v] of Object.entries(extra)) {
    if (v === undefined) delete env[k];
    else env[k] = v;
  }
  return env;
}

async function fireHook(sessionId: string, env: NodeJS.ProcessEnv): Promise<string> {
  const child = run("node", [HOOK], { env });
  child.child.stdin?.end(JSON.stringify({ session_id: sessionId, transcript_path: transcript }));
  const { stderr } = await child;
  return stderr;
}

async function rowsForSession(sessionId: string): Promise<number> {
  const r = await db()
    .selectFrom("cost_ledger")
    .select(db().fn.countAll<string>().as("n"))
    .where(sql<boolean>`meta->>'session_id' = ${sessionId}`)
    .executeTakeFirstOrThrow();
  return Number(r.n);
}

/**
 * A SELECT against the holding's own database, on the one access path this
 * repository allows (packages/shared/src/db.ts). Used to prove that a refused
 * write really did not land — the count is the only thing that can say so.
 */
async function readCompany<T>(query: string): Promise<T> {
  const saved = process.env.DXB_DATABASE_URL;
  process.env.DXB_DATABASE_URL = COMPANY_URL;
  const client = await createListenClient();
  try {
    const r = (await client.query(query)) as { rows: T[] };
    return r.rows[0];
  } finally {
    await client.end();
    if (saved === undefined) delete process.env.DXB_DATABASE_URL;
    else process.env.DXB_DATABASE_URL = saved;
  }
}

const companyRowsFor = async (model: string): Promise<number> =>
  Number(
    (await readCompany<{ n: string }>(`select count(*) n from cost_ledger where model = '${model}'`))
      .n,
  );

beforeAll(() => {
  tmp = mkdtempSync(join(tmpdir(), "b36-"));
  transcript = join(tmp, "transcript.jsonl");
  writeFileSync(
    transcript,
    JSON.stringify({
      type: "assistant",
      message: { model: MODEL, usage: { input_tokens: 11, output_tokens: 7 } },
    }) + "\n",
  );
});

afterAll(async () => {
  await db().deleteFrom("cost_ledger").where("model", "=", MODEL).execute();
  await closeDb();
  rmSync(tmp, { recursive: true, force: true });
});

describe("B36 — the SessionEnd hook and the company ledger", () => {
  it("writes NOTHING when no construction ledger address is set", async () => {
    const sessionId = randomUUID();
    // DXB_DATABASE_URL is pinned to dxb_test so the pre-fix `??=` fallback had a
    // reachable target: before the fix this case wrote a row and went red here.
    await fireHook(sessionId, hookEnv({ DXB_DATABASE_URL: CONSTRUCTION_URL }));
    expect(await rowsForSession(sessionId)).toBe(0);
  });

  it("writes into the construction ledger when that address IS set", async () => {
    const sessionId = randomUUID();
    await fireHook(sessionId, hookEnv({ DXB_CONSTRUCTION_DATABASE_URL: CONSTRUCTION_URL }));
    expect(await rowsForSession(sessionId)).toBe(1);
  });

  it("refuses when the construction address IS the company address", async () => {
    const before = await companyRowsFor(MODEL);
    const stderr = await fireHook(
      randomUUID(),
      hookEnv({ DXB_CONSTRUCTION_DATABASE_URL: COMPANY_URL }),
    );
    expect(stderr).toContain("reaches the company database");
    expect(await companyRowsFor(MODEL)).toBe(before);
  });

  // The audit's own attack, and the five more it opened the door to.
  it.each(ESCAPES)("refuses the company reached through %s", async (_name, url) => {
    const before = await companyRowsFor(MODEL);
    const stderr = await fireHook(randomUUID(), hookEnv({ DXB_CONSTRUCTION_DATABASE_URL: url }));
    expect(stderr, `this spelling was not refused: ${_name}`).toContain(
      "reaches the company database",
    );
    // The decisive line: the holding's ledger did not grow by one.
    expect(await companyRowsFor(MODEL)).toBe(before);
  });

  it("refuses when the address cannot be read at all", async () => {
    const stderr = await fireHook(
      randomUUID(),
      hookEnv({ DXB_CONSTRUCTION_DATABASE_URL: "this-is-not-an-address" }),
    );
    expect(stderr).toContain("refusing to write");
  });

  // The guard fails CLOSED. Without the recorded identity it has nothing to
  // compare against, and a hook that cannot prove where it is writing must not
  // write — not even somewhere harmless.
  it("refuses when the company's recorded identity is missing", async () => {
    const sessionId = randomUUID();
    const parked = `${FINGERPRINT}.parked`;
    renameSync(FINGERPRINT, parked);
    try {
      const stderr = await fireHook(
        sessionId,
        hookEnv({ DXB_CONSTRUCTION_DATABASE_URL: CONSTRUCTION_URL }),
      );
      expect(stderr).toContain("refusing to write");
      expect(await rowsForSession(sessionId)).toBe(0);
    } finally {
      renameSync(parked, FINGERPRINT);
    }
  });

  // A fingerprint that no longer names the live company is a guard aiming at a
  // database that does not exist. Recreating the stack (a new cluster, or
  // `supabase db reset`) must fail the battery, not silently open the door.
  it("still recognises the live company from its recorded identity", async () => {
    const saved = JSON.parse(readFileSync(FINGERPRINT, "utf8")) as Record<string, string>;
    const live = await readCompany<{ sysid: string; dboid: string; dbname: string }>(
      `select (select system_identifier::text from pg_control_system()) sysid,
              (select oid::text from pg_database where datname = current_database()) dboid,
              current_database() dbname`,
    );
    expect(
      { sysid: saved.sysid, dboid: saved.dboid, dbname: saved.dbname },
      "tools/hooks/company-fingerprint.json no longer names the live company — " +
        "re-take it with scripts/b36/company-fingerprint.mjs",
    ).toEqual(live);
  });

  it("still writes when the two addresses really are different databases", async () => {
    const sessionId = randomUUID();
    await fireHook(
      sessionId,
      hookEnv({ DXB_DATABASE_URL: COMPANY_URL, DXB_CONSTRUCTION_DATABASE_URL: CONSTRUCTION_URL }),
    );
    expect(await rowsForSession(sessionId)).toBe(1);
  });

  // B21 taught this repository that a battery can be green because it is testing
  // an older build than its own source. The hook is the one file where that would
  // be dangerous rather than merely wrong: `.claude/settings.json` runs the BUILT
  // file, and `dist/` is not in the repository (.gitignore:30).
  //
  // CORRECTED 2026-08-23 by the same audit: the first version of this case
  // compared MODIFICATION TIMES, and `touch dist/tag-subscription-call.js` makes
  // yesterday's build look newer than today's source. It now compares CONTENT —
  // the source is compiled here, in the test, and the built file must be that
  // compilation byte for byte. Measured: tsc --build and transpileModule emit
  // identical bytes for this file (6,631 of them).
  it("is built from the source that is on disk right now — byte for byte", async () => {
    const ts = (await import("typescript")).default;
    const srcPath = join(process.cwd(), "tools/hooks/src/tag-subscription-call.ts");
    const src = readFileSync(srcPath, "utf8");
    const built = readFileSync(HOOK, "utf8");
    const base = JSON.parse(readFileSync(join(process.cwd(), "tsconfig.base.json"), "utf8")) as {
      compilerOptions: { target: string };
    };
    const compiled = ts.transpileModule(src, {
      // `module: NodeNext` in the real build resolves to ESM emit here, because
      // tools/hooks/package.json says "type": "module".
      compilerOptions: {
        target: ts.ScriptTarget[base.compilerOptions.target as "ES2022"],
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
        esModuleInterop: true,
      },
      fileName: "tag-subscription-call.ts",
    }).outputText;
    expect(
      built,
      `tools/hooks/dist is not what tools/hooks/src compiles to — run \`pnpm typecheck\`. ` +
        `Built ${statSync(HOOK).size} bytes, source compiles to ${compiled.length}.`,
    ).toBe(compiled);
  });

  it("carries no company-database fallback in its source or its build", async () => {
    for (const f of [
      "tools/hooks/src/tag-subscription-call.ts",
      "tools/hooks/dist/tag-subscription-call.js",
    ]) {
      const text = readFileSync(join(process.cwd(), f), "utf8");
      // The address may appear inside the comment that records what it used to
      // do; it may never appear as a value assigned to the connection variable.
      const assigned = text
        .split("\n")
        .filter((l) => !l.trimStart().startsWith("//") && !l.trimStart().startsWith("*"))
        .some((l) => l.includes("54322/postgres"));
      expect(assigned, `${f} still assigns the company database`).toBe(false);
    }
  });
});
