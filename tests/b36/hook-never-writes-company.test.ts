import { execFile, execFileSync } from "node:child_process";
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
// The contract now: the hook writes NOTHING when DXB_CONSTRUCTION_DATABASE_URL
// is unset, and otherwise writes ONLY into a database whose IDENTITY is on the
// allow list in tools/hooks/ledger-identity.json — decided by asking the server
// who it is, never by reading the address. Everything else is refused: the
// holding, a rebuilt holding, a database nobody listed, an address that hangs.
//
// WHY THE ADDRESS IS NOT READ ANY MORE. The first guard compared the two URLs as
// text; a second compared them as `server:port/database`. An independent audit
// broke the first, and the six cases below broke the second — every one of them
// was run against the live engine on 2026-08-23 and every one CONNECTED TO THE
// COMPANY while the parser called it a different database. They are permanent
// cases now.
//
// WHY A DENY RULE WAS NOT ENOUGH EITHER. A third audit broke the guard that
// replaced them without touching a line of it: a deny rule only knows what it
// was told to refuse, so a rebuilt company under a new identity walks straight
// past it. The list is now an ALLOW list, and the cases below hold that shape —
// a database nobody listed is refused even though it is not the company.
//
// This suite drives the COMPILED hook the way Claude Code drives it — stdin
// JSON, a real transcript file — because the compiled file is what runs at
// session end. Nothing here writes to the company: the escape cases all end in a
// refusal, and the only reads of the company are SELECTs (CLAUDE.md §5).

import { CONSTRUCTION_DATABASE_URL } from "../construction-engine.js";

const run = promisify(execFile);

