// An outcome several bench cases expect, spelled in one place: every part of it is given by the case.
import type { Outcome } from "@dxb-foundation/chain";

/** A reference pass that failed at `file` with `message`, in a run that applied these schema files before it. */
export const referenceFailedAt = (file: string, message: string, applied: string[] = []): Outcome => ({ state: "pass-failed", pass: "reference", file, message, applied });
