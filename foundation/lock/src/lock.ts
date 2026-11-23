// `lock <piece> [<dir>…]` (SPEC §5): the lock of a piece made from the index
// and written into the working tree — nothing is staged, nothing is committed.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { candidateOf, idsByPath, listTree, textOf } from "./git.ts";
import { TOOL_DIRECTORY } from "./judge.ts";
import { caseCount, foundationScriptsOf, lockDifference, lockPathOf, lockedTestsOf, parseLock, serializeLock } from "./lockfile.ts";
import { CONFIG, lockOf, subjectDirectory } from "./making.ts";
import { Refused } from "./run.ts";
import { copyAndInstall, runTheTests } from "./runner.ts";
import { inAWorkDirectory, toolStandsAs } from "./work.ts";

/** A piece's name is a file's name among the records, and the inventory's is taken. */
const isPieceName = (piece: string): boolean => /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(piece) && piece !== "inventory";

/** `lock`: answers 0 with `LOCK_WRITTEN …` as its last line; every refusal is thrown. */
export async function lockPiece(root: string, piece: string, givenDirs: readonly string[], keep: boolean): Promise<number> {
  if (!isPieceName(piece)) throw new Refused(`"${piece}" cannot name a piece`);
  const entries = listTree(root, candidateOf(root).tree);
  const files = idsByPath(entries.filter((entry) => entry.type === "blob"));
  const textOfFile = (path: string): string | undefined => {
    const id = files.get(path);
    return id === undefined ? undefined : textOf(root, id);
  };

  const toolInTheIndex = new Map([...files].filter(([path]) => path.startsWith(`${TOOL_DIRECTORY}/`)));
  if (!toolStandsAs(toolInTheIndex)) throw new Refused(`the running tool differs from ${TOOL_DIRECTORY}/ in the index`);
  const previous = parseLock(textOfFile(lockPathOf(piece)) ?? "");
  const named = givenDirs.length > 0 ? givenDirs : previous?.dirs;
  if (named === undefined) throw new Refused(`the first lock of ${piece} names its directories: lock ${piece} <dir>…`);
  const dirs = [...new Set(named.map((dir) => subjectDirectory(dir, files)))];
  const tests = lockedTestsOf(dirs, [...files.keys()]);
  // Handed no file, the runner would take every test the config includes.
  if (tests.length === 0) throw new Refused(`${dirs.join(", ")} holds no *.test.ts in the index`);

  const ran = await inAWorkDirectory(keep, async (work) => {
    const [notInstalled] = await copyAndInstall(root, entries, work);
    if (notInstalled !== undefined) throw new Refused(`${notInstalled.kind} ${notInstalled.detail}`);
    return runTheTests(work, { config: CONFIG, tests }, "collecting");
  });
  const lock = lockOf({ piece, dirs, files, scripts: foundationScriptsOf(textOfFile("package.json")), ran, sourceOf: textOfFile });

  const lockPath = join(root, lockPathOf(piece));
  mkdirSync(dirname(lockPath), { recursive: true });
  writeFileSync(lockPath, serializeLock(lock));
  for (const line of lockDifference(previous, lock)) console.log(line);
  console.log(`LOCK_WRITTEN piece=${piece} cases=${caseCount(lock.cases)} protected=${Object.keys(lock.protected).length}`);
  return 0;
}
