// Locale-bound value formatters (Amendment A2: en primary, tr secondary).
// HH:MM stays 24-hour in BOTH locales — the "14:32" stamp format is a
// UI-SPEC §4 design decision, not a locale preference.
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

const BCP47: Record<Locale, string> = { tr: "tr-TR", en: "en-GB" };

const timeFormats = new Map<Locale, Intl.DateTimeFormat>();
const eurFormats = new Map<Locale, Intl.NumberFormat>();

export function timeHM(date: Date, locale: Locale = DEFAULT_LOCALE): string {
  let format = timeFormats.get(locale);
  if (!format) {
    format = new Intl.DateTimeFormat(BCP47[locale], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    timeFormats.set(locale, format);
  }
  return format.format(date);
}

export function formatEur(value: number, locale: Locale = DEFAULT_LOCALE): string {
  let format = eurFormats.get(locale);
  if (!format) {
    format = new Intl.NumberFormat(BCP47[locale], { style: "currency", currency: "EUR" });
    eurFormats.set(locale, format);
  }
  return format.format(value);
}
