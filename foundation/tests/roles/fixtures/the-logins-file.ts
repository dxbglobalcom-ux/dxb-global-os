// The install step's secret file (piece 5's SPEC §6 step 3) as a case looks at it from outside: where it lies, what
// it holds, and whether it changed. Nothing here prints what the file holds: a change is told by a digest.
import { createHash, randomBytes } from "node:crypto";
import { lstatSync, readFileSync, writeFileSync } from "node:fs";
import { userInfo } from "node:os";
import { dirname, join } from "node:path";
import { defaultStatePath } from "@dxb-foundation/bench";

/** `logins.json` beside `instances.json`, in the bench's state directory — spelled from the list file's own place. */
export const secretFilePath = (): string => join(dirname(defaultStatePath()), "logins.json");

/** A password as the step mints one (SPEC §6 step 3, §11 item 2): 32 random bytes, base64url without padding. */
export const MINTED_FORM = /^[A-Za-z0-9_-]{43}$/;
export const aPasswordOfTheMintedForm = (): string => randomBytes(32).toString("base64url");

const digestOf = (bytes: Buffer | string): string => createHash("sha256").update(bytes).digest("hex");

/** What stands at a path, said without its content: equal before and after means not written, not replaced, not moved. */
export type AsItStands = "absent" | { digest: string; inode: number; modifiedMs: number; mode: number };

/** The path itself, a link not followed: a link's digest is that of the file it leads to, its mode its own. */
export function standingAt(path: string): AsItStands {
  const stat = lstatSync(path, { throwIfNoEntry: false });
  if (stat === undefined) return "absent";
  return { digest: digestOf(readFileSync(path)), inode: stat.ino, modifiedMs: stat.mtimeMs, mode: stat.mode };
}

export const secretFileNow = (): AsItStands => standingAt(secretFilePath());

/** How the file stands as SPEC §6 wants it said — `a regular file, mode 600, this user's` — the path itself, a link not followed. */
export function howTheFileStands(): string {
  const stat = lstatSync(secretFilePath());
  const kind = stat.isFile() ? "a regular file" : stat.isSymbolicLink() ? "a symbolic link" : "not a regular file";
  return `${kind}, mode ${(stat.mode & 0o777).toString(8)}, ${stat.uid === userInfo().uid ? "this user's" : `uid ${stat.uid}`}`;
}
export const AS_THE_STEP_WRITES_IT = "a regular file, mode 600, this user's";

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

/** The file rewritten in place as `change` makes it — its inode and its mode stay the file's. */
export function rewriteTheFile(change: (file: SecretFile) => SecretFile): void {
  writeFileSync(secretFilePath(), `${JSON.stringify(change(readSecretFile()))}\n`);
}

/** The file with its `sysid` replaced, written in place. */
export const changeTheFilesSysid = (to: string): void => rewriteTheFile((file) => ({ ...file, sysid: to }));

/** Each value by its digest: two maps of secrets compared so that a difference prints no secret. */
export const digested = (secrets: ReadonlyMap<string, string | null>): Record<string, string | null> =>
  Object.fromEntries([...secrets].map(([key, value]) => [key, value === null ? null : digestOf(value)]));
