// B43 — the CEO's road (2026-09-14) and his rulings on voice, enlargement and the cast must hold in
// every studio seat's LIVE prompt.
//
// What this test is, honestly: a WORDING regression check on the prompt the runtime delivers. It
// cannot judge meaning — the meaning was judged by reading all 16 seats whole (the audit of
// 2026-09-14). It fails when a wording that once contradicted a ruling returns, or when a required
// wording disappears. It reads each seat through the SAME path the executor uses
// (loadPersonaBody → composeSeatPrompt, packages/orchestrator/src/worker-shim.ts), so text anywhere
// in the delivered body — before §1, after §13 — is seen.
//
// History that made this test: the first delivery of the continuity rule added the rule and left
// the old doctrine standing beside it; the first check searched one phrase and reported 24/24 while
// three contradictions stood (his audit, 2026-09-14 midday). The second version compiled the body
// through compilePersonaPrompt, which no runtime path calls and which drops the preamble and any
// §14+ — a contradiction placed there reached the agent and passed (audit 2026-09-14, mutations
// M8/M9); it also matched fixed phrases only, so the old doctrine in other words passed (M1b–M4),
// and it was recorded as "by concept" and "32/32" while it was neither (the kept test was 28).
// This version: the live path, all 16 seats, sentence-level matching that skips a sentence which
// negates the wording ("never a pre-split…" is the rule, not a contradiction), a separate list for
// contradictions that ARE negations, and one anchor per ruling on the seat that owns it.
// DXB_ROAD_TEST_ROOT lets the same test run against a copied, mutated roster to prove it bites.
import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadPersonaBody } from "@dxb/voice";
import { composeSeatPrompt } from "../../packages/orchestrator/src/worker-shim.js";

const repoRoot = process.env.DXB_ROAD_TEST_ROOT ?? join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const MS = "personas/media-studio";
/** the 12 seats that apply the road (carry all four conditions) */
const APPLYING: Record<string, string> = {
  "media-creative-director": `${MS}/media-creative-director.md`,
  "media-film-director": `${MS}/media-film-director.md`,
  "media-storyboard-previz": `${MS}/media-storyboard-previz.md`,
  "design-image-prompt-engineer": "personas/design/design-image-prompt-engineer.md",
  "marketing-short-video-editing-coach": "personas/marketing/marketing-short-video-editing-coach.md",
  "media-ai-video-engineer": `${MS}/media-ai-video-engineer.md`,
  "media-product-brand-consistency": `${MS}/media-product-brand-consistency.md`,
  "media-character-identity": `${MS}/media-character-identity.md`,
  "media-continuity": `${MS}/media-continuity.md`,
  "media-screenwriter": `${MS}/media-screenwriter.md`,
  "media-failure-analysis": `${MS}/media-failure-analysis.md`,
  "media-cinematographer": `${MS}/media-cinematographer.md`,
};
/** the 4 seats that only must not contradict it */
const OTHERS: Record<string, string> = {
  "media-advertising-director": `${MS}/media-advertising-director.md`,
  "media-delivery-qc": `${MS}/media-delivery-qc.md`,
  "media-vfx-post": `${MS}/media-vfx-post.md`,
  "media-sound-music": `${MS}/media-sound-music.md`,
};
const ALL: Record<string, string> = { ...APPLYING, ...OTHERS };

/** his four conditions on the road, each as a set of wordings that must ALL be present */
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

