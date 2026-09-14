// B43 leg (3) — the CEO's road (2026-09-14) must be CONSISTENT in every studio seat's real prompt.
//
// History that made this test: the first delivery of the continuity rule added the rule and left
// the old doctrine standing beside it; the first check searched one phrase and a list of old words
// and reported 24/24 while three contradictions stood (his audit, 2026-09-14). This test renders
// each seat's prompt the way the runtime does (loadPersonaBody → compilePersonaPrompt, full and
// compact) and tests his four conditions BY CONCEPT — several wordings each — plus a broad list of
// the sentences that contradicted them. A new contradiction wording is added to CONTRA when found;
// the four conditions never shrink. 2026-09-14 afternoon: condition 4 grew — on the station Flux is not
// used at all (panels written, the hero frame the engine's own); the still lane serves the external routes only.
import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadPersonaBody } from "@dxb/voice";
import { compilePersonaPrompt } from "../../packages/hr/src/compiler.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** the 12 seats that apply the road (carry all four conditions) */
const APPLYING: Record<string, string> = {
  "media-creative-director": "personas/media-studio/media-creative-director.md",
  "media-film-director": "personas/media-studio/media-film-director.md",
  "media-storyboard-previz": "personas/media-studio/media-storyboard-previz.md",
  "design-image-prompt-engineer": "personas/design/design-image-prompt-engineer.md",
  "marketing-short-video-editing-coach": "personas/marketing/marketing-short-video-editing-coach.md",
  "media-ai-video-engineer": "personas/media-studio/media-ai-video-engineer.md",
  "media-product-brand-consistency": "personas/media-studio/media-product-brand-consistency.md",
  "media-character-identity": "personas/media-studio/media-character-identity.md",
  "media-continuity": "personas/media-studio/media-continuity.md",
  "media-screenwriter": "personas/media-studio/media-screenwriter.md",
  "media-failure-analysis": "personas/media-studio/media-failure-analysis.md",
  "media-cinematographer": "personas/media-studio/media-cinematographer.md",
};
/** the 4 seats that only must not contradict it */
const OTHERS: Record<string, string> = {
  "media-advertising-director": "personas/media-studio/media-advertising-director.md",
  "media-delivery-qc": "personas/media-studio/media-delivery-qc.md",
  "media-vfx-post": "personas/media-studio/media-vfx-post.md",
  "media-sound-music": "personas/media-studio/media-sound-music.md",
};

/** his four conditions, each as a set of wordings that must ALL be present (concept, not one phrase) */
const CONDITIONS: Record<string, RegExp[]> = {
  "1 one take when it suffices; no fixed pre-split": [
    /one take when (it|one) suffic/i,
    /never (a )?pre-split|never pre-cut|no fixed pre-split|never a fixed split|never from a fixed count|never a pre-planned split|no scene pre-split|no film (is )?pre-split/i,
  ],
  "2 a native multi-shot run is evaluated first": [
    /natively in one run|shoot(s)? (a |the )?(multi-shot )?sequence natively|several shots in one run|whole sequence in one run|holds a whole sequence/i,
  ],
  "3 joins are the shooting engine's own frames": [
    /engine'?s own (last )?frame|frames of the engine that shot|shooting engine'?s own frames|taken from the engine that shot|the frame the engine itself shot/i,
  ],
  "4 Flux plays no part in the LOCAL engine's take; a Flux still made here may go to an EXTERNAL engine's take; everything is made here": [
    /Flux (is not used|plays no part)/i,
    /local[- ]engine('s)? take|shot by the local engine|the local engine \(MiniMax H3/i,
    /external engine('s)? take|shot by an external engine|RunPod, an API or an MCP/i,
    /made here on this computer|made here, on this computer|produced here on this computer/i,
    /text-to-video and image-to-video are both open|image-to-video is not forbidden|both roads/i,
    /local engine is the first choice|first choice, beginning to end/i,
  ],
};

/** sentences that contradicted the road — every one found on 2026-09-14 and removed */
const CONTRA: RegExp[] = [
  /six to ten/i, /short shots/i, /long take/i, /kept short/i, /thirty-second take/i, /thirty seconds right/i,
  /wrong (one|road|method) for (faces|a face)/i, /several shots, never one/i,
  /is the (literal )?first frame the (motion )?engine receives/i, /handed to the AI Video Generation Engineer for motion/i,
  /approved still handed as the first frame/i, /strong default wherever/i, /never asked of one long generation/i,
  /cut into thirty seconds/i, /chain of short shots/i, /handed to the motion lane/i,
  /a scene longer than the hold time is several shots/i, /the cause is the long single take/i,
  // his three sentences of 2026-09-14 (afternoon): on the station Flux is not used at all — no local still lane
  /panels produced with the Prompt \/ Model Specialist on the still lane, composited/i,
  /the still lane produces the product frames first/i, /product stills built with the Prompt/i,
  /the hero frame and the panels produced as stills/i, /who operates the still engine, to produce the panels/i,
  /built to perfection here[^.]*and shown to the CEO before motion; it is the frame/i,
  // his correction (2026-09-14 afternoon): place words were wrong — only the ENGINE that shoots the take differs
  /off the station/i, /on the station'?s? own (road|route)/i, /on this station'?s own route/i, /outside the computer|bilgisayar dışında/i,
];

async function render(path: string, mode: "full" | "compact"): Promise<string> {
  const body = await loadPersonaBody(repoRoot, path);
  expect(body.length, `${path}: persona body`).toBeGreaterThan(1000);
  return compilePersonaPrompt({ personaBody: body, hookVersion: 1, hookStandardText: "(hook)", mode });
}

describe("B43 leg (3) — the road's four conditions are consistent in every studio seat's real prompt", () => {
  for (const [slug, path] of Object.entries(APPLYING)) {
    for (const mode of ["full", "compact"] as const) {
      it(`${slug} (${mode}) carries all four conditions and no contradiction`, async () => {
        const prompt = await render(path, mode);
        for (const [name, wordings] of Object.entries(CONDITIONS)) {
          for (const rx of wordings) expect(prompt, `${slug}: condition ${name} — ${rx.source}`).toMatch(rx);
        }
        for (const rx of CONTRA) expect(prompt, `${slug}: contradiction ${rx.source}`).not.toMatch(rx);
        expect(prompt, `${slug}: dossier leaked into the prompt`).not.toContain("| 31 | Version history |");
      });
    }
  }
  for (const [slug, path] of Object.entries(OTHERS)) {
    it(`${slug} (full) does not contradict the road`, async () => {
      const prompt = await render(path, "full");
      for (const rx of CONTRA) expect(prompt, `${slug}: contradiction ${rx.source}`).not.toMatch(rx);
    });
  }
});
