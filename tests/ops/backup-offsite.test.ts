// B72 — THE NIGHT LEAVES THE MACHINE ENCRYPTED, AND IS PROVEN WHERE IT LANDED. The off-site leg of
// scripts/backup/laptop-pg-dump.sh: the set's three files travel as ONE file, a tar encrypted on this machine to a
// public key, and land as the one asset of a GitHub release named after the night. These tests drive the real job
// on the fakes of tests/ops/backup-fakes.ts: `gh` is a fake that keeps its GitHub in a folder, gpg is the real one
// on a throwaway key pair — so a test opens what was shipped with the private half and looks inside. The local set
// is in tests/ops/backup-job.test.ts.
import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { day, DEST, FAR_REPO, GLOBALS, GOOD, GOOD_NIGHT, LEAK, ROOT, runLine, setup, TODAY, TOKEN, unseal, type Run } from "./backup-fakes";

type Bench = ReturnType<typeof setup>;
const STEM = `dxb-laptop-${TODAY}`;
const UNPROVEN = runLine(`local=ok offsite=fail prune=skipped bytes=${GOOD.length}`, 1);
const failedOffsite = (reason: string) => [GOOD_NIGHT[0], `OFFSITE_FAIL ${TODAY} ${reason}`, UNPROVEN];
const calls = (t: Bench) => t.log("gh.log").trim().split("\n").filter(Boolean);
/** Nothing gh said, nothing it was told and nothing it holds is in what the run printed or logged. */
const saysNothingOfGh = (t: Bench, r: Run) => {
  for (const planted of [LEAK, FAR_REPO, TOKEN]) expect(r.stdout + r.stderr + t.backupLog()).not.toContain(planted);
};

