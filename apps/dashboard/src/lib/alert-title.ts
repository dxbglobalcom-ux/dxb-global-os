// Alert titles are machine-written English records (language directive:
// project artifacts stay English — the DB row is the artifact). The TR
// surface localizes the finite generator vocabulary at render time; an
// unrecognized title falls through verbatim rather than guessing.
// Writers covered: fn_alerts_evaluate / fn_alert_on_* / fn_model_fallback /
// fn_hook_violation_alert (20260713080000, 20260714030000), workflow
// runner, observability run-scope, hook pre-task fail-closed.
//
// B39, 2026-08-25 — THE OTHER TWO LINES ARE LOCALIZED TOO, AND THEY NEVER WERE.
// Measured that day: `title` came through here, while `probable_cause` and
// `suggested_action` went to the CEO's screen as raw English. Those two are the
// lines that tell him WHAT HAPPENED and WHAT TO DO — the half of an alert he
// actually reads. The bilingual purity rule (00-CEO-DIRECTIVE-LANGUAGE) says a
// CEO surface is 100% one locale; two of the three lines were not.
// localizeAlertDetail below closes that for the patterns it knows, and falls
// through verbatim for the rest rather than guessing — same contract as titles.

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
  {
    // B39 — the dispatch line holding itself at the hourly model ceiling.
    re: /^The company paused its own work — this hour's working allowance is used up$/,
    tr: () => "Şirket kendi işini duraklattı — bu saat için ayırdığı çalışma payı doldu",
  },
  {
    // 2026-10-01 — the pin check (packages/gateway/src/pin-check.ts raisePinAlert).
    re: /^Tool locked: (.+) changed to a text the repository does not vouch for$/,
    tr: (m) => `Araç kilitlendi: ${m[1]} değişti ve yeni metni kayıtlı onaylı metin değil`,
  },
  {
    re: /^Tool updated without a lock: (.+) changed to the text the repository vouches for$/,
    tr: (m) => `Araç güncellendi, kilit gerekmedi: ${m[1]} kayıtlı onaylı metne geçti`,
  },
  {
    // 2026-10-04 — his list item 2: the lock lifted by the repository's word (pin-check.ts).
    re: /^Tool unlocked: (.+) now carries the text the repository vouches for$/,
    tr: (m) => `Araç kilidi açıldı: ${m[1]} artık depodaki onaylı metni taşıyor`,
  },
  {
    // B51 — a critical-gate seat that cannot judge (packages/orchestrator/src/critical-gate.ts runCriticalGate).
    re: /^Critical gate seat (\d+) cannot judge$/,
    tr: (m) => `Kritik kapının ${m[1]}. koltuğu karar veremiyor`,
  },
];

// The catalogue's statuses (model_catalog_status_check) as a seat's reason names them. An unknown one passes
// through as it is.
const MODEL_STATUS_TR: Record<string, string> = {
  testing: "deneme aşamasında",
  degraded: "performansı düşmüş durumda",
  disabled: "devre dışı",
  retired: "kullanımdan kaldırılmış",
};

// The pin check's signal names (packages/gateway/src/drift-review.ts describeDrift) — what to read
// first in a locked tool's change. An unknown name passes through as it is.
const PIN_SIGNAL_TR: Record<string, string> = {
  none: "yok",
  "hidden-characters": "gizli karakter",
  "reader-instruction": "okuyana talimat gibi yazılmış metin",
  "new-address": "yeni bir adres",
  "new-sensitive-word": "yeni bir hassas kelime",
  "new-outbound-parameter": "dışarıya veri taşıyabilecek yeni bir alan",
  "schema-changed": "alanların yapısı değişti",
};

