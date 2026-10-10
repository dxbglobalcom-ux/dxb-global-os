// B51 step 3 · audit B4 — the Codex-lane smoke's pass decision, pure so a test pins it without a live call.
// A pass is: the runner answered, its text is JSON the critical gate's own verdict schema accepts, and the CLI
// that answered is known. `typeof … === "object"` was not a pass: null, {} and [] are objects to typeof.

/**
 * @param {{ ok: boolean, raw?: string | null, cli: string | null }} run
 * @param {{ safeParse: (v: unknown) => { success: boolean } }} verdictSchema — ChallengerVerdict
 * @returns {boolean}
 */
export function codexSmokePasses({ ok, raw, cli }, verdictSchema) {
  if (!ok || cli === null) return false;
  try {
    return verdictSchema.safeParse(JSON.parse(raw ?? "")).success;
  } catch {
    return false;
  }
}