describe("laptop-pg-dump.sh — the off-site copy", () => {
  it("ships the night as one encrypted file that opens to exactly the set's three files, as the one asset of the night's release", () => {
    const t = setup();
    const r = t.run(DEST);
    expect(r.status, r.stdout + r.stderr).toBe(0);
    expect(t.lines(r)).toEqual(GOOD_NIGHT);
    expect(t.far.releases()).toEqual([STEM]);
    expect(t.far.tags()).toEqual([STEM]);
    expect(readdirSync(dirname(t.far.asset()))).toEqual([`${STEM}.set.tar.gpg`]);
    expect(unseal(t.far.asset())).toEqual({
      [`${STEM}.dump`]: GOOD, [`${STEM}.globals.sql`]: GLOBALS, [`${STEM}.manifest.json`]: readFileSync(`${t.tonight}.manifest.json`, "utf8"),
    });
    expect(readFileSync(t.far.asset(), "latin1")).not.toContain("PGDMP"); // what left the machine cannot be read as it is
    expect(t.files()).toEqual(t.tonightSet); // neither the encrypted file nor the copy read back is left lying
    saysNothingOfGh(t, r);
  });

  it("finds the public key where it is told to, when the default place holds none", () => {
    const t = setup();
    const elsewhere = join(t.dir, "a-key-kept-elsewhere.asc");
    writeFileSync(elsewhere, readFileSync(t.publicKey));
    rmSync(t.publicKey);
    const r = t.run({ ...DEST, BACKUP_PUBLIC_KEY: elsewhere });
    expect(r.status, r.stdout + r.stderr).toBe(0);
    expect(Object.keys(unseal(t.far.asset()))).toHaveLength(3);
  });

  it("encrypts in a gpg home of its own: the user's gpg settings do not decide the night", () => {
    const t = setup();
    mkdirSync(join(t.home, ".gnupg"), { mode: 0o700 });
    writeFileSync(join(t.home, ".gnupg/gpg.conf"), "a-line-gpg-does-not-know\n");
    const r = t.run(DEST);
    expect(r.status, r.stdout + r.stderr).toBe(0);
    expect(Object.keys(unseal(t.far.asset()))).toHaveLength(3);
  });

  const UNSEALED: [string, (t: Bench) => void, RegExp][] = [
    ["there is no public key", (t) => rmSync(t.publicKey), /^the public key cannot be read$/],
    ["the public key's file is no key", (t) => writeFileSync(t.publicKey, "not a key\n"), /^the set could not be encrypted \(tar and gpg exited \d+ [1-9]\d*\)$/],
  ];
  for (const [what, spoil, reason] of UNSEALED) {
    it(`sends nothing at all when ${what}: OFFSITE_FAIL, and gh was never called`, () => {
      const t = setup();
      spoil(t);
      const r = t.run(DEST);
      expect(r.status).not.toBe(0);
      const [ok, failed, last] = t.lines(r);
      expect([ok, last]).toEqual([GOOD_NIGHT[0], UNPROVEN]);
      expect(failed.replace(`OFFSITE_FAIL ${TODAY} `, "")).toMatch(reason);
      expect(calls(t)).toEqual([]); // never a plain upload — never any call
      expect(t.far.releases()).toEqual([]);
      expect(t.files()).toEqual(t.tonightSet); // the local set stands
    });
  }

  const UNLANDED: [string, string, string][] = [
    ["the upload is refused", "down", "the upload failed (gh exited 1)"],
    ["the far side took the file and kept nothing", "lost", "the copy could not be read back (gh exited 1)"],
    ["the copy read back is not what was sent", "corrupt", "the copy read back is not what was sent"],
  ];
  for (const [what, mode, reason] of UNLANDED) {
    it(`says OFFSITE_FAIL with one fixed reason and exits non-zero when ${what}; the local set is kept`, () => {
      const t = setup();
      const r = t.run({ ...DEST, STUB_GH: mode });
      expect(r.status).not.toBe(0);
      expect(t.lines(r)).toEqual(failedOffsite(reason));
      expect(t.files()).toEqual(t.tonightSet);
      saysNothingOfGh(t, r);
    });
  }

  it("cuts off a call to gh that outlasts BACKUP_GH_WAIT_SECONDS, and says the night did not land", () => {
    const t = setup();
    const r = t.run({ ...DEST, STUB_GH: "slow", BACKUP_GH_WAIT_SECONDS: "1" });
    expect(r.status).not.toBe(0);
    expect(t.lines(r)).toEqual(failedOffsite("the upload failed (gh exited 124)"));
  });

  it("says so, in words of its own, when gh holds no login — and asks gh for nothing else", () => {
    const t = setup();
    const r = t.run({ ...DEST, STUB_GH: "logged-out" });
    expect(r.status).not.toBe(0);
    expect(t.lines(r)).toEqual(failedOffsite("gh is not logged in to github.com (gh exited 1)"));
    expect(calls(t)).toEqual(["auth token -h github.com"]); // `gh auth status` exits 0 either way: it is not what is asked
    saysNothingOfGh(t, r);
  });

  it("replaces the night's one asset on a same-day re-run, and proves the new one", () => {
    const t = setup();
    expect(t.run(DEST).status).toBe(0);
    const first = readFileSync(t.far.asset());
    const LATER = "PGDMP a later archive of tonight\nPGDMP-END\n";
    writeFileSync(join(t.dir, "payload/good.dump"), LATER);
    const r = t.run(DEST);
    expect(r.status, r.stdout + r.stderr).toBe(0);
    expect(t.lines(r)).toEqual([`BACKUP_OK ${TODAY} ${LATER.length} bytes`, `OFFSITE_OK ${TODAY}`, runLine(`local=ok offsite=ok prune=ok bytes=${LATER.length}`, 0)]);
    expect(t.far.releases()).toEqual([STEM]);
    expect(readdirSync(dirname(t.far.asset()))).toEqual([`${STEM}.set.tar.gpg`]);
    expect(readFileSync(t.far.asset()).equals(first)).toBe(false);
    expect(unseal(t.far.asset())[`${STEM}.dump`]).toBe(LATER);
  });

  it("fails a same-day re-run whose copy does not land, like any other night", () => {
    const t = setup();
    expect(t.run(DEST).status).toBe(0);
    const r = t.run({ ...DEST, STUB_GH: "corrupt" });
    expect(r.status).not.toBe(0);
    expect(t.lines(r)).toEqual(failedOffsite("the copy read back is not what was sent"));
  });

  for (const [what, extra] of [["no destination is set", {}], ["the destination is set empty", { BACKUP_DEST: "" }]] as const) {
    it(`treats "${what}" as a failure that is said, never as a skip`, () => {
      const t = setup();
      const r = t.run(extra);
      expect(r.status).not.toBe(0);
      expect(t.lines(r)).toEqual([GOOD_NIGHT[0], `OFFSITE_FAIL ${TODAY} no destination set (BACKUP_DEST)`, runLine(`local=ok offsite=unset prune=skipped bytes=${GOOD.length}`, 1)]);
      expect(calls(t)).toEqual([]); // it did not fall back to an address of its own
    });
  }

  const UNKNOWN: [string, string, string][] = [
    ["of a kind it has no way to verify", "somewhere-without-a-kind", "no known kind of destination (BACKUP_DEST)"],
    ["that names no repository", "github:only-an-owner", "the destination is not github:<owner>/<repo>"],
  ];
  for (const [what, destination, reason] of UNKNOWN) {
    it(`refuses a destination ${what}, and does not repeat it in the log`, () => {
      const t = setup();
      const r = t.run({ BACKUP_DEST: destination });
      expect(r.status).not.toBe(0);
      expect(t.lines(r)).toEqual(failedOffsite(reason));
      expect(r.stdout + t.backupLog()).not.toContain(destination.replace("github:", ""));
      expect(calls(t)).toEqual([]);
    });
  }
});

