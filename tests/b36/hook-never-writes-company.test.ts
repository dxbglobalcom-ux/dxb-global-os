import { execFile } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
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
// The contract now: the hook writes ONLY where DXB_CONSTRUCTION_DATABASE_URL
// points, writes NOTHING when that is unset, and refuses when that address is
// the company's own. This suite drives the COMPILED hook the way Claude Code
// drives it — stdin JSON, a real transcript file — because the compiled file is
// what actually runs at session end.
//
// Every case targets dxb_test. No case can reach the company database: the one
// case that leaves DXB_CONSTRUCTION_DATABASE_URL unset also pins
// DXB_DATABASE_URL to dxb_test, so the pre-fix fallback had nowhere else to go.

const run = promisify(execFile);

const HOOK = join(process.cwd(), "tools/hooks/dist/tag-subscription-call.js");
const CONSTRUCTION_URL = "postgresql://postgres:postgres@127.0.0.1:54322/dxb_test";
// A syntactically valid address for a database that does not exist. Used where a
// case must prove the hook IGNORED it: a write attempt there fails loudly instead
// of landing somewhere real.
const DEAD_URL = "postgresql://postgres:postgres@127.0.0.1:54322/dxb_b36_no_such_db";

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
    // The company-shaped variable points at a database that does not exist; only
    // a hook that overrides it with the construction address can write at all.
    await fireHook(
      sessionId,
      hookEnv({ DXB_DATABASE_URL: DEAD_URL, DXB_CONSTRUCTION_DATABASE_URL: CONSTRUCTION_URL }),
    );
    expect(await rowsForSession(sessionId)).toBe(1);
  });

  it("refuses when the construction address IS the company address", async () => {
    const sessionId = randomUUID();
    const stderr = await fireHook(
      sessionId,
      hookEnv({
        DXB_DATABASE_URL: CONSTRUCTION_URL,
        DXB_CONSTRUCTION_DATABASE_URL: CONSTRUCTION_URL,
      }),
    );
    expect(await rowsForSession(sessionId)).toBe(0);
    expect(stderr).toContain("refusing to write");
  });

  // The first version of this guard compared the two addresses as TEXT. An
  // independent audit broke it in one line: the same database written two ways
  // is two different strings. These cases are that attack.
  it("refuses when the same database is spelled two different ways", async () => {
    const sessionId = randomUUID();
    const stderr = await fireHook(
      sessionId,
      hookEnv({
        DXB_DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:54322/dxb_test",
        DXB_CONSTRUCTION_DATABASE_URL:
          "postgres://postgres:postgres@localhost:54322/dxb_test?sslmode=disable",
      }),
    );
    // Had it not refused, it would have written into dxb_test through the second
    // spelling — which is the company's database under a different name.
    expect(await rowsForSession(sessionId)).toBe(0);
    expect(stderr).toContain("refusing to write");
  });

  it("refuses when one address names the default port and the other writes it out", async () => {
    const stderr = await fireHook(
      randomUUID(),
      hookEnv({
        DXB_DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:5432/postgres",
        DXB_CONSTRUCTION_DATABASE_URL: "postgresql://postgres:postgres@localhost/postgres",
      }),
    );
    expect(stderr).toContain("refusing to write");
  });

  it("refuses when an address cannot be read at all", async () => {
    const stderr = await fireHook(
      randomUUID(),
      hookEnv({
        DXB_DATABASE_URL: CONSTRUCTION_URL,
        DXB_CONSTRUCTION_DATABASE_URL: "this-is-not-an-address",
      }),
    );
    expect(stderr).toContain("refusing to write");
  });

  it("still writes when the two addresses really are different databases", async () => {
    const sessionId = randomUUID();
    await fireHook(
      sessionId,
      hookEnv({
        DXB_DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
        DXB_CONSTRUCTION_DATABASE_URL: CONSTRUCTION_URL,
      }),
    );
    expect(await rowsForSession(sessionId)).toBe(1);
  });

  // B21 taught this repository that a battery can be green because it is testing
  // an older build than its own source. The hook is the one file where that would
  // be dangerous rather than merely wrong: `.claude/settings.json` runs the BUILT
  // file, and `dist/` is not in the repository (.gitignore:30).
  it("is built from the source that is on disk right now", async () => {
    const { statSync } = await import("node:fs");
    const src = statSync(join(process.cwd(), "tools/hooks/src/tag-subscription-call.ts"));
    const built = statSync(join(process.cwd(), "tools/hooks/dist/tag-subscription-call.js"));
    expect(
      built.mtimeMs >= src.mtimeMs,
      "tools/hooks/dist is older than its source — run `pnpm typecheck` (tsc --build)",
    ).toBe(true);
  });

  it("carries no company-database fallback in its source or its build", async () => {
    const { readFileSync } = await import("node:fs");
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
