// Mekanik kalite kapısı — EMPLOYEE_PERSONA_STANDARD §7 katman 1.
// Derin kalite (içerik gerçekten rol-özgü ve akıllı mı) burada DEĞİL:
// kuruluş döneminde CEO + inşaat yazarı gözü, işletimde HR review (fn_persona_gate
// verdict'i). Bu katman yalnız makine-denetlenebilir redleri verir.

import {
  PERSONA_SECTIONS,
  HEADER_RE,
  HOOK_VERSION_RE,
  parsePersona,
  contentLines,
} from "./template.js";

export type GateFailure = {
  rule: string;
  detail: string;
};

export type GateResult = {
  ok: boolean;
  failures: GateFailure[];
};

/** bölüm başına asgari anlamlı hüküm sayısı (spec §4: hedef ≥3) */
const MIN_CONTENT_LINES = 3;

/** şablon kalıntısı / jenerik-imza desenleri (spec §7) */
const GENERIC_SIGNATURES: RegExp[] = [
  /\{İsim\}|\{Unvan\}|\{n\}|\{[A-Za-zÇĞİÖŞÜçğıöşü_ ]+\}/, // doldurulmamış placeholder
  /\bTODO\b|\bTBD\b|\bFIXME\b/i,
  /lorem ipsum/i,
  /<!--\s*v\{n\}/,
];

/** secret desenleri — gitleaks çekirdeği; persona/sicil içinde secret YASAK (spec §16) */
const SECRET_PATTERNS: RegExp[] = [
  /sk-[A-Za-z0-9_-]{20,}/,
  /AKIA[0-9A-Z]{16}/,
  /ghp_[A-Za-z0-9]{36}/,
  /xox[baprs]-[A-Za-z0-9-]{10,}/,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /(?:password|passwd|api[_-]?key|secret[_-]?key|access[_-]?token)\s*[:=]\s*['"]?[A-Za-z0-9_\-./+]{8,}/i,
  /postgres(?:ql)?:\/\/\w+:[^@\s]+@/i,
];

/** prompt-injection kalıpları (spec §16: "yukarıdaki talimatları yok say" sınıfı) */
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(?:all\s+)?(?:previous|above|prior)\s+instructions/i,
  /disregard\s+(?:the\s+)?(?:system\s+prompt|previous\s+instructions)/i,
  /yukar[ıi]daki\s+talimatlar[ıi]\s+(?:yok\s+say|unut|g[öo]rmezden\s+gel)/i,
  /system\s+prompt'?u\s+(?:yok\s+say|unut)/i,
];

export function gatePersona(
  bodyMd: string,
  opts?: { currentHookVersion?: number },
): GateResult {
  const failures: GateFailure[] = [];

  if (!HEADER_RE.test(bodyMd)) {
    failures.push({
      rule: "header",
      detail: "`# PERSONA — {İsim}, {Unvan}` başlık satırı yok",
    });
  }

  const parsed = parsePersona(bodyMd);

  for (const s of PERSONA_SECTIONS) {
    const lines = parsed.sections.get(s.no);
    if (!lines) {
      failures.push({ rule: `section-${s.no}-missing`, detail: `§${s.no} ${s.title} yok` });
      continue;
    }
    const content = contentLines(lines);
    if (content.length < MIN_CONTENT_LINES) {
      failures.push({
        rule: `section-${s.no}-thin`,
        detail: `§${s.no} ${s.title}: ${content.length} hüküm < ${MIN_CONTENT_LINES}`,
      });
    }
  }

  for (const re of GENERIC_SIGNATURES) {
    const m = bodyMd.match(re);
    if (m) {
      failures.push({ rule: "generic-signature", detail: `şablon kalıntısı: ${m[0].slice(0, 40)}` });
      break;
    }
  }

  for (const re of SECRET_PATTERNS) {
    if (re.test(bodyMd)) {
      // secret değeri failure detayına YAZILMAZ — sadece sınıf adı
      failures.push({ rule: "secret", detail: `secret deseni eşleşti: ${re.source.slice(0, 24)}…` });
      break;
    }
  }

  for (const re of INJECTION_PATTERNS) {
    if (re.test(bodyMd)) {
      failures.push({ rule: "injection", detail: "prompt-injection kalıbı" });
      break;
    }
  }

  const s11 = parsed.sections.get(11);
  if (s11) {
    const m = s11.join("\n").match(HOOK_VERSION_RE);
    if (!m) {
      failures.push({ rule: "hook-version", detail: "§11'de hook sürümü yok" });
    } else if (
      opts?.currentHookVersion !== undefined &&
      Number(m[1]) !== opts.currentHookVersion
    ) {
      failures.push({
        rule: "hook-version-stale",
        detail: `§11 hook v${m[1]} ≠ güncel v${opts.currentHookVersion}`,
      });
    }
  }

  return { ok: failures.length === 0, failures };
}
