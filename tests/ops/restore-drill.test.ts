// B72 — THE RESTORE DRILL CAN ONLY EVER TOUCH ITS OWN CONTAINER. scripts/backup/restore-drill.sh replays a
// dump with `pg_restore --clean`, which drops what it replaces: aimed at the company it would be the end of
// the company's data. So the first thing proven here is the refusal — an ID that is empty, is not an ID, or
// belongs to the company's or the construction bench's container stops the drill before any `exec`. The rest
// proves what the drill calls "restored". `docker` is a stub on PATH; no container and no database is touched.
import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const ROOT = resolve(__dirname, "../..");
const DRILL = join(ROOT, "scripts/backup/restore-drill.sh");
const COMPANY = "supabase_db_DxB_Global_OS";
const BENCH = "supabase_db_DxB_Build";
const OWN_ID = "a".repeat(64);
const COMPANY_ID = "c".repeat(64);
const BENCH_ID = "b".repeat(64);
const tmp: string[] = [];
afterAll(() => { for (const d of tmp) rmSync(d, { recursive: true, force: true }); });

// The stub. `run` prints STUB_RUN_ID and remembers the name it was given; `inspect` answers the four formats
// the drill asks; `exec <container> <tool>` answers from the files the test wrote, one set for the company and
// one for the drill's own container. Every call is recorded with its container.
const DOCKER = `#!/usr/bin/env bash
echo "$*" >> "$STUB_DIR/docker.log"
side() { [ "$1" = ${COMPANY} ] && echo company || echo drill; }
case "$1" in
  run) while [ $# -gt 0 ]; do [ "$1" = --name ] && echo "$2" > "$STUB_DIR/name"; shift; done
       printf '%s' "\${STUB_RUN_ID-${OWN_ID}}"; [ -z "\${STUB_RUN_ID-x}" ] || echo ;;
  inspect)
    case "$3:$4" in
      *Image*:*) echo stub/postgres:1 ;;
      *Health*:*) echo healthy ;;
      *.Name*:*) echo "\${STUB_NAME_OF_ID-/$(cat "$STUB_DIR/name")}" ;;
      *.Id*:${COMPANY}) echo ${COMPANY_ID} ;;
      *.Id*:${BENCH}) echo ${BENCH_ID} ;;
      *) exit 1 ;;
    esac ;;
  exec)
    shift; while [ "\${1#-}" != "$1" ]; do [ "$1" = -e ] && shift; shift; done
    s=$(side "$1"); shift
    case "$1 $*" in
      "pg_restore "*--list*) cat "$STUB_DIR/toc" ;;
      "pg_restore "*) cat > /dev/null; cat "$STUB_DIR/restore.err" >&2 2>/dev/null; exit "\${STUB_RESTORE_EXIT:-0}" ;;
      "psql "*rolname*) cat "$STUB_DIR/roles.$s" ;;
      "psql "*count*) cat "$STUB_DIR/counts.$s" ;;
      "psql "*) cat >> "$STUB_DIR/sql.$s" ;;
    esac ;;
esac
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
  mkdirSync(bin);
  mkdirSync(backups);
  writeFileSync(join(bin, "docker"), DOCKER);
  writeFileSync(join(bin, "sleep"), "#!/usr/bin/env bash\n");
  chmodSync(join(bin, "docker"), 0o755);
  chmodSync(join(bin, "sleep"), 0o755);
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
  const run = (args: string[] = [], env: Record<string, string> = {}) =>
    spawnSync("bash", [DRILL, ...args], {
      encoding: "utf8",
      env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, STUB_DIR: dir, BACKUP_DIR: backups, ...env },
    });
  const calls = () => (existsSync(join(dir, "docker.log")) ? readFileSync(join(dir, "docker.log"), "utf8").trim().split("\n") : []);
  const name = () => readFileSync(join(dir, "name"), "utf8").trim();
  const lastLine = (r: { stdout: string }) => r.stdout.trim().split("\n").pop() ?? "";
  return { dir, backups, dump, run, calls, name, lastLine };
}

describe("restore-drill.sh — the wall", () => {
  const refusals: [string, Record<string, string>][] = [
    ["its docker run returned no ID", { STUB_RUN_ID: "" }],
    ["the ID is the company container's", { STUB_RUN_ID: COMPANY_ID }],
    ["the ID is the construction bench's", { STUB_RUN_ID: BENCH_ID }],
    ["the ID is the company container's name", { STUB_RUN_ID: COMPANY }],
    ["the ID resolves to the company container's name", { STUB_NAME_OF_ID: `/${COMPANY}` }],
    ["the ID resolves to the construction bench's name", { STUB_NAME_OF_ID: `/${BENCH}` }],
    ["the ID resolves to no container at all", { STUB_NAME_OF_ID: "" }],
  ];
  for (const [what, env] of refusals) {
    it(`refuses when ${what}: nothing is executed anywhere, and only its own name is removed`, () => {
      const t = setup();
      const r = t.run([], env);
      expect(r.status).not.toBe(0);
      expect(t.lastLine(r)).toMatch(/^RESTORE_DRILL_FAIL refused/);
      expect(r.stdout).not.toContain("RESTORE_DRILL_OK");
      expect(t.calls().filter((c) => c.startsWith("exec"))).toEqual([]); // no restore, no SQL, not even a read
      expect(t.calls().filter((c) => c.startsWith("rm"))).toEqual([`rm -f -v ${t.name()}`]);
      expect(t.name()).toMatch(/^dxb-restore-drill-\d{8}-\d{6}-\d+$/);
    });
  }

  it("creates its own container from the company's image with no door to the outside, and restores only into it", () => {
    const t = setup();
    const r = t.run();
    expect(r.status, r.stdout + r.stderr).toBe(0);
    const run = t.calls().find((c) => c.startsWith("run"))!;
    expect(run).toContain("--network none");
    expect(run).not.toMatch(/(^| )(-p|-P|--publish)/);
    expect(run).toMatch(/ stub\/postgres:1$/);
    expect(run).not.toMatch(/POSTGRES_PASSWORD=/); // the password travels in the environment, never on a command line
    expect(r.stdout + r.stderr).not.toMatch(/POSTGRES_PASSWORD=/);
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
    expect(t.calls().pop()).toBe(`rm -f -v ${t.name()}`);
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

  it("fails on any pg_restore error — none is ignored — and still removes its container", () => {
    const t = setup({ "restore.err": 'pg_restore: error: could not execute query: ERROR:  relation "users" already exists\nDETAIL:  Key (id)=(secret-row) exists.\npg_restore: warning: errors ignored on restore: 1\n' });
    const r = t.run([], { STUB_RESTORE_EXIT: "1" });
    expect(r.status).not.toBe(0);
    expect(t.lastLine(r)).toMatch(/^RESTORE_DRILL_FAIL pg_restore exited 1 with 1 error/);
    expect(r.stdout).toContain('relation "users" already exists');
    expect(r.stdout + r.stderr).not.toContain("secret-row"); // a DETAIL line can carry a row; it is not printed
    expect(t.calls().pop()).toBe(`rm -f -v ${t.name()}`);
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
    expect(strict.calls().pop()).toBe(`rm -f -v ${strict.name()}`);
  });
});
