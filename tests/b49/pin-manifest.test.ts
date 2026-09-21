// B49 — THE BENCH'S TOOL CORPUS COMES FROM THE REPOSITORY, NOT FROM THE MACHINE.
//
// Until `db/seed/tool-pins.manifest.json` existed, the seed pinned whatever MCP
// servers happened to be alive on the workstation that ran it, so the same
// `pnpm construction:seed` built a different bench elsewhere. These thirteen cases
// are hermetic on purpose — NOT ONE of them spawns an MCP server or reads the
// live machine; that is exactly the dependency being removed, and a test that
// kept it would prove nothing. The live half is the hand-run
// `pnpm construction:pins:check`.
//
// Ownership (E9.3 rule, and the 2026-09-21 sweep law): the two cases that write
// rows write them under `b49-fixture%` server names and delete exactly those —
// never a watermark, never another writer's row. The 76 pins the bench already
// carries are not read for truth here and are never touched.
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "@dxb/shared";
import {
  buildManifest,
  diffManifest,
  pinFromManifest,
  readManifest,
  serializeManifest,
  verifyManifest,
  diffAgainstBench,
  pinTheCorpus,
  DEFAULT_MANIFEST_PATH,
  MANIFEST_RELATIVE_PATH,
  type ToolPinsManifest,
} from "../../db/seed/tool-pins-manifest.ts";
// Recomputed with the SOURCE hash function while the manifest module hashes
// with the built one — so a dist that has drifted from src fails here too.
import { computeToolHash, type ToolInventoryEntry } from "../../packages/gateway/src/index.js";

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const db = () => getDb();

const FIXTURE = "b49-fixture";
const FIXTURE_BAD = "b49-fixture-bad";
const tempDirs: string[] = [];

function fixtureEntries(server: string): ToolInventoryEntry[] {
  return [
    {
      server,
      tool: "toolA",
      description: "first fixture tool",
      // Keys deliberately out of order — the serializer sorts, the hash does too.
      inputSchema: { type: "object", properties: { b: { type: "string" }, a: { type: "number" } } },
    },
    { server, tool: "toolB", description: "second fixture tool", inputSchema: { type: "object" } },
  ];
}

function writeTemp(manifest: ToolPinsManifest): string {
  const dir = mkdtempSync(join(tmpdir(), "b49-manifest-"));
  tempDirs.push(dir);
  const path = join(dir, "tool-pins.manifest.json");
  writeFileSync(path, serializeManifest(manifest));
  return path;
}

/** Read arbitrary bytes through the real reader — the reader takes a path. */
function readManifestText(text: string): ToolPinsManifest {
  const dir = mkdtempSync(join(tmpdir(), "b49-manifest-"));
  tempDirs.push(dir);
  const path = join(dir, "tool-pins.manifest.json");
  writeFileSync(path, text);
  return readManifest(path);
}

async function pinCount(server: string): Promise<number> {
  const res = await sql<{ n: string }>`
    SELECT count(*)::text AS n FROM tool_pins WHERE server = ${server}
  `.execute(db());
  return Number(res.rows[0].n);
}

async function fingerprint(server: string): Promise<string[]> {
  const res = await sql<{ line: string }>`
    SELECT server || '|' || tool || '|' || schema_hash AS line
      FROM tool_pins WHERE server = ${server} ORDER BY tool
  `.execute(db());
  return res.rows.map((r) => r.line);
}

/** This suite's own rows and nothing else. */
async function sweep(): Promise<void> {
  await sql`DELETE FROM tool_pins WHERE server LIKE 'b49-fixture%'`.execute(db());
}

beforeAll(sweep);
afterAll(async () => {
  await sweep();
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
  await closeDb();
});

