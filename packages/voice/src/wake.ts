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
// U15 D9 (2026-07-25, CEO live verdict "kapan dedim kapanmadı"): the CEO's
// actual shutdown words joined the list. Short stems (≤4 chars) match EXACT
// only — at fuzzy distance 1 "sus" would swallow "su" and "kes" would
// swallow "ses", both common in ordinary speech.
const DISMISS_STEMS = [
  "kapanabilirsin",
  "kapatabilirsin",
  "gidebilirsin",
  "kapan",
  "kapat",
  "görüşürüz",
  "görüşmek",
  "hoşçakal",
  "hoşça",
  "sus",
  "yeter",
  "kes",
];

function matchesStem(token: string, stem: string): boolean {
  if (stem.length <= 4) return token === stem;
  return fuzzyEquals(token, stem, 0.25);
}

export function matchDismiss(text: string): boolean {
  const tokens = normalizeTr(text).split(" ").filter(Boolean);
  return tokens.some((tok) => DISMISS_STEMS.some((stem) => matchesStem(tok, stem)));
}

// ── U15 round 2 (ticket 20260725-u15-voice-round2) — hard-off + chat-lane
// mute/unmute matchers. Semantics contract (spec §24bis round-2 block):
//   dismiss   → session closes, wake phrase re-opens (sleeping)
//   hard-off  → microphone MUTES until the CEO re-opens it from chat/panel
//   mute/unmute → the same commands arriving on the CHAT lane

/** Off-verb class: kapan/kapat and one-char STT slips of them. */
function isOffVerb(token: string): boolean {
  return fuzzyEquals(token, "kapan", 0.2) || fuzzyEquals(token, "kapat", 0.2);
}

/** On-verb class for reopening. "aç" is exact-only (2 chars). */
function isOnVerb(token: string): boolean {
  return token === "aç" || fuzzyEquals(token, "uyan", 0.25)
    || fuzzyEquals(token, "dinle", 0.25) || fuzzyEquals(token, "başlat", 0.25);
}

/** Address tokens that point a command at the voice layer itself. */
function isVoiceAddress(token: string): boolean {
  return token.startsWith("jarvis") || token.startsWith("hamza")
    || token.startsWith("mikrofon") || token.startsWith("ses")
    || token.startsWith("asistan");
}

/** Hard-off target: "kendini/tamamen/mikrofonu/sesi kapat" class. */
function isHardOffTarget(token: string): boolean {
  return token === "kendini" || token === "tamamen"
    || token.startsWith("mikrofon") || token.startsWith("ses");
}

/** Hard-off = an off-verb aimed at the daemon itself ("kendini kapat",
 *  "tamamen kapan", "mikrofonu kapat"). Plain dismissals are NOT hard-off. */
export function matchHardOff(text: string): boolean {
  const tokens = normalizeTr(text).split(" ").filter(Boolean);
  return tokens.some(isHardOffTarget) && tokens.some(isOffVerb);
}

// Filler tokens allowed inside a standalone command ("kapan artık lütfen").
const COMMAND_FILLER = new Set([
  "artık", "lütfen", "hemen", "şimdi", "hadi", "tamam", "i", "ı", "u", "ü",
]);

function isMuteWord(token: string): boolean {
  return isOffVerb(token) || token === "sus" || token === "kendini" || token === "yeter";
}

/** Chat-lane mute: a short standalone command whose EVERY token is
 *  command-class ("kapan", "sus artık lütfen"), a targeted command
 *  ("jarvis kapan", "sesli asistanı kapat"), or a hard-off sentence.
 *  Long free-text sentences ("dosyayı kapat ve raporu gönder") never match:
 *  without a voice-address token the standalone path requires ALL tokens to
 *  be command-class. */
export function matchMute(text: string): boolean {
  if (matchHardOff(text)) return true;
  const tokens = normalizeTr(text).split(" ").filter(Boolean);
  if (tokens.length === 0) return false;
  const standalone =
    tokens.length <= 3 &&
    tokens.every((t) => isMuteWord(t) || COMMAND_FILLER.has(t)) &&
    tokens.some((t) => isOffVerb(t) || t === "sus");
  if (standalone) return true;
  return tokens.some(isVoiceAddress) && tokens.some(isOffVerb);
}

/** Chat-lane unmute: "mikrofonu aç", "jarvis uyan", standalone "aç". */
export function matchUnmute(text: string): boolean {
  const tokens = normalizeTr(text).split(" ").filter(Boolean);
  if (tokens.length === 0) return false;
  const standalone =
    tokens.length <= 3 &&
    tokens.every((t) => isOnVerb(t) || isVoiceAddress(t) || COMMAND_FILLER.has(t)) &&
    tokens.some(isOnVerb);
  if (standalone) return true;
  return tokens.some(isVoiceAddress) && tokens.some(isOnVerb);
}
