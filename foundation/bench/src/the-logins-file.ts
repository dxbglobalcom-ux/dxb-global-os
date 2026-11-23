// The install step's file of passwords (piece 5's SPEC §6 step 3, §11 items 2 and 3): where it lies, its one reading —
// the step's and `loginConnectionString`'s alike — and its writing. A file stands only when the step could have
// written it; anything else is a file that does not stand, and the step replaces it. What it holds is never printed.
import { randomBytes } from "node:crypto";
import { closeSync, constants, fchmodSync, fstatSync, fsyncSync, openSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { makeTheStateDirectory, stateDirectory } from "./bench.ts";

export const FOUNDATION_LOGINS = ["os_engine", "os_executor", "os_intake", "os_reader"] as const;
export type FoundationLogin = (typeof FOUNDATION_LOGINS)[number];

/** What the file holds (SPEC §6 step 3): the instance it was written for, and a password by login. */
export type TheLogins = { sysid: string; logins: Partial<Record<FoundationLogin, string>> };

/** The file's place: `logins.json` beside the list file, in the bench's state directory (mode 700). */
export function defaultLoginsPath(): string {
  return join(stateDirectory, "logins.json");
}

/** 32 bytes of the system's random source, base64url without padding: 43 characters. */
const minted = (): string => randomBytes(32).toString("base64url");
const OF_THE_MINTED_FORM = /^[A-Za-z0-9_-]{43}$/;

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const isLogin = (name: string): name is FoundationLogin => FOUNDATION_LOGINS.some((login) => login === name);

/**
 * The text as the step writes it (SPEC §6, §11 item 2) — or nothing: exactly `sysid`, a cluster identifier, and
 * `logins`, whose every key is a foundation login and every value a password of the minted form, no two alike. The
 * file is judged whole, whichever login is asked of it. A file of three logins is of the shape; it does not hold the
 * fourth.
 */
function asTheStepWritesIt(text: string): TheLogins | undefined {
  let content: unknown;
  try {
    content = JSON.parse(text);
  } catch {
    return undefined;
  }
  if (!isObject(content) || Object.keys(content).sort().join(",") !== "logins,sysid") return undefined;
  const { sysid, logins } = content;
  if (typeof sysid !== "string" || !/^\d+$/.test(sysid) || !isObject(logins)) return undefined;
  const held = Object.entries(logins);
  const eachMinted = held.every(([name, password]) => isLogin(name) && typeof password === "string" && OF_THE_MINTED_FORM.test(password));
  const noTwoAlike = new Set(held.map(([, password]) => password)).size === held.length;
  return eachMinted && noTwoAlike ? { sysid, logins: logins as TheLogins["logins"] } : undefined;
}

/**
 * The file, read whole — or nothing when it does not stand (SPEC §11 item 2): missing, a link (`O_NOFOLLOW`: never
 * followed), not a regular file, not this user's, of a mode other than 600 exactly, or not as the step writes it.
 * Kind, owner and mode are asked of the descriptor that is then read, so nothing put in the path's place after the
 * look is what is read. `O_NONBLOCK`: a FIFO in the file's place is judged at once, not waited on for a writer.
 */
export function readTheLogins(path: string): TheLogins | undefined {
  let descriptor: number;
  try {
    descriptor = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  } catch {
    return undefined;
  }
  try {
    const opened = fstatSync(descriptor);
    if (!opened.isFile() || opened.uid !== process.getuid?.() || (opened.mode & 0o7777) !== 0o600) return undefined;
    return asTheStepWritesIt(readFileSync(descriptor, "utf8"));
  } finally {
    closeSync(descriptor);
  }
}

/**
 * Replaces the file whole, as the list file is replaced: written and synced beside it, then renamed over the path —
 * which replaces whatever entry stands there, a link itself and never its target. The file beside it is made new
 * (never one that stood) with mode 600 before a byte is written — the mode is set on the open descriptor, so no mask
 * of the process makes it other — and it is removed when the writing fails. `writeFileSync` on the descriptor writes
 * until every byte is taken, where one `writeSync` may take fewer (SPEC §11 item 3).
 */
function writeTheLogins(path: string, file: TheLogins): void {
  makeTheStateDirectory();
  const beside = `${path}.${randomBytes(6).toString("hex")}.writing`;
  const descriptor = openSync(beside, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
  try {
    try {
      fchmodSync(descriptor, 0o600);
      writeFileSync(descriptor, `${JSON.stringify(file, null, 2)}\n`);
      fsyncSync(descriptor);
    } finally {
      closeSync(descriptor);
    }
    renameSync(beside, path);
  } catch (failure) {
    rmSync(beside, { force: true });
    throw failure;
  }
}

/**
 * The passwords the step gives the four (SPEC §6 step 3): the file's, when it stands, names this instance and holds
 * all four — the file is then not written; otherwise four new ones, and the file replaced. So every password the step
 * hands the server is one it minted (§11 item 2).
 */
export function passwordsKeptOrMinted(sysid: string): Record<FoundationLogin, string> {
  const path = defaultLoginsPath();
  const standing = readTheLogins(path);
  const { os_engine, os_executor, os_intake, os_reader } = standing?.logins ?? {};
  if (standing?.sysid === sysid && os_engine && os_executor && os_intake && os_reader) return { os_engine, os_executor, os_intake, os_reader };
  const passwords = { os_engine: minted(), os_executor: minted(), os_intake: minted(), os_reader: minted() };
  writeTheLogins(path, { sysid, logins: passwords });
  return passwords;
}
