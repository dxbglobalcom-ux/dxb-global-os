// B72 — THE BACKUP TELLS THE TRUTH. Measured 2026-11-22: the nightly job had exited 0 for 55 nights while its
// off-site copy failed every one of them (`scp … && echo OFFSITE_OK` under `set -e`), and on the 22nd it left a
// 0-byte file under a backup's name because it dumped before the database accepted connections. These tests
// drive the real scripts/backup/laptop-pg-dump.sh and backup-alert.sh; `docker`, `scp`, `sleep` and
// `notify-send` are stubs on PATH, the backup folder is a temporary one. No database and no network is touched.
import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const ROOT = resolve(__dirname, "../..");
const JOB = join(ROOT, "scripts/backup/laptop-pg-dump.sh");
const ALERT = join(ROOT, "scripts/backup/backup-alert.sh");
const TODAY = new Date().toLocaleDateString("sv-SE"); // YYYY-MM-DD in local time, as `date +%F`
const GOOD = "PGDMP good archive of tonight\n";
const NEVER = "999999";
const tmp: string[] = [];
afterAll(() => { for (const d of tmp) rmSync(d, { recursive: true, force: true }); });

// The stubs. docker answers `exec <container> <tool>` by tool: pg_isready is ready from the STUB_READY_AFTER-th
// probe on, pg_dump writes what STUB_DUMP says, pg_restore accepts only what starts like an archive. scp keeps
// its "remote" in a folder: STUB_SCP=down refuses the upload, =lost takes it and keeps nothing, =corrupt keeps
// a cut copy. Every call is recorded.
const DOCKER = `#!/usr/bin/env bash
echo "$*" >> "$STUB_DIR/docker.log"
[ "$1" = exec ] || exit 0
shift; while [ "\${1#-}" != "$1" ]; do shift; done; shift
case "$1" in
  pg_isready) n=$(cat "$STUB_DIR/probes" 2>/dev/null || echo 0); echo $((n + 1)) > "$STUB_DIR/probes"
              [ "$n" -ge "\${STUB_READY_AFTER:-0}" ] ;;
  pg_dump)    case "\${STUB_DUMP:-good}" in
                good) printf '${GOOD.replace("\n", "\\n")}' ;; empty) ;; garbage) printf 'not an archive\\n' ;;
                dies) printf 'PGDMP cut sho'; exit 1 ;;
              esac ;;
  pg_restore) head -c 5 | grep -q '^PGDMP' ;;
esac
`;
const SCP = `#!/usr/bin/env bash
echo "$*" >> "$STUB_DIR/scp.log"
paths=(); while [ $# -gt 0 ]; do case "$1" in -o) shift ;; -*) ;; *) paths+=("$1") ;; esac; shift; done
src="\${paths[0]}"; dst="\${paths[1]}"; mode="\${STUB_SCP:-ok}"
remote() { echo "$STUB_DIR/remote/\${1#*:}"; }
case "$src" in
  /*) [ "$mode" = down ] && { echo "scp: Connection closed" >&2; exit 255; }
      [ "$mode" = lost ] && exit 0
      mkdir -p "$(dirname "$(remote "$dst")")"
      if [ "$mode" = corrupt ]; then head -c 10 "$src" > "$(remote "$dst")"; else cp "$src" "$(remote "$dst")"; fi ;;
  *)  cp "$(remote "$src")" "$dst" ;;
esac
`;
const SLEEP = `#!/usr/bin/env bash
echo "$*" >> "$STUB_DIR/sleep.log"
`;
const NOTIFY = `#!/usr/bin/env bash
n=$(cat "$STUB_DIR/notify.tries" 2>/dev/null || echo 0); echo $((n + 1)) > "$STUB_DIR/notify.tries"
[ "$n" -ge "\${STUB_NOTIFY_AFTER:-0}" ] || exit 1
printf '%s\\n' "$@" > "$STUB_DIR/notify.args"
`;

