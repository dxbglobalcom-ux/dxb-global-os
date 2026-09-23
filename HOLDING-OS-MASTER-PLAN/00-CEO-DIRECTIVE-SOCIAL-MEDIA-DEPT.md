# CEO DİREKTİFİ — Social Media Department (BAĞLAYICI)

> Kaynak: CEO'nun `agency-agents/social media departman/social media layer for agents.md` dosyası (2026-07-10/11).
> Statü: **Bağlayıcı direktif** — [[master-plan-fidelity]] kuralına tabi. Önceki oturum bu direktifi GÖRMEDİ
> (klasör gitignore kapsamındaydı); 2026-07-11 ~16:20'de tespit edilip işlendi — gecikme kaydı budur, sessiz atlama değildir.
> İşleyen: Fable 5 bizzat. CEO'nun açık yetki devri: "if there are better things to do add or substract."

## 1. Direktif metni (birebir)

> Visit https://omnisocials.com and analyze what the product does.
> Create a new "Social Media Department" inside our AI-native company OS that can do the same core
> functions functionally, without copying their branding, text, design, or code.
>
> The department must include agents for:
> 1. **Social Media Orchestrator Agent** — coordinates the whole department, receives user/client requests, assigns tasks, tracks status, reports results.
> 2. **Social Account Connector Agent** — connecting/managing accounts: Instagram, Facebook, TikTok, LinkedIn, YouTube Shorts, X/Twitter, Threads, Pinterest, Bluesky, Mastodon, Google Business, future channels.
> 3. **Content Strategy Agent** — weekly/monthly content plans, campaign ideas, posting strategy, platform-specific angles, brand voice rules.
> 4. **Copywriting Agent** — captions, hooks, hashtags, CTAs, short-form scripts, threads, LinkedIn posts, product posts, platform variations.
> 5. **Creative Asset Agent** — image/video briefs, thumbnails, story/reel ideas, alt text, visual direction per platform.
> 6. **Scheduler & Publisher Agent** — calendar view scheduling; draft → pending approval → scheduled → published → failed states.
> 7. **Social Inbox Agent** — comments, mentions, reviews, DMs in one unified inbox.
> 8. **Analytics Agent** — followers, impressions, reach, engagement rate, top posts, growth, best posting times, platform performance.
> 9. **Reporting Agent** — daily/weekly/monthly reports for clients and internal teams with insights, recommendations, next actions.
> 10. **Approval Workflow Agent** — review steps before publishing; roles: creator, editor, manager, client, final approver.
> 11. **Client Workspace Agent** — separate workspace per client/brand: connected accounts, team, permissions, calendar, inbox, reports.
> 12. **AI Integration / MCP Agent** — external AI assistants (ChatGPT, Claude, Notion, internal agents) create drafts, schedule, analyze, retrieve reports via API/MCP-style actions.
>
> Output required: department structure; each agent's role, inputs, outputs, tools, permissions, handoff logic;
> workflow client request → content plan → draft → approval → scheduling → publishing → inbox → analytics report;
> modular so real platform APIs connect later.

## 2. omnisocials.com analizi (canlı, 2026-07-11 — WebSearch; site 403 bot-koruması, arama sonuçları kaynak)

- **Ürün:** tek panelden çoklu-platform sosyal medya yönetimi; hedef kitle: ajanslar, marka sahipleri, creator'lar.
- **Çekirdek modüller:** takvimli yayınlama (post/story/reel, taslak→onay→zamanlanmış→yayınlandı→hata durumları) · unified inbox (FB/IG/LinkedIn/TikTok mesaj+yorum) · analitik (takipçi, engagement, top içerik) + müşteri raporları · ajans workspace'leri (müşteri başına hesaplar/ekip/izinler) · **"Agent Skill — Give Any AI Agent Social Media Powers"**: tam AI + API erişimi dahil.
- **Platformlar:** Facebook, Instagram, TikTok, LinkedIn, YouTube Shorts, Pinterest, Threads, Bluesky, Mastodon, X.
- **Fiyat modeli:** $10/ay/workspace (yıllık) — düşük-maliyet, self-serve.
- **Sonuç:** CEO'nun 12-ajan taslağı ürün işlev setini eksiksiz kapsıyor; işlevsel eşdeğerlik hedefi gerçekçi. Branding/metin/tasarım/kod kopyalanmaz — yalnız işlev sınıfları.

## 3. Fable işleme kararları (add/subtract yetkisiyle)

1. **12 rol AYNEN kabul** — çıkarma yok. Gerekçe: her rol ayrı çıktı sözleşmesi taşır; birleştirme (örn. Analytics+Reporting) ajans-müşteri raporlama hattını tek boğaza sokar.
2. **Departman statüsü:** tam departman (`social-media`), pod değil — CEO metni açık ("Create a new Social Media Department"). Head = Social Media Orchestrator (role_level='director'; departman-içi koordinasyon). Hedef org 18→**19 departman**.
3. **Marketing sınır sözleşmesi:** marketing = içerik/growth STRATEJİSİ ve kanal uzmanlığı (tiktok-strategist, instagram-curator vb. marketing'de KALIR); social-media = OPERASYON (hesap bağlama, takvim, yayın, inbox, onay akışı, müşteri workspace, rapor). Kampanya stratejisi marketing'den girdi alır; yayın operasyonu social-media'dan çıkar. Çatışma protokolü persona §7'lerde yazılır.
4. **data-ai sınırı:** Social MCP/API Agent departmanın DIŞA AÇILAN yüzüdür (drafts/schedule/analyze API aksiyonları); MCP altyapı sahipliği data-ai/specialized-mcp-builder'da kalır.
5. **Dış-yüz onay kapıları:** yayınlama (publish) DIŞA DÖNÜK eylemdir — Approval Workflow Agent'ın final-approver zinciri APPROVAL_ENGINE_SPEC'e bağlanır; müşteri-görünür rapor gönderimi rutin dış iletişim sınıfındadır (otonom, CEO onayı gerekmez), ücretli reklam/para-çıkışı bu departmanda YOKTUR (paid-media'da kalır).
6. **Kadro etkisi:** ADD +12 → hedef aktif kadro **179** (WORKFORCE-GAP-MATRIX §4 güncellendi). Personaların TAMAMI inşaat yazarı bizzat (K2 — oturumu süren model); yazım sırası E5.3 müdürler sonrası (E5.6).
7. **Platform API'leri:** modüler bağlantı — persona/workflow katmanı şimdi, gerçek API entegrasyonları (IG/TikTok/LinkedIn… + Google Business) ilgili execute fazında; Speaches/hermes kaynak planına dokunmaz.

## 4. Roadmap bağlantısı

- `IMPLEMENTATION_ROADMAP.md` **E5.6**: departments migration (+social-media) + 12 persona (Fable) + workflow zinciri.
- Workflow hedefi (direktif "output required" birebir): müşteri isteği → içerik planı → taslak → onay → takvim → yayın → inbox yönetimi → analitik rapor.
- Kabul kanıtı: 12 persona dosyası `personas/social-media/` altında + matris §4 sayımı 179 + workflow sözleşmesi persona §3/§7'lerde.

Sources: [OmniSocials](https://omnisocials.com/) · [Agencies](https://omnisocials.com/agencies) · [Agent Skill](https://omnisocials.com/integrations/agent-skill) · [Pricing](https://omnisocials.com/pricing)
