// B72 — THE RESTORE DRILL CAN ONLY EVER TOUCH ITS OWN CONTAINER. scripts/backup/restore-drill.sh replays a
// dump with `pg_restore --clean`, which drops what it replaces: aimed at the company it would be the end of
// the company's data. So the first thing proven here is the refusal — an ID that is empty, is not an ID, or
// belongs to the company's or the construction bench's container stops the drill before any `exec`. The rest
// proves what the drill calls "restored", and that it says OK only once its container and its working directory
// are gone. `docker` is a stub on PATH; no container and no database is touched.
import { spawn, spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, describe, expect, it, vi } from "vitest";

const ROOT = resolve(__dirname, "../..");
const DRILL = join(ROOT, "scripts/backup/restore-drill.sh");
const COMPANY = "supabase_db_DxB_Global_OS";
const BENCH = "supabase_db_DxB_Build";
const OWN_ID = "a".repeat(64);
const COMPANY_ID = "c".repeat(64);
const BENCH_ID = "b".repeat(64);
const tmp: string[] = [];
afterAll(() => { for (const d of tmp) rmSync(d, { recursive: true, force: true }); });

// The stub. `create` prints STUB_CREATE_ID and remembers the name and the label it was given; from then on the
// container EXISTS (the file `alive`) until `rm` is handed its true ID — and STUB_RM_EXIT makes `rm` leave it
// standing, with that exit status. `ps` lists it only under the label it was created with (STUB_LISTING_EXIT:
// it lists nothing, and exits so); `inspect` answers the
// formats the drill asks, and a bare `inspect <name>` succeeds while it exists; `exec <container> <tool>` answers
// from the files the test wrote, one set for the company and one for the drill's own container. Every call is
// recorded with its container.
const DOCKER = `#!/usr/bin/env bash
echo "$*" >> "$STUB_DIR/docker.log"
side() { [ "$1" = ${COMPANY} ] && echo company || echo drill; }
alive() { [ -e "$STUB_DIR/alive" ]; }
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
    s=$(side "$1"); shift
    case "$1 $*" in
      "pg_restore "*--list*) cat "$STUB_DIR/toc" ;;
      "pg_restore "*) cat > /dev/null; cat "$STUB_DIR/restore.err" >&2 2>/dev/null
        [ -z "\${STUB_RESTORE_HOLDS-}" ] || { touch "$STUB_DIR/restoring"; /bin/sleep 1; }
        exit "\${STUB_RESTORE_EXIT:-0}" ;;
      "psql "*rolname*) cat "$STUB_DIR/roles.$s" ;;
      "psql "*count*) cat "$STUB_DIR/counts.$s" ;;
      "psql "*) cat >> "$STUB_DIR/sql.$s" ;;
    esac ;;
esac
`;
// `rm` on PATH is the real one, unless the test says the drill's working directory is to stay.
const RM = `#!/usr/bin/env bash
[ -z "\${STUB_WORKDIR_RM_EXIT-}" ] || exit "$STUB_WORKDIR_RM_EXIT"
exec /bin/rm "$@"
`;

const TOC = [
  ";",
  "; Archive created at 2026-11-22",
  "221; 1259 16525 TABLE public agents postgres",
  "222; 1259 16526 TABLE public tasks postgres",
  "223; 1259 16527 TABLE auth users supabase_auth_admin",
  "4001; 0 16525 TABLE DATA public agents postgres",
  "4002; 0 16526 TABLE ATTACH public tasks_p1 postgres",
  "13; 2615 16457 SCHEMA - auth supabase_admin",
].join("\n");
const COUNTS = ["auth.users|1", "public.agents|44", "public.tasks|1000", "vault.secrets|0"];

function setup(files: Record<string, string> = {}) {
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
  const all = {
    toc: TOC,
    "roles.company": "anon\ndxb_gateway\npostgres\n",
    "roles.drill": "anon\npostgres\n",
    "counts.company": `${COUNTS.join("\n")}\n`,
    "counts.drill": `${COUNTS.join("\n")}\n`,
    ...files,
  };
  for (const [name, body] of Object.entries(all)) writeFileSync(join(dir, name), body);
  const dump = join(backups, "dxb-laptop-2026-11-22.dump");
  writeFileSync(dump, "PGDMP the night of 2026-11-22\n");
  const env = (extra: Record<string, string> = {}) =>
    ({ ...process.env, PATH: `${bin}:${process.env.PATH}`, STUB_DIR: dir, BACKUP_DIR: backups, TMPDIR: scratch, ...extra });
  const run = (args: string[] = [], extra: Record<string, string> = {}) =>
    spawnSync("bash", [DRILL, ...args], { encoding: "utf8", env: env(extra) });
  const calls = () => (existsSync(join(dir, "docker.log")) ? readFileSync(join(dir, "docker.log"), "utf8").trim().split("\n") : []);
  const name = () => readFileSync(join(dir, "name"), "utf8").trim();
  const lastLine = (r: { stdout: string }) => r.stdout.trim().split("\n").pop() ?? "";
  // What the drill left: the removals docker was asked for, whether the container still exists, its directories.
  const removed = () => calls().filter((c) => c.startsWith("rm"));
  const containerStands = () => existsSync(join(dir, "alive"));
  const workdirs = () => readdirSync(scratch).map((d) => join(scratch, d));
  return { dir, backups, dump, env, run, calls, name, lastLine, removed, containerStands, workdirs };
}
const REMOVED_BY_ID = [`rm -f -v ${OWN_ID}`]; // the one removal a drill asks of docker: its own container, by full ID
function expectNothingLeft(t: ReturnType<typeof setup>) {
  expect(t.removed()).toEqual(REMOVED_BY_ID);
  expect(t.containerStands()).toBe(false);
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
    const onCompany = execs.filter((c) => c.includes(COMPANY));
    expect(onCompany.length).toBeGreaterThan(0);
    for (const c of onCompany) {
      expect(c).toContain("default_transaction_read_only=on"); // the company is asked in a read-only session …
      expect(c).toMatch(new RegExp(`${COMPANY} psql `)); // … and only ever by psql
    }
    for (const c of execs.filter((x) => x.includes("pg_restore"))) expect(c).toContain(` ${OWN_ID} `);
    expect(execs.some((c) => c.includes("pg_restore") && c.includes("--clean"))).toBe(true);
    expect(execs.join("\n")).not.toContain(BENCH);
  });
});