describe("B49 the pin manifest", () => {
  it("(1) the repository's manifest re-hashes to itself and holds the catalogued external corpus", () => {
    const manifest = readManifest(DEFAULT_MANIFEST_PATH);
    const mismatched = manifest.tools
      .filter((t) => computeToolHash({ description: t.description, inputSchema: t.inputSchema }) !== t.schema_hash)
      .map((t) => `${t.server}.${t.tool}`);
    expect(mismatched).toEqual([]);

    const { servers } = JSON.parse(
      readFileSync(join(ROOT, "packages/gateway/policy/grants.json"), "utf8"),
    ) as { servers: Record<string, unknown> };
    const catalogued = Object.keys(servers).filter((s) => s !== "dxb-mcp").sort();
    expect(Object.keys(manifest.servers).sort()).toEqual(catalogued);
    // dxb-mcp is read in-process from this repository — never from a file.
    expect(manifest.tools.some((t) => t.server === "dxb-mcp")).toBe(false);

    expect(manifest.servers).toEqual({ git: 12, context7: 2, playwright: 24, scrapling: 10 });
    expect(manifest.tools.length).toBe(48);
  });

  it("(2) serialization is deterministic — the file is what the serializer produces", () => {
    const path = DEFAULT_MANIFEST_PATH;
    expect(serializeManifest(readManifest(path))).toBe(readFileSync(path, "utf8"));
    // ...and a run-stamp of any kind would break that on the next refresh, so
    // the file carries exactly three keys and each tool exactly five. (Grepping
    // the text for "timestamp" would not do: the served descriptions contain
    // that word honestly — measured, it is why this assertion is structural.)
    const raw = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
    expect(Object.keys(raw)).toEqual(["about", "servers", "tools"]);
    for (const tool of raw.tools as Array<Record<string, unknown>>) {
      expect(Object.keys(tool)).toEqual([
        "server",
        "tool",
        "description",
        "inputSchema",
        "schema_hash",
      ]);
    }
    expect(MANIFEST_RELATIVE_PATH).toBe("db/seed/tool-pins.manifest.json");
  });

  it("(3) pinning from a manifest is first-sight and idempotent, and sweeps after itself", async () => {
    const path = writeTemp(buildManifest(fixtureEntries(FIXTURE)));

    const first = await pinFromManifest(db(), path);
    expect(first.pinned.map((p) => p.tool).sort()).toEqual(["toolA", "toolB"]);
    expect(first.existing).toBe(0);
    const afterFirst = await fingerprint(FIXTURE);
    expect(afterFirst.length).toBe(2);

    const second = await pinFromManifest(db(), path);
    expect(second.pinned).toEqual([]);
    expect(second.existing).toBe(2);
    // The same file pins the same hashes — a second seed cannot re-legitimize
    // anything, because `pinAll` never overwrites an existing row.
    expect(await fingerprint(FIXTURE)).toEqual(afterFirst);
  });

  it("(4) a manifest that disagrees with itself pins NOTHING and names the tool", async () => {
    const manifest = buildManifest(fixtureEntries(FIXTURE_BAD));
    expect(manifest.tools[0].tool).toBe("toolA");
    // The served shape changed; the stored hash is the old one — exactly the
    // drift a hand-edited or half-refreshed file would carry.
    manifest.tools[0].inputSchema = { type: "object", properties: { c: { type: "boolean" } } };
    const path = writeTemp(manifest);

    await expect(pinFromManifest(db(), path)).rejects.toThrow(
      /manifest hash mismatch: b49-fixture-bad\.toolA/,
    );
    expect(await pinCount(FIXTURE_BAD)).toBe(0);
  });

  it("(6) a body edited by hand is invisible to the diff — which is why the check verifies first", () => {
    // Found by mutation while proving this row (2026-09-21): `git.git_add`'s
    // description was edited in the manifest, its stored hash left alone, and
    // `pnpm construction:pins:check` printed "manifest matches the live
    // servers". The diff compares the STORED hash against the machine, so a
    // body that drifted from its own hash is outside its sight — by design.
    // The check now runs verifyManifest first; this case pins both halves.
    const manifest = buildManifest(fixtureEntries(FIXTURE));
    manifest.tools[0].description = "first fixture tool, edited by hand";
    const live = fixtureEntries(FIXTURE);
    expect(diffManifest(manifest, live)).toEqual({
      missingLive: [],
      extraLive: [],
      drifted: [],
    });
    expect(() => verifyManifest(manifest)).toThrow(/manifest hash mismatch: b49-fixture\.toolA/);
  });

  it("(7) verify refuses what a manifest may never carry — the rules, not just the hashes", () => {
    // Each of these was removed from the module and the suite stayed GREEN in an
    // adversarial mutation pass (2026-09-21). A rule with no case is not a rule.
    const withDxbMcp = buildManifest(fixtureEntries(FIXTURE));
    withDxbMcp.tools.push({
      server: "dxb-mcp",
      tool: "board_open_work",
      description: "in-process",
      inputSchema: {},
      schema_hash: computeToolHash({ description: "in-process", inputSchema: {} }),
    });
    withDxbMcp.servers["dxb-mcp"] = 1;
    expect(() => verifyManifest(withDxbMcp)).toThrow(/must not carry dxb-mcp/);

    const miscounted = buildManifest(fixtureEntries(FIXTURE));
    miscounted.servers[FIXTURE] = 3;
    expect(() => verifyManifest(miscounted)).toThrow(/count mismatch/);

    // THE HOLE THE ADVERSARIAL PASS WALKED THROUGH: one key twice. Each copy
    // hashes correctly, the count is bumped to match, the diff's map keeps the
    // LAST and `pinAll` writes the FIRST — so a forged body pins while a real
    // one is reported. Refused outright now.
    const twice = buildManifest(fixtureEntries(FIXTURE));
    const forged = {
      ...twice.tools[0],
      description: "forged body",
      schema_hash: computeToolHash({ description: "forged body", inputSchema: twice.tools[0].inputSchema }),
    };
    twice.tools.unshift(forged);
    twice.servers[FIXTURE] = 3;
    expect(() => verifyManifest(twice)).toThrow(/carries a tool twice: b49-fixture\.toolA/);

    // A tool served without an inputSchema cannot survive the round trip
    // (JSON drops undefined), so the build refuses it rather than writing a
    // file its own reader rejects on the next run.
    expect(() =>
      buildManifest([{ server: FIXTURE, tool: "toolZ", description: "no schema", inputSchema: undefined }]),
    ).toThrow(/without an inputSchema.*b49-fixture\.toolZ/);
  });

  it("(8) the serializer sorts — object keys and the tool list, whatever order it is handed", () => {
    const manifest = buildManifest(fixtureEntries(FIXTURE));
    manifest.tools.reverse();
    const text = serializeManifest(manifest);
    const written = JSON.parse(text) as { tools: Array<{ tool: string; inputSchema: unknown }> };
    expect(written.tools.map((t) => t.tool)).toEqual(["toolA", "toolB"]);
    // the fixture hands `{ b, a }`; the file must hold `{ a, b }`
    const properties = (written.tools[0].inputSchema as { properties: Record<string, unknown> }).properties;
    expect(Object.keys(properties)).toEqual(["a", "b"]);
    // and sorting must not disturb the hash it is stored under
    expect(verifyManifest(readManifestText(text)).length).toBe(2);
  });

  it("(9) reading refuses a file that is not a manifest, by name", () => {
    const good = serializeManifest(buildManifest(fixtureEntries(FIXTURE)));
    const bend = (fn: (raw: any) => void): string => {
      const raw = JSON.parse(good);
      fn(raw);
      return JSON.stringify(raw, null, 2);
    };
    expect(() => readManifestText("[]")).toThrow(/not an object/);
    expect(() => readManifestText(bend((r) => delete r.about))).toThrow(/no 'about' sentence/);
    expect(() => readManifestText(bend((r) => delete r.servers))).toThrow(/no 'servers' map/);
    expect(() => readManifestText(bend((r) => delete r.tools))).toThrow(/no 'tools' array/);
    expect(() => readManifestText(bend((r) => delete r.tools[0].inputSchema))).toThrow(
      /tool #0 has no 'inputSchema'/,
    );
    expect(() => readManifestText(bend((r) => delete r.tools[1].schema_hash))).toThrow(
      /tool #1 has no 'schema_hash'/,
    );
    expect(() => readManifestText(bend((r) => (r.servers[FIXTURE] = "two")))).toThrow(/has no count/);
  });

  it("(10) the three holes the SECOND adversarial round found in the first round's fixes", () => {
    const hashOf = (description: string, inputSchema: unknown): string =>
      computeToolHash({ description, inputSchema });

    // (a) The write path had no duplicate gate, so `refresh` could write a file
    // its own reader refuses — the very reason the schemaless case is refused.
    const served = fixtureEntries(FIXTURE)[0];
    expect(() => buildManifest([served, served])).toThrow(
      /served twice, cannot be stored: b49-fixture\.toolA/,
    );

    // (b) A server named `__proto__` was invisible to BOTH sides of the count
    // gate (assignment to that key on a plain object is swallowed), so the file
    // could carry a row it never declared and the gate called them equal.
    const sneaky: ToolPinsManifest = {
      about: "x",
      servers: { [FIXTURE]: 1 },
      tools: [
        { ...buildManifest(fixtureEntries(FIXTURE)).tools[0] },
        {
          server: "__proto__",
          tool: "a",
          description: "smuggled",
          inputSchema: {},
          schema_hash: hashOf("smuggled", {}),
        },
      ],
    };
    expect(() => verifyManifest(sneaky)).toThrow(/count mismatch/);

    // (c) ...while two genuinely DIFFERENT pairs that share one dotted spelling
    // are not duplicates and must pass: `b49.x` + `y` versus `b49` + `x.y`.
    const collide: ToolPinsManifest = {
      about: "x",
      servers: { "b49.x": 1, b49: 1 },
      tools: [
        { server: "b49.x", tool: "y", description: "one", inputSchema: {}, schema_hash: hashOf("one", {}) },
        { server: "b49", tool: "x.y", description: "two", inputSchema: {}, schema_hash: hashOf("two", {}) },
      ],
    };
    expect(verifyManifest(collide).map((e) => e.tool)).toEqual(["y", "x.y"]);
  });

  it("(5) the diff names every difference, and says nothing when there is none", () => {
    const manifest = buildManifest(fixtureEntries(FIXTURE));
    const same = fixtureEntries(FIXTURE);
    expect(diffManifest(manifest, same)).toEqual({ missingLive: [], extraLive: [], drifted: [] });

    const changed: ToolInventoryEntry[] = [
      // toolA drifted, toolB gone from the machine, toolC new on the machine
      { ...same[0], description: "first fixture tool, reworded" },
      { server: FIXTURE, tool: "toolC", description: "new on the machine", inputSchema: {} },
      // dxb-mcp always rides along in a live inventory and must not be reported
      { server: "dxb-mcp", tool: "board_open_work", description: "in-process", inputSchema: {} },
    ];
    expect(diffManifest(manifest, changed)).toEqual({
      missingLive: ["b49-fixture.toolB"],
      extraLive: ["b49-fixture.toolC"],
      drifted: ["b49-fixture.toolA"],
    });
  });

  // The other ten cases prove the MANIFEST. This one proves the WIRING: that
  // the seed actually reads it. Without it the row's whole promise lived in
  // prose — `node("scripts/gateway/pin-arsenal.mjs")` could come back tomorrow,
  // by hand or by a merge, and every suite would stay green. B36's twin
  // promise has `tests/b36/seed-is-fiction.test.ts`; this is B49's.
  it("(11) the seed pins from THIS REPOSITORY — the wiring is pinned, not merely described", () => {
    const seed = readFileSync(join(ROOT, "db/seed/build-seed.ts"), "utf8");

    // The dependency this row removed may not return under any spelling.
    expect(seed).not.toMatch(/pin-arsenal/);

    // AND THE STEP'S BODY IS PINNED CHARACTER FOR CHARACTER. The first shape of
    // this case read the body for the word `catch`; the second adversarial
    // round walked straight past it with `.then(ok, err)` — no `catch` in the
    // whole file — and a broken manifest was skipped in silence while the bench
    // built with 28 tools instead of 76 and printed no warning at all. There is
    // no regex for "does not swallow". There is only: this, exactly, and the
    // behaviour of what it calls, measured in case (13).
    const RUN = [
      "    run: async () => {",
      "      pinRun = await pinTheCorpus(getDb(), await readDxbMcpInventory(), join(REPO, MANIFEST_RELATIVE_PATH));",
      "    },",
    ].join("\n");
    expect(seed).toContain(RUN);

    // And the step is still the step — the name the row and the records use.
    expect(seed).toContain('name: "tool pins from the repository (dxb-mcp in-process + manifest)",');
  });

  it("(12) a bench that holds what this repository does not declare is NAMED, in all three directions", () => {
    const want = new Map([
      ["git", new Map([["git_add", "hash-a"], ["git_log", "hash-b"]])],
      ["dxb-mcp", new Map([["board_open_work", "hash-c"]])],
    ]);
    const flat = (m: typeof want): Array<[string, string, string]> =>
      [...m].flatMap(([s, tools]) => [...tools].map(([t, h]) => [s, t, h] as [string, string, string]));

    // The healthy bench: the same pairs under the same hashes — silence.
    expect(diffAgainstBench(want, flat(want))).toEqual({ stranger: [], disagrees: [], absent: [] });

    // The three ways a bench can disagree, at once and each by name.
    expect(
      diffAgainstBench(want, [
        ["git", "git_add", "hash-a"],
        ["git", "git_log", "SOMETHING-ELSE"],
        ["scrapling", "fetch", "hash-x"],
        ["playwright", "browser_click", "hash-y"],
      ]),
    ).toEqual({
      stranger: ["playwright.browser_click", "scrapling.fetch"],
      disagrees: ["git.git_log"],
      absent: ["dxb-mcp.board_open_work"],
    });

    // An empty bench is not a healthy one: everything declared is absent.
    expect(diffAgainstBench(want, []).absent).toEqual(["dxb-mcp.board_open_work", "git.git_add", "git.git_log"]);

    // IDENTITY IS THE PAIR. The dotted spelling is for the message only — this
    // file has been bitten once already by `a.b` + `c` sharing a string with
    // `a` + `b.c` (the duplicate gate, 2026-09-21), and the same trap is here.
    // Declared `a` + `b.c`, pinned `a.b` + `c`: two different tools, and BOTH
    // must be reported, not cancelled against each other.
    const dotted = new Map([["a", new Map([["b.c", "same-hash"]])]]);
    expect(diffAgainstBench(dotted, [["a.b", "c", "same-hash"]])).toEqual({
      stranger: ["a.b.c"],
      disagrees: [],
      absent: ["a.b.c"],
    });

    // A server named `__proto__` is a server like any other (Map, not object).
    expect(diffAgainstBench(new Map(), [["__proto__", "t", "h"]]).stranger).toEqual(["__proto__.t"]);
  });

  // The behaviour case (11) cannot express as text: the step REFUSES, and it
  // refuses before it has written anything.
  it("(13) the seed's whole pin step refuses a manifest that disagrees with itself — and pins nothing at all", async () => {
    const HOUSE = "b49-fixture-house";
    const OK = "b49-fixture-ok";

    const good = await pinTheCorpus(db(), fixtureEntries(HOUSE), writeTemp(buildManifest(fixtureEntries(OK))));
    expect(good.pinned).toBe(4);
    expect(good.existing).toBe(0);
    expect(good.want.get(HOUSE)?.size).toBe(2);
    expect(good.want.get(OK)?.size).toBe(2);
    expect(await pinCount(HOUSE)).toBe(2);
    expect(await pinCount(OK)).toBe(2);

    // A second run over the same file writes nothing and says so — this is the
    // idempotence the row promises, taken through the step itself.
    const again = await pinTheCorpus(db(), fixtureEntries(HOUSE), writeTemp(buildManifest(fixtureEntries(OK))));
    expect(again.pinned).toBe(0);
    expect(again.existing).toBe(4);

    // And the refusal: a fresh in-house half that has NEVER been pinned does
    // not land either, because the manifest is verified before the first write.
    const HOUSE2 = "b49-fixture-house2";
    const bad = buildManifest(fixtureEntries("b49-fixture-bad2"));
    bad.tools[0].inputSchema = { type: "object", properties: { c: { type: "boolean" } } };
    await expect(pinTheCorpus(db(), fixtureEntries(HOUSE2), writeTemp(bad))).rejects.toThrow(
      /manifest hash mismatch: b49-fixture-bad2\.toolA/,
    );
    expect(await pinCount(HOUSE2)).toBe(0);
    expect(await pinCount("b49-fixture-bad2")).toBe(0);
  });
});
