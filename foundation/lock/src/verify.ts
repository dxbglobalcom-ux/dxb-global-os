// `verify <piece>` and `verify --all` (SPEC §5): the lock, the judge, the
// structure, the copy, the run, the judgement — in that order, and what is said of each.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { idsByPath, listTree, newestCommitChanging, textAt, type Candidate } from "./git.ts";
import type { Offence } from "./index.ts";
import { TOOL_DIRECTORY, judgeRun } from "./judge.ts";
import { INVENTORY_PATH, LOCKS_DIRECTORY, caseCount, lockPathOf, lockedTestsOf, parseInventory, parseLock, pieceOfLockPath } from "./lockfile.ts";
import { Refused, assertNotToldToStop, oneLine, refusalOf, start } from "./run.ts";
import { copyAndInstall, copyOffences, runTheTests } from "./runner.ts";
import { runnerNameNotes, structuralOffences, type Judged } from "./structure.ts";
import { inAWorkDirectory, judgeIn, toolStandsAs, workDirectoryOfTheExtractedJudge, writeEntries } from "./work.ts";

export type VerifyOptions = {
  /** `--rev`: the commit that is the candidate and its own base. Without it the candidate is the index, on HEAD. */
  rev?: string;
  /** `--keep`: the work directory is left standing, and its path is said. */
  keep: boolean;
  /**
   * Given by a judge to the tool it extracted, and by nobody else: the work
   * directory that tool was extracted into. It says the running tool is the
   * extracted judge — it judges in that directory, removes nothing, and never
   * extracts again.
   */
  extractedInto?: string;
};

/** The argument a judge hands the tool it extracted. The tool of every lock commit reads it: it is not to be renamed. */
export const EXTRACTED_INTO = "--extracted-judge-in";

const sayOffence = ({ kind, detail }: Offence): void => console.log(`OFFENCE ${kind} ${oneLine(detail)}`);

/** Says every offence, then the last line of SPEC §5's table; answers the exit code beside it. */
function sayVerdict({ lock, lockCommit, candidate }: Judged, offences: readonly Offence[]): number {
  offences.forEach(sayOffence);
  const judged = `piece=${lock.piece} lock=${lockCommit} candidate=${candidate.tree}`;
  if (offences.length > 0) console.log(`LOCK_RED ${judged} offences=${offences.length}`);
  else console.log(`LOCK_GREEN ${judged} cases=${caseCount(lock.cases)}`);
  return offences.length > 0 ? 1 : 0;
}

/**
 * SPEC §5 steps 3 to 7 by the running tool, in `work`. A structural offence
 * ends it before anything is copied, installed or run; a copy that the install
 * left unready, or other than the candidate's tree, before anything is run.
 */
async function judgeIt(judged: Judged, work: string): Promise<number> {
  const { root, lock, candidate } = judged;
  const entries = listTree(root, candidate.tree);
  const structural = structuralOffences(judged, entries);
  if (structural.length > 0) return sayVerdict(judged, structural);

  const notReady = [...(await copyAndInstall(root, entries, work)), ...copyOffences(work, entries, lock)];
  if (notReady.length > 0) return sayVerdict(judged, notReady);

  const protectedPaths = Object.keys(lock.protected);
  const ran = await runTheTests(work, { config: lock.config, tests: lockedTestsOf(lock.dirs, protectedPaths) }, "judging");
  // The copy is compared again: what ran in it could write over the tests that judged it (SPEC §10 item 2).
  const offences = [...judgeRun({ cases: lock.cases, protectedPaths, ...ran }), ...copyOffences(work, entries, lock)];
  for (const note of await runnerNameNotes(judged, entries)) console.log(note);
  return sayVerdict(judged, offences);
}

/**
 * SPEC §3, the judge: the tool as it stands at the lock commit, written into
 * the work directory's `judge/` and run there on the same piece and candidate.
 * What it prints is the answer, and its exit code is the exit code.
 */
