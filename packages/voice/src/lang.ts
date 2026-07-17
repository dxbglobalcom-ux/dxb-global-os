// Utterance-language detection (VOICE_INTERACTION_SPEC §27: answer language =
// utterance language). Registered adaptation 2026-07-17: the UI locale is NOT
// a language source — forcing it into STT made Whisper transcribe Turkish
// speech as fluent English (measured live, call f05cf286). STT now runs in
// auto-detect and THIS module decides the language from the transcript text;
// the caller's locale is only a last-resort tie-break for char-ambiguous
// one-word utterances.

const TR_CHARS = /[çğıöşüÇĞİÖŞÜ]/;

// Deliberately common, short, high-frequency function words — the kind that
// survive STT errors. Not exhaustive; two hits already decide a sentence.
const TR_WORDS = new Set([
  "bir", "ve", "bu", "şu", "ne", "mı", "mi", "mu", "mü", "için", "var", "yok",
  "nasıl", "neden", "niye", "kaç", "bana", "benim", "senin", "ile", "çok",
  "az", "evet", "hayır", "lütfen", "merhaba", "selam", "tamam", "değil",
  "ben", "sen", "biz", "siz", "ama", "daha", "en", "gibi", "kadar", "sonra",
]);

const EN_WORDS = new Set([
  "the", "is", "are", "was", "were", "what", "why", "how", "when", "you",
  "me", "my", "your", "please", "hello", "hi", "yes", "no", "do", "does",
  "can", "could", "will", "would", "i", "we", "they", "it", "not", "and",
  "or", "of", "to", "in", "on", "for", "with", "have", "has",
]);

/** Decide the utterance language from transcript text. `hint` (the caller's
 *  UI locale) is used ONLY when the text carries no signal at all. */
export function detectLang(text: string, hint?: "tr" | "en"): "tr" | "en" {
  if (TR_CHARS.test(text)) return "tr";
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9çğıöşü\s']/gi, " ")
    .split(/\s+/)
    .filter(Boolean);
  let tr = 0;
  let en = 0;
  for (const tok of tokens) {
    if (TR_WORDS.has(tok)) tr += 1;
    if (EN_WORDS.has(tok)) en += 1;
  }
  if (tr > en) return "tr";
  if (en > tr) return "en";
  // No signal (e.g. a lone proper noun): caller hint, else the CEO's
  // primary language.
  return hint ?? "tr";
}
