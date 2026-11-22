// B72 — what the restore drill's tests stand the real script on: one night's SET in a temporary backup folder and
// fakes of `docker`, `sleep` and `rm` first on PATH. No container and no database is touched. The fake container
// answers as the real tools were measured to on 2026-11-22; each says how beside its code.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll } from "vitest";

const ROOT = resolve(__dirname, "../..");
export const DRILL = join(ROOT, "scripts/backup/restore-drill.sh");
const INVENTORY_SQL = join(ROOT, "scripts/backup/inventory.sql");
export const COMPANY = "supabase_db_DxB_Global_OS";
export const BENCH = "supabase_db_DxB_Build";
export const OWN_ID = "a".repeat(64);
export const COMPANY_ID = "c".repeat(64);
export const BENCH_ID = "b".repeat(64);
/** YYYY-MM-DD in local time, as `date +%F`, `daysAgo` days back. */
export const night = (daysAgo = 0) => new Date(Date.now() - daysAgo * 86_400_000).toLocaleDateString("sv-SE");
const sha256 = (content: string) => createHash("sha256").update(content).digest("hex");

export const DUMP = "PGDMP the archive of one night\n";
/** A globals file as pg_dumpall writes it. The fake image has `anon` and `postgres` already, and not `dxb_gateway`. */
export const GLOBALS = [
  "--", "-- PostgreSQL database cluster dump", "--",
  "CREATE ROLE anon;", "ALTER ROLE anon WITH NOSUPERUSER NOLOGIN;",
  "CREATE ROLE dxb_gateway;", "ALTER ROLE dxb_gateway WITH NOSUPERUSER LOGIN;",
  "CREATE ROLE postgres;", "ALTER ROLE postgres WITH NOSUPERUSER LOGIN;",
  "GRANT anon TO postgres WITH INHERIT TRUE GRANTED BY supabase_admin;",
  "--", "-- PostgreSQL database cluster dump complete", "--", "",
].join("\n");
const IMAGE_ROLES = "anon\npostgres\nsupabase_admin\n";

export type Inventory = {
  tables: Record<string, number>;
  sequences: Record<string, { last_value: number; is_called: boolean }>;
  large_objects: number;
  extensions: Record<string, string>;
  roles: Record<string, { login: boolean; member_of: string[] }>;
  acl_sha256: string;
};
/** What the night held: 4 tables and 1052 rows (1 + 44 + 7 + 1000). One table's name has a space in it. */
export const inventory = (): Inventory => ({
  tables: { "auth.users": 1, "public.agents": 44, "public.night shift": 7, "public.tasks": 1000 },
  sequences: { "public.agents_id_seq": { last_value: 44, is_called: true } },
  large_objects: 0,
  extensions: { pgcrypto: "1.3", plpgsql: "1.0" },
  roles: { anon: { login: false, member_of: [] }, dxb_gateway: { login: true, member_of: [] }, postgres: { login: true, member_of: ["anon"] } },
  acl_sha256: "0f".repeat(32),
});
export type Manifest = Record<string, unknown> & { inventory: Inventory };