async function handOverToTheLockCommitsTool(judged: Judged, options: VerifyOptions, work: string): Promise<number> {
  const { root, lock, lockCommit } = judged;
  await writeEntries(root, listTree(root, lockCommit, TOOL_DIRECTORY), judgeIn(work));
  const entry = join(judgeIn(work), TOOL_DIRECTORY, "src", "cli.ts");
  if (!existsSync(entry)) throw new Refused(`the lock commit ${lockCommit} holds no tool to judge by`);
  const candidate = options.rev === undefined ? [] : ["--rev", judged.candidate.base];
  const args = [entry, "verify", lock.piece, ...candidate, EXTRACTED_INTO, work];
  return start(process.execPath, args, { cwd: root, stdio: ["ignore", "inherit", "inherit"], stoppedBy: "the-same-signal" }).ended;
}

/** SPEC §5 steps 1 and 2: the piece's lock as the base holds it, and the newest commit that changed it. */
function lockAtTheBase(root: string, piece: string, candidate: Candidate): Judged {
  const text = textAt(root, candidate.base, lockPathOf(piece));
  if (text === undefined) throw new Refused(`${piece} has no lock: ${candidate.base} holds no ${lockPathOf(piece)}`);
  const lock = parseLock(text);
  if (lock === undefined || lock.piece !== piece) throw new Refused(`${lockPathOf(piece)} at ${candidate.base} is not the lock of ${piece}`);
  const lockCommit = newestCommitChanging(root, candidate.base, lockPathOf(piece));
  if (lockCommit === undefined) throw new Refused(`${piece} has no lock commit: no commit of ${candidate.base} changed ${lockPathOf(piece)}`);
  return { root, lock, lockCommit, candidate };
}

/**
 * `verify <piece>`: says which tool judges — always the lock commit's,
 * extracted (SPEC §10 item 10) — then that tool's judgement. Answers the exit
 * code of SPEC §5's table; a refusal is said here, as the piece's last line.
 */
export async function verifyPiece(root: string, piece: string, candidate: Candidate, options: VerifyOptions): Promise<number> {
  try {
    const judged = lockAtTheBase(root, piece, candidate);
    if (options.extractedInto !== undefined) {
      // The judge that extracted this tool has said so; this one only judges — when it is the tool that was extracted.
      const asLocked = toolStandsAs(idsByPath(listTree(root, judged.lockCommit, TOOL_DIRECTORY)));
      if (!asLocked) throw new Refused(`the extracted tool is not the tool of the lock commit ${judged.lockCommit}`);
      return await judgeIt(judged, workDirectoryOfTheExtractedJudge(options.extractedInto));
    }
    console.log(`JUDGE extracted lock=${judged.lockCommit}`);
    return await inAWorkDirectory(options.keep, (work) => handOverToTheLockCommitsTool(judged, options, work));
  } catch (failure) {
    return refusalOf(failure);
  }
}

/**
 * `verify --all`: the inventory against the lock files, then `verify` of every
 * locked piece in the inventory's order. A piece that is refused is counted red:
 * it was not seen green.
 */
export async function verifyAll(root: string, candidate: Candidate, options: VerifyOptions): Promise<number> {
  const inventory = parseInventory(textAt(root, candidate.base, INVENTORY_PATH) ?? "");
  if (inventory === undefined) throw new Refused(`${candidate.base} holds no inventory that can be read at ${INVENTORY_PATH}`);
  const locked = listTree(root, candidate.base, LOCKS_DIRECTORY).flatMap((entry) => pieceOfLockPath(entry.path) ?? []);
  const owed = inventory.filter((row) => row.lock && !locked.includes(row.piece));
  const unlisted = locked.filter((piece) => !inventory.some((row) => row.piece === piece));
  owed.forEach((row) => sayOffence({ kind: "lock-owed", detail: row.piece }));
  unlisted.forEach((piece) => sayOffence({ kind: "lock-unlisted", detail: piece }));

  const toVerify = inventory.filter((row) => row.lock && locked.includes(row.piece));
  let red = 0;
  for (const { piece } of toVerify) {
    if ((await verifyPiece(root, piece, candidate, options)) !== 0) red += 1;
    assertNotToldToStop();
  }
  const green = red === 0 && owed.length === 0 && unlisted.length === 0;
  console.log(green ? `LOCKS_GREEN pieces=${toVerify.length}` : `LOCKS_RED pieces=${toVerify.length} red=${red} owed=${owed.length}`);
  return green ? 0 : 1;
}
