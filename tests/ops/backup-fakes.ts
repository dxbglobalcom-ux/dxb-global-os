// B72 — what the backup tests stand the real scripts on: a temporary backup folder and fakes of `docker`, `scp`,
// `sleep`, `mv`, `notify-send` and `systemctl` first on PATH. No database, no network and no systemd is touched.
// The fakes fail the way the real tools do where that is what a test is about; each says how beside its code.
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll } from "vitest";

export const ROOT = resolve(__dirname, "../..");
const JOB = join(ROOT, "scripts/backup/laptop-pg-dump.sh");
const ALERT = join(ROOT, "scripts/backup/backup-alert.sh");
const INSTALL = join(ROOT, "scripts/backup/install-units.sh");
export const INVENTORY_SQL = join(ROOT, "scripts/backup/inventory.sql");

/** YYYY-MM-DD in local time, as `date +%F`, `daysAgo` days back. */
export const day = (daysAgo = 0) => new Date(Date.now() - daysAgo * 86_400_000).toLocaleDateString("sv-SE");
export const TODAY = day();
export const NEVER = "999999";
export const sha256 = (content: string) => createHash("sha256").update(content).digest("hex");

/** An archive is a head and an end. CUT has the head only: `pg_restore --list` passes it, the full read does not. */
export const GOOD = "PGDMP good archive of tonight\nPGDMP-END\n";
const CUT = "PGDMP good archive of ton";
export const SNAPSHOT = "00000003-0000001B-1";
export const GLOBALS = "--\n-- PostgreSQL database cluster dump\n--\nCREATE ROLE dxb_reader;\nALTER ROLE dxb_reader WITH NOSUPERUSER LOGIN;\n--\n-- PostgreSQL database cluster dump complete\n--\n";
/** What inventory.sql answers with, as the fake session gives it. */
export const INVENTORY = {
  inventory: {
    tables: { "public.jobs": 3, "public.notes": 0 },
    sequences: { "public.jobs_id_seq": { last_value: 3, is_called: true } },
    large_objects: 0,
    extensions: { pgcrypto: "1.3" },
    roles: { dxb_reader: { login: true, member_of: [] } },
    acl_sha256: "0f".repeat(32),
  },
  excluded: [{ what: "net.queue", why: "extension-owned; pg_dump carries no rows of it" }],
};
/** What a tool's own error text could carry out of the company. No log may ever hold it. */
export const LEAK = "Key (email)=(someone@holding.example) already exists";

