// B72 — THE BACKUP TELLS THE TRUTH. Measured 2026-11-22: the nightly job had exited 0 for 55 nights while its
// off-site copy failed every one of them (`scp … && echo OFFSITE_OK` under `set -e`), and on the 22nd it left a
// 0-byte file under a backup's name because it dumped before the database accepted connections. These tests
// drive the real scripts/backup/laptop-pg-dump.sh on the fakes of tests/ops/backup-fakes.ts. One night's backup
// is a SET of three files (.planning/quick/20261122-b72-yedek/SET-CONTRACT.md). The alert and the units are in
// tests/ops/backup-alert.test.ts.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, utimesSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { day, GLOBALS, GOOD, INVENTORY, LEAK, NEVER, runLine, setup, sha256, SNAPSHOT, TODAY } from "./backup-fakes";

const DEST = { BACKUP_DEST: "box:dumps" };
const NO_SET = runLine("local=fail offsite=fail prune=skipped bytes=0", 1);
const GOOD_NIGHT = [`BACKUP_OK ${TODAY} ${GOOD.length} bytes`, `OFFSITE_OK ${TODAY}`, runLine(`local=ok offsite=ok prune=ok bytes=${GOOD.length}`, 0)];

describe("laptop-pg-dump.sh — the local set", () => {
  it("waits for a database that is not yet accepting connections, says it waited, then dumps", () => {
    const t = setup();
    const r = t.run({ ...DEST, STUB_READY_AFTER: "3" });
    expect(r.status, r.stdout + r.stderr).toBe(0);
    expect(r.stdout).toMatch(new RegExp(`^BACKUP_WAIT ${TODAY} database accepted connections after \\d+s$`, "m"));
    expect(t.log("sleep.log").trim().split("\n")).toHaveLength(3);
    expect(readFileSync(`${t.tonight}.dump`, "utf8")).toBe(GOOD);
  });

  it("says nothing about waiting when the database answered at once", () => {
    const t = setup();
    const r = t.run(DEST);
    expect(r.status, r.stdout + r.stderr).toBe(0);
    expect(r.stdout).not.toContain("BACKUP_WAIT");
    expect(t.log("sleep.log")).toBe("");
  });

  it("fails with one clear line when the wait runs out, and leaves no file behind", () => {
    const t = setup();
    const r = t.run({ ...DEST, STUB_READY_AFTER: NEVER, BACKUP_DB_WAIT_SECONDS: "20" });
    expect(r.status).not.toBe(0);
    expect(r.stdout.match(/^BACKUP_FAIL .*$/gm)).toEqual([`BACKUP_FAIL ${TODAY} database not accepting connections after 20s`]);
    expect(t.files()).toEqual([]);
    expect(t.log("docker.log")).not.toContain("pg_dump"); // it never dumped into the void
    expect(t.lastLine(r)).toBe(NO_SET);
  });

  it("writes the night as a set of three: the dump on the snapshot the inventory was counted in, the globals, the manifest last", () => {
    const t = setup();
    const r = t.run(DEST);
    expect(r.status, r.stdout + r.stderr).toBe(0);
    expect(t.lines(r)).toEqual(GOOD_NIGHT);
    expect(t.files()).toEqual(t.tonightSet); // and nothing of the run's own is left lying
    const calls = t.log("docker.log").trim().split("\n").map((call) => call.replace(/^exec (-i )?\S+ /, ""));
    // the fake hands the snapshot out only in a read-only REPEATABLE READ transaction and lets pg_dump have it only
    // while that session is open; the inventory it gives only to scripts/backup/inventory.sql itself
    expect(calls).toContain(`pg_dump -U postgres -d postgres -Fc --snapshot=${SNAPSHOT}`);
    expect(calls).toContain("pg_restore -f /dev/null"); // the FULL read
    expect(t.log("docker.log")).not.toContain("--list");
    expect(calls).toContain("pg_dumpall -U postgres --globals-only --no-role-passwords");
    expect(t.log("mv.log").trim().split("\n")).toEqual(t.tonightSet); // the manifest takes its name last
    expect(readFileSync(`${t.tonight}.dump`, "utf8")).toBe(GOOD);
    expect(readFileSync(`${t.tonight}.globals.sql`, "utf8")).toBe(GLOBALS);
    const manifest = JSON.parse(readFileSync(`${t.tonight}.manifest.json`, "utf8"));
    expect(manifest.taken_at).toMatch(new RegExp(`^${TODAY}T\\d\\d:\\d\\d:\\d\\d[+-]\\d\\d:\\d\\d$`));
    expect(manifest).toEqual({
      format: 1, stem: `dxb-laptop-${TODAY}`, taken_at: manifest.taken_at, server_version: "17.6",
      dump_bytes: GOOD.length, dump_sha256: sha256(GOOD), globals_sha256: sha256(GLOBALS),
      inventory: INVENTORY.inventory, excluded: INVENTORY.excluded,
    });
  });

  const REFUSED: [string, Record<string, string>, string][] = [
    ["an empty dump", { STUB_DUMP: "empty" }, "empty dump"],
    ["a dump that is not an archive", { STUB_DUMP: "garbage" }, "dump is not a readable archive"],
    ["an archive with a valid head that is cut short", { STUB_DUMP: "cut" }, "dump is not a readable archive"],
    ["a pg_dump that died mid-way", { STUB_DUMP: "dies" }, "pg_dump exited 1"],
    ["a company that gives no session", { STUB_SESSION: "refused" }, "the snapshot could not be exported (psql exited 2)"],
    ["an inventory that fails", { STUB_SESSION: "no-inventory" }, "the inventory could not be taken (psql exited 3)"],
    ["an inventory that is not the document", { STUB_SESSION: "not-json" }, "the inventory is not the document the manifest needs"],
    ["a pg_dumpall that died", { STUB_GLOBALS: "dies" }, "pg_dumpall exited 1"],
    ["a globals file without its end", { STUB_GLOBALS: "cut" }, "the globals file is not complete"],
    ["a globals file that carries a password", { STUB_GLOBALS: "password" }, "the globals file carries a password"],
  ];
  for (const [what, mode, reason] of REFUSED) {
    it(`refuses ${what}: one fixed reason, no tool's own words, and every earlier set untouched`, () => {
      const t = setup();
      t.earlier(2);
      t.earlier(0); // an earlier good run of today
      const before = t.everything();
      const r = t.run({ ...DEST, ...mode });
      expect(r.status).not.toBe(0);
      expect(t.lines(r)).toEqual([`BACKUP_FAIL ${TODAY} ${reason}`, `OFFSITE_FAIL ${TODAY} no dump of tonight to copy`, NO_SET]);
      expect(t.everything()).toEqual(before); // a bad run never overwrites a good one, and leaves nothing of its own
      expect(r.stdout + r.stderr + t.backupLog()).not.toContain(LEAK);
      expect(t.log("scp.log")).toBe(""); // what failed tonight is not what goes off-site
    });
  }

  it("leaves no file at all when the first dump of the day fails", () => {
    const t = setup();
    expect(t.run({ ...DEST, STUB_DUMP: "empty" }).status).not.toBe(0);
    expect(t.files()).toEqual([]);
  });

  it("does not call an earlier run's set tonight's when the new dump cannot take its name", () => {
    const t = setup();
    t.earlier(0);
    t.earlier(40);
    const before = t.everything();
    const r = t.run({ ...DEST, STUB_MV_FAIL: ".dump" });
    expect(r.status).not.toBe(0);
    expect(t.lines(r)).toEqual([`BACKUP_FAIL ${TODAY} the set could not take its names`, `OFFSITE_FAIL ${TODAY} no dump of tonight to copy`, NO_SET]);
    expect(t.log("scp.log")).toBe(""); // the earlier run's dump did not travel as tonight's
    expect(t.everything()).toEqual(before); // nothing was replaced, and nothing was pruned
  });

  it("does not take a move's word for it: an earlier run's dump left standing under tonight's name is not called tonight's", () => {
    const t = setup();
    t.earlier(0);
    const r = t.run({ ...DEST, STUB_MV_LIES: ".dump" });
    expect(r.status).not.toBe(0);
    expect(t.lines(r)).toEqual([`BACKUP_FAIL ${TODAY} what stands under tonight's names is not this run's set`, `OFFSITE_FAIL ${TODAY} no dump of tonight to copy`, NO_SET]);
    expect(t.log("scp.log")).toBe("");
    expect(t.files()).toEqual([]); // a dump of one run beside the manifest of another is no set
  });

  it("leaves no half of a set under a backup's name when the manifest cannot take its name", () => {
    const t = setup();
    t.earlier(40);
    const r = t.run({ ...DEST, STUB_MV_FAIL: ".manifest.json" });
    expect(r.status).not.toBe(0);
    expect(r.stdout).not.toMatch(/BACKUP_OK|OFFSITE_OK/);
    expect(t.lastLine(r)).toBe(NO_SET);
    expect(t.files()).toEqual([`dxb-laptop-${day(40)}.dump`, `dxb-laptop-${day(40)}.globals.sql`, `dxb-laptop-${day(40)}.manifest.json`]);
  });
});

