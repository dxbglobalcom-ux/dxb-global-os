import { execFile, execFileSync } from "node:child_process";
import { mkdtempSync, renameSync, rmSync, writeFileSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "@dxb/shared";

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
// broke the first, and six spellings broke the second — every one of them was
// run against a live engine on 2026-08-23 and every one CONNECTED while the
// parser called it a different database. They are permanent cases below.
//
// WHY A DENY RULE WAS NOT ENOUGH EITHER. A third audit broke the guard that
// replaced them without touching a line of it: a deny rule only knows what it
// was told to refuse, so a rebuilt company under a new identity walks straight
// past it. The list is now an ALLOW list, and the cases below hold that shape —
// a database nobody listed is refused even though it is not the company.
//
// ─────────────────────────────────────────────────────────────────────────────
// AND THIS SUITE NO LONGER CARRIES A KEY TO THE COMPANY. The auditor's first
// FAIL on Block 2, 2026-08-23: a battery that is being cut out of the company
// must not hold the company's address and its write-capable `postgres` account.
// It used to hold both, and it opened a real connection to the CEO's database on
// every run to count rows there.
//
// Nothing is lost by taking it out, because the guard's rule was never about the
// company in particular — it is "ask the server who it is, and refuse unless the
// answer is on the list". Every branch of that rule is exercised here on the
// CONSTRUCTION cluster, and the branches that need a forbidden database get one
// by rewriting the RECORD the guard reads, not the address it is handed:
//
//   · WALL 1 (never the company) — the record is made to say that the
//     construction engine IS the company, and the six spellings are then fired
//     at it. Each connects; each is refused. This is a stronger form of the
//     original case: if the guard let one through, the row would land in the
//     very database this file then counts.
//   · WALL 2 (a stale record) and WALL 3 (a database nobody listed) — measured
//     against `_supabase`, a real, harmless database on the construction cluster.
//   · The bridge to the holding itself is the last case in this file, and it
//     needs no connection: the company recorded in the identity ledger is NOT on
//     the allow list, so "not on the list ⇒ refused" is a statement about it.
//
// The one thing that does require reaching the holding — checking that the
// recorded company identity still matches the live one — moved to the drill
// that is run deliberately and is not part of `pnpm test`:
// `pnpm b36:prove-block1` (scripts/b36/prove-block1.mjs).
// ─────────────────────────────────────────────────────────────────────────────

import { CONSTRUCTION_DATABASE_URL } from "../construction-engine.js";

const run = promisify(execFile);

const HOOK = join(process.cwd(), "tools/hooks/dist/tag-subscription-call.js");
// B36 Block 2: the construction site's ledger is no longer a database sitting
// INSIDE the company's engine — it is the DxB_Build stack's own database, on its
// own cluster and its own port. Spelled once, in tests/construction-engine.ts.
const CONSTRUCTION_URL = CONSTRUCTION_DATABASE_URL;
const IDENTITY = join(process.cwd(), "tools/hooks/ledger-identity.json");

// A real database that is nobody's ledger: it lives on the construction
// cluster, it answers, and it is not on the allow list. `_supabase` is
// Supabase's own bookkeeping database and this suite only ever asks it who it
// is — the point of the case is that the hook refuses before it writes.
const UNLISTED_URL = "postgresql://postgres:postgres@127.0.0.1:54422/_supabase";

// Six spellings of ONE database — the construction engine's own `postgres`.
// Each was measured connecting to it on 2026-08-23, and each was measured being
// read as a different database by the parser the second guard used.
const ESCAPES: [string, string][] = [
  // the driver obeys ?host=, the URL parser reads the authority
  ["a host= query parameter", "postgresql://postgres:postgres@example.invalid:54422/postgres?host=127.0.0.1"],
  // libpq falls back to the USER name for the database, and the user is postgres
  ["no database in the path", "postgresql://postgres:postgres@127.0.0.1:54422"],
  ["a short IPv4", "postgresql://postgres:postgres@127.1:54422/postgres"],
  ["an IPv4 written as one number", "postgresql://postgres:postgres@2130706433:54422/postgres"],
  ["a hostname with a trailing dot", "postgresql://postgres:postgres@localhost.:54422/postgres"],
  ["another address on the same loopback", "postgresql://postgres:postgres@127.0.0.2:54422/postgres"],
];

const MODEL = "b36t-model";
const db = () => getDb();

let tmp: string;
let transcript: string;

interface Identity {
  sysid: string;
  dboid: string;
  dbname: string;
}
interface Ledger {
  company: Identity | null;
  allowed: Identity[];
}

const readLedger = (): Ledger => JSON.parse(readFileSync(IDENTITY, "utf8")) as Ledger;

/**
 * Run a case with the identity RECORD rewritten — the address stays whatever the
 * case hands the hook. This is how a forbidden database is produced without one:
 * the guard's answer comes from the server, and the record is what decides what
 * that answer means.
 */
async function withRecord<T>(mutate: (l: Ledger) => void, body: () => Promise<T>): Promise<T> {
  const parked = `${IDENTITY}.parked`;
  const doctored = readLedger();
  mutate(doctored);
  renameSync(IDENTITY, parked);
  writeFileSync(IDENTITY, JSON.stringify(doctored, null, 2));
  try {
    return await body();
  } finally {
    rmSync(IDENTITY, { force: true });
    renameSync(parked, IDENTITY);
  }
}

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

  it("refuses the database the record calls the company — even on the allow list", async () => {
    const sessionId = randomUUID();
    await withRecord(
      (l) => (l.company = { ...l.allowed[0] }),
      async () => {
        const stderr = await fireHook(
          sessionId,
          hookEnv({ DXB_CONSTRUCTION_DATABASE_URL: CONSTRUCTION_URL }),
        );
        expect(stderr).toContain("reaches the company database");
      },
    );
    // The decisive line, and it is decisive precisely because the refused target
    // is the database this query reads: a write that got through would be here.
    expect(await rowsForSession(sessionId)).toBe(0);
  });

  // The audit's own attack, and the five more it opened the door to. Every one
  // of these spellings was measured CONNECTING to the engine below while a
  // text parser called it something else.
  it.each(ESCAPES)("refuses the company reached through %s", async (_name, url) => {
    const sessionId = randomUUID();
    await withRecord(
      (l) => (l.company = { ...l.allowed[0] }),
      async () => {
        const stderr = await fireHook(sessionId, hookEnv({ DXB_CONSTRUCTION_DATABASE_URL: url }));
        expect(stderr, `this spelling was not refused: ${_name}`).toContain(
          "reaches the company database",
        );
      },
    );
    expect(await rowsForSession(sessionId), `${_name} got a row through`).toBe(0);
  });

  it("refuses when the address cannot be read at all", async () => {
    const stderr = await fireHook(
      randomUUID(),
      hookEnv({ DXB_CONSTRUCTION_DATABASE_URL: "this-is-not-an-address" }),
    );
    expect(stderr).toContain("refusing to write");
  });

  // THE HOLE THE THIRD AUDIT FOUND. `_supabase` is not the company, and it is
  // not on the allow list. A deny-only guard would have written into it.
  it("refuses a database that is real, harmless and simply not on the list", async () => {
    const sessionId = randomUUID();
    const stderr = await fireHook(
      sessionId,
      hookEnv({ DXB_CONSTRUCTION_DATABASE_URL: UNLISTED_URL }),
    );
    expect(stderr).toContain("is not a permitted construction ledger");
    expect(await rowsForSession(sessionId)).toBe(0);
  });

  // THE FAIL-OPEN THE THIRD AUDIT NAMED, written as two cases.
  //
  // Rebuild a database and its identity changes. A deny-only guard then does not
  // recognise it, calls it "some other database", and writes. Here the recorded
  // company is deliberately made wrong in exactly that way — a different oid AND
  // a different name, which is what a rebuild under another name looks like —
  // and an unlisted database must still be refused, because being unrecognised
  // is not the same as being permitted.
  it("refuses an unlisted database even when the recorded company no longer matches anything", async () => {
    const sessionId = randomUUID();
    await withRecord(
      (l) => (l.company = { ...(l.company as Identity), dboid: "999999", dbname: "postgres_before_the_rebuild" }),
      async () => {
        const stderr = await fireHook(
          sessionId,
          hookEnv({ DXB_CONSTRUCTION_DATABASE_URL: UNLISTED_URL }),
        );
        expect(stderr).toContain("is not a permitted construction ledger");
      },
    );
    expect(await rowsForSession(sessionId)).toBe(0);
  });

  // And when the record has gone stale in a way the hook CAN see — a database
  // still carrying the recorded company's name on this cluster but under another
  // oid — it stops and says why, rather than working on beside a wall that is
  // aiming at something that no longer exists.
  it("stops and says so when the recorded company identity has gone stale", async () => {
    const sessionId = randomUUID();
    await withRecord(
      (l) => (l.company = { sysid: l.allowed[0].sysid, dboid: "999999", dbname: l.allowed[0].dbname }),
      async () => {
        const stderr = await fireHook(
          sessionId,
          hookEnv({ DXB_CONSTRUCTION_DATABASE_URL: UNLISTED_URL }),
        );
        expect(stderr).toContain("recorded identity of the company is stale");
      },
    );
    expect(await rowsForSession(sessionId)).toBe(0);
  });

  // The wall that does NOT depend on recognising anything. With the recorded
  // company describing a cluster that does not exist, Wall 1 and Wall 2 are both
  // blind and only the allow list is left. This is why the rule was inverted
  // from deny to allow after the third audit, and it is the case that proves the
  // inversion earns its keep.
  it("refuses an unlisted database even when the record describing the company is wrong", async () => {
    const sessionId = randomUUID();
    await withRecord(
      (l) => (l.company = { ...(l.company as Identity), sysid: "1", dboid: "999999" }),
      async () => {
        const stderr = await fireHook(
          sessionId,
          hookEnv({ DXB_CONSTRUCTION_DATABASE_URL: UNLISTED_URL }),
        );
        expect(stderr).toContain("refusing to write");
      },
    );
    expect(await rowsForSession(sessionId)).toBe(0);
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

  // THE BRIDGE TO THE HOLDING, and it needs no connection to it. Every case
  // above proves the same rule: a database that is not on the allow list is
  // refused, whatever it is and however its address is spelled. This is the
  // statement that makes that rule a statement about the CEO's own database.
  it("the company is recorded, and it is NOT on the list of places the hook may write", () => {
    const l = readLedger();
    expect(l.company?.sysid, "the record does not say who the company is").toBeTruthy();
    expect(l.allowed.length, "the record permits nothing at all").toBeGreaterThan(0);
    const permitted = l.allowed.filter(
      (a) =>
        a.sysid === l.company?.sysid &&
        (a.dboid === l.company?.dboid || a.dbname === l.company?.dbname),
    );
    expect(permitted, "the company's own identity is on the hook's allow list").toEqual([]);
    // And what IS on the list is the construction engine this battery stands on.
    expect(l.allowed.some((a) => a.dbname === "postgres")).toBe(true);
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
