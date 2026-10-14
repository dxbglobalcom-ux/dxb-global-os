import { z } from "zod";

// The body /api/intent accepts (DASH-02 seam). What the CEO gives the holding
// is a goal — a broad brief written the way a task is written for an engineer
// (B64 A1, CEO 2026-10-12) — so there is no 500-character cap any more. The
// bound below is a sanity limit only and must equal the intents_text_check
// in migration 20261014040000.
export const GOAL_MAX_CHARS = 20000;

export const IntentBody = z.object({
  text: z.string().trim().min(1).max(GOAL_MAX_CHARS),
  lang: z.enum(["tr", "en"]).default("en"),
});