// The fake docker. `create` prints STUB_CREATE_ID and remembers the name and the label it was given; from then on
// the container EXISTS (the file `alive`) until `rm` is handed its true ID — and STUB_RM_EXIT makes `rm` leave it
// standing, with that exit status. `ps` lists it only under the label it was created with (STUB_LISTING_EXIT: it
// lists nothing, and exits so); `inspect` answers the formats the drill asks, and a bare `inspect <name>` succeeds
// while it exists. `exec` on the company answers nothing and fails; on the drill's own container:
//   pg_restore  keeps what it was fed (restored.dump), says restore.err, exits STUB_RESTORE_EXIT.
//   psql        told by what it is fed. scripts/backup/inventory.sql byte for byte: the restored copy's inventory.
//               A script that speaks of pg_default_acl: how many default privileges are left (defaults.left).
//               Anything else is a globals file, taken as the real psql takes it — a role the image has "already
//               exists", a role nobody made "does not exist", a repeated membership is a NOTICE; it goes on after
//               an error and exits 0, unless it was told ON_ERROR_STOP=1: then it stops at the first one, exit 3.
//               STUB_PSQL_DIES=<inventory|defaults|globals> ends that call with exit 2 and an error quoting a row.
// Every call is recorded with its container (docker.log), and what happened in the container in order (events).
const DOCKER = `#!/usr/bin/env bash
echo "$*" >> "$STUB_DIR/docker.log"
alive() { [ -e "$STUB_DIR/alive" ]; }
step() { echo "$1" >> "$STUB_DIR/events"
  [ "\${STUB_PSQL_DIES-}" != "$1" ] || { echo 'ERROR:  duplicate key: Key (email)=(planted@holding.example) already exists.' >&2; exit 2; }; }
refuse() { echo "ERROR:  role \\"$1\\" $2" >&2; [ "$stop" -eq 0 ] || exit 3; }
globals() {
  local known=" $(tr '\\n' ' ' < "$STUB_DIR/image.roles")" verb a b c rest
  while read -r verb a b c rest; do
    b="\${b%;}"; c="\${c%;}"
    case "$verb $a" in
      "CREATE ROLE") if [[ "$known" == *" $b "* ]]; then refuse "$b" "already exists"; else known+="$b "; fi ;;
      "ALTER ROLE") [[ "$known" == *" $b "* ]] || refuse "$b" "does not exist" ;;
      "GRANT "*) if [[ "$known" != *" $a "* ]]; then refuse "$a" "does not exist"
                 else echo "NOTICE:  role \\"$c\\" has already been granted membership in role \\"$a\\" by role \\"supabase_admin\\"" >&2; fi ;;
    esac
  done
}
case "$1" in
  create) while [ $# -gt 1 ]; do case "$1" in --name) echo "$2" > "$STUB_DIR/name" ;; --label) echo "$2" > "$STUB_DIR/label" ;; esac; shift; done
       touch "$STUB_DIR/alive"; printf '%s' "\${STUB_CREATE_ID-${OWN_ID}}"; [ -z "\${STUB_CREATE_ID-x}" ] || echo ;;
  start) exit "\${STUB_START_EXIT:-0}" ;;
  ps) for a; do case "$a" in
        label=*=*) [ -z "\${STUB_LISTING_EXIT-}" ] || exit "$STUB_LISTING_EXIT"
          alive && [ "$a" = "label=$(cat "$STUB_DIR/label")" ] && echo ${OWN_ID} ;;
        label=*) [ -z "\${STUB_EARLIER_DRILL-}" ] || echo "$STUB_EARLIER_DRILL" ;;
      esac; done; exit 0 ;;
  rm) [ -z "\${STUB_RM_EXIT-}" ] || exit "$STUB_RM_EXIT"; [ "\${@: -1}" != ${OWN_ID} ] || /bin/rm -f "$STUB_DIR/alive" ;;
  inspect)
    [ "$2" = -f ] || { alive && [ "$2" = "$(cat "$STUB_DIR/name")" ]; exit; }
    case "$3:$4" in
      *Image*:*) echo stub/postgres:1 ;;
      *Health*:*) echo healthy ;;
      *.Name*:*) alive && echo "\${STUB_NAME_OF_ID-/$(cat "$STUB_DIR/name")} \${STUB_LABEL_OF_ID-$(cut -d= -f2 "$STUB_DIR/label")}" ;;
      *.Id*:${COMPANY}) echo ${COMPANY_ID} ;;
      *.Id*:${BENCH}) echo ${BENCH_ID} ;;
      *) exit 1 ;;
    esac ;;
  exec)
    shift; while [ "\${1#-}" != "$1" ]; do [ "$1" = -e ] && shift; shift; done
    [ "$1" != ${COMPANY} ] || exit 1
    shift
    case "$1" in
      pg_restore) echo restore >> "$STUB_DIR/events"; cat > "$STUB_DIR/restored.dump"; cat "$STUB_DIR/restore.err" >&2 2>/dev/null
        [ -z "\${STUB_RESTORE_HOLDS-}" ] || { touch "$STUB_DIR/restoring"; /bin/sleep 1; }
        exit "\${STUB_RESTORE_EXIT:-0}" ;;
      psql) cat > "$STUB_DIR/fed"
        if cmp -s "$STUB_DIR/fed" "${INVENTORY_SQL}"; then step inventory; cat "$STUB_DIR/inventory.restored"
        elif grep -q pg_default_acl "$STUB_DIR/fed"; then step defaults; cat "$STUB_DIR/defaults.left"
        else step globals; cp "$STUB_DIR/fed" "$STUB_DIR/globals.applied"
          stop=0; case " $* " in *" ON_ERROR_STOP=1 "*) stop=1 ;; esac; globals < "$STUB_DIR/fed"; fi ;;
    esac ;;
esac
`;
// `rm` on PATH is the real one, unless the test says the drill's working directory is to stay.
const RM = `#!/usr/bin/env bash
[ -z "\${STUB_WORKDIR_RM_EXIT-}" ] || exit "$STUB_WORKDIR_RM_EXIT"
exec /bin/rm "$@"
`;

