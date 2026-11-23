// The two passes on the disk (piece 4's SPEC §4): `<root>/functions` and `<root>/reference`, read from the directories alone.
import type { Offence } from "./outcome.ts";

/** A file of a pass: the entry's name, extension included, and its text. */
export type PassFile = { name: string; text: string };

/**
 * Reads `<root>/functions` and `<root>/reference` — each when it stands; its key is absent when it does not.
 * Files by name; the offences of SPEC §4. Never throws for a root that holds neither, or does not exist.
 */
export function readPasses(_root: string): { functions?: PassFile[]; reference?: PassFile[]; offences: Offence[] } {
  throw new Error("NOT_BUILT");
}