function setup() {
  const dir = mkdtempSync(join(tmpdir(), "backupjob"));
  tmp.push(dir);
  const bin = join(dir, "bin");
  const backups = join(dir, "backups");
  mkdirSync(bin);
  mkdirSync(backups);
  for (const [name, body] of [["docker", DOCKER], ["scp", SCP], ["sleep", SLEEP], ["notify-send", NOTIFY]]) {
    writeFileSync(join(bin, name), body);
    chmodSync(join(bin, name), 0o755);
  }
  const env = (extra: Record<string, string>) => {
    const e: Record<string, string | undefined> = { ...process.env, PATH: `${bin}:${process.env.PATH}`, STUB_DIR: dir, BACKUP_DIR: backups, ...extra };
    if (!("BACKUP_DEST" in extra)) delete e.BACKUP_DEST; // the lead's shell must not decide a test
    return e as NodeJS.ProcessEnv;
  };
  const run = (extra: Record<string, string> = {}) => spawnSync("bash", [JOB], { encoding: "utf8", env: env(extra) });
  const alert = (extra: Record<string, string> = {}) => spawnSync("bash", [ALERT], { encoding: "utf8", env: env(extra) });
  /** A dump of an earlier night: its content, and its age in days. */
  const earlier = (date: string, daysOld: number, content = `PGDMP the night of ${date}\n`) => {
    const f = join(backups, `dxb-laptop-${date}.dump`);
    writeFileSync(f, content);
    const t = new Date(Date.now() - daysOld * 86_400_000);
    utimesSync(f, t, t);
    return f;
  };
  const tonight = join(backups, `dxb-laptop-${TODAY}.dump`);
  const files = () => readdirSync(backups).sort();
  const lastLine = (r: { stdout: string }) => r.stdout.trim().split("\n").pop();
  const log = (name: string) => (existsSync(join(dir, name)) ? readFileSync(join(dir, name), "utf8") : "");
  return { dir, backups, run, alert, earlier, tonight, files, lastLine, log };
}

const DEST = { BACKUP_DEST: "box:dumps" };

describe("laptop-pg-dump.sh — the local dump", () => {
  it("waits for a database that is not yet accepting connections, says it waited, then dumps", () => {
    const t = setup();
    const r = t.run({ ...DEST, STUB_READY_AFTER: "3" });
    expect(r.status, r.stdout + r.stderr).toBe(0);
    expect(r.stdout).toMatch(new RegExp(`^BACKUP_WAIT ${TODAY} database accepted connections after \\d+s$`, "m"));
    expect(t.log("sleep.log").trim().split("\n")).toHaveLength(3);
    expect(readFileSync(t.tonight, "utf8")).toBe(GOOD);
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
    expect(t.lastLine(r)).toBe(`BACKUP_RUN ${TODAY} local=fail offsite=fail prune=skipped bytes=0 exit=1`);
  });

  for (const [what, mode] of [["an empty dump", "empty"], ["a dump that is not a readable archive", "garbage"], ["a pg_dump that died mid-way", "dies"]]) {
    it(`refuses ${what}: nothing stands under a backup's name, earlier good dumps are untouched`, () => {
      const t = setup();
      const old = t.earlier("2026-11-20", 2);
      writeFileSync(t.tonight, "PGDMP an earlier good run today\n");
      const r = t.run({ ...DEST, STUB_DUMP: mode });
      expect(r.status).not.toBe(0);
      expect(r.stdout).toMatch(new RegExp(`^BACKUP_FAIL ${TODAY} `, "m"));
      expect(r.stdout).not.toContain("BACKUP_OK");
      expect(t.files()).toEqual(["dxb-laptop-2026-11-20.dump", `dxb-laptop-${TODAY}.dump`]); // no partial left
      expect(readFileSync(old, "utf8")).toBe("PGDMP the night of 2026-11-20\n");
      expect(readFileSync(t.tonight, "utf8")).toBe("PGDMP an earlier good run today\n"); // a bad run never overwrites a good one
      expect(t.lastLine(r)).toBe(`BACKUP_RUN ${TODAY} local=fail offsite=fail prune=skipped bytes=0 exit=1`);
      expect(t.log("scp.log")).toBe(""); // a dump that failed tonight is not what goes off-site
    });
  }

  it("leaves no file at all when the first dump of the day fails", () => {
    const t = setup();
    expect(t.run({ ...DEST, STUB_DUMP: "empty" }).status).not.toBe(0);
    expect(t.files()).toEqual([]);
  });
});