const HOOK = join(process.cwd(), "tools/hooks/dist/tag-subscription-call.js");
// B36 Block 2: the construction site's ledger is no longer a database sitting
// INSIDE the company's engine — it is the DxB_Build stack's own database, on its
// own cluster and its own port. Spelled once, in tests/construction-engine.ts.
const CONSTRUCTION_URL = CONSTRUCTION_DATABASE_URL;
const IDENTITY = join(process.cwd(), "tools/hooks/ledger-identity.json");

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
    // DXB_DATABASE_URL is pinned to the construction engine so the pre-fix `??=`
    // fallback had a reachable target: before the fix this case wrote a row and
    // went red here.
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

  // The recorded company must still name the live one. A rebuilt stack (a new
  // cluster, or `supabase db reset`) must fail the battery loudly — and the hook
  // itself refuses while the record is stale, rather than trusting it.
  it("still recognises the live company from its recorded identity", async () => {
    const saved = (JSON.parse(readFileSync(IDENTITY, "utf8")) as { company: Record<string, string> })
      .company;
    const live = await readCompany<{ sysid: string; dboid: string; dbname: string }>(
      `select (select system_identifier::text from pg_control_system()) sysid,
              (select oid::text from pg_database where datname = current_database()) dboid,
              current_database() dbname`,
    );
    expect(
      { sysid: saved.sysid, dboid: saved.dboid, dbname: saved.dbname },
      "tools/hooks/ledger-identity.json no longer names the live company — " +
        "re-take it with `node scripts/b36/ledger-identity.mjs --set-company`",
    ).toEqual(live);
  });

  // THE HOLE THE THIRD AUDIT FOUND. `_supabase` is not the company, and it is
  // not on the allow list. A deny-only guard would have written into it.
  it("refuses a database that is real, harmless and simply not on the list", async () => {
    const sessionId = randomUUID();
    const stderr = await fireHook(
      sessionId,
      hookEnv({
        DXB_CONSTRUCTION_DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:54322/_supabase",
      }),
    );
    expect(stderr).toContain("is not a permitted construction ledger");
    expect(await rowsForSession(sessionId)).toBe(0);
  });

  // THE FAIL-OPEN THE THIRD AUDIT NAMED, written as two cases.
  //
  // Rebuild the holding's database and its identity changes. A deny-only guard
  // then does not recognise it, calls it "some other database", and writes. Here
  // the recorded identity is deliberately made wrong in exactly that way — a
  // different oid AND a different name, which is what a rebuild under another
  // name looks like — and the hook must still refuse, because the holding is not
  // on the list of places it may write.
  it("refuses the company even when the recorded identity no longer matches it", async () => {
    const parked = `${IDENTITY}.parked`;
    const real = readFileSync(IDENTITY, "utf8");
    const stale = JSON.parse(real) as { company: Record<string, string> };
    stale.company = { ...stale.company, dboid: "999999", dbname: "postgres_before_the_rebuild" };
    const before = await companyRowsFor(MODEL);
    renameSync(IDENTITY, parked);
    writeFileSync(IDENTITY, JSON.stringify(stale, null, 2));
    try {
      const stderr = await fireHook(
        randomUUID(),
        hookEnv({ DXB_CONSTRUCTION_DATABASE_URL: COMPANY_URL }),
      );
      expect(stderr).toContain("is not a permitted construction ledger");
      expect(await companyRowsFor(MODEL)).toBe(before);
    } finally {
      rmSync(IDENTITY, { force: true });
      renameSync(parked, IDENTITY);
    }
  });

  // And when the record has gone stale in a way the hook CAN see — the holding's
  // database still carries its recorded name on this cluster but under another
  // oid — it stops and says why, rather than working on beside a wall that is
  // aiming at something that no longer exists.
  //
  // B36 Block 2 narrowed where this is visible AT ALL, and the narrowing is the
  // point of the block: the construction site now lives on its OWN cluster, so a
  // hook standing on it cannot see the company's server and has nothing to say
  // about the freshness of the company's record. It can only see it while it is
  // standing on the company's own cluster — which is what this case does, with
  // `_supabase`, a real database there that is not on the allow list.
  it("stops and says so when the recorded company identity has gone stale", async () => {
    const sessionId = randomUUID();
    const parked = `${IDENTITY}.parked`;
    const stale = JSON.parse(readFileSync(IDENTITY, "utf8")) as { company: Record<string, string> };
    stale.company = { ...stale.company, dboid: "999999" };
    renameSync(IDENTITY, parked);
    writeFileSync(IDENTITY, JSON.stringify(stale, null, 2));
    try {
      const stderr = await fireHook(
        sessionId,
        hookEnv({
          DXB_CONSTRUCTION_DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:54322/_supabase",
        }),
      );
      expect(stderr).toContain("recorded identity of the company is stale");
      expect(await rowsForSession(sessionId)).toBe(0);
    } finally {
      rmSync(IDENTITY, { force: true });
      renameSync(parked, IDENTITY);
    }
  });

  // The wall that does NOT depend on seeing the company at all. With the record
  // stale — the company rebuilt under an identity nobody recorded — the hook is
  // handed the company's real address. Wall 1 cannot recognise it any more,
  // because what it was told the company looks like is wrong. The allow list
  // refuses it regardless: this is why the rule was inverted from deny to allow
  // after the third audit, and it is the case that proves the inversion earns
  // its keep.
  it("refuses the company even when the record describing it is wrong", async () => {
    const sessionId = randomUUID();
    const parked = `${IDENTITY}.parked`;
    const stale = JSON.parse(readFileSync(IDENTITY, "utf8")) as {
      company: Record<string, string>;
      allowed: Array<Record<string, string>>;
    };
    // Not merely a wrong oid — a company on a cluster that does not exist, so
    // Wall 1 and Wall 2 are both blind and only the allow list is left.
    stale.company = { ...stale.company, sysid: "1", dboid: "999999" };
    renameSync(IDENTITY, parked);
    writeFileSync(IDENTITY, JSON.stringify(stale, null, 2));
    try {
      const stderr = await fireHook(sessionId, hookEnv({ DXB_CONSTRUCTION_DATABASE_URL: COMPANY_URL }));
      expect(stderr).toContain("refusing to write");
      expect(await rowsForSession(sessionId)).toBe(0);
    } finally {
      rmSync(IDENTITY, { force: true });
      renameSync(parked, IDENTITY);
    }
  });

  // The guard fails CLOSED. With no allow list it has nothing it is permitted to
  // write to, and it writes nothing — not even somewhere harmless.
  it("refuses when the allow list is missing", async () => {
    const sessionId = randomUUID();
    const parked = `${IDENTITY}.parked`;
    renameSync(IDENTITY, parked);
    try {
      const stderr = await fireHook(
        sessionId,
        hookEnv({ DXB_CONSTRUCTION_DATABASE_URL: CONSTRUCTION_URL }),
      );
      expect(stderr).toContain("refusing to write");
      expect(await rowsForSession(sessionId)).toBe(0);
    } finally {
      renameSync(parked, IDENTITY);
    }
  });

  // An address that accepts the connection and never answers used to hang the
  // hook for as long as the socket stayed open. A guard that cannot finish never
  // refuses.
  it("gives up on an address that answers nothing, instead of hanging", async () => {
    const net = await import("node:net");
    const held: import("node:net").Socket[] = [];
    // Accept, hold, and say nothing at all. The sockets are kept so this case
    // can close them itself — `server.close()` waits for every connection, and
    // an abandoned one would hang the suite instead of the hook.
    const silent = net.createServer((sock) => held.push(sock));
    await new Promise<void>((r) => silent.listen(0, "127.0.0.1", r));
    const port = (silent.address() as { port: number }).port;
    const began = Date.now();
    try {
      const stderr = await fireHook(
        randomUUID(),
        hookEnv({
          DXB_CONSTRUCTION_DATABASE_URL: `postgresql://postgres:postgres@127.0.0.1:${port}/anything`,
        }),
      );
      expect(stderr).toContain("refusing to write");
      expect(Date.now() - began, "the hook did not give up inside its own deadline").toBeLessThan(
        15_000,
      );
    } finally {
      for (const sock of held) sock.destroy();
      await new Promise<void>((r) => silent.close(() => r()));
    }
  }, 30_000);

  it("writes when — and only when — the target is on the allow list", async () => {
    const sessionId = randomUUID();
    await fireHook(sessionId, hookEnv({ DXB_CONSTRUCTION_DATABASE_URL: CONSTRUCTION_URL }));
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

  // A third audit: the commit did not contain the file Claude Code actually runs,
  // so on any other machine the wall did not exist until somebody built it. The
  // built hook now travels with the repository — and the case above keeps it
  // honest, because a committed build that drifts from its source is worse than
  // none at all.
  it("travels with the repository — the built file is committed", async () => {
    const tracked = execFileSync("git", ["ls-files", "tools/hooks/dist/tag-subscription-call.js"], {
      encoding: "utf8",
    }).trim();
    expect(
      tracked,
      "tools/hooks/dist/tag-subscription-call.js is not tracked by git — " +
        "the .gitignore exception for it has been lost, and the guard stops travelling",
    ).toBe("tools/hooks/dist/tag-subscription-call.js");
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
