// Graphify adapter (study card graphify.md, 06-01 — ADOPT; spike 06-02 CONFIRMED
// relation→graphify). Card contract, followed exactly ("no guessing"):
//   "graphify has NO programmatic single-node-add API — build/update is
//    corpus-driven. A relation-kind memory is written as a note under
//    memory-store/relation/ (same fs mechanics as the obsidian adapter) and
//    the graph ingests it at the next build cycle; the adapter records the
//    ref and, when the CLI is available, triggers an incremental update.
//    Exact invocation recorded for 06-06:
//      execFile('graphify', [<corpus-path>, '--update'])  — no shell interpolation"
// CARD CORRECTION (2026-07-09, verified against live `graphify --help`): the
// CLI ships a SUBCOMMAND form — `update <path>  re-extract code files and
// update the graph (no LLM needed)` — so the exec args are
// ['update', corpusPath], not [corpusPath, '--update']. No-shell rule holds.
// ref = note path (idempotent by ref, card). The incremental update is exposed
// as updateGraphIncremental() and scheduled OUTSIDE the commit transaction
// (06-08 cron / phase-completion build): the CLI may be slow/LLM-backed and
// must never sit inside the door's rule-4 transaction. Reads never depend on
// skill-only behavior (card pitfall) — readByRef returns the note body from
// disk, deterministic, no LLM.
// Reachable ONLY through write-policy's registry (T-06-12) on the write side.
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
import { writeNote, type ObsidianNoteArgs } from "./obsidian.js";

const execFileAsync = promisify(execFile);

const RELATION_REF_RE = /^memory-store\/relation\/[0-9a-f-]{36}\.md$/;

/** Write one relation node as a corpus note; returns the note-path ref. */
export async function writeRelationNote(args: Omit<ObsidianNoteArgs, "kind">): Promise<string> {
  return writeNote({ ...args, kind: "relation" });
}

/** Read a relation node body by its note-path ref. Loud on a broken ref. */
export async function readRelationByRef(ref: string): Promise<string> {
  if (!RELATION_REF_RE.test(ref)) {
    throw new Error(`graphify adapter: ref is not a relation note path: ${ref}`);
  }
  return readFile(ref, "utf8");
}

/** Incremental ingest via the live CLI surface (`graphify update <path>`,
 *  no-LLM re-extract — see card correction above). Loud on nonzero exit.
 *  NOT called on the write path — 06-08 schedules it. */
export async function updateGraphIncremental(
  corpusPath = "memory-store/relation",
): Promise<{ stdout: string; stderr: string }> {
  return execFileAsync("graphify", ["update", corpusPath]);
}
