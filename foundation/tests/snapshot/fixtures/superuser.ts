// The bench's superuser, for what the installer cannot do (SPEC §3 fact 5): an owner changed. Reached as the lead
// measured it (evidence/measure-q4-owner.sh): `docker exec` into the one container whose name ends in
// `_DxB_Foundation` and is the database's, `psql` as supabase_admin. The container is first seen to be the bench's
// database container by its name and its project label, so this can never exec into another stack's.
import { execFile } from "node:child_process";

const DATABASE_CONTAINER = "supabase_db_DxB_Foundation";
const PROJECT_LABEL = "label=com.supabase.cli.project=DxB_Foundation";

type Ran = { code: number; stdout: string; stderr: string };

function run(args: string[], timeoutMs = 30_000): Promise<Ran> {
  return new Promise((resolve, reject) => {
    execFile("docker", args, { timeout: timeoutMs, env: { PATH: process.env.PATH, HOME: process.env.HOME } }, (error, stdout, stderr) => {
      if (error === null) resolve({ code: 0, stdout, stderr });
      else if (typeof error.code === "number") resolve({ code: error.code, stdout, stderr });
      else reject(new Error(`docker ${args[0]} did not end by itself: ${error.message}`));
    });
  });
}

/** The bench's database container: the one of the project's containers named so, and labelled the project's. */
async function theDatabaseContainer(): Promise<string> {
  const listed = await run(["ps", "--filter", PROJECT_LABEL, "--format", "{{.Names}}"]);
  const names = listed.stdout.split("\n").map((name) => name.trim()).filter((name) => name.endsWith("_DxB_Foundation") && name.startsWith("supabase_db_"));
  if (names.length !== 1 || names[0] !== DATABASE_CONTAINER) throw new Error(`not exactly one bench database container: ${JSON.stringify(names)}`);
  const facts = await run(["inspect", "--format", '{{.Name}} {{index .Config.Labels "com.supabase.cli.project"}}', DATABASE_CONTAINER]);
  if (facts.stdout.trim() !== `/${DATABASE_CONTAINER} DxB_Foundation`) throw new Error(`refusing to exec into ${DATABASE_CONTAINER}: it is "${facts.stdout.trim()}"`);
  return DATABASE_CONTAINER;
}

/** One statement as the bench's superuser in the database `postgres`; a statement the server refuses is an error. */
export async function asTheSuperuser(sql: string): Promise<void> {
  const container = await theDatabaseContainer();
  const ran = await run(["exec", container, "psql", "-X", "-q", "-At", "-v", "ON_ERROR_STOP=1", "-U", "supabase_admin", "-d", "postgres", "-c", sql]);
  if (ran.code !== 0) throw new Error(`as the superuser, "${sql}" ended ${ran.code}: ${ran.stderr.trim()}`);
}