describe("restore-drill.sh — what it calls restored", () => {
  it("passes when every table of the dump stands in the restored database, and prints tables and rows", () => {
    const t = setup();
    const r = t.run();
    expect(r.status, r.stdout + r.stderr).toBe(0);
    expect(t.lastLine(r)).toBe(`RESTORE_DRILL_OK ${t.dump} 3 tables 1045 rows`); // the dump's 3 tables: 1 + 44 + 1000
    expect(r.stdout).toContain("COMPARED 4 tables with the company: 0 differ");
    expect(readFileSync(join(t.dir, "sql.drill"), "utf8")).toContain("create role dxb_gateway nologin"); // the role the image lacks
    expect(r.stdout).toMatch(/^ROLES_ADDED dxb_gateway /m);
    expectNothingLeft(t);
  });

  it("takes the newest non-empty nightly dump by default, and the one it is given otherwise", () => {
    const t = setup();
    writeFileSync(join(t.backups, "dxb-laptop-2026-11-20.dump"), "PGDMP the night of 2026-11-20\n");
    writeFileSync(join(t.backups, "dxb-laptop-2026-11-23.dump"), ""); // a 0-byte file under a backup's name
    expect(t.lastLine(t.run())).toContain(`RESTORE_DRILL_OK ${t.dump} `);
    const given = join(t.backups, "dxb-laptop-2026-11-20.dump");
    expect(t.lastLine(t.run([given]))).toContain(`RESTORE_DRILL_OK ${given} `);
    const empty = t.run([join(t.backups, "dxb-laptop-2026-11-23.dump")]);
    expect(empty.status).not.toBe(0);
    expect(t.lastLine(empty)).toMatch(/^RESTORE_DRILL_FAIL /);
  });

  it("fails on any pg_restore error — none is ignored — naming its kind and count, never its text", () => {
    // An error line carries what it failed on: here a row's value in the line itself and another in its DETAIL.
    const t = setup({ "restore.err": [
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
    ].join("\n") });
    const r = t.run([], { STUB_RESTORE_EXIT: "1" });
    expect(r.status).not.toBe(0);
    expect(r.stdout + r.stderr).not.toMatch(/planted|users|nobody listed/); // not one word of the raw error text
    expect(r.stdout).toMatch(/^RESTORE_ERRORS already_exists=1 archive_unreadable=1 connection_lost=1 constraint_violated=1 copy_failed=1 dependency=1 does_not_exist=1 other=1 permission_denied=1$/m);
    expect(t.lastLine(r)).toMatch(/^RESTORE_DRILL_FAIL pg_restore exited 1 with 9 errors/);
    expectNothingLeft(t); // and no file that held it
  });

  it("fails on an error line even when pg_restore itself exits 0", () => {
    const t = setup({ "restore.err": "pg_restore: error: could not execute query: ERROR:  x\n" });
    const r = t.run();
    expect(r.status).not.toBe(0);
    expect(t.lastLine(r)).toMatch(/^RESTORE_DRILL_FAIL pg_restore exited 0 with 1 error/);
  });

  it("fails when a table of the dump is missing after the restore, and names it", () => {
    const t = setup({ "counts.drill": "auth.users|1\npublic.agents|44\nvault.secrets|0\n" });
    const r = t.run();
    expect(r.status).not.toBe(0);
    expect(t.lastLine(r)).toBe("RESTORE_DRILL_FAIL 1 of the dump's 3 tables missing after restore: public.tasks");
  });

  it("reports a difference from the company table by table: information by default, failure with --require-equal", () => {
    const files = { "counts.company": "auth.users|1\npublic.agents|45\npublic.tasks|1000\nrealtime.messages_2026_11_23|0\n" };
    const t = setup(files);
    const r = t.run();
    expect(r.status, r.stdout + r.stderr).toBe(0);
    expect(r.stdout.match(/^DIFF .*$/gm)).toEqual([
      "DIFF public.agents dump=44 company=45",
      "DIFF realtime.messages_2026_11_23 dump=absent company=0",
      "DIFF vault.secrets dump=0 company=absent",
    ]);
    expect(r.stdout).toContain("COMPARED 5 tables with the company: 3 differ");
    expect(t.lastLine(r)).toBe(`RESTORE_DRILL_OK ${t.dump} 3 tables 1045 rows`);
    const strict = setup(files);
    const s = strict.run(["--require-equal"]);
    expect(s.status).not.toBe(0);
    expect(s.stdout.match(/^DIFF .*$/gm)).toHaveLength(3);
    expect(strict.lastLine(s)).toBe("RESTORE_DRILL_FAIL 3 tables differ from the company (--require-equal)");
    expect(strict.removed()).toEqual(REMOVED_BY_ID);
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
      expect(r.stdout).toContain("COMPARED 4 tables with the company: 0 differ"); // the restore itself was good
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
