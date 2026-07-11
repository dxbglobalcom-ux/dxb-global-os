// Minimal dictionary loader (DASH-06): bilingual — en is primary (UI-SPEC
// Amendment A2), tr mirrors it at full coverage. Every user-visible string
// lives in messages/*.json — hard-coded UI strings are a violation, scanned
// at phase verification. Locale switching UI arrives in 08-07; until then
// the app renders the default locale.
import tr from "../../messages/tr.json";
import en from "../../messages/en.json";

export type Locale = "tr" | "en";
export const DEFAULT_LOCALE: Locale = "en";
// Cookie adı client tarafında da lazım (LocaleSwitch); server çözümü
// lib/locale.ts'te (next/headers oradan izole).
export const LOCALE_COOKIE_CLIENT = "dxb-locale";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = { tr, en };

export function getDict(locale: Locale = DEFAULT_LOCALE): Dictionary {
  return dictionaries[locale];
}