// docker answers `exec [-i] <container> <tool> …` by tool.
//   pg_isready  ready from the STUB_READY_AFTER-th probe on.
//   psql        ONE session. A request is everything up to a `\echo <mark>` line; it is answered, then the mark is
//               echoed. It hands out a snapshot only inside a REPEATABLE READ, READ ONLY transaction, and the
//               inventory only for a request that is scripts/backup/inventory.sql byte for byte.
//   pg_dump     as the real one, cannot import a snapshot that no open session holds.
//   pg_restore  as the real one: `--list` reads only the head; the full read (-f /dev/null) needs the end too.
//   pg_dumpall  writes a role's password unless it is told --no-role-passwords.
// Every tool that fails says LEAK on stderr first. Every call is recorded.
const DOCKER = `#!/usr/bin/env bash
echo "$*" >> "$STUB_DIR/docker.log"
[ "$1" = exec ] || exit 0
shift; while [ "\${1#-}" != "$1" ]; do shift; done; shift
tool="$1"; shift
give() { cat "$STUB_DIR/payload/$1"; }
leak() { echo "$STUB_LEAK" >&2; }
case "$tool" in
  pg_isready) n=$(cat "$STUB_DIR/probes" 2>/dev/null || echo 0); echo $((n + 1)) > "$STUB_DIR/probes"
              [ "$n" -ge "\${STUB_READY_AFTER:-0}" ] ;;
  psql) mode="\${STUB_SESSION:-ok}"; request="$STUB_DIR/request"; : > "$request"
        [ "$mode" = refused ] && { leak; exit 2; }
        while IFS= read -r line; do
          case "$line" in
            '\\echo '*)
              if cmp -s "$request" "$STUB_INVENTORY_SQL"; then
                case "$mode" in no-inventory) leak; exit 3 ;; not-json) echo "ERROR 42" ;; *) give inventory.json ;; esac
              elif grep -q 'REPEATABLE READ, READ ONLY' "$request" && grep -q 'pg_export_snapshot()' "$request"; then
                echo "${SNAPSHOT}" | tee "$STUB_DIR/session.open"
              elif grep -q server_version "$request"; then echo 17.6
              fi
              echo "\${line#* }"; : > "$request" ;;
            *) printf '%s\\n' "$line" >> "$request" ;;
          esac
        done
        rm -f "$STUB_DIR/session.open" ;;
  pg_dump) snapshot=""; for arg in "$@"; do case "$arg" in --snapshot=*) snapshot="\${arg#--snapshot=}" ;; esac; done
        [ -n "$snapshot" ] && [ "$(cat "$STUB_DIR/session.open" 2>/dev/null)" = "$snapshot" ] || { leak; exit 1; }
        case "\${STUB_DUMP:-good}" in
          good) give good.dump ;; cut) give cut.dump ;; empty) ;; garbage) echo "not an archive" ;;
          dies) printf 'PGDMP cut sho'; leak; exit 1 ;;
          held) : > "$STUB_DIR/dump.started"; cat "$STUB_DIR/gate" > /dev/null; give good.dump ;;
        esac ;;
  pg_restore) archive="$(cat)"
        case "$archive" in PGDMP*) ;; *) leak; exit 1 ;; esac
        case " $* " in *" --list "*|*" -l "*) exit 0 ;; *" -f /dev/null "*) ;; *) exit 1 ;; esac
        case "$archive" in *PGDMP-END) ;; *) leak; exit 1 ;; esac ;;
  pg_dumpall) mode="\${STUB_GLOBALS:-good}"
        case " $* " in *" --globals-only "*) ;; *) exit 1 ;; esac
        case " $* " in *" --no-role-passwords "*) ;; *) mode=password ;; esac
        case "$mode" in
          good) give globals.sql ;; cut) give globals.sql | head -n 5 ;;
          password) give globals.sql | sed "s/ LOGIN;/ LOGIN PASSWORD 'SCRAM-SHA-256\\$stub';/" ;;
          dies) echo "--"; leak; exit 1 ;;
        esac ;;
esac
`;
// scp keeps its "remote" in a folder: STUB_SCP=down refuses the upload, =lost takes it and keeps nothing,
// =corrupt keeps a cut copy.
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
// mv records where it was asked to put a file. For the name STUB_MV_FAIL ends with it fails, as on a full disk;
// for the name STUB_MV_LIES ends with it reports success and moves nothing.
const MV = `#!/usr/bin/env bash
for destination; do :; done
echo "\${destination##*/}" >> "$STUB_DIR/mv.log"
case "$destination" in *"\${STUB_MV_FAIL:-/}") echo "mv: cannot move" >&2; exit 1 ;; *"\${STUB_MV_LIES:-/}") exit 0 ;; esac
PATH="\${PATH#*:}"; exec mv "$@"
`;
const NOTIFY = `#!/usr/bin/env bash
n=$(cat "$STUB_DIR/notify.tries" 2>/dev/null || echo 0); echo $((n + 1)) > "$STUB_DIR/notify.tries"
[ "$n" -ge "\${STUB_NOTIFY_AFTER:-0}" ] || exit 1
printf '%s\\n' "$@" > "$STUB_DIR/notify.args"
`;
// systemctl records the call and fails the one STUB_SYSTEMCTL_FAIL names.
const SYSTEMCTL = `#!/usr/bin/env bash
echo "$*" >> "$STUB_DIR/systemctl.log"
case " $* " in *" \${STUB_SYSTEMCTL_FAIL:-/} "*) exit 1 ;; esac
`;

const tmp: string[] = [];
afterAll(() => { for (const d of tmp) rmSync(d, { recursive: true, force: true }); });

type Env = Record<string, string>;
export type Run = { status: number | null; stdout: string; stderr: string };

