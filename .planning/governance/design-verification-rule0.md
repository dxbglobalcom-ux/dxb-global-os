---
name: design-verification-rule0
description: RULE
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 8d6b0a5d-7aee-4050-bdf2-9c63a7459068
---

CEO talimatı 2026-07-13 ~01:40 (bir gecede 7 görsel kusuru bizzat yakalamak zorunda kaldıktan sonra, "EN ŞİDDETLİ TALİMAT"): **görsel yüzeye dokunan hiçbir iş Design Verification Pass koşulmadan ve kanıtlanmadan done raporlanamaz.**

**Why:** CEO'nun dashboard'u sürekli kontrol edip hata bulmak zorunda kalması = zaman + token israfı + anti-baby-sitting çekirdek değerinin ihlali. Derleme/test geçmesi görsel doğruluk kanıtı değildir.

**How to apply:**
1. Dokunulan HER rotayı gerçek tarayıcıda render et: İKİ locale (EN+TR) × ≥2 genişlik (~1280 + ≥1900).
2. `references/design-bank/CHECKLIST.md` maddelerini tek tek yürü: örtüşme, hizalama, kesik içerik, scroll sağlığı (çift bar yok, erişilmez satır yok), dil saflığı, dürüst boş-durumlar, rozet gürültüsü, token disiplini, modern/jenerik-değil çıtası.
3. `references/design-bank/` baseline'larıyla karşılaştır (INDEX.md: APPROVED = CEO kontratı, PENDING = göz testi bekliyor); onaylı baseline'dan kayıtsız sapma = ihlal.
4. Makine kapıları: `scripts/i18n-purity-check.sh` + tsc + eslint (+ contrast).
5. Rapora ekran görüntüsü + karar veren çıktılar; göz testi SON cila, ilk QA değil.

Tam metin: `HOLDING-OS-MASTER-PLAN/00-CEO-DIRECTIVE-DESIGN-VERIFICATION.md`; CLAUDE.md'nin EN BAŞINDA RULE #0 olarak alıntılı.

Related: [[evidence-before-done]], [[ui-bilingual-purity-gate]], [[phase8-design-brief]], [[master-plan-fidelity]].
