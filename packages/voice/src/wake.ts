// JARVIS wake/dismiss phrase matching (VOICE_INTERACTION_SPEC §24bis,
// registered 2026-07-17 — CEO command verbatim: the system activates on
// "Selamaleykum ya Hamza" spoken aloud, and stands down on dismissal
// sentences like "kapanabilirsin / gidebilirsin (ya) Hamza").
//
// STT mangles greetings aggressively ("Selamünaleyküm", "Salam aleykum",
// "Selam aleyküm"…), so matching is fuzzy TOKEN-CLASS matching, never exact
// string equality: a wake = a salam-class token AND a hamza-class token in
// one utterance. "Hamza" is a rare token in ambient speech, which keeps the
// false-positive rate low while surviving transcription noise.

/** Turkish-aware normalize: lowercase with İ/I folding, strip punctuation,
 *  collapse whitespace. */
export function normalizeTr(text: string): string {
  return text
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .toLowerCase()
    .replace(/[^a-zçğıöşü0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Bounded Levenshtein — small strings only (wake tokens). */
export function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i, ...new Array<number>(n).fill(0)];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = cur;
  }
  return prev[n];
}

function fuzzyEquals(token: string, target: string, maxRatio = 0.34): boolean {
  const dist = editDistance(token, target);
  return dist <= Math.max(1, Math.floor(target.length * maxRatio));
}

// Salam-class: any greeting token whose stem opens with selam/salam/esselam.
// STT often glues the whole greeting into one token ("selamünaleyküm") or
// splits it ("selam aleyküm") — prefix carries the class either way.
function isSalamToken(token: string): boolean {
  return /^(es)?s[ae]l[aeü]m/.test(token);
}

function isHamzaToken(token: string): boolean {
  // Tight bound (distance ≤ 1): at ≤ 2 the common word "hava" false-wakes —
  // measured in the R3.2 unit battery. STT slips one char ("hamsa", "amza");
  // it does not slip two.
  return fuzzyEquals(token, "hamza", 0.2) || fuzzyEquals(token, "hamzaya", 0.2);
}

/** Wake = salam-class token + hamza-class token in the same utterance. */
export function matchWake(text: string): boolean {
  const tokens = normalizeTr(text).split(" ").filter(Boolean);
  return tokens.some(isSalamToken) && tokens.some(isHamzaToken);
}

// Dismiss verbs the CEO listed (plus close TR variants an STT plausibly
// produces). Utterance-level: a dismiss verb ends the session; the "hamza"
// vocative is optional in his sentences, so it is not required.
const DISMISS_STEMS = [
  "kapanabilirsin",
  "kapatabilirsin",
  "gidebilirsin",
  "kapan",
  "görüşürüz",
  "görüşmek",
  "hoşçakal",
  "hoşça",
];

export function matchDismiss(text: string): boolean {
  const tokens = normalizeTr(text).split(" ").filter(Boolean);
  return tokens.some((tok) => DISMISS_STEMS.some((stem) => fuzzyEquals(tok, stem, 0.25)));
}
