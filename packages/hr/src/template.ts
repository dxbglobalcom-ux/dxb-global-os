// EMPLOYEE_PERSONA_STANDARD §4 — 11 zorunlu bölüm (madde 8 birebir).
// Başlık numarası + anahtar sözcük eşleşmesi gate ve derleyicinin ortak
// sözlüğüdür; başlık metni değişirse spec değişmiş demektir (tek kaynak).

export type SectionSpec = {
  no: number;
  /** `## {no}.` satırında aranan anahtar parça (küçük harf) */
  key: string;
  title: string;
  /** compact derlemede kısaltılabilir mi (§1-6 + §11 HER ZAMAN tam — spec §26) */
  compactable: boolean;
  /**
   * Rol-özgü bölüm: YOKSA kapı reddetmez, VARSA derlenir.
   * Bu bayrak olmadan role-specific bir bölüm eklemek iki yoldan da yanlıştı:
   * listeye eklenmezse derleyici onu SESSİZCE düşürür (yazılmış ama teslim
   * edilmemiş bir CEO emri), listeye zorunlu olarak eklenirse bölümü olmayan
   * 198 persona kapıdan düşer. Ölçüldü 2026-07-27, §13 eklenirken.
   */
  optional?: boolean;
};

export const PERSONA_SECTIONS: readonly SectionSpec[] = [
  { no: 1, key: "rol kimliği", title: "Rol kimliği", compactable: false },
  { no: 2, key: "düşünme disiplini", title: "Düşünme disiplini", compactable: false },
  { no: 3, key: "iş yapma yöntemi", title: "İş yapma yöntemi", compactable: false },
  { no: 4, key: "karar yöntemi", title: "Karar yöntemi", compactable: false },
  { no: 5, key: "hata önleme", title: "Hata önleme yöntemi", compactable: false },
  { no: 6, key: "kalite kriterleri", title: "Kalite kriterleri", compactable: false },
  { no: 7, key: "departman ilişkileri", title: "Departman ilişkileri", compactable: true },
  { no: 8, key: "ceo'ya raporlama", title: "CEO'ya raporlama", compactable: true },
  { no: 9, key: "tool kullanımı", title: "Tool kullanımı", compactable: true },
  { no: 10, key: "memory kullanımı", title: "Memory kullanımı", compactable: true },
  { no: 11, key: "hook bağlantısı", title: "Fable 5 hook bağlantısı", compactable: false },
  // §12 anayasal bölüm (CEO D5+D6 2026-07-17, Talep §5.12; spec §4.1 kanonik metin, G8):
  // tek tip metin tasarım gereği — jenerik-metin reddi §12'ye uygulanmaz.
  { no: 12, key: "discipline dna", title: "Discipline DNA & Islamic conduct", compactable: false },
  // §13 — rol-özgü karakter bölümü (CEO ruling 2026-07-27). Şu an YALNIZ orkestratörde
  // (`agents-orchestrator` = Hamza): CEO şirketini emanet edeceği orkestratörün, adını taşıdığı
  // Hamza ibn Abdülmuttalib (r.a.) karakterinde olmasını emretti. §12'nin aksine bu bölüm
  // MİRAS ALINMAZ — ada ve arkasındaki emanete özgüdür. optional: yoksa kapı reddetmez.
  {
    no: 13,
    key: "name and the character",
    title: "The name and the character",
    compactable: false,
    optional: true,
  },
] as const;

/** `# PERSONA — {Unvan}` başlık satırı deseni — isim politikası (E5.2b, CEO 2026-07-11):
 *  uydurma insan adı YASAK, rol adıyla anılır; tarihsel `{İsim}, {Unvan}` formu da geçer. */
export const HEADER_RE = /^# PERSONA — .+$/m;

/** §11 içinde geçerli hook sürümü: `hook_version: v3` / `hook sürümü v3` vb. */
export const HOOK_VERSION_RE = /hook[\s_-]?(?:version|sürümü?)\s*[:=]?\s*v?(\d+)/i;

export type ParsedPersona = {
  header: string;
  /** bölüm no → ham içerik satırları (başlık satırı hariç) */
  sections: Map<number, string[]>;
};

/** body_md'yi başlık + 11 bölüme ayırır; bölüm sınırı `## {n}.` satırıdır. */
export function parsePersona(bodyMd: string): ParsedPersona {
  const lines = bodyMd.split("\n");
  const sections = new Map<number, string[]>();
  const headerMatch = bodyMd.match(HEADER_RE);
  let current: number | null = null;
  for (const line of lines) {
    const m = line.match(/^##\s+(\d+)\./);
    if (m) {
      current = Number(m[1]);
      sections.set(current, []);
      continue;
    }
    if (current !== null) sections.get(current)!.push(line);
  }
  return { header: headerMatch?.[0] ?? "", sections };
}

/** yorum/boş satır düşülmüş anlamlı içerik satırları */
export function contentLines(sectionLines: string[]): string[] {
  return sectionLines.filter((l) => {
    const t = l.trim();
    return t !== "" && !t.startsWith("<!--");
  });
}
