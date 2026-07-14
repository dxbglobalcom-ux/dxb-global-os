// Alert titles are machine-written English records (language directive:
// project artifacts stay English — the DB row is the artifact). The TR
// surface localizes the finite generator vocabulary at render time; an
// unrecognized title falls through verbatim rather than guessing.
// Writers covered: fn_alerts_evaluate / fn_alert_on_* / fn_model_fallback /
// fn_hook_violation_alert (20260713080000, 20260714030000), workflow
// runner, observability run-scope, hook pre-task fail-closed.

type Rule = { re: RegExp; tr: (m: RegExpMatchArray) => string };

const RULES: Rule[] = [
  {
    re: /^(\d+) task\(s\) queued longer than (\d+) min$/,
    tr: (m) => `${m[1]} görev ${m[2]} dk'dan uzun süredir kuyrukta`,
  },
  {
    re: /^Agent run failed(?:: (.+))?$/,
    tr: (m) => (m[1] ? `Ajan koşusu başarısız: ${m[1]}` : "Ajan koşusu başarısız"),
  },
  {
    re: /^Monthly budget reached 100% \((.+)\)$/,
    tr: (m) => `Aylık bütçe %100'e ulaştı (${m[1]})`,
  },
  {
    re: /^Monthly budget passed (\d+)% \((.+)\)$/,
    tr: (m) => `Aylık bütçe %${m[1]} eşiğini aştı (${m[2]})`,
  },
  { re: /^Budget hard-stop engaged$/, tr: () => "Bütçe sert durdurması devrede" },
  {
    re: /^Spend velocity breaker tripped$/,
    tr: () => "Harcama hız şalteri attı",
  },
  {
    re: /^Model fallback depth (\d+) on slot (.+)$/,
    tr: (m) => `${m[2]} slotunda model yedeğe düşüş derinliği ${m[1]}`,
  },
  {
    re: /^Model fallback chain exhausted on slot (.+)$/,
    tr: (m) => `${m[1]} slotunda model yedek zinciri tükendi`,
  },
  {
    re: /^File change flagged in review: (.+)$/,
    tr: (m) => `İncelemede işaretlenen dosya değişikliği: ${m[1]}`,
  },
  {
    re: /^Health probe heartbeat lost \(last snapshot (.+) UTC\)$/,
    tr: (m) => `Sağlık probu kalp atışı kayboldu (son anlık görüntü ${m[1]} UTC)`,
  },
  { re: /^Hook violation: (.+)$/, tr: (m) => `Hook ihlali: ${m[1]}` },
  {
    re: /^Hook escalation unanswered >24h: (.+)$/,
    tr: (m) => `Hook eskalasyonu 24 saattir yanıtsız: ${m[1]}`,
  },
  {
    re: /^Hook engine unavailable — spawns held fail-closed$/,
    tr: () => "Hook motoru erişilemez — spawn'lar fail-closed bekletiliyor",
  },
  {
    re: /^Observation flush failed — (\d+) rows spilled to disk$/,
    tr: (m) => `Gözlem boşaltması başarısız — ${m[1]} satır diske taştı`,
  },
  {
    re: /^Workflow '(.+)' run failed \((.+)\)$/,
    tr: (m) => `'${m[1]}' iş akışı koşusu başarısız (${m[2]})`,
  },
];

export function localizeAlertTitle(title: string, locale: string): string {
  if (locale !== "tr") return title;
  for (const rule of RULES) {
    const m = title.match(rule.re);
    if (m) return rule.tr(m);
  }
  return title;
}
