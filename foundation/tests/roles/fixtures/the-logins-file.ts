// The install step's secret file (piece 5's SPEC §6 step 3) as a case looks at it from outside: where it lies, what
// it holds, and whether it changed. Nothing here prints what the file holds: a change is told by a digest.
import { createHash } from "node:crypto";
import { lstatSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { defaultStatePath } from "@dxb-foundation/bench";

/** `logins.json` beside `instances.json`, in the bench's state directory — spelled from the list file's own place. */
export const secretFilePath = (): string => join(dirname(defaultStatePath()), "logins.json");

const digestOf = (bytes: Buffer | string): string => createHash("sha256").update(bytes).digest("hex");

/** What stands at the path, said without its content: equal before and after means not written, not replaced, not moved. */
export type AsItStands = "absent" | { digest: string; inode: number; modifiedMs: number; mode: number };

export function secretFileNow(): AsItStands {
  const stat = lstatSync(secretFilePath(), { throwIfNoEntry: false });
  if (stat === undefined) return "absent";
  return { digest: digestOf(readFileSync(secretFilePath())), inode: stat.ino, modifiedMs: stat.mtimeMs, mode: stat.mode };
}

/** What the file holds, as JSON. Never printed. */
export type SecretFile = { sysid: unknown; logins: Record<string, unknown> };

/** The file parsed. A file that is no object with an object `logins` fails here, with no part of its text said. */
export function readSecretFile(): SecretFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(secretFilePath(), "utf8"));
  } catch {
    throw new Error(`${secretFilePath()} is not a JSON text`);
  }
  const logins = typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>)["logins"] : undefined;
  if (typeof logins !== "object" || logins === null || Array.isArray(logins)) throw new Error(`${secretFilePath()} holds no object "logins"`);
  return parsed as SecretFile;
}

/** The four passwords the file holds, by role — each as written; one that is not a text fails here. */
export function passwordsInTheFile(roles: readonly string[]): Map<string, string> {
  const { logins } = readSecretFile();
  return new Map(
    roles.map((role) => {
      const password = logins[role];
      if (typeof password !== "string") throw new Error(`${secretFilePath()} holds no password text for ${role}`);
      return [role, password];
    }),
  );
}

/** The file's passwords, or none when it is absent or cannot be read: what a command's output is searched for. */
export function passwordsIfReadable(roles: readonly string[]): string[] {
  try {
    return [...passwordsInTheFile(roles).values()];
  } catch {
    return [];
  }
}

/** The file with its `sysid` replaced, written in place — its mode stays the file's. */
export function changeTheFilesSysid(to: string): void {
  const file = readSecretFile();
  writeFileSync(secretFilePath(), `${JSON.stringify({ ...file, sysid: to })}\n`);
}

/** Each value by its digest: two maps of secrets compared so that a difference prints no secret. */
export const digested = (secrets: ReadonlyMap<string, string | null>): Record<string, string | null> =>
  Object.fromEntries([...secrets].map(([key, value]) => [key, value === null ? null : digestOf(value)]));