describe("laptop-pg-dump.sh — the off-site copy", () => {
  it("exits 0 only when the dump is proven and its copy was read back identical; the last line says so", () => {
    const t = setup();
    const r = t.run(DEST);
    expect(r.status, r.stdout + r.stderr).toBe(0);
    expect(r.stdout.trim().split("\n")).toEqual([
      `BACKUP_OK ${TODAY} ${GOOD.length} bytes`,
      `OFFSITE_OK ${TODAY}`,
      `BACKUP_RUN ${TODAY} local=ok offsite=ok prune=ok bytes=${GOOD.length} exit=0`,
    ]);
    expect(readFileSync(join(t.dir, "remote/dumps", `dxb-laptop-${TODAY}.dump`), "utf8")).toBe(GOOD);
    expect(t.files()).toEqual([`dxb-laptop-${TODAY}.dump`]); // the read-back copy is not left lying
  });

  for (const [what, mode] of [["the copy is refused", "down"], ["the destination took the copy and kept nothing", "lost"], ["the copy that landed is not the dump", "corrupt"]]) {
    it(`says OFFSITE_FAIL and exits non-zero when ${what}; the local dump is kept`, () => {
      const t = setup();
      const r = t.run({ ...DEST, STUB_SCP: mode });
      expect(r.status).not.toBe(0);
      expect(r.stdout).toMatch(new RegExp(`^OFFSITE_FAIL ${TODAY} \\S`, "m"));
      expect(r.stdout).not.toContain("OFFSITE_OK");
      expect(readFileSync(t.tonight, "utf8")).toBe(GOOD);
      expect(t.files()).toEqual([`dxb-laptop-${TODAY}.dump`]);
      expect(t.lastLine(r)).toBe(`BACKUP_RUN ${TODAY} local=ok offsite=fail prune=ok bytes=${GOOD.length} exit=1`);
    });
  }

  for (const [what, extra] of [["no destination is set", {}], ["the destination is set empty", { BACKUP_DEST: "" }]] as const) {
    it(`treats "${what}" as a failure that is said, never as a skip`, () => {
      const t = setup();
      const r = t.run(extra);
      expect(r.status).not.toBe(0);
      expect(r.stdout).toMatch(new RegExp(`^OFFSITE_FAIL ${TODAY} no destination`, "m"));
      expect(t.log("scp.log")).toBe(""); // it did not fall back to an address of its own
      expect(readFileSync(t.tonight, "utf8")).toBe(GOOD);
      expect(t.lastLine(r)).toBe(`BACKUP_RUN ${TODAY} local=ok offsite=unset prune=ok bytes=${GOOD.length} exit=1`);
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
  it("on a good night removes what is older than the retention, and nothing else", () => {
    const t = setup();
    t.earlier("2026-10-01", 40);
    t.earlier("2026-11-18", 4);
    writeFileSync(join(t.backups, "dxb-b36-pre-separation-2026-08-23.dump"), "kept: not a nightly dump\n");
    utimesSync(join(t.backups, "dxb-b36-pre-separation-2026-08-23.dump"), new Date(0), new Date(0));
    expect(t.run({ ...DEST, BACKUP_RETENTION_DAYS: "14" }).status).toBe(0);
    expect(t.files()).toEqual(["dxb-b36-pre-separation-2026-08-23.dump", "dxb-laptop-2026-11-18.dump", `dxb-laptop-${TODAY}.dump`]);
  });

  it("still prunes on a night whose only failure is the off-site copy", () => {
    const t = setup();
    t.earlier("2026-10-01", 40);
    expect(t.run({ ...DEST, STUB_SCP: "down" }).status).not.toBe(0);
    expect(t.files()).toEqual([`dxb-laptop-${TODAY}.dump`]);
  });

  it("says PRUNE_FAIL and exits non-zero when an old copy cannot be removed — and the off-site copy still lands", () => {
    const t = setup();
    const stuck = join(t.backups, "dxb-laptop-2026-10-01.dump"); // find -delete cannot remove a folder that is not empty
    mkdirSync(stuck);
    writeFileSync(join(stuck, "held"), "x");
    utimesSync(stuck, new Date(0), new Date(0));
    const r = t.run(DEST);
    expect(r.status).not.toBe(0);
    expect(r.stdout).toContain(`PRUNE_FAIL ${TODAY}`);
    expect(r.stdout).toContain(`OFFSITE_OK ${TODAY}`);
    expect(t.lastLine(r)).toBe(`BACKUP_RUN ${TODAY} local=ok offsite=ok prune=fail bytes=${GOOD.length} exit=1`);
  });

  for (const [what, extra] of [["the dump failed", { STUB_DUMP: "empty" }], ["the database never answered", { STUB_READY_AFTER: NEVER, BACKUP_DB_WAIT_SECONDS: "10" }]] as const) {
    it(`does not prune on a night when ${what}: the newest good dump stays, whatever its age`, () => {
      const t = setup();
      t.earlier("2026-09-01", 80);
      const newestGood = t.earlier("2026-10-01", 40);
      const r = t.run({ ...DEST, BACKUP_RETENTION_DAYS: "14", ...extra });
      expect(r.status).not.toBe(0);
      expect(t.files()).toEqual(["dxb-laptop-2026-09-01.dump", "dxb-laptop-2026-10-01.dump"]);
      expect(readFileSync(newestGood, "utf8")).toBe("PGDMP the night of 2026-10-01\n");
    });
  }
});

describe("backup-alert.sh — the failure is said on the desktop", () => {
  const said = (t: ReturnType<typeof setup>) => t.log("notify.args");
  const withLog = (lines: string[]) => {
    const t = setup();
    writeFileSync(join(t.backups, "backup.log"), `${lines.join("\n")}\n`);
    return t;
  };

  it("names the local dump when that is the leg that failed, from the run's own last line", () => {
    const t = withLog([
      "BACKUP_RUN 2026-11-21 local=ok offsite=ok prune=ok bytes=5 exit=0",
      "BACKUP_FAIL 2026-11-22 empty dump",
      "BACKUP_RUN 2026-11-22 local=fail offsite=unset prune=skipped bytes=0 exit=1",
    ]);
    const r = t.alert();
    expect(r.status, r.stderr).toBe(0);
    expect(said(t)).toContain("critical");
    expect(said(t)).toContain("2026-11-22");
    expect(said(t)).toContain("yerel döküm");
    expect(said(t)).toContain("hedef"); // the unset destination is named too
  });

  it("names the off-site copy alone when the local dump is good", () => {
    const t = withLog(["BACKUP_RUN 2026-11-22 local=ok offsite=fail prune=ok bytes=5 exit=1"]);
    expect(t.alert().status).toBe(0);
    expect(said(t)).toContain("şirket dışı kopya");
    expect(said(t)).not.toContain("yerel döküm");
  });

  it("names the pruning when an old copy could not be removed", () => {
    const t = withLog(["BACKUP_RUN 2026-11-22 local=ok offsite=ok prune=fail bytes=5 exit=1"]);
    expect(t.alert().status).toBe(0);
    expect(said(t)).toContain("eski kopyalar silinemedi");
    expect(said(t)).not.toContain("şirket dışı kopya");
  });

  it("says the job died without its last line when the log does not carry a failed run", () => {
    const t = withLog(["BACKUP_RUN 2026-11-21 local=ok offsite=ok prune=ok bytes=5 exit=0"]);
    expect(t.alert().status).toBe(0);
    expect(said(t)).toContain("son satırını yazamadan");
    expect(said(t)).not.toContain("yerel döküm");
  });

  it("keeps trying while the desktop is not up yet, and fails itself when it never comes", () => {
    const t = withLog(["BACKUP_RUN 2026-11-22 local=fail offsite=fail prune=skipped bytes=0 exit=1"]);
    expect(t.alert({ STUB_NOTIFY_AFTER: "4" }).status).toBe(0);
    expect(said(t)).toContain("yerel döküm");
    const never = withLog(["BACKUP_RUN 2026-11-22 local=fail offsite=fail prune=skipped bytes=0 exit=1"]);
    expect(never.alert({ STUB_NOTIFY_AFTER: NEVER }).status).not.toBe(0);
    expect(said(never)).toBe("");
  });
});