describe("laptop-pg-dump.sh — one run at a time, and its leftovers", () => {
  it("fails a second call at once while the first still runs, and the second touches no file", async () => {
    const t = setup();
    execFileSync("mkfifo", [join(t.dir, "gate")]);
    const first = t.start({ ...DEST, STUB_DUMP: "held" }); // its pg_dump waits at the gate
    await expect.poll(() => existsSync(join(t.dir, "dump.started")), { timeout: 10_000 }).toBe(true);
    const before = t.everything();
    const second = t.run(DEST);
    expect(second.status).not.toBe(0);
    expect(t.lines(second)).toEqual([`BACKUP_FAIL ${TODAY} another run holds the lock`, NO_SET]);
    expect(t.everything()).toEqual(before);
    writeFileSync(join(t.dir, "gate"), ""); // the gate opens
    const ended = await first.done;
    expect(ended.status, ended.stdout).toBe(0);
    expect(t.lines(ended)).toEqual(GOOD_NIGHT);
    expect(t.files()).toEqual(t.tonightSet);
    expect(readFileSync(`${t.tonight}.dump`, "utf8")).toBe(GOOD);
  });

  it("sweeps what a dead run left more than a day ago, on any night, and leaves a younger one alone", () => {
    const t = setup();
    const aged = (name: string, hours: number, folder = false) => {
      if (folder) { mkdirSync(join(t.backups, name)); writeFileSync(join(t.backups, name, "dump"), "PGDMP half"); } else writeFileSync(join(t.backups, name), "PGDMP half");
      const at = new Date(Date.now() - hours * 3_600_000);
      utimesSync(join(t.backups, name), at, at);
    };
    aged(".dxb-backup-run.dead01", 50, true);
    aged("dxb-laptop-2026-11-20.dump.partial", 50); // the name the job wrote under until 2026-11-22
    aged(".dxb-backup-run.young1", 2, true);
    expect(t.run({ ...DEST, STUB_DUMP: "empty" }).status).not.toBe(0);
    expect(t.files()).toEqual([".dxb-backup-run.young1"]);
  });
});