describe("laptop-pg-dump.sh — its off-site half is a file beside it", () => {
  it("says so and does nothing when scripts/backup/offsite-github.sh is not there", () => {
    const t = setup();
    const alone = join(t.dir, "the-job-alone");
    mkdirSync(alone);
    for (const name of ["laptop-pg-dump.sh", "inventory.sql"]) copyFileSync(join(ROOT, "scripts/backup", name), join(alone, name));
    const r = t.script(join(alone, "laptop-pg-dump.sh"))(DEST);
    expect(r.status).not.toBe(0);
    expect(t.lines(r)).toEqual([`BACKUP_FAIL ${TODAY} offsite-github.sh is not beside the job`, runLine("local=fail offsite=fail prune=skipped bytes=0", 1)]);
    expect(t.backupLog()).toBe(r.stdout); // the log holds the reason too, not the journal alone
    expect(t.log("docker.log")).toBe("");
  });
});

describe("laptop-pg-dump.sh — pruning the far side", () => {
  it("on a proven night deletes the releases of nights older than 90 days with their tags, and nothing else", () => {
    const t = setup();
    for (const daysAgo of [200, 91]) t.far.night(daysAgo);
    const kept = [t.far.night(90), t.far.night(4), t.far.release("v1.0-not-a-night"), STEM].sort();
    const r = t.run(DEST);
    expect(r.status, r.stdout + r.stderr).toBe(0);
    expect(t.lines(r)).toEqual(GOOD_NIGHT);
    expect(t.far.releases()).toEqual(kept);
    expect(t.far.tags()).toEqual(kept);
  });

  it("keeps the far side as long as BACKUP_OFFSITE_RETENTION_DAYS says, whatever the local retention is", () => {
    const t = setup();
    t.far.night(40);
    const kept = [t.far.night(20), STEM].sort();
    expect(t.run({ ...DEST, BACKUP_OFFSITE_RETENTION_DAYS: "30", BACKUP_RETENTION_DAYS: "2" }).status).toBe(0);
    expect(t.far.releases()).toEqual(kept);
  });

  it("reaches an old night that stands behind more releases than gh lists when it is not told how many", () => {
    const t = setup();
    for (let daysAgo = 1; daysAgo <= 31; daysAgo++) t.far.night(daysAgo);
    const old = t.far.night(200);
    expect(t.run(DEST).status).toBe(0);
    expect(t.far.releases()).not.toContain(old);
    expect(t.far.releases()).toHaveLength(32); // the 31 young nights and tonight's
  });

  it("never deletes tonight's release, whatever the retention", () => {
    const t = setup();
    t.far.night(1);
    expect(t.run({ ...DEST, BACKUP_OFFSITE_RETENTION_DAYS: "0" }).status).toBe(0);
    expect(t.far.releases()).toEqual([STEM]);
    expect(t.far.tags()).toEqual([STEM]);
  });

  const NOT_PROVEN: [string, Record<string, string>][] = [
    ["the upload is refused", { STUB_GH: "down" }],
    ["the far side kept nothing", { STUB_GH: "lost" }],
    ["the copy read back is not what was sent", { STUB_GH: "corrupt" }],
    ["gh holds no login", { STUB_GH: "logged-out" }],
    ["the dump failed", { STUB_DUMP: "empty" }],
  ];
  for (const [what, mode] of NOT_PROVEN) {
    it(`leaves every old release where it is on a night when ${what}`, () => {
      const t = setup();
      const old = [t.far.night(200), t.far.night(120)].sort();
      const r = t.run({ ...DEST, ...mode });
      expect(r.status).not.toBe(0);
      expect(t.lastLine(r)).toContain(" prune=skipped ");
      expect(t.far.releases().filter((tag) => tag !== STEM)).toEqual(old);
      expect(calls(t).filter((call) => /^release (list|delete)/.test(call))).toEqual([]); // it did not even look
    });
  }

  const FAR_PRUNE_FAILS: [string, Record<string, string>, string][] = [
    ["an old release cannot be deleted", { STUB_GH: "no-delete" }, "an old release could not be deleted (gh exited 1)"],
    ["the releases cannot be listed", { STUB_GH: "no-list" }, "the releases could not be listed (gh exited 1)"],
    ["the far retention is not a number of days", { BACKUP_OFFSITE_RETENTION_DAYS: "ninety" }, "the retention is not a number of days"],
  ];
  for (const [what, mode, reason] of FAR_PRUNE_FAILS) {
    it(`says PRUNE_FAIL and exits non-zero when ${what} — tonight's copy stands, and this machine's old sets are pruned all the same`, () => {
      const t = setup();
      const old = t.far.night(200);
      t.earlier(40);
      const r = t.run({ ...DEST, ...mode });
      expect(r.status).not.toBe(0);
      expect(t.lines(r)).toEqual([GOOD_NIGHT[0], GOOD_NIGHT[1], `PRUNE_FAIL ${TODAY} github ${reason}`, runLine(`local=ok offsite=ok prune=fail bytes=${GOOD.length}`, 1)]);
      expect(t.far.releases()).toEqual([old, STEM].sort());
      expect(t.files()).toEqual(t.tonightSet);
      saysNothingOfGh(t, r);
    });
  }

  it("prunes the far side all the same when an old set on this machine cannot be removed", () => {
    const t = setup();
    t.far.night(200);
    const stuck = join(t.backups, `dxb-laptop-${day(40)}.dump`); // a folder that is not empty cannot be removed as a file
    mkdirSync(stuck);
    writeFileSync(join(stuck, "held"), "x");
    const r = t.run(DEST);
    expect(r.status).not.toBe(0);
    expect(r.stdout).toContain(`PRUNE_FAIL ${TODAY} local`);
    expect(t.far.releases()).toEqual([STEM]);
  });
});
