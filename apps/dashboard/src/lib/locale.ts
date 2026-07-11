import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, type Locale } from "./i18n";

// Locale çözümü (A2: EN birincil, TR tam ikincil) — tercih cookie'de
// yaşar (httpOnly değil: UI tercihi, gizli veri değil). i18n.ts client
// bundle'a da girdiği için next/headers BURADA izole kalır.

export const LOCALE_COOKIE = "dxb-locale";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const raw = store.get(LOCALE_COOKIE)?.value;
  return raw === "tr" || raw === "en" ? raw : DEFAULT_LOCALE;
}