describe("laptop-pg-dump.sh — its own log", () => {
  it("appends every line it says to backup.log itself, and its last line carries the invocation", () => {
    const t = setup();
    writeFileSync(join(t.backups, "backup.log"), "an earlier night\n");
    const r = t.run({ ...DEST, INVOCATION_ID: "0a1b2c3d4e5f60718293a4b5c6d7e8f9" });
    expect(r.status, r.stdout + r.stderr).toBe(0);
    expect(t.lastLine(r)).toBe(`BACKUP_RUN ${TODAY} invocation=0a1b2c3d4e5f60718293a4b5c6d7e8f9 local=ok offsite=ok prune=ok bytes=${GOOD.length} exit=0`);
    expect(t.backupLog()).toBe(`an earlier night\n${r.stdout}`);
  });

  it("still does the night's work when backup.log cannot be opened", () => {
    const t = setup();
    mkdirSync(join(t.backups, "backup.log"));
    const r = t.run(DEST);
    expect(r.status, r.stdout + r.stderr).toBe(0);
    expect(t.lines(r)).toEqual(GOOD_NIGHT);
  });

  it("says so and fails when the backup folder itself cannot be made", () => {
    const t = setup();
    writeFileSync(join(t.dir, "in-the-way"), "");
    const r = t.run({ ...DEST, BACKUP_DIR: join(t.dir, "in-the-way", "backups") });
    expect(r.status).not.toBe(0);
    expect(t.lines(r)).toEqual([`BACKUP_FAIL ${TODAY} the backup folder cannot be made`, NO_SET]);
    expect(t.log("docker.log")).toBe("");
  });
});