const tmp: string[] = [];
afterAll(() => { for (const d of tmp) rmSync(d, { recursive: true, force: true }); });

type Change = {
  /** The night the set is of — today's unless said. */
  night?: string;
  globals?: string;
  /** Changes the manifest AFTER it was written true to the dump and the globals. */
  manifest?: (m: Manifest) => void;
  /** Changes what the restored copy holds; untouched, it holds what the manifest says. */
  restored?: (i: Inventory) => void;
  /** The fake's own files: restore.err, defaults.left. */
  files?: Record<string, string>;
};

export function setup(change: Change = {}) {
  const dir = mkdtempSync(join(tmpdir(), "restoredrill"));
  tmp.push(dir);
  const bin = join(dir, "bin");
  const backups = join(dir, "backups");
  const scratch = join(dir, "scratch"); // the drill's TMPDIR: whatever it leaves behind is found here
  for (const d of [bin, backups, scratch]) mkdirSync(d);
  for (const [tool, body] of Object.entries({ docker: DOCKER, sleep: "#!/usr/bin/env bash\n", rm: RM })) {
    writeFileSync(join(bin, tool), body);
    chmodSync(join(bin, tool), 0o755);
  }
  const stem = `dxb-laptop-${change.night ?? night()}`;
  const set = join(backups, stem);
  const globals = change.globals ?? GLOBALS;
  const manifest: Manifest = {
    format: 1, stem, taken_at: "2026-11-22T02:30:07+01:00", server_version: "17.6", dump_bytes: DUMP.length,
    dump_sha256: sha256(DUMP), globals_sha256: sha256(globals), inventory: inventory(), excluded: [],
  };
  change.manifest?.(manifest);
  const restored = inventory();
  change.restored?.(restored);
  for (const [part, body] of Object.entries({ dump: DUMP, "globals.sql": globals, "manifest.json": `${JSON.stringify(manifest)}\n` })) {
    writeFileSync(`${set}.${part}`, body);
  }
  const fake = { "image.roles": IMAGE_ROLES, "defaults.left": "0\n", "inventory.restored": `${JSON.stringify({ inventory: restored, excluded: [] })}\n`, ...change.files };
  for (const [name, body] of Object.entries(fake)) writeFileSync(join(dir, name), body);

  const env = (extra: Record<string, string> = {}) =>
    ({ ...process.env, PATH: `${bin}:${process.env.PATH}`, STUB_DIR: dir, BACKUP_DIR: backups, TMPDIR: scratch, ...extra });
  const run = (args: string[] = [], extra: Record<string, string> = {}) =>
    spawnSync("bash", [DRILL, ...args], { encoding: "utf8", env: env(extra) });
  const read = (name: string) => (existsSync(join(dir, name)) ? readFileSync(join(dir, name), "utf8") : "");
  const calls = () => read("docker.log").trim().split("\n").filter(Boolean);
  return {
    dir, backups, stem, set, env, run, read, calls,
    /** What happened inside the drill's container, in order: defaults, globals, restore, inventory. */
    events: () => read("events").trim().split("\n").filter(Boolean),
    name: () => read("name").trim(),
    lastLine: (r: { stdout: string }) => r.stdout.trim().split("\n").pop() ?? "",
    diffs: (r: { stdout: string }) => r.stdout.match(/^DIFF .*$/gm) ?? [],
    // What the drill left: the removals docker was asked for, whether the container still exists, its directories.
    removed: () => calls().filter((c) => c.startsWith("rm")),
    containerStands: () => existsSync(join(dir, "alive")),
    workdirs: () => readdirSync(scratch).map((d) => join(scratch, d)),
  };
}