export function setup() {
  const dir = mkdtempSync(join(tmpdir(), "backupjob"));
  tmp.push(dir);
  const bin = join(dir, "bin");
  const backups = join(dir, "backups");
  const home = join(dir, "home");
  for (const d of [bin, backups, home, join(dir, "payload")]) mkdirSync(d);
  for (const [name, body] of [["docker", DOCKER], ["scp", SCP], ["sleep", SLEEP], ["mv", MV], ["notify-send", NOTIFY], ["systemctl", SYSTEMCTL]]) {
    writeFileSync(join(bin, name), body);
    chmodSync(join(bin, name), 0o755);
  }
  for (const [name, content] of [["good.dump", GOOD], ["cut.dump", CUT], ["globals.sql", GLOBALS], ["inventory.json", `${JSON.stringify(INVENTORY)}\n`]]) {
    writeFileSync(join(dir, "payload", name), content);
  }
  const env = (extra: Env) => {
    const e: Record<string, string | undefined> = {
      ...process.env, PATH: `${bin}:${process.env.PATH}`, HOME: home, STUB_DIR: dir, STUB_LEAK: LEAK, STUB_INVENTORY_SQL: INVENTORY_SQL, BACKUP_DIR: backups, ...extra,
    };
    // the lead's shell, or a systemd manager above it, must not decide a test
    for (const name of ["BACKUP_DEST", "INVOCATION_ID", "MONITOR_INVOCATION_ID", "MONITOR_SERVICE_RESULT"]) if (!(name in extra)) delete e[name];
    return e as NodeJS.ProcessEnv;
  };
  const script = (path: string) => (extra: Env = {}): Run => spawnSync("bash", [path], { encoding: "utf8", env: env(extra) });
  /** The job, not waited for: `done` resolves when it has ended. */
  const start = (extra: Env = {}) => {
    const child = spawn("bash", [JOB], { env: env(extra) });
    let stdout = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    return { done: new Promise<Run>((ended) => child.on("close", (status) => ended({ status, stdout, stderr: "" }))) };
  };
  const setPath = (date: string) => join(backups, `dxb-laptop-${date}`);
  /** The files of an earlier night, `daysAgo` days old by name and by clock. `parts` picks which of the set exist. */
  const earlier = (daysAgo: number, parts = ["dump", "globals.sql", "manifest.json"]) => {
    const at = new Date(Date.now() - daysAgo * 86_400_000);
    return parts.map((part) => {
      const file = `${setPath(day(daysAgo))}.${part}`;
      writeFileSync(file, `${part} of the night ${daysAgo} days ago\n`);
      utimesSync(file, at, at);
      return file.slice(backups.length + 1);
    });
  };
  /** Everything in the backup folder but its log. */
  const files = () => readdirSync(backups).filter((name) => name !== "backup.log").sort();
  /** Every file under the backup folder with its content — what a run that must touch nothing is held to. */
  const everything = (folder = backups): string[] => readdirSync(folder, { withFileTypes: true })
    .filter((entry) => entry.name !== "backup.log")
    .flatMap((entry) => {
      const path = join(folder, entry.name);
      if (entry.isDirectory()) return [path, ...everything(path)];
      return [`${path} ${entry.isFile() ? sha256(readFileSync(path, "utf8")) : "not a regular file"}`];
    })
    .sort();
  const read = (path: string) => (existsSync(path) ? readFileSync(path, "utf8") : "");
  return {
    dir, backups, home, files, everything, earlier, start,
    run: script(JOB), alert: script(ALERT), install: script(INSTALL),
    tonight: setPath(TODAY),
    tonightSet: [`dxb-laptop-${TODAY}.dump`, `dxb-laptop-${TODAY}.globals.sql`, `dxb-laptop-${TODAY}.manifest.json`],
    lines: (r: { stdout: string }) => r.stdout.trim().split("\n"),
    lastLine: (r: { stdout: string }) => r.stdout.trim().split("\n").pop(),
    log: (name: string) => read(join(dir, name)),
    backupLog: () => read(join(backups, "backup.log")),
  };
}

/** The last line of a run by hand: `legs` is what stands between the invocation and the exit code. */
export const runLine = (legs: string, exit: number) => `BACKUP_RUN ${TODAY} invocation=manual ${legs} exit=${exit}`;