describe("laptop-pg-dump.sh — the off-site copy", () => {
  it("exits 0 only when the set is proven and the copy was read back identical; the last line says so", () => {
    const t = setup();
    const r = t.run(DEST);
    expect(r.status, r.stdout + r.stderr).toBe(0);
    expect(t.lines(r)).toEqual(GOOD_NIGHT);
    expect(readFileSync(join(t.dir, "remote/dumps", `dxb-laptop-${TODAY}.dump`), "utf8")).toBe(GOOD);
    expect(t.files()).toEqual(t.tonightSet); // the read-back copy is not left lying
  });

  for (const [what, mode] of [["the copy is refused", "down"], ["the destination took the copy and kept nothing", "lost"], ["the copy that landed is not the dump", "corrupt"]]) {
    it(`says OFFSITE_FAIL and exits non-zero when ${what}; the local set is kept`, () => {
      const t = setup();
      const r = t.run({ ...DEST, STUB_SCP: mode });
      expect(r.status).not.toBe(0);
      expect(r.stdout).toMatch(new RegExp(`^OFFSITE_FAIL ${TODAY} \\S`, "m"));
      expect(r.stdout).not.toContain("OFFSITE_OK");
      expect(readFileSync(`${t.tonight}.dump`, "utf8")).toBe(GOOD);
      expect(t.files()).toEqual(t.tonightSet);
      expect(t.lastLine(r)).toBe(runLine(`local=ok offsite=fail prune=skipped bytes=${GOOD.length}`, 1));
    });
  }

  for (const [what, extra] of [["no destination is set", {}], ["the destination is set empty", { BACKUP_DEST: "" }]] as const) {
    it(`treats "${what}" as a failure that is said, never as a skip`, () => {
      const t = setup();
      const r = t.run(extra);
      expect(r.status).not.toBe(0);
      expect(r.stdout).toMatch(new RegExp(`^OFFSITE_FAIL ${TODAY} no destination`, "m"));
      expect(t.log("scp.log")).toBe(""); // it did not fall back to an address of its own
      expect(readFileSync(`${t.tonight}.dump`, "utf8")).toBe(GOOD);
      expect(t.lastLine(r)).toBe(runLine(`local=ok offsite=unset prune=skipped bytes=${GOOD.length}`, 1));
    });
  }

  it("refuses a destination of a kind it has no way to verify", () => {
    const t = setup();
    const r = t.run({ BACKUP_DEST: "somewhere-without-a-kind" });
    expect(r.status).not.toBe(0);
    expect(r.stdout).toMatch(new RegExp(`^OFFSITE_FAIL ${TODAY} .*somewhere-without-a-kind`, "m"));
    expect(t.log("scp.log")).toBe("");
  });
});

describe("laptop-pg-dump.sh — pruning", () => {
  it("on a night proven here and off-site removes whole sets older than the retention, and nothing else", () => {
    const t = setup();
    t.earlier(40);
    t.earlier(50, ["dump"]); // a night from before the set: a dump alone
    const kept = t.earlier(4);
    writeFileSync(join(t.backups, "dxb-b36-pre-separation-2026-08-23.dump"), "kept: not a nightly dump\n");
    utimesSync(join(t.backups, "dxb-b36-pre-separation-2026-08-23.dump"), new Date(0), new Date(0));
    expect(t.run({ ...DEST, BACKUP_RETENTION_DAYS: "14" }).status).toBe(0);
    expect(t.files()).toEqual(["dxb-b36-pre-separation-2026-08-23.dump", ...kept, ...t.tonightSet].sort());
  });

  it("never prunes tonight's proven set, whatever the retention", () => {
    const t = setup();
    t.earlier(1);
    expect(t.run({ ...DEST, BACKUP_RETENTION_DAYS: "0" }).status).toBe(0);
    expect(t.files()).toEqual(t.tonightSet);
  });

  const UNPROVEN: [string, Record<string, string>][] = [
    ["the off-site copy is refused", { ...DEST, STUB_SCP: "down" }],
    ["the off-site copy read back is not the dump", { ...DEST, STUB_SCP: "corrupt" }],
    ["there is no destination", {}],
    ["the dump failed", { ...DEST, STUB_DUMP: "empty" }],
    ["the database never answered", { ...DEST, STUB_READY_AFTER: NEVER, BACKUP_DB_WAIT_SECONDS: "10" }],
  ];
  for (const [what, extra] of UNPROVEN) {
    it(`prunes nothing on a night when ${what}: every old set stays, whatever its age`, () => {
      const t = setup();
      const old = [...t.earlier(80), ...t.earlier(40)];
      const r = t.run({ BACKUP_RETENTION_DAYS: "14", ...extra });
      expect(r.status).not.toBe(0);
      expect(t.lastLine(r)).toContain(" prune=skipped ");
      expect(t.files().filter((name) => !t.tonightSet.includes(name))).toEqual(old.sort());
    });
  }

  it("says PRUNE_FAIL and exits non-zero when an old copy cannot be removed — and the off-site copy still lands", () => {
    const t = setup();
    const stuck = join(t.backups, `dxb-laptop-${day(40)}.dump`); // a folder that is not empty cannot be removed as a file
    mkdirSync(stuck);
    writeFileSync(join(stuck, "held"), "x");
    const r = t.run(DEST);
    expect(r.status).not.toBe(0);
    expect(r.stdout).toContain(`PRUNE_FAIL ${TODAY}`);
    expect(r.stdout).toContain(`OFFSITE_OK ${TODAY}`);
    expect(t.lastLine(r)).toBe(runLine(`local=ok offsite=ok prune=fail bytes=${GOOD.length}`, 1));
  });
});