// The other two lines of an alert: what probably caused it, and what to do.
const DETAIL_RULES: Rule[] = [
  {
    re: /^the company used (\d+) of the (\d+) it allows itself per hour$/,
    tr: (m) => `şirket bir saatte kendine ayırdığı ${m[2]} birimin ${m[1]}'ini kullandı`,
  },
  {
    re: /^Nothing is broken and nothing is lost\. Waiting work stays in the queue and the company starts again on its own within the hour — you do not have to do anything\. If this allowance is the wrong size for the company's pace, it is one number in Settings \((.+)\)\.$/,
    tr: (m) =>
      "Bozulan bir şey yok, kaybolan bir şey yok. Bekleyen işler kuyrukta durur ve şirket saat " +
      "içinde kendi kendine yeniden başlar — sizin bir şey yapmanız gerekmiyor. Bu pay şirketin " +
      `temposuna göre yanlış ölçüldüyse, Ayarlar'da tek bir sayıdır (${m[1]}).`,
  },
  // 2026-10-01 — the pin check's cause, action and area lines.
  {
    re: /^The new text is neither the approved one nor the one the repository's tool manifest carries\. Signals: (.+)$/,
    tr: (m) =>
      "Yeni metin ne eski onaylı metin ne de depodaki incelenmiş araç listesinde kayıtlı olan. " +
      `Önce bakılacaklar: ${m[1]!.split(", ").map((x) => PIN_SIGNAL_TR[x] ?? x).join(", ")}`,
  },
  {
    re: /^The tool is out of every profile until a person reads the change in audit record (\d+) and re-pins it$/,
    tr: (m) =>
      `Araç hiçbir çalışana verilmiyor; biri değişikliği ${m[1]} numaralı denetim kaydında okuyup ` +
      "aracı yeniden onaylayana kadar böyle kalır",
  },
  {
    re: /^The new text equals the repository's reviewed tool manifest$/,
    tr: () => "Yeni metin, depodaki incelenmiş araç listesindekiyle birebir aynı",
  },
  {
    re: /^The new text equals the repository's own source$/,
    tr: () => "Yeni metin, depodaki kendi kaynak kodumuzla birebir aynı",
  },
  {
    re: /^Nothing to do; the old and the new text are kept in audit record (\d+)$/,
    tr: (m) => `Yapılacak bir şey yok; eski ve yeni metin ${m[1]} numaralı denetim kaydında duruyor`,
  },
  {
    re: /^Nothing to do; the new text is kept in audit record (\d+) \(no earlier text was kept\)$/,
    tr: (m) => `Yapılacak bir şey yok; yeni metin ${m[1]} numaralı denetim kaydında duruyor (eski metin saklanmamıştı)`,
  },
  // 2026-10-04 — his list item 2: the lock goes to the security engineer; the watch's escalation lines
  // (packages/gateway/src/lock-review.ts); the unlock's resolve note and mitigation (pin-check.ts closeLock).
  {
    re: /^The security engineer reviews the change; the tool stays out of every profile until the repository's tool manifest carries the new text of audit record (\d+)$/,
    tr: (m) =>
      "Güvenlik mühendisi değişikliği inceliyor; araç, " +
      `${m[1]} numaralı denetim kaydındaki yeni metin depodaki incelenmiş araç listesine girene kadar hiçbir çalışana verilmiyor`,
  },
  {
    re: /^The security engineer judged the change in audit record (\d+) malicious; the tool stays out of every profile and a person decides$/,
    tr: (m) =>
      `Güvenlik mühendisi ${m[1]} numaralı denetim kaydındaki değişikliği kötü niyetli buldu; ` +
      "araç hiçbir çalışana verilmiyor ve kararı bir insan verecek",
  },
  {
    re: /^The security engineer's review of the change in audit record (\d+) gave no usable verdict; the tool stays out of every profile and a person decides$/,
    tr: (m) =>
      `Güvenlik mühendisinin ${m[1]} numaralı denetim kaydındaki değişiklik için yaptığı inceleme kullanılabilir bir karar vermedi; ` +
      "araç hiçbir çalışana verilmiyor ve kararı bir insan verecek",
  },
  {
    re: /^The tool has been locked for more than 72 hours \(audit record (\d+)\); it stays out of every profile until the repository's tool manifest carries the new text$/,
    tr: (m) =>
      `Araç 72 saatten uzun süredir kilitli (${m[1]} numaralı denetim kaydı); ` +
      "yeni metin depodaki incelenmiş araç listesine girene kadar hiçbir çalışana verilmiyor",
  },
  {
    re: /^Unlocked by the repository's word \(audit record (\d+)\)$/,
    tr: (m) => `Depodaki onaylı metin kilidi açtı (${m[1]} numaralı denetim kaydı)`,
  },
  {
    re: /^The repository's tool manifest carries the new text \(audit record (\d+)\)$/,
    tr: (m) => `Depodaki incelenmiş araç listesi artık yeni metni taşıyor (${m[1]} numaralı denetim kaydı)`,
  },
  { re: /^tool pins$/, tr: () => "araç onayları" },
  // B51 — the critical gate's seat alert: its action, and every reason seatsFrom gives for a seat that cannot
  // judge (packages/orchestrator/src/critical-gate.ts). The specific "is not …" lines come before "is <status>".
  {
    re: /^Name an active Codex-lane model for seat (\d+) in (\S+) \(\/sys\/settings\)\.$/,
    tr: (m) => `${m[1]}. koltuk için ${m[2]} ayarında (/sys/settings) etkin durumda bir Codex hattı modeli belirleyin.`,
  },
  { re: /^critical_gate$/, tr: () => "kritik karar kapısı" },
  { re: /^(\S+) is not two seats$/, tr: (m) => `${m[1]} ayarı tam olarak iki koltuk tanımlamıyor` },
  {
    re: /^seat (\d+): effort '(.*)' is not one of (\S+)$/,
    tr: (m) => `${m[1]}. koltuk: '${m[2]}' çaba düzeyi geçerli değil; şunlardan biri olmalı: ${m[3]}`,
  },
  {
    re: /^seat (\d+): (.+) is not in the model catalogue$/,
    tr: (m) => `${m[1]}. koltuk: ${m[2]} model kataloğunda bulunmuyor`,
  },
  {
    re: /^seat (\d+): (.+) is not on the Codex lane$/,
    tr: (m) => `${m[1]}. koltuk: ${m[2]} Codex hattında çalışmıyor`,
  },
  { re: /^seat (\d+): (.+) is banned$/, tr: (m) => `${m[1]}. koltuk: ${m[2]} yasaklı` },
  {
    re: /^seat (\d+): (.+) is (\S+)$/,
    tr: (m) => `${m[1]}. koltuk: ${m[2]} etkin değil (durumu: ${MODEL_STATUS_TR[m[3]!] ?? m[3]})`,
  },
];

function localize(rules: Rule[], text: string, locale: string): string {
  if (locale !== "tr") return text;
  for (const rule of rules) {
    const m = text.match(rule.re);
    if (m) return rule.tr(m);
  }
  return text;
}

export function localizeAlertTitle(title: string, locale: string): string {
  return localize(RULES, title, locale);
}

/** The cause and the suggested action — null passes through untouched. */
export function localizeAlertDetail(text: string | null, locale: string): string | null {
  return text === null ? null : localize(DETAIL_RULES, text, locale);
}