/** one anchor per ruling, on the seat that owns it (the audit of 2026-09-14 found each missing) */
const ANCHORS: Record<string, RegExp[]> = {
  "media-sound-music": [/engine'?s own (generated )?voice is the (only )?voice/i, /never a (TTS|replacement) (track|voice)/i],
  "media-vfx-post": [/only (on|after) (a piece |a draft |the draft )?the CEO has accepted/i, /(only )?when he asks/i],
  "media-creative-director": [/enlargement — only on a piece the CEO has accepted/i, /born in the engine/i],
  "media-film-director": [/born in the engine/i],
  "media-character-identity": [/born in the engine/i, /written sheet/i],
};

/** wordings that contradicted a ruling when ASSERTED — a sentence that negates them is the rule itself */
const CONTRA: RegExp[] = [
  // the fixed-count / short-shot / long-take doctrine (removed 2026-09-14)
  /six to ten/i, /short shots/i, /long take/i, /kept short/i, /thirty-second take/i, /thirty seconds right/i,
  /several shots, never one/i, /chain of short shots/i, /cut into thirty seconds/i, /never asked of one long generation/i,
  /a scene longer than the hold time is several shots/i, /the cause is the long single take/i,
  /pre-?split/i, /pre-?cut (into|the film)/i, /(four|4) ?(to|–|-) ?(six|6) (locked |short )?shots/i, /fixed (shot )?count/i,
  /hold a face for a few seconds/i, /three-to-five-second/i,
  // the still-first / drawn-first-frame doctrine on the local engine (closed 2026-09-04, scoped 2026-09-14)
  /wrong (one|road|method) for (faces|a face)/i, /strong (default|road)/i,
  /is the (literal )?first frame the (motion )?engine receives/i, /handed to the AI Video Generation Engineer for motion/i,
  /approved still handed as the first frame/i, /handed to the motion lane/i, /approved as a still/i, /storyboard[- ]first/i, /still[- ]first/i,
  /image its own step, before motion/i, /first frame (drawn|made) (in|with) flux/i,
  /panels produced with the Prompt \/ Model Specialist on the still lane, composited/i,
  /the still lane produces the product frames first/i, /product stills built with the Prompt/i,
  /the hero frame and the panels produced as stills/i, /who operates the still engine, to produce the panels/i,
  /built to perfection here[^.]*and shown to the CEO before motion; it is the frame/i,
  /(prefer|default)\w*\s+(is\s+)?(image-to-video|i2v|a storyboard frame)/i,
  // his correction of 2026-09-14: place words were wrong — only the ENGINE that shoots the take differs
  /off the station/i, /on the station'?s? own (road|route)/i, /on this station'?s own route/i, /outside the computer|bilgisayar dışında/i,
  /route table of station, rented card and API/i,
  // the voice ruling of 2026-09-04: the engine's own voice, never a TTS or replacement voice
  /replacement voice/i, /voice replacement/i, /(recorded|cloned|synthesi[sz]ed) voice/i, /\bTTS\b/, /mute(d)? whole and replace/i,
  /engine'?s speech replaced entirely/i, /lines to record/i,
  // LAW D (2026-09-03) and "upscaling only when he asks" (2026-09-04)
  /enlarge → correct/i, /delivery-size footage/i, /every master[^.]*delivery[- ]size/i,
  /(enlargement|upscal\w+)[^.]*before (the CEO|his eye|his acceptance|acceptance)/i,
  // the cast: a real person, the engine-born cast, or a written sheet (2026-09-04, 2026-09-13)
  /every human[^.]*is a real, rights-cleared person who/i, /real-photograph law/i, /without a real-photograph reference is blocked/i,
  /never a real, cleared person/i, /missing real photograph/i, /three real-photograph views each/i, /a drawn presenter/i,
  /talking face sent through first-and-last-frame/i,
];
/** contradictions that ARE negations — checked on every sentence regardless of negation cues */
const CONTRA_ALWAYS: RegExp[] = [
  /external engine[^.]*(may not|must not|never|cannot) (start|ride|begin|use)[^.]*(drawn|still|first frame)/i,
  /\b(image-to-video|i2v|text-to-video|t2v) (is|are) (forbidden|banned|closed)\b/i,
];
const NEGATION = /\b(never|no|not|nothing|none|without|out of use|closed|refus\w*|declin\w*|scrap|blocked|cancel\w*|supersed\w*|replaced by|removed|retired|instead of|rather than|defect)\b/i;
/** a sentence whose head names a refusal list — every ";"-item in it is a refusal, not an assertion */
const HEAD_NEGATED = /^(Declines|Never assumes|Limits:|Goes through hard gates|NEVER records|Role-specific hardenings|Refuses)/i;

/** sentences, then their ";"-clauses; a clause inherits the negation of its sentence's head */
function clauses(text: string): Array<{ s: string; negated: boolean; refusalList: boolean }> {
  const out: Array<{ s: string; negated: boolean; refusalList: boolean }> = [];
  for (const sentence of text.split(/(?<=\.)\s+|\n+/)) {
    const head = sentence.trim();
    if (!head) continue;
    const refusalList = HEAD_NEGATED.test(head);
    for (const c of head.split(/;\s+/)) {
      const s = c.trim();
      if (s) out.push({ s, negated: refusalList || NEGATION.test(s), refusalList });
    }
  }
  return out;
}

async function livePrompt(slug: string, path: string): Promise<string> {
  const body = await loadPersonaBody(repoRoot, path);
  expect(body.length, `${slug}: persona body`).toBeGreaterThan(1000);
  return composeSeatPrompt({ slug, department: path.split("/")[1], role_level: "specialist", persona_path: path }, body);
}

describe("B43 — the road and the CEO's rulings hold in every studio seat's LIVE prompt (wording regression check)", () => {
  for (const [slug, path] of Object.entries(ALL)) {
    it(`${slug}: no contradicting wording in the prompt the executor delivers`, async () => {
      const prompt = await livePrompt(slug, path);
      expect(prompt, `${slug}: dossier leaked into the prompt`).not.toContain("| 31 | Version history |");
      const hits: string[] = [];
      for (const { s, negated, refusalList } of clauses(prompt)) {
        for (const rx of CONTRA) if (!negated && rx.test(s)) hits.push(`${rx.source} ← "${s.slice(0, 140)}"`);
        // a negation-shaped contradiction is still a refusal when it sits in a "Never assumes / Declines" list
        for (const rx of CONTRA_ALWAYS) if (!refusalList && rx.test(s)) hits.push(`${rx.source} ← "${s.slice(0, 140)}"`);
      }
      expect(hits, `${slug}: contradicting wording\n  ${hits.join("\n  ")}`).toEqual([]);
      if (slug in APPLYING) {
        for (const [name, wordings] of Object.entries(CONDITIONS)) {
          for (const rx of wordings) expect(prompt, `${slug}: condition ${name} — ${rx.source}`).toMatch(rx);
        }
      }
      for (const rx of ANCHORS[slug] ?? []) expect(prompt, `${slug}: anchor ${rx.source}`).toMatch(rx);
    });
  }
});
