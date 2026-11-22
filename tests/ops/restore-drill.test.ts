// B72 — THE RESTORE DRILL CAN ONLY EVER TOUCH ITS OWN CONTAINER. scripts/backup/restore-drill.sh replays a
// dump with `pg_restore --clean`, which drops what it replaces: aimed at the company it would be the end of
// the company's data. So the first thing proven here is the refusal — an ID that is empty, is not an ID, or
// belongs to the company's or the construction bench's container stops the drill before any `exec`. The rest
// proves what the drill calls "restored" — one night's proven SET, restored from the set alone (its equality with
// the manifest is restore-drill-equal.test.ts) — and that it says OK only once its container and its working
// directory are gone. `docker` is a fake on PATH (restore-drill-fakes.ts); no container and no database is touched.
import { spawn } from "node:child_process";
import { existsSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { BENCH, BENCH_ID, COMPANY, COMPANY_ID, DRILL, DUMP, GLOBALS, night, OWN_ID, setup } from "./restore-drill-fakes";

const REMOVED_BY_ID = [`rm -f -v ${OWN_ID}`]; // the one removal a drill asks of docker: its own container, by full ID
const COMPARED_EQUAL = "COMPARED 4 tables, 1 sequences, 2 extensions, 3 roles, the large objects and the privileges with the manifest: 0 differ";
function expectNothingLeft(t: ReturnType<typeof setup>) {
  expect(t.removed()).toEqual(REMOVED_BY_ID);
  expect(t.containerStands()).toBe(false);
  expect(t.workdirs()).toEqual([]);
}
/** The drill stopped before it made anything: no container was created, started, entered or removed. */
function expectNothingMade(t: ReturnType<typeof setup>) {
  expect(t.calls().filter((c) => /^(create|start|exec|rm)/.test(c))).toEqual([]);
  expect(t.workdirs()).toEqual([]);
}

describe("restore-drill.sh — the wall", () => {
  // What docker does wrong · the stub's setting · whether the container that does exist is still provably this run's.
  const refusals: [string, Record<string, string>, boolean][] = [
    ["its docker create returned no ID", { STUB_CREATE_ID: "" }, true],
    ["the ID is the company container's", { STUB_CREATE_ID: COMPANY_ID }, true],
    ["the ID is the construction bench's", { STUB_CREATE_ID: BENCH_ID }, true],
    ["the ID is the company container's name", { STUB_CREATE_ID: COMPANY }, true],
    ["the ID resolves to the company container's name", { STUB_NAME_OF_ID: `/${COMPANY}` }, false],
    ["the ID resolves to the construction bench's name", { STUB_NAME_OF_ID: `/${BENCH}` }, false],
    ["the ID resolves to no name at all", { STUB_NAME_OF_ID: "" }, false],
    ["the ID carries another run's label", { STUB_LABEL_OF_ID: "0".repeat(32) }, false],
  ];
  for (const [what, env, provable] of refusals) {
    it(`refuses when ${what}: nothing is executed anywhere, and nothing is removed that is not proven its own`, () => {
      const t = setup();
      const r = t.run([], env);
      expect(r.status).not.toBe(0);
      expect(r.stdout).toMatch(/^RESTORE_DRILL_FAIL refused/m);
      expect(r.stdout).not.toContain("RESTORE_DRILL_OK");
      expect(t.calls().filter((c) => /^(exec|start)/.test(c))).toEqual([]); // no restore, no SQL, not even a read
      // The container that exists is found by its label and removed by its ID; one that cannot be proven is left, and said.
      expect(t.removed()).toEqual(provable ? REMOVED_BY_ID : []);
      expect(t.lastLine(r)).toMatch(provable ? /^RESTORE_DRILL_FAIL refused/ : new RegExp(`^RESTORE_DRILL_LEFTOVER the container ${OWN_ID}$`));
      expect(t.name()).toMatch(/^dxb-restore-drill-\d{8}-\d{6}-\d+$/);
    });
  }

  it("refuses to start while a container of an earlier drill exists, and removes nothing it did not create", () => {
    const t = setup();
    const r = t.run([], { STUB_EARLIER_DRILL: "dxb-restore-drill-20261121-023000-77" });
    expect(r.status).not.toBe(0);
    expect(t.lastLine(r)).toMatch(/^RESTORE_DRILL_FAIL refused: .*dxb-restore-drill-20261121-023000-77/);
    expect(t.calls().filter((c) => /^(create|exec|rm)/.test(c))).toEqual([]);
  });

  it("creates its own container from the company's image with no door to the outside, and restores only into it", () => {
    const t = setup();
    const r = t.run();
    expect(r.status, r.stdout + r.stderr).toBe(0);
    const create = t.calls().find((c) => c.startsWith("create"))!;
    expect(create).toContain("--network none");
    expect(create).not.toMatch(/(^| )(-p|-P|--publish)/);
    expect(create).toMatch(/ stub\/postgres:1$/);
    expect(create).toMatch(/ --label dxb\.restore-drill=[0-9a-f]{32} /); // a token no other run carries
    expect(create).toContain("-e POSTGRES_HOST_AUTH_METHOD=trust");
    expect(create).not.toMatch(/PASSWORD/); // no password at all: `docker inspect` of the container holds no secret
    expect(t.calls()).toContain(`start ${OWN_ID}`);
    const execs = t.calls().filter((c) => c.startsWith("exec"));
    expect(execs.length).toBeGreaterThan(0);
    for (const c of execs) expect(c).toContain(` ${OWN_ID} `); // every tool runs in the drill's own container …
    expect(execs.some((c) => c.includes("pg_restore") && c.includes("--clean"))).toBe(true);
    // … and docker is asked two things about the company: its image, and its ID to stay away from.
    const aboutCompany = [...new Set(t.calls().filter((c) => c.includes(COMPANY)))];
    expect(aboutCompany.sort()).toEqual([`inspect -f {{.Config.Image}} ${COMPANY}`, `inspect -f {{.Id}} ${COMPANY}`]);
    expect(execs.join("\n")).not.toContain(BENCH);
  });
});

describe("restore-drill.sh — the set it takes", () => {
  it("with nothing named takes TODAY's set, and fails when today has none: an older night is not taken for it", () => {
    const today = setup();
    expect(today.lastLine(today.run())).toBe(`RESTORE_DRILL_OK ${today.set} 4 tables 1052 rows`);
    const t = setup({ night: night(1) });
    const r = t.run();
    expect(r.status).not.toBe(0);
    expect(t.lastLine(r)).toBe(`RESTORE_DRILL_FAIL today's set is not there: ${join(t.backups, `dxb-laptop-${night()}`)}.dump is missing or empty`);
    expectNothingMade(t);
  });

  it("takes the set named by its stem, or by any of its three files — and --require-equal is no more", () => {
    const t = setup({ night: night(3) });
    for (const named of [t.stem, t.set, `${t.set}.dump`, `${t.set}.globals.sql`, `${t.set}.manifest.json`]) {
      expect(t.lastLine(t.run([named])), named).toBe(`RESTORE_DRILL_OK ${t.set} 4 tables 1052 rows`);
    }
    const old = setup();
    const r = old.run(["--require-equal", `${old.set}.dump`]);
    expect(r.status).not.toBe(0);
    expect(old.lastLine(r)).toMatch(/^RESTORE_DRILL_FAIL /);
    expectNothingMade(old);
  });

  // What is wrong with the set · how it got so · what the drill says. Nothing is created for any of them.
  const unproven: [string, (set: string) => void, RegExp][] = [
    ["its manifest is missing", (set) => rmSync(`${set}.manifest.json`), /manifest\.json is missing or empty$/],
    ["its globals file is empty", (set) => writeFileSync(`${set}.globals.sql`, ""), /globals\.sql is missing or empty$/],
    ["its manifest does not parse", (set) => writeFileSync(`${set}.manifest.json`, '{"format": 1, "inventory": {'), /not a proven set: the manifest does not parse/],
    ["its dump is not the one the manifest names", (set) => writeFileSync(`${set}.dump`, `${DUMP}one more byte`), /not a proven set: .*\.dump is not the file the manifest names \(dump_sha256\)$/],
    ["its globals are not the ones the manifest names", (set) => writeFileSync(`${set}.globals.sql`, `${GLOBALS}CREATE ROLE intruder;\n`), /not a proven set: .*\.globals\.sql is not the file the manifest names \(globals_sha256\)$/],
  ];
  for (const [what, spoil, says] of unproven) {
    it(`creates nothing when ${what}`, () => {
      const t = setup();
      spoil(t.set);
      const r = t.run();
      expect(r.status).not.toBe(0);
      expect(t.lastLine(r)).toMatch(/^RESTORE_DRILL_FAIL /);
      expect(t.lastLine(r)).toMatch(says);
      expectNothingMade(t);
    });
  }

  it("creates nothing when the manifest is of a format it does not know", () => {
    const t = setup({ manifest: (m) => { m.format = 2; } });
    expect(t.lastLine(t.run())).toBe("RESTORE_DRILL_FAIL not a proven set: the manifest's format is not 1");
    expectNothingMade(t);
  });
});

describe("restore-drill.sh — what it calls restored", () => {
  it("restores from the set alone: the image's default privileges cleared, the set's own globals, its dump, then the inventory", () => {
    const t = setup();
    const r = t.run();
    expect(r.status, r.stdout + r.stderr).toBe(0);
    expect(t.events()).toEqual(["defaults", "globals", "restore", "inventory"]);
    expect(t.read("globals.applied")).toBe(GLOBALS);
    expect(t.read("restored.dump")).toBe(DUMP);
    expect(r.stdout).toMatch(/^GLOBALS_APPLIED .* 2 roles the image had already/m); // anon and postgres, of the set's three
    expect(r.stdout).toContain(COMPARED_EQUAL);
    expect(t.calls().join("\n")).not.toContain("--list"); // no table of contents is parsed any more
    expect(r.stderr).toBe("");
    expect(t.lastLine(r)).toBe(`RESTORE_DRILL_OK ${t.set} 4 tables 1052 rows`);
    expectNothingLeft(t);
  });

  it("fails on a globals error that is not \"role already exists\" — its kind and count, never its text — and restores nothing", () => {
    const t = setup({ globals: GLOBALS.replace("GRANT anon TO", "GRANT dxb_planted_role TO postgres;\nGRANT anon TO") });
    const r = t.run();
    expect(r.status).not.toBe(0);
    expect(r.stdout).toMatch(/^GLOBALS_ERRORS does_not_exist=1 role_exists=2$/m);
    expect(t.lastLine(r)).toBe("RESTORE_DRILL_FAIL the set's globals: psql exited 0 with 1 error other than a role the image had already");
    expect(r.stdout + r.stderr).not.toContain("dxb_planted_role");
    expect(t.events()).toEqual(["defaults", "globals"]);
    expectNothingLeft(t);
  });

  it("fails when the image's default privileges are not all cleared: what the dump creates would be granted more than the company's", () => {
    const t = setup({ files: { "defaults.left": "3\n" } });
    const r = t.run();
    expect(r.status).not.toBe(0);
    expect(t.lastLine(r)).toBe("RESTORE_DRILL_FAIL the image's default privileges could not be cleared: 3 are left");
    expect(t.events()).toEqual(["defaults"]);
  });

  // No tool's own words reach the output: an error can quote a row. Which psql dies · what the drill says instead.
  const deaths: [string, string][] = [
    ["defaults", "RESTORE_DRILL_FAIL the image's default privileges could not be cleared (psql exited 2)"],
    ["globals", "RESTORE_DRILL_FAIL the set's globals: psql exited 2 with 1 error other than a role the image had already"],
    ["inventory", "RESTORE_DRILL_FAIL the inventory of the restored copy could not be taken (psql exited 2)"],
  ];
  for (const [call, says] of deaths) {
    it(`says a fixed reason and not one word of psql's own when the ${call} call dies`, () => {
      const t = setup();
      const r = t.run([], { STUB_PSQL_DIES: call });
      expect(r.status).not.toBe(0);
      expect(t.lastLine(r)).toBe(says);
      expect(r.stdout + r.stderr).not.toMatch(/planted|duplicate key/);
      expectNothingLeft(t);
    });
  }

  it("fails on any pg_restore error — none is ignored — naming its kind and count, never its text", () => {
    // An error line carries what it failed on: here a row's value in the line itself and another in its DETAIL.
    const t = setup({ files: { "restore.err": [
      'pg_restore: error: could not execute query: ERROR:  relation "users" already exists',
      'pg_restore: error: COPY failed for table "users": ERROR:  invalid input syntax for type uuid: "planted-in-the-line"',
      "DETAIL:  Key (id)=(planted-in-the-detail) exists.",
      "pg_restore: error: could not execute query: ERROR:  a shape nobody listed",
      'pg_restore: error: could not execute query: ERROR:  role "users" does not exist',
      "pg_restore: error: could not execute query: ERROR:  permission denied for schema users",
      "pg_restore: error: could not execute query: ERROR:  cannot drop table users because other objects depend on it",
      'pg_restore: error: could not execute query: ERROR:  insert or update on table "users" violates foreign key constraint "users_fk"',
      "pg_restore: error: could not read from input file: end of file",
      "pg_restore: error: error returned by PQputCopyData: server closed the connection unexpectedly",
      "pg_restore: warning: errors ignored on restore: 9",
    ].join("\n") } });
    const r = t.run([], { STUB_RESTORE_EXIT: "1" });
    expect(r.status).not.toBe(0);
    expect(r.stdout + r.stderr).not.toMatch(/planted|users|nobody listed/); // not one word of the raw error text
    expect(r.stdout).toMatch(/^RESTORE_ERRORS already_exists=1 archive_unreadable=1 connection_lost=1 constraint_violated=1 copy_failed=1 dependency=1 does_not_exist=1 other=1 permission_denied=1$/m);
    expect(t.lastLine(r)).toMatch(/^RESTORE_DRILL_FAIL pg_restore exited 1 with 9 errors/);
    expectNothingLeft(t); // and no file that held it
  });

  it("fails on an error line even when pg_restore itself exits 0", () => {
    const t = setup({ files: { "restore.err": "pg_restore: error: could not execute query: ERROR:  x\n" } });
    const r = t.run();
    expect(r.status).not.toBe(0);
    expect(t.lastLine(r)).toMatch(/^RESTORE_DRILL_FAIL pg_restore exited 0 with 1 error/);
  });

  it("fails when the restored copy answers with something that is not an inventory", () => {
    const t = setup({ files: { "inventory.restored": '{"inventory": null}\n' } });
    expect(t.lastLine(t.run())).toBe("RESTORE_DRILL_FAIL what the restored copy answered is not an inventory");
  });
});

describe("restore-drill.sh — nothing of the company's data is left behind", () => {
  // What goes wrong in the cleanup · the stub's setting · which of the two stays: the container, or the directory.
  const leftovers: [string, Record<string, string>, "container" | "workdir"][] = [
    ["docker rm fails", { STUB_RM_EXIT: "1" }, "container"],
    ["docker rm says done and the container still stands", { STUB_RM_EXIT: "0" }, "container"],
    ["the working directory cannot be removed", { STUB_WORKDIR_RM_EXIT: "1" }, "workdir"],
    ["rm says done and the working directory still stands", { STUB_WORKDIR_RM_EXIT: "0" }, "workdir"],
  ];
  for (const [what, env, stays] of leftovers) {
    it(`a good restore is not called OK when ${what}: LEFTOVER, non-zero, and the other removal still done`, () => {
      const t = setup();
      const r = t.run([], env);
      expect(r.status).not.toBe(0);
      expect(r.stdout).not.toContain("RESTORE_DRILL_OK");
      expect(r.stdout).toContain(COMPARED_EQUAL); // the restore itself was good
      expect(t.removed()).toEqual(REMOVED_BY_ID); // asked in every case …
      expect(t.containerStands()).toBe(stays === "container"); // … and done unless docker is the one failing
      const dirs = t.workdirs();
      expect(dirs).toHaveLength(stays === "workdir" ? 1 : 0);
      for (const d of dirs) expect(statSync(d).mode & 0o777).toBe(0o700); // what does stay is the owner's alone
      expect(t.lastLine(r)).toBe(`RESTORE_DRILL_LEFTOVER ${stays === "container" ? `the container ${OWN_ID}` : `the working directory ${dirs[0]}`}`);
    });
  }

  // A container docker does not list is never removed — and never taken for gone.
  const unlisted: [string, string, (name: string) => string][] = [
    ["docker does not answer", "1", () => "a container, perhaps: docker did not answer"],
    ["docker lists nothing under the run's label", "0", (name) => `the container ${name}`],
  ];
  for (const [what, listingExit, left] of unlisted) {
    it(`a good restore is not called OK when ${what} while its container stands`, () => {
      const t = setup();
      const r = t.run([], { STUB_LISTING_EXIT: listingExit });
      expect(r.status).not.toBe(0);
      expect(r.stdout).not.toContain("RESTORE_DRILL_OK");
      expect(t.containerStands()).toBe(true);
      expect(t.lastLine(r)).toBe(`RESTORE_DRILL_LEFTOVER ${left(t.name())}`);
    });
  }

  it("removes the container when its start fails after it was created", () => {
    const t = setup();
    const r = t.run([], { STUB_START_EXIT: "1" });
    expect(r.status).not.toBe(0);
    expectNothingLeft(t);
    expect(t.calls().filter((c) => c.startsWith("exec"))).toEqual([]);
    expect(t.lastLine(r)).toBe("RESTORE_DRILL_FAIL docker start failed");
  });

  it("cleans up when a signal stops it in the middle of the restore", async () => {
    const t = setup();
    const drill = spawn("bash", [DRILL], { env: t.env({ STUB_RESTORE_HOLDS: "1" }) });
    let stdout = "";
    drill.stdout.on("data", (chunk) => { stdout += chunk; });
    await vi.waitFor(() => expect(existsSync(join(t.dir, "restoring"))).toBe(true), { timeout: 10_000, interval: 20 });
    drill.kill("SIGTERM");
    const status = await new Promise((done) => drill.on("close", done));
    expect(status).not.toBe(0);
    expectNothingLeft(t);
    expect(t.lastLine({ stdout })).toBe("RESTORE_DRILL_FAIL stopped by a signal");
  });
});
