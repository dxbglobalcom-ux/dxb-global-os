// B72 — what the backup tests stand the real scripts on: a temporary backup folder and fakes of `docker`, `gh`,
// `sleep`, `mv`, `notify-send` and `systemctl` first on PATH. No database, no network and no systemd is touched.
// The fakes fail the way the real tools do where that is what a test is about; each says how beside its code.
// gpg is the REAL one, with a throwaway key pair: a test opens what the job would ship and looks inside.
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

/**
 * YYYY-MM-DD in local time, as `date +%F`, `daysAgo` days back — by the calendar, not by 24-hour steps: measured
 * 2026-11-22 at 23:38, 91 × 24 h back crossed the end of summer time and named the night 90 days back.
 */
export const day = (daysAgo = 0) => {
  const at = new Date();
  at.setDate(at.getDate() - daysAgo);
  return at.toLocaleDateString("sv-SE");
};
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
/** The far side the fake gh keeps, and what gh prints when it is asked for its token. Neither may reach a log. */
export const FAR_REPO = "acme/vault";
export const TOKEN = "the-token-gh-holds-is-never-to-be-seen";
export const DEST = { BACKUP_DEST: `github:${FAR_REPO}` };

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
// gh keeps its GitHub in a folder — github/<owner>/<repo>/releases/<tag>/<asset>, with tags/<tag> beside it — and
// behaves as gh 2.46.0 was measured to on 2026-11-22: `auth status` exits 0 whatever it says; `auth token` prints
// the token, or exits 1 without one, and then every call that needs it exits 1; `release list` shows the newest
// 30 unless --limit says more, and a table unless --json is asked; `release create` refuses a tag that has a
// release and prints the release's address; `release upload` refuses a name already there without --clobber;
// `release delete` wants --yes when nobody can be asked, and leaves the tag without --cleanup-tag.
// STUB_GH: logged-out · down (the upload is refused) · slow (the upload takes 3 s, then lands) · lost (taken,
// nothing kept) · corrupt (a cut copy kept) · no-list · no-delete. Every call is recorded, and every call says
// LEAK on stderr.
const GH = `#!/usr/bin/env bash
echo "$*" >> "$STUB_DIR/gh.log"
echo "$STUB_LEAK" >&2
mode="\${STUB_GH:-ok}"; call="$1 $2"; shift 2
words=(); repo=""; out=""; pattern=""; limit=30; json=""; clobber=""; yes=""; cleanup=""
while [ $# -gt 0 ]; do
  case "$1" in
    -R) repo="$2"; shift ;; -O) out="$2"; shift ;; -p) pattern="$2"; shift ;; --limit) limit="$2"; shift ;;
    --json) json="$2"; shift ;; -h|-q|--title|--notes) shift ;;
    --clobber) clobber=1 ;; --yes) yes=1 ;; --cleanup-tag) cleanup=1 ;; *) words+=("$1") ;;
  esac; shift
done
case "$call" in
  "auth status") echo "X Failed to log in to github.com account someone (keyring)"; exit 0 ;;
  "auth token") [ "$mode" != logged-out ] || exit 1; echo "$STUB_TOKEN"; exit 0 ;;
esac
[ "$mode" != logged-out ] || exit 1
releases="$STUB_DIR/github/$repo/releases"; tags="$STUB_DIR/github/$repo/tags"; tag="\${words[0]:-}"; file="\${words[1]:-}"
asset="$releases/$tag/\${file##*/}"
keep() { [ "$mode" != slow ] || /usr/bin/sleep 3; case "$mode" in lost) ;; corrupt) head -c 10 "$file" > "$asset" ;; *) cp "$file" "$asset" ;; esac; }
case "$call" in
  "release view") [ -d "$releases/$tag" ] ;;
  "release create") [ ! -e "$releases/$tag" ] && [ "$mode" != down ] || exit 1
        mkdir -p "$releases/$tag" "$tags"; : > "$tags/$tag"; keep; echo "https://github.com/$repo/releases/tag/$tag" ;;
  "release upload") [ -d "$releases/$tag" ] && [ "$mode" != down ] || exit 1
        [ ! -e "$asset" ] || [ -n "$clobber" ] || exit 1
        rm -f "$asset"; keep ;;
  "release download") [ -n "$out" ] && cp "$releases/$tag/$pattern" "$out" 2>/dev/null ;;
  "release list") [ "$mode" != no-list ] || exit 1
        ls "$releases" 2>/dev/null | sort -r | head -n "$limit" \\
          | if [ "$json" = tagName ]; then cat; else sed 's/.*/& Latest & 2026-01-01T00:00:00Z/'; fi ;;
  "release delete") [ -n "$yes" ] && [ "$mode" != no-delete ] || exit 1
        rm -rf "$releases/\${tag:?}"; [ -z "$cleanup" ] || rm -f "$tags/$tag" ;;
  *) exit 1 ;;
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
let keyHome = ""; // the throwaway key pair's own gpg home, once a test has needed it
afterAll(() => {
  // making the key started an agent of that home's own: it is stopped, and its socket folder under /run goes too
  if (keyHome) for (const tidy of [["--kill", "all"], ["--remove-socketdir"]]) spawnSync("gpgconf", ["--homedir", keyHome, ...tidy]);
  for (const d of tmp) rmSync(d, { recursive: true, force: true });
});

type Env = Record<string, string>;
export type Run = { status: number | null; stdout: string; stderr: string };

/** The real gpg on a throwaway key pair, made once per test file. The job is only ever given the public half. */
const gpg = (args: string[]) => {
  if (!keyHome) {
    keyHome = mkdtempSync(join(tmpdir(), "backupkey"));
    tmp.push(keyHome);
    gpg(["--pinentry-mode", "loopback", "--passphrase", "", "--quick-generate-key", "throwaway <throwaway@example.invalid>", "default", "default", "never"]);
  }
  const ran = spawnSync("gpg", ["--homedir", keyHome, "--batch", "--quiet", ...args], { maxBuffer: 64 * 1024 * 1024 });
  if (ran.status !== 0) throw new Error(`gpg ${args[0]} exited ${ran.status}`);
  return ran.stdout;
};

/** What a file the job shipped holds once the private half has opened it: every member of the tar, by name. */
export const unseal = (sealed: string): Record<string, string> => {
  const into = mkdtempSync(join(tmpdir(), "backupopen"));
  tmp.push(into);
  const untar = spawnSync("tar", ["-x", "-C", into], { input: gpg(["--decrypt", sealed]) });
  if (untar.status !== 0) throw new Error(`what was shipped is not a tar (tar exited ${untar.status})`);
  return Object.fromEntries(readdirSync(into).map((name) => [name, readFileSync(join(into, name), "utf8")]));
};

export function setup() {
  const dir = mkdtempSync(join(tmpdir(), "backupjob"));
  tmp.push(dir);
  const bin = join(dir, "bin");
  const backups = join(dir, "backups");
  const home = join(dir, "home");
  for (const d of [bin, backups, home, join(dir, "payload")]) mkdirSync(d);
  for (const [name, body] of [["docker", DOCKER], ["gh", GH], ["sleep", SLEEP], ["mv", MV], ["notify-send", NOTIFY], ["systemctl", SYSTEMCTL]]) {
    writeFileSync(join(bin, name), body);
    chmodSync(join(bin, name), 0o755);
  }
  const publicKey = join(home, ".config/dxb/backup-public.asc"); // where the job looks when it is told nothing
  mkdirSync(join(home, ".config/dxb"), { recursive: true });
  writeFileSync(publicKey, gpg(["--armor", "--export"]));
  for (const [name, content] of [["good.dump", GOOD], ["cut.dump", CUT], ["globals.sql", GLOBALS], ["inventory.json", `${JSON.stringify(INVENTORY)}\n`]]) {
    writeFileSync(join(dir, "payload", name), content);
  }
  const env = (extra: Env) => {
    const e: Record<string, string | undefined> = {
      ...process.env, PATH: `${bin}:${process.env.PATH}`, HOME: home, STUB_DIR: dir, STUB_LEAK: LEAK, STUB_TOKEN: TOKEN, STUB_INVENTORY_SQL: INVENTORY_SQL, BACKUP_DIR: backups, ...extra,
    };
    // the lead's shell, or a systemd manager above it, must not decide a test
    const inherited = ["BACKUP_DEST", "BACKUP_PUBLIC_KEY", "BACKUP_OFFSITE_RETENTION_DAYS", "BACKUP_GH_WAIT_SECONDS", "GNUPGHOME", "INVOCATION_ID", "MONITOR_INVOCATION_ID", "MONITOR_SERVICE_RESULT"];
    for (const name of inherited) if (!(name in extra)) delete e[name];
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
  // The far side as the fake gh keeps it: `night` leaves an earlier night's release there with its tag, `release`
  // one under any tag; `releases` and `tags` say what stands there now, `asset` where a night's one file is.
  const farSide = (what: "releases" | "tags") => join(dir, "github", FAR_REPO, what);
  const standing = (what: "releases" | "tags") => () => (existsSync(farSide(what)) ? readdirSync(farSide(what)).sort() : []);
  const far = {
    release: (tag: string) => {
      for (const folder of [join(farSide("releases"), tag), farSide("tags")]) mkdirSync(folder, { recursive: true });
      writeFileSync(join(farSide("releases"), tag, `${tag}.set.tar.gpg`), `what an earlier run shipped as ${tag}\n`);
      writeFileSync(join(farSide("tags"), tag), "");
      return tag;
    },
    night: (daysAgo: number) => far.release(`dxb-laptop-${day(daysAgo)}`),
    releases: standing("releases"),
    tags: standing("tags"),
    asset: (daysAgo = 0) => join(farSide("releases"), `dxb-laptop-${day(daysAgo)}`, `dxb-laptop-${day(daysAgo)}.set.tar.gpg`),
  };
  return {
    dir, backups, home, files, everything, earlier, start, far, publicKey, script,
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
/** Everything a night says when its set is proven here and its copy is proven on the far side. */
export const GOOD_NIGHT = [`BACKUP_OK ${TODAY} ${GOOD.length} bytes`, `OFFSITE_OK ${TODAY}`, runLine(`local=ok offsite=ok prune=ok bytes=${GOOD.length}`, 0)];
