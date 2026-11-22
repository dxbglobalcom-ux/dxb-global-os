// The bench's names and places (SPEC §3): what it is called, where it listens, where it lives on disk.
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const BENCH = {
  project: "DxB_Foundation",
  apiPort: 54521,
  dbPort: 54522,
  network: "dxb_foundation_bench",
  bind: "127.0.0.1",
} as const;

/** The CLI's local credential is fixed and public; this is the bench's address, not a secret. */
export function connectionString(): string {
  return `postgresql://postgres:postgres@${BENCH.bind}:${BENCH.dbPort}/postgres`;
}

/** `foundation/bench` — from this file's own location, never from the working directory. */
export const benchDirectory = resolve(fileURLToPath(new URL("..", import.meta.url)));

/** The repository root, three levels above this file. */
export const repositoryRoot = resolve(benchDirectory, "../..");

/** The label the Supabase CLI puts on every container and volume of a project. */
export const PROJECT_LABEL_KEY = "com.supabase.cli.project";
