# Virtual creator — Islamic data sources and platform AI-disclosure rules (measured 2026-09-25)

Measured by: an Opus 5.5 reader subagent · for the chief engineer (Fable 5.1), for the studio's virtual-creator architecture plan.
Method: `curl` GET on public pages and key-free endpoints only; no keys, no logins, no installs.
Legend: **R** = read first-hand at the cited URL on 2026-09-25. **U** = not measured; the reason is given.
- Raw captures stayed in the session scratchpad (not kept in the repo).

## A. Islamic sources for a self-written "editorial check" skill

### A.1 Summary table

| Source | Base URL | Key-free GET? | Arabic / English / Turkish | Grading in data | Rate limit stated | Licence (short) |
|---|---|---|---|---|---|---|
| Al Quran Cloud | `https://api.alquran.cloud/v1` | YES, HTTP 200 (R) | Yes / 17 EN / 10 TR text + 1 TR audio (R) | n/a (Qur'an) | "soft" per-IP; header `x-ratelimit-limit-second: 12` (R) | Arabic: free, commercial OK with acknowledgement; translations: attribute translator (R) |
| Quran.com API v4 (legacy) | `https://api.quran.com/api/v4` | YES, HTTP 200 today (R); QF calls it "older unauthenticated API" (R) | Yes / 8 EN / 5 TR (R) | n/a | none published; QF terms make rate-limit values confidential (R) | QF Developer Terms, 2026-09-14 (R); whether they govern the legacy host: U |
| Quran Foundation Content API | `https://apis.quran.foundation/content/api/v4` | NO: OAuth2 client credentials, `x-auth-token` + `x-client-id` (R) | same data as above (R, migration page) | QF has a "Hadith References API" (by ayah): contents U | confidential (R) | no modification, no redistribution, cache ≤ 1 week (R) |
| Tanzil.net | `https://tanzil.net` (files, no API) | YES, file download HTTP 200 (R) | Yes / many / 10 TR (R) | n/a | none stated | Arabic text CC BY 3.0, "CHANGING IT IS NOT ALLOWED"; translations **non-commercial only** (R) |
| fawazahmed0 hadith-api | `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1` | YES, HTTP 200 (R) | Yes / Yes / Turkish for 8 of 10 collections (R) | YES, per hadith, named graders (R) | README: "No Rate limits" (R) | Unlicense (GitHub API, R) |
| hadithapi.com | `https://hadithapi.com/api` | NO: `{"status":403,"message":"API key is required."}` (R) | Arabic, Urdu, English; no Turkish (R) | YES: `status` filter "Sahih / Hasan / Da`eef" (R) | none stated on pages read | "free for everyone", key by registration (R); written licence: U |
| sunnah.com API | `https://api.sunnah.com/v1` | NO: `{"message":"Forbidden"}` 403 (R) | U (not reachable without key) | U | U | key "by creating an issue on our GitHub repo"; API is "a portion of our data" (R) |
| api.hadith.gading.dev | — | NO: host does not resolve (NXDOMAIN) (R) | repo: "Indonesia Translation" only (R) | — | — | MIT; repo last push 2023-07-11 → dead (R) |
| Diyanet Kur'an | `kuran.diyanet.gov.tr` (site); `acikkaynakkuran-dev.diyanet.gov.tr` (API) | NO: API key via GitHub login, limited scope; `kuran.diyanet.gov.tr/api` → HTTP 500 (R) | Turkish (site) | n/a | — | Diyanet refuses to share content as data (quote below) (R) |
| Diyanet Hadislerle İslâm | `hadislerleislam.diyanet.gov.tr` | pages only (`sayfa.php?CILT=&SAYFA=`, 7 volume PDFs, search page); no API found (R) | Turkish | U (not examined) | — | "© Diyanet İşleri Başkanlığı. Tüm hakları saklıdır." (R) |

### A.2 Measurements behind the table

- **Al Quran Cloud** (R): `GET /v1/ayah/2:255/editions/quran-uthmani,en.sahih,tr.diyanet` → 200, returned the Uthmani Arabic, Saheeh International and Diyanet İşleri text together.
  Turkish editions (`GET /v1/edition?language=tr`): `tr.diyanet`, `tr.vakfi`, `tr.yazir`, `tr.ates`, `tr.bulac`, `tr.golpinarli`, `tr.ozturk`, `tr.yildirim`, `tr.yuksel`, `tr.transliteration`, plus `tr.vakfi-audio`.
  English, 17 text editions, including `en.sahih`, `en.pickthall`, `en.yusufali`, `en.hilali`, `en.asad`, `en.arberry`, `en.itani` and `en.wahiduddin`.
  **Quote search works without a key**: `GET /v1/search/uyuklama/all/tr.diyanet` → 1 match, 2:255 (R).
  Terms (https://alquran.cloud/terms-and-conditions, "Last updated: 14 June 2026"): "The API is free and key-less. To keep it that way for everyone, there is a soft rate limit applied on a per second bases per IP address."
  The same page says the Arabic text is sourced from "Tanzil.net and Quran Academy". It says "You may reproduce, embed, store and display the text freely, for any non-commercial purpose. Commercial reproduction … requires no permission from us but a respectful acknowledgement".
  On translations: "Translations are contributed by their rights-holders or sourced from public-domain editions … If you republish a translation, please attribute the translator by name."
- **Quran.com v4 legacy** (R): `GET /verses/by_key/2:255?translations=20,77,52&fields=text_uthmani` → 200 with no key; `cache-control: public, max-age=691200`; no rate-limit headers.
  `GET /resources/translations` → 126 translations.
  Turkish: 77 Diyanet İşleri, 52 Elmalılı Hamdi Yazır, 210 Dar Al-Salam Center, 124 Muslim Shahin, 112 Shaban Britch.
  English: 20 Saheeh International, 85 Abdel Haleem, 84 Taqi Usmani, 19 Pickthall, 22 Yusuf Ali, 203 Hilali & Khan, 149 Fadel Soliman, 95 Maududi.
  Migration page (https://api-docs.quran.foundation/docs/quickstart/migration/) describes the old host as "the older unauthenticated API at https://api.quran.com/api/v4/..." and replaces it with OAuth2. **No sunset date appeared on any page read → U.**
  New QF apps start in "pre-live", whose dataset "includes only Al-Fatihah (surah 1) and Al-Baqarah (surah 2)" (quickstart, R).
- **QF Developer Terms** (https://api-docs.quran.foundation/legal/developer-terms/, "Last updated: 2026-09-14", R):
  - The licence is granted "solely to develop and operate Applications that provide beneficial Quranic experiences".
  - Display conditions: "The text of the Quran is not modified in any way"; QF Content "is not sold, sublicensed, or redistributed"; snippets must preserve "original context and meaning".
  - Storage: "Cache or store QF Content longer than 1 week" is prohibited.
  - Commerce: paid apps and advertising are allowed without a separate licence while content is shown only inside the app.
  - Secrecy: "rate-limit values" are "QF Confidential Information".
- **Tanzil** (R): https://tanzil.net/docs/text_license applies "Creative Commons Attribution 3.0". It says "Permission is granted to copy and distribute verbatim copies of this text, but CHANGING IT IS NOT ALLOWED", and it requires source attribution plus a link to tanzil.net.
  https://tanzil.net/trans/ lists 10 Turkish translations, the same 10 names Al Quran Cloud serves. Its terms: "The translations provided at this page are for non-commercial purposes only. If used otherwise, you need to obtain necessary permission from the translator or the publisher."
  `tr.diyanet` txt download → HTTP 200, 977,213 bytes.
- **Conflict, named and left unresolved:** Al Quran Cloud says its translations come from rights-holders or public-domain editions and asks only for attribution. Tanzil, which publishes the same 10 Turkish translations, says they are non-commercial only.
  Diyanet itself refuses sharing (next bullet), yet its translation (`tr.diyanet`, id 77) is served by all three sources above. For a commercial studio these facts conflict; which one governs is a decision, not a measurement.
- **Diyanet Kur'an API Servisi** (https://acikkaynakkuran-dev.diyanet.gov.tr/, R): an API key comes through a GitHub login and reaches "Sayfa bazlı ayetlerde ilk 30 sayfa; Sure bazlı ayetlerde her surenin ilk 9 ayeti; Cüz bazlı ayetlerde yalnızca 1. cüz". Verbatim:
  > "…metin, ses dosyası, veri seti, kaynak dosya ve diğer dijital materyaller; … firma, vatandaş, bireysel yazılım geliştiricisi veya diğer üçüncü kişilerle paylaşılmamaktadır."
- **fawazahmed0 hadith-api** (R): `editions.json` lists 10 collections. Turkish editions exist for Abu Dawud, Bukhari, Ibn Majah, Malik, Muslim, Nasa'i, Nawawi 40 and Tirmidhi; none exist for Dehlawi 40 or Qudsi 40.
  Languages: Arabic, Bengali, English, French, Indonesian, Russian, Tamil, Turkish, Urdu.
  Grades vary by collection:
  - `tur-abudawud/1` returns Al-Albani "Hasan Sahih", Muhammad Muhyi Al-Din Abdul Hamid "Hasan Sahih", Shuaib Al Arnaut "Sahih Lighairihi" and Zubair Ali Zai "Isnaad Hasan".
  - `ara-bukhari/1` returns `grades: []`.
  **Weak provenance for Turkish:** every Turkish edition's metadata carries `"author": "Unknown", "source": ""`.
  The Turkish Bukhari text embeds cross-references inline ("Tekrar: 54, 2529… Diğer Tahric: …"), so exact-match checking needs text normalisation first.
  The README also says: "You should include fallback mechanism in your code".
- **hadithapi.com** (R, https://hadithapi.com/docs/hadiths): the query parameters are `hadithEnglish`, `hadithUrdu`, `hadithArabic`, `hadithNumber`, `book`, `chapter`, `status` (Sahih / Hasan / Da`eef) and `paginate` (maximum 200). It lists 9 books, including `al-silsila-sahiha`.
- **sunnah.com** (R, https://sunnah.com/developers): "You will need an API key to access this data; you can create an issue on our GitHub repo to request one." It also says an offline dump is "not available yet".

### A.3 What a machine can and cannot decide

**It can** check that:
- a cited verse (sura:ayah) exists, and the quoted Arabic matches the Uthmani text after normalisation;
- a Turkish or English wording matches a *named* edition (Diyanet, Elmalılı, Saheeh International…);
- a hadith exists at a collection and number, and which named graders marked it Sahih, Hasan or Da'if, where the data carries grades.

**It cannot** rule on religious permissibility (halal/haram), on whether a quotation is used appropriately, or on disagreements between graders. A rule-based check can only report "found / not found / mismatch / grader X says Y".

The constitution puts the boundaries outside any agent's judgment (R, read in the repo):
- `HOLDING-OS-MASTER-PLAN/MASTER_PLAN.md:163`: "**the objective is fixed, the Islamic boundaries are fixed, the solution/portfolio/execution are the Holding's responsibility.**"
- `MASTER_PLAN.md:166`: "Revenue targets can NEVER weaken these boundaries; no agent may debate, reinterpret, or optimize around them."
- `.claude/CLAUDE.md:132-133`: "**Islamic boundaries are constitutional.** CEO-only. Code may refuse its own work against them; code may never widen or narrow them."

## B. Platform rules for AI-generated realistic people and voices

### B.1 TikTok (R)
- **Page:** https://www.tiktok.com/community-guidelines/en/integrity-authenticity (redirects to `/safety/en/policies-and-engagement/integrity-authenticity`).
- **Date:** version "2026 August", "Released August 25, 2026 Effective September 24, 2026". **It took effect the day before this reading.**
- **Rule (quote):** "we require creators to label AI-generated or significantly edited content that shows realistic-looking scenes or people. Unlabeled content may be removed, restricted, or labeled by our team, depending on the harm it could cause."
- **How to label:** "You can add your own clear caption, sticker, or watermark. For AI-generated content, you can also use our AIGC label."
- **Disclosure required when:** "AI-generated audio mimics the voice of a real person". **Not required for:** "generic text-to-speech (TTS) narration, when the TTS isn't a recognizable voice of a known individual".
- **NOT ALLOWED** includes "Using the likeness of private figures without consent" and a public figure "supporting products … they haven't actually addressed". A separate "FYF INELIGIBLE" (For You feed) tier exists.
- **Penalty:** removal, restriction or a label applied by TikTok (quote above).
- **C2PA:** 0 hits in the Community Guidelines page. The C2PA source is a newsroom post dated **May 09, 2024** (https://newsroom.tiktok.com/partnering-with-our-industry-to-advance-ai-transparency-and-literacy): "TikTok is starting to automatically label AI-generated content (AIGC) when it's uploaded from certain other platforms … partnering with the Coalition for Content Provenance and Authenticity (C2PA)… Content Credentials".
- **U:** the TikTok Help "AI-generated content" article and the Creator Academy label article both returned navigation shells only; reading them needs a JS browser.

### B.2 YouTube (R)
- **Page:** https://support.google.com/youtube/answer/14328491 ("Disclosing use of GenAI content").
- **Date:** none shown on the page (measured: no date found).
- **Rule (quote):** "we require creators to disclose when they use AI to meaningfully alter or generate photorealistic content."
  The three listed triggers include "Generates a realistic scene that didn't actually occur". "AI generated music" and "Making it appear as if someone gave advice that they did not actually give" require disclosure. "Cloning one's own voice to create voice overs or dubs" does not.
- **How to disclose:** YouTube Studio → Attributes → "AI use" → Yes. Photorealistic content gets a label on the player; non-photorealistic content gets one in the expanded description.
- **Automatic labelling:** the label may be applied for "Content that contains C2PA metadata" and "Content that our internal systems detect is AI generated or altered". Labels from C2PA metadata or YouTube's own tools cannot be removed by the creator.
- **Penalty (quote):** "Creators who consistently choose not to disclose this information may be subject to manual application of a label, or penalties from YouTube, including removal of content or suspension from the YouTube Partner Program."
  The page also says: "Disclosing AI content won't limit a video's audience or impact its eligibility to earn money."
- **2026 change:** https://blog.youtube/news-and-events/improving-ai-labels-viewers-creators/, datePublished **2026-05-27**.
  - The label moves "directly below the video player" for long-form and becomes an "overlay on the video itself" for Shorts, as "the single label format for all photorealistic and meaningfully AI altered or generated content".
  - Detection (quote): "Starting in May 2026, we're rolling out new internal signals … If a creator doesn't specify whether or not they used AI, but our systems detect significant photorealistic AI use, we will now automatically apply a label."
- The help section's navigation also lists "Understanding 'How this content was made' disclosures" and "Building trust on YouTube: 'Captured with a camera' disclosure". Their contents were not read → U.

### B.3 Meta / Instagram (R)
- **Page:** https://help.instagram.com/761121959519495 ("Label AI content on Instagram | Instagram Help Center"). A visible date was not located in the fetched page → U.
- **Rule (quote):** "Meta requires you to label content you share that has photorealistic video or realistic-sounding audio that has been digitally generated or altered, including with AI. This means … you must label the content before you share it."
- **Images:** "Meta does not require you to label images that have been created or altered with AI. Images will still receive a label if Meta's systems detect they were AI-generated."
- **Voice:** the examples that require a label include "A reel narrated with a realistic AI-generated voiceover".
- **Penalty (quote):** "Note: There may be penalties if you do not label content as required."
- **Profile-level label, which matters most for a virtual creator:** "When you label your profile, people will see an AI-generated profile label on your profile and alongside your content…". The setting is a toggle named "AI-generated profile".
- **Label name:** this help page calls it the "AI content" label (0 hits for "AI info" on the page).
  Meta's newsroom renamed "Made with AI" to "AI info" on 2024-07-01 (https://about.fb.com/news/2024/04/metas-approach-to-labeling-ai-generated-content-and-manipulated-media/).
- **Original policy post:** https://about.fb.com/news/2024/02/labeling-ai-generated-images-on-facebook-instagram-and-threads/ (published 2024-02-06, updated 2025-04-01). Quote: "We'll require people to use this disclosure and label tool when they post organic content with a photorealistic video or realistic-sounding audio … and we may apply penalties if they fail to do so." Detection is based on the C2PA and IPTC "AI generated" signals.
- **EU code signature:** Meta is named among the "Section 1" examples, in the signatory list of the page cited in B.4. Section 1 covers *providers* of generative-AI systems (marking and detection of their own output); it is **not** the Instagram user-labelling duty. On the same page, Google is present, while TikTok, ByteDance and YouTube returned 0 hits.

### B.4 EU AI Act Article 50: deepfake transparency (R, official Commission pages)
- **Art. 50(4)** (https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-50) says: "Deployers of an AI system that generates or manipulates image, audio or video content constituting a deep fake, shall disclose that the content has been artificially generated or manipulated."
  The same paragraph continues: for "evidently artistic, creative, satirical, fictional or analogous work", the duty is "limited to disclosure of the existence of such generated or manipulated content in an appropriate manner that does not hamper the display or enjoyment of the work".
- **Art. 3(60)** (…/article-3): "'deep fake' means AI-generated or manipulated image, audio or video content that resembles existing persons, objects, places, entities or events and would falsely appear to a person to be authentic or truthful". Whether a wholly invented persona "resembles existing persons" is the pivot; that is a legal question, not a measurement.
- **Application date:** Art. 113 (…/article-113): "It shall apply from 2 August 2026". Article 50 is not among the listed exceptions.
  The Commission policy page (https://digital-strategy.ec.europa.eu/en/policies/code-practice-ai-generated-content, last update 31 July 2026) says "These transparency obligations, applicable from 2 August 2026". **The obligation has been in force for 54 days.**
  The service-desk text is the "Official version of 13 June 2024". Whether any later amendment (e.g. Digital Omnibus) changed Art. 50 timing → U; EUR-Lex returned an HTTP 202 bot challenge.
- **Code of Practice:** final version published 10 June 2026 (https://digital-strategy.ec.europa.eu/en/news/commission-publishes-code-practice-marking-and-labelling-ai-generated-content). "Section 1: Providers … marking and detection"; "Section 2: Deployers - Rules for labelling of deepfakes".
  Signatories: https://digital-strategy.ec.europa.eu/en/news/strong-backing-code-practice-transparency-ai-generated-content (published 31 July 2026, last update 24 September 2026) prints "Section 1 signatories: 95 / Section 2 signatories: 192". The code is voluntary.
  A studio that publishes persona videos would be a *deployer*, so Section 2 is its section. That is an inference from the section titles, not a legal opinion.

## C. Precedent: Kenza Layli

| Item | Value | Source |
|---|---|---|
| Instagram now | "159K Followers, 24 Following, 404 Posts" | R: https://www.instagram.com/kenza.layli/ (og:description) |
| Instagram bio | "First Moroccan Meta Humans powered by AI 🇲🇦 / First world MISS AI @waicas / @zinalayli1 @layli.mehdi 's sister / By @phoenixai.ai" (plus a phoenixai.ai contact e-mail) | R, same |
| TikTok now | followerCount 47,200; likes 76,600; bio "First Moroccan Meta Humans powered by AI 🤖 Proudly First World miss AI 2024" | R: https://www.tiktok.com/@kenza.layli (page JSON) |
| 2024 baseline | "nearly 200,000 Instagram followers, and a further 45,000 on TikTok"; "Layli is entirely AI-generated"; "a hijab-wearing North African avatar" | R: CNN, 2024-07-11, https://edition.cnn.com/2024/07/11/style/miss-ai-pageant-winner-kenza-layli |
| Who runs it | "Layli was created by Myriam Bessa, founder of the Phoenix AI agency, who will receive $5,000 cash, support on Fanvue and a publicist"; the organiser was Fanvue | R: CNN, same |
| Drift | Instagram ~200K → 159K, about −20% in 26 months; TikTok 45K → 47.2K, flat | computed from the two R rows |
| Meta AI label on her profile or posts | not determinable: the `isAI` and `aigcInfoPanel` strings in the HTML are generic UI-bundle names | U: needs a logged-in browser |
| WAICA site | not fetched | U |

## U, in one place
1. Sunset date of the key-free `api.quran.com/api/v4`, and whether the QF Developer Terms bind it.
2. Contents and grading of the QF "Hadith References API" (it needs OAuth).
3. sunnah.com API languages, grades and rate limit (it needs a key); written licence of hadithapi.com.
4. Grading data in Diyanet Hadislerle İslâm (pages not examined).
5. The commercial status of Diyanet and other Turkish translations when republished: Al Quran Cloud and Tanzil conflict, and Diyanet refuses sharing. This needs a rights decision, not a measurement.
6. TikTok Help Center and Creator Academy AIGC articles (JS shells; they need a browser).
7. The date shown on Instagram's help page; the contents of YouTube's "Captured with a camera" and "How this content was made" pages.
8. Any post-2024 amendment to Art. 50 timing (EUR-Lex blocked with HTTP 202).
9. Whether Kenza Layli's Instagram or TikTok carries a platform AI label; the WAICA site.
