# CEO DİREKTİFİ — 2026-07-09 Dış Denetim Sonucu (BAĞLAYICI)

> Kaynak: CEO'nun 12 endişe maddesi + master notlar dosyasının (ODT) A'dan Z'ye bağımsız denetimi.
> Statü: **Bağlayıcı direktif** — [[master-plan-fidelity]] kuralına tabidir. Sapma gerekiyorsa kayıtlı + CEO'ya görünür olmalı; sessiz sapma yasak.
> Uygulayıcı: Ana inşaat session'ındaki Fable 5. Bu belge dış denetim session'ı tarafından üretildi; ana session'ın başka hiçbir dosyasına dokunulmadı.

---

## Bölüm A — Onaylanan Mevcut Durum (değişiklik istenmez, devam)

Denetim şu kalemlerin planda doğru karşılandığını teyit etti:

| Konu | Plandaki yeri | Denetim notu |
|---|---|---|
| autoresearch (karpathy) | Phase 11 — ROADMAP.md:322, INTEGRATION-TRACKER.md:59 | Locked-scorer + git commit/revert disiplini kriterde. Study card stub — fazın başında derinleşecek (mevcut kural) |
| Whisperflow | Phase 9 — açık-kaynak klon (voicebox + Speaches/faster-whisper) | Paralı ürün alınmıyor; CEO isteğine uygun |
| CRM + Dashboard | Phase 8 — responsive web, telefon+masaüstü tarayıcıdan, uzaktan erişim, Türkçe-dostu | Native ayrı uygulama GEREKMEZ; responsive web CEO tarafından yeterli kabul edildi |
| Repo kütüphanesi | INTEGRATION-TRACKER.md envanteri + study-before-install (INTEG-01) | Her repo kullanılacağı fazın BAŞINDA inşaat yazarı (2026-07-25'ten itibaren Opus 5) bizzat derin çalışır — kural geçerli, değişmez |
| 7/24 gelir holding | Phase 7 (24/7 VPS + Hermes) + Phase 11 (Outleteuro → techshopeuro → social media) | CEO-sadece-onaylar modeli GATE-01'de kayıtlı |
| Departmanlar (creative + social) | Boş oldukları için seed edilmedi; Phase 10 persona v2.0 factory'de kurulacak | Katlanma yok, kayıp yok |
| JARVIS komut kanalı | Phase 9 — VOICE-02: STT → kernel intent yolu | Sesli komut, dashboard komutuyla AYNI kernel yoluna iner (Bölüm B madde 2 ile spec'e açık cümle eklenecek) |

---

## Bölüm B — Direktifler (8 madde; her biri kabul kriteriyle kapanır)

### B1. Loop engineering: genel OS modülü + Outleteuro pilotu
**Ne:** Phase 11'deki loop-engineering kapsamı SADECE tek Outleteuro asset'i olmayacak. Önce **genel loop-engine modülü** kurulacak: her departmanın örnekleyebileceği program.md + asset + **locked scorer** şablonu (değiştir → ölç → daha iyiyse commit, kötüyse revert). Örnek kullanım alanları: sales mail şablonu → cevap oranı; reklam metni → CTR; ürün listeleme → dönüşüm; agent promptu → test geçme oranı. İlk canlı uygulama: Outleteuro asset'i.
**Nerede:** ROADMAP.md Phase 11 kriteri + INTEGRATION-TRACKER.md (autoresearch satırı) + Phase 11 plan.
**Güvenlik (değişmez):** scorer kilitli (agent asla düzenleyemez), gerçek mail draft-only, onaysız bütçe harcaması yok.
**Kabul kriteri:** Phase 11 planında "generic loop-engine module" ayrı task olarak görünür; Outleteuro asset'i onun ilk örneği olarak tanımlı; ROADMAP kriteri güncellenmiş ve commit edilmiş.
**Kapanış fazı:** Phase 11 (plan güncellemesi hemen yapılabilir).

### B2. JARVIS: wake word + tam komut kanalı şartı
**Ne:** Phase 9 spec'ine iki şart yazılacak:
1. Wake word **runtime-configurable config değeri**, varsayılan: **"Selamünaleyküm ya Hamza"** (openWakeWord; CEO istediği zaman değiştirebilir).
2. Açık cümle: *"JARVIS, dashboard'a EŞİT tam komut kanalıdır — CEO'nun her sesli direktifi kernel intent yoluna iner ve ilgili departmana dağıtılır; asistan istenen işe itiraz etmez, risk ve faydayı bildirir, son karar CEO'nundur; outward aksiyonlar mevcut GATE-01 draft+onay akışından geçer."*
**Nerede:** master-plan/PHASE-09.md (veya Phase 9 spec eşdeğeri) + REQUIREMENTS.md VOICE bölümü.
**Kabul kriteri:** Her iki şart Phase 9 spec metninde birebir yer alır; wake word değeri hard-code değil config'te.
**Kapanış fazı:** Spec güncellemesi hemen; uygulama Phase 9.

### B3. Design-bundle re-enable köprüsü
**Ne:** Token-diet'te kapatılan design/UI skilleri (impeccable, taste vb. — STATE.md:117 kaydı) ile Phase 8 "design bundle faz BAŞINDA kurulur+çalışılır" kriteri arasında otomatik hatırlatma köprüsü yok. Köprü kurulacak:
1. STATE.md Blockers/Concerns'e satır: *"Phase 8 giriş şartı: design bundle (impeccable + taste + open-design + Google Stitch) re-enable + study — dashboard tasarımından ÖNCE."*
2. Kalıcı memory kaydı (session'lar arası hatırlatma).
**Kabul kriteri:** STATE.md satırı commit edilmiş + memory dosyası yazılmış; Phase 8 planlaması bu şart kapanmadan design işine başlayamaz.
**Kapanış fazı:** Hemen.

### B4. ODT kalem denetimi raporu
**Ne:** Master notlardaki şu kalemler için tek tek **VAR / YOK / DIŞLANDI** raporu: MiroFish (decision-intelligence/simülasyon katmanı olarak), Google Stitch + Gemini Omni, video-izleme zinciri (yt-dlp / browser-use video-use / OpenMontage — "OS video izleyip öğrenmeli" gereksinimi; 07-07 video-learn ile ilişkisi netleşsin), Agent-Reach, open-notebook / NotebookLM entegrasyonu.
**Dokunulmayacak:** kickbacks / automaton / llm-council bilinçli dışlanmıştır — karar geçerli. Apify: anahtar CEO tarafından rotate edildi ve dosyadan kaldırıldı — konu KAPALI.
**Kabul kriteri:** INTEGRATION-TRACKER.md'de her kalem için satır (durum + faz + gerekçe); eksik bulunanlar için study card hedefi atanmış; rapor CEO tablo formatında (✓/⚠/❌ + kanıt).
**Kapanış fazı:** Rapor hemen; kurulumlar ilgili fazlarında (dual-role kuralı).

### B5. Email / self-marketing outbound pipeline kriteri
**Ne:** Güvenlik tarafı (DRAFT-only, outbox executor, tek Gmail-send credential) sağlam. Eksik olan: şirketin KENDİ hizmetini pazarlayan outbound pipeline'ın açık faz kriteri olması. Phase 10/11 kriterlerine eklenecek: *"DXB kendi hizmetlerini pazarlayan outbound pipeline çalışır: humanizer skill zorunlu, tüm gönderimler draft → CEO onay → outbox; ölçülebilir çıktı (gönderilen kampanya sayısı / cevap oranı) dashboard'da görünür."*
**Kabul kriteri:** ROADMAP Phase 10 veya 11 kriter listesinde bu madde; loop-engine (B1) ile bağlantısı not edilmiş (mail şablonu ilk loop asset adaylarından).
**Kapanış fazı:** Kriter güncellemesi hemen; uygulama Phase 10/11.

### B6. Literatür programı: 50+ kaynağın profesör-derinliğinde etüdü + gelir fırsatları sentezi
**Ne:** Master notlar (ODT) 50'den fazla repo/kaynak içeriyor. Bunlar sadece "kur ve kullan" envanteri değil — **literatür**dür. İnşaat yazarı (2026-07-25'ten itibaren Opus 5) bu külliyatı bir üniversite profesörü gibi okuyacak, literatür belgesi oluşturacak ve şu soruya cevap üretecek: *"Bu kütüphanedeki bilgilerle DXB Global'ın içinde AYRICA neler yapılabilir — gerçek müşteri, gerçek kârlılık, gerçek para; fiziki bir şirketin yapamayacağı veya çok zor/yavaş elde edeceği satış kazançları hangi yapılar, sistemler, ek düğmeler ve otomasyonlar kurulursa mümkün olur?"*

**Yöntem (governance'a uygun):**
1. **Külliyat envanteri:** ODT'deki TÜM kaynaklar tek listede — repolar (superpowers, humanizer, Scrapegraph-ai, ruflo, gstack, last30days, OpenMontage, graphify, Obsidian dörtlüsü, headroom, claude-mem, yt-dlp, supabase, caveman, opencut, ECC, marketingskills, awesome-claude-code, impeccable, agency-agents, vercel skills, Agent-Reach, voicebox, open-design, claudex, system_prompts_leaks, karpathy skills+llm-wiki+autoresearch, playwright-mcp, gsd-core, video-use, MoneyPrinterTurbo, open_deep_research, gpt-researcher, browser-use, gptr-mcp, hermes-agent, jcode, oh-my-pi, free-claude-code, taste-skill, knowledge-work-plugins, agent-skills, MiroFish 3 varyant, OpenJarvis) + servisler (Apify, Higgsfield, Figma, Google Stitch/Gemini Omni, 9Router Fusion, huggingface, NotebookLM/open-notebook, Aceternity, Refero, Mobbin, Godly) + Anthropic resmi MCP/plugin haritası. Dışlananlar (kickbacks/automaton/llm-council) listede "DIŞLANDI + gerekçe" olarak durur.
2. **Etüt:** Ham malzeme toplamayı (README, docs, örnekler) Sonnet yapabilir; **okuma, değerlendirme ve sentez inşaat yazarının bizzat işi** — model-routing yetki matrisi geçerli. Her kaynak için literatür girdisi: çekirdek fikir, DXB'de mevcut kullanım yeri, başka kaynaklarla kombinasyonu, gelir potansiyeli notu.
3. **Sentez belgesi:** `.planning/research/LITERATURE.md` + `.planning/research/REVENUE-OPPORTUNITIES.md`. İkincisi ana çıktı: her fırsat için — ne kurulur, hangi kaynaklar birleşir, para nasıl kazanılır (müşteri kim, ödemeyi kim yapar), fiziki şirketin neden yapamayacağı/yavaş kalacağı, hangi faza bağlanır, hangi gate'ler (draft-only, bütçe) geçerli. Örnek damar (bağlayıcı değil, çıta göstergesi): Scrapegraph+Apify+browser-use ile tedarikçi/fiyat istihbaratı servisi; MoneyPrinterTurbo+opencut+Higgsfield ile 7/24 içerik-reklam fabrikası; open_deep_research+gpt-researcher ile satılabilir pazar-araştırma raporu ürünü; last30days+Agent-Reach ile trend-yakalama ve erken-satış sinyali; autoresearch loop'larıyla müşteri assetlerinin ücretli sürekli-optimizasyonu (retainer modeli).
4. **Yazarın kendi katkısı ZORUNLU:** Listeyle sınırlı kalmayacak — kendi bilgisinden ek gelir yapıları, eksik gördüğü repo/araçları da ekleyecek (ODT kuralı zaten diyor: "eksik parça varsa GitHub'da reposunu bul").

**Zamanlama (token disiplini, kalite düşmeden):** Dalga 1 (envanter + sınıflandırma + ilk sentez taslağı) hemen başlar, Phase 7 yürütmesini bloklamaz. Derin etüt dalgaları fazlara hizalanır (dual-role kuralı korunur) ama TAMAMI Phase 10 planlamasından önce bitmiş olmalı — persona v2 ve departman aktivasyonu bu literatürden beslenecek. REVENUE-OPPORTUNITIES.md her dalga sonunda güncellenir ve CEO'ya sunulur.
**Kabul kriteri:** ODT'deki her kaynağın literatür girdisi var (stub bırakmak yasak — Phase 10 planlaması öncesi); REVENUE-OPPORTUNITIES.md'de en az 10 somut fırsat (her biri: mekanizma + müşteri + faz + gate); Yazarın liste-dışı kendi önerileri ayrı bölümde; rapor CEO tablo formatında.
**Kapanış fazı:** Dalga 1 hemen; tam kapanış Phase 10 planlama girişi.

### B7. CEO yük sıfırlama: onay/red makamı, iş gönderilmez + onay kapsamı daraltma
**Ne:** CEO'nun dışarıda işleri var; bu OS tam da bu yüzden kuruluyor. Şirket CEO'ya İŞ göndermez — CEO **onay/red makamıdır**. İki alt kural:

**7a. CEO'ya gidebilecek istek sınıfları (bunlar dışında CEO'ya görev açmak YASAK):**
1. **Para ÇIKIŞI onayı** — transfer, ödeme, harcama, reklam bütçesi: her zaman CEO onayı.
2. **Kritik hukuki taahhüt** — sözleşme imza/gönderim: CEO onayı.
3. **Yasal/fiziki olarak insan gerektiren kimlik adımları** — 2FA, banka hesabı açma, domain tescili gibi. Bunlar bile: batched tek liste, copy-paste hazır adımlar, dakika tahmini ile sunulur; asla "araştır, kur, ayarla" sınıfı iş CEO'ya dönmez ([[ceo-delegation-rule]] geçerli).
Her "CEO yapacak" maddesi açılmadan ÖNCE otomasyon alternatifi denenmiş ve imkânsızlığı kanıtlanmış olmalı.

**7b. Onay kapsamı revizyonu (GATE-01 güncellemesi — kayıtlı master-plan değişikliği olarak işlenir, sessiz sapma değil):**
- **Para GİRİŞİ = ONAYSIZ.** Tahsilat, ödeme alma, satış geliri, fatura tahsili — departmanlar kendileri yapar, CEO'ya sorulmaz; dashboard'da görünür, istenirse sonradan denetlenir.
- **Para ÇIKIŞI = ONAYLI.** Her türlü giden para CEO onayından geçer (draft → approval inbox → onay → outbox).
- Rutin dış iletişim (mail, sosyal medya paylaşımı) departman politikası içinde otonom yürür; kritik olmayan işler için CEO'ya onay sorulmaz. Onay inbox'ı sadece para-çıkışı + sözleşme + CEO'nun özel işaretlediği konularla dolar.
- Onaylar Phase 8 sonrası tek kanaldan: dashboard approval inbox (toplu onay) + JARVIS sesli onay.

**Nerede:** GATE-01 (REQUIREMENTS.md), approvals/outbox policy, Phase 8 approval-inbox spec'i, Phase 11 ödeme entegrasyon planları (Stripe/Revolut/Wise: tahsilat otonom, gönderim onaylı).
**Kabul kriteri:** GATE-01 metni "para girişi onaysız / para çıkışı onaylı" ayrımıyla güncellenmiş ve commit edilmiş; policy tablolarında tahsilat işlemleri approval-gerektirmez sınıfında; değişiklik PROJECT.md Key Decisions'a CEO kararı olarak işlenmiş; STATE'te CEO'ya açık görev formatı standardı (batched + copy-paste + dakika) not edilmiş.
**Kapanış fazı:** Doküman/policy güncellemesi hemen; approval-inbox uygulaması Phase 8, ödeme akışları Phase 11.

### B8. Support ekibi + şirket-politikası yazarı güvencesi
**Ne:** Mevcut durum: `agency-agents/support/` 6 persona içeriyor (support-responder = şikayet/müşteri cevabı dahil) ve registry'ye seed edilmiş. Ancak dedike **şirket politikası yazan uzman** yok (yalnız compliance-checker/auditor var). Direktif:
1. Phase 10 persona v2 factory'de support departmanı tam aktive edilir; support-responder v2'si müşteri şikayet/talep akışına (dashboard/CRM inbox → cevap draft → politika-içi ise otonom gönderim, B7b kuralı) bağlanır.
2. Legal departmanına (Phase 10, Alman + Türk uzman — ODT şartı) **policy-writer uzmanı** eklenir: şirket politikalarını (iade, SLA, gizlilik, iletişim tonu, departman SOP'ları) yazar ve günceller; politikalar `.planning/` veya docs/'ta versiyonlu tutulur, support-responder'ın otonom cevap sınırını bu politikalar çizer.
**Kabul kriteri:** Phase 10 planında support aktivasyonu + policy-writer persona task olarak görünür; politika dosyaları için konum ve sahiplik tanımlı.
**Kapanış fazı:** Phase 10.

---

## Bölüm C — Mevcut Açık Taahhütlerle İlişki

Phase 7 kapanış blokerleri (CEO taahhütleri) **değişmiyor**, bu direktif onların yerine geçmez:
1. DNS A kaydı 46.225.89.249 → domain
2. OPENROUTER_API_KEY → /opt/dxb/vps/.env + restart
3. BACKUP_DEST off-site hedefi

B1/B2/B3/B5'in "hemen" kısımları doküman/plan güncellemesidir; B6 Dalga 1 (envanter + ilk sentez) de hemen başlar — hiçbiri Phase 7 yürütmesini bloklamaz, 07-06/07-07 ile paralel yapılabilir.

---

## Kapanış — Kanıt Zorunluluğu

Bu direktifin uygulaması **Evidence-Before-Done** formatında geri raporlanır: her madde için ✓ VERIFIED (komut → çıktı satırı / commit hash) veya ⚠ UNVERIFIED (makine-doğrulanamama gerekçesi). "Tamam" kelimesi kanıtsız kullanılamaz. Rapor CEO tablo formatında.
