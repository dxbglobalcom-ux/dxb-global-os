# R2-platform-survey (helper report, 2026-10-17; raw evidence paths inside)

Ölçüm 17 Ekim 2026'da, satıcıların kendi sayfalarından curl ile yapıldı. `/home/dxb/DxB Global OS/fleet/fleet.sh` diskte yok (`head: cannot open ... No such file or directory`), bu yüzden yalnız curl kullandım. Ham sayfalar `/tmp/claude-1000/-home-dxb-DxB-Global-OS/780184a8-14f7-45ce-91c0-2943127c7438/scratchpad/h2/raw/` altında.

## Karşılaştırma tablosu (fiyatlar saniye başına, USD, liste fiyatı)

| Platform | Ref. A: Kling 3.0 Pro 1080p, sessiz | Ref. B: MiniMax H3 768p | Seedance 2.5 1080p | Veo 3.1 1080p, sesli | Wan 3.0 1080p | Görüntü, ses ve lip-sync | Ticari kullanım | Ödeme | Şirket | Entegrasyon |
|---|---|---|---|---|---|---|---|---|---|---|
| **fal.ai** | $0.112 (sesli $0.168) [1] | H3 $0.06 [2]. H3 Max $0.052, 31 Ekim'e kadar %35 indirimli; sonra $0.08 [3] | ~$1.164 [4] | $0.40 [5] | $0.20 [6] | FLUX.2 pro $0.03/MP [7]. ElevenLabs v3 ve multilingual v2 $0.10/1k karakter, MiniMax Speech 2.8 [8]. Lip-sync: sync v2/v3, kling lipsync, h3-max/lip-sync [9] | Model SSS'sinde "Yes… commercial projects" yazıyor [2]. Şartlar özgünlük ve ihlal garantisi vermiyor, tazminat müşteride [10] | Kullandıkça öde, alt sınır yok [2] | $140M Series D, Aralık 2025 [11] | MCP `https://mcp.fal.ai/` [12] |
| **Replicate** | $0.224 (sesli $0.336). Pro = 1080p [13] | $0.08 [14] | 1080p görülmedi. 720p $0.2312 [15] | $0.40 [16] | $0.20 [17] | ElevenLabs v3 [18]. Lip-sync: kling, sync-2, heygen [19] | Çıktının tüm hakkı kullanıcıya veriliyor, "commercial purposes" dahil; model sahibinin şartları saklı [20] | Kullandıkça öde, hacim indirimi [21] | Kariyer sayfası Cloudflare'e yönlendiriyor (Cloudflare bünyesinde) [22] | MCP `mcp.replicate.com` [23] |
| **Runware** | "Kling 3.0 Omni Pro" ve "Turbo" en az $0.112. Düz Pro 1080p okunmadı [24] | $0.08 [25] | $0.61354 [26] | Model sayfası var, fiyat UNVERIFIED [27] | 480p $0.05, 1080p UNVERIFIED [28] | FLUX 3 [28]. ElevenLabs UNVERIFIED | "You own your Outputs". Partner modellerinde ticari hak Runware tarafından alınmış [29] | Kullandıkça öde, $2 deneme kredisi. ISO 27001, SOC 2, AB ve ABD veri yerleşimi [28] | $50M Series A, Aralık 2025. Müşterileri arasında Higgsfield ve Wix [30] | MCP ve CLI [31] |
| **WaveSpeedAI** | $0.112 (5 sn $0.56) [32] | $0.08 [33] | $0.90 [34] | $0.40 [35] | En düşük $0.05 [36] | ElevenLabs koleksiyonu, InfiniteTalk [36] | Müşteri, girdi ve çıktının sahibi. Kullanım politikası siyasi reklamı ve rızasız deepfake'i yasaklıyor [37] | Ön ödemeli kredi. Kart, PayPal, Alipay, WeChat; kurumsalda havale [36] | 2025'te Singapur'da kuruldu [38] | Açık kaynak CLI ve MCP [39] |
| **kie.ai** | $0.09 (sesli $0.135) [40] | $0.04 [41] | $0.79 [42] | Video başına fiyat: Quality 1080p $1.275. Süre o satırda yazmıyor, saniye fiyatı UNVERIFIED [43] | Listede var [44] | FLUX.2, Suno; pazar filtresinde Elevenlabs ve Lip Sync [44][45] | Şartlarda çıktı hakkı ya da ticari kullanım maddesi yok [46] | Kredilerin süresi dolmuyor, iade var [46] | Denver'da iki LLC: NEXUSAI SERVICES ve INNOLEAP AI [44] | Kodlama ajanı kurulumu var. MCP UNVERIFIED [44] |
| **Together AI** | Kling 3 yok, liste Kling 2.1'de bitiyor [47] | Yok [47] | "$0.115 per video", ayarı belirsiz [47] | Yok (yalnız Veo 2.0) [47] | Yok [47] | FLUX.2 pro $0.03, Cartesia Sonic-3 [47] | Medya çıktısı maddesi bulunamadı, UNVERIFIED [48] | Video başına | $800M Series C [49] | UNVERIFIED |
| **Freepik API (yeni adı Magnific API)** | Doküman dizininde Kling 2.6 ve O1'e kadar [50] | Yok (Hailuo 2.3) [50] | Yalnız Seedance Pro [50] | Dizinde yok [50] | Wan 2.6 [50] | FLUX.2 Pro, ElevenLabs, Lip Sync API [50] | UNVERIFIED (fiyat sayfası 403 döndü) | Kredi. "Unlimited" yalnız web uygulamasında geçiyor, API her zaman kredi düşüyor [51] | UNVERIFIED | MCP dokümanı var [50] |
| **Higgsfield** | API'de "Kling 3.0 from $0.042/s" (%50 indirimli, listede $0.084). Seviye belirsiz [52] | H3 var, fiyat okunmadı [52] | En düşük $0.144, liste $0.206 [52] | API listesinde yok [52] | Var [52] | Image modelleri [52] | Çıktıya sahiplik iddiası yok, ticari kullanımı kısıtlamıyor [53] | Abonelik + kredi. Ayrıca kullandıkça öde API [52][53] | Accel ve Menlo destekli, değerleme 1.3 milyar doların üstünde [54] | MCP `https://mcp.higgsfield.ai/mcp` [55] |
| **Birinci taraf API'ler** | Kling: UNVERIFIED (sayfa JavaScript istiyor) [56] | MiniMax: $0.08. H3-Max 768P $0.08. Speech 2.8 HD $100/M karakter [57] | BytePlus: UNVERIFIED (JavaScript). Sayfa 480P/720P ve token fiyatlaması diyor [58] | Google Gemini API: $0.40 (Fast 1080p $0.12, Lite $0.08) [59]. Vertex: $0.40 "/1 count" [60] | Alibaba (uluslararası): $0.20 listede, süreli %30 indirim [61] | ElevenLabs API: $0.08/1k karakter (multilingual) [62] | Hiçbirinin şartları okunmadı, UNVERIFIED | — | — | — |

**Higgsfield'e dair verilen bilgi kısmen eskimiş.** Şartlar 26 Temmuz 2026'da güncellenmiş [53]:
- "Unlimited" planlar fair-use sınırına bağlı. Şirket "automated or materially exceeds typical individual use" kullanımı yavaşlatabiliyor, askıya alabiliyor ya da kısıtlayabiliyor.
- Otomasyon için açıkça yazılmış bir "yasak" cümlesi yok.
- "Web-only" ifadesini okumadım, UNVERIFIED.
- Pratik sonuç aynı: Unlimited bir boru hattına bağlanamaz.
- Bunun yanında artık ayrı ve ücretli bir API/MCP var. Lisansı "own personal or internal business purposes" ve son kullanıcıya uygulama kurmayı kapsıyor.

**Okurken çıkan iki dikkat noktası:**
- Runware, Kling 4.0'ın Ekim 2026'da çıkacağını ilan ediyor, henüz "Coming soon" durumunda [63]. Bu yüzden Kling 3.0 yakında referans model olmaktan çıkabilir.
- kie'nin fiyatları resmî liste fiyatının altında. Örneğin H3 768p için $0.04 istiyor, MiniMax'ın listesi $0.08. Bunu nasıl sağladığını hiçbir yerde açıklamıyor.

## Öneri

1. **Ana hesap fal.ai olsun.** Okuduğum platformlar içinde istenen modellerin hepsini tek anahtarla, ölçülmüş fiyatla veren tek platform: H3, H3 Max, Veo 3.1, Kling 3.0, Seedance 2.5, Wan 3.0, FLUX.2, ElevenLabs, MiniMax Speech, lip-sync ve MCP. Kling ve Veo fiyatı en ucuzlarla aynı, H3 768p ($0.06) MiniMax'ın kendi fiyatından ucuz.
2. **Ana risk fal'ın Seedance 2.5 1080p fiyatı.** ~$1.164/sn ile ölçtüklerimin en pahalısı. Runware aynı işi $0.614'e, kie $0.79'a, WaveSpeed $0.90'a yapıyor.
3. **İkinci hesap Runware olsun.** Seedance 2.5'te en ucuzu. Şartlarda çıktı sahipliğini ve partner modellerde ticari hakkı açıkça yazıyor. ISO 27001, SOC 2 ve AB veri yerleşimi var, MCP sunuyor. Müşteri reklamı satan bir stüdyo için en temiz hukuk metni bu. Alternatif WaveSpeed olabilir: Kling fiyatı fal ile aynı, Alipay ve WeChat ile ödeme Asya'da işe yarar. Ancak 2025'te kurulmuş genç bir şirket.
4. **kie.ai müşteri reklamında kullanılmasın.** Fiyatı en ucuz, ama şartlarında çıktı ve ticari kullanım maddesi yok, arkasında iki LLC var ve resmî listenin altındaki fiyatın kaynağı yazmıyor. Replicate Kling'de iki kat pahalı. Together ve Magnific'te en yeni modeller yok.
5. **Higgsfield Unlimited otomasyona bağlanmasın.** Şirket otomatik kullanımı kısıtlayabiliyor. Bunlardan biri işe alınmadan önce okunması gereken açıklar var: Kling, BytePlus, Google ve MiniMax'ın ticari şartları ile Kling ve BytePlus'ın birinci taraf fiyatları UNVERIFIED.

## Kaynaklar
[1] https://fal.ai/models/fal-ai/kling-video/v3/pro/text-to-video
[2] https://fal.ai/minimax-h3 · https://fal.ai/models/minimax/h3/text-to-video
[3] https://fal.ai/models/minimax/h3-max/text-to-video
[4] https://fal.ai/models/bytedance/seedance-2.5/text-to-video (açılış sayfası https://fal.ai/seedance-2.5 ise yalnız "480p or 720p" diyor; iki sayfa çelişiyor)
[5] https://fal.ai/models/fal-ai/veo3.1
[6] https://fal.ai/models/alibaba/wan-3.0/text-to-video
[7] https://fal.ai/flux-2
[8] https://fal.ai/pricing
[9] https://fal.ai/models?keywords=lipsync
[10] https://fal.ai/terms
[11] https://blog.fal.ai
[12] https://docs.fal.ai/model-apis/mcp
[13] https://replicate.com/kwaivgi/kling-v3-video ("standard (720p) or pro (1080p)")
[14] https://replicate.com/minimax/h3
[15] https://replicate.com/bytedance/seedance-2.5
[16] https://replicate.com/google/veo-3.1
[17] https://replicate.com/alibaba/wan-3
[18] https://replicate.com/elevenlabs/v3
[19] https://replicate.com/collections/lipsync
[20] https://replicate.com/terms
[21] https://replicate.com/pricing
[22] https://replicate.com/about
[23] https://replicate.com/docs/reference/mcp
[24] https://runware.ai/kling-4
[25] https://runware.ai/minimax-h3
[26] https://runware.ai/seedance-2-5
[27] https://runware.ai/models/google-veo-3-1
[28] https://runware.ai/pricing
[29] https://runware.ai/terms
[30] https://runware.ai/about
[31] https://runware.ai/mcp
[32] https://wavespeed.ai/models/kwaivgi/kling-v3.0-pro/text-to-video
[33] https://wavespeed.ai/models/wavespeed-ai/minimax-h3/text-to-video
[34] https://wavespeed.ai/models/bytedance/seedance-2.5/text-to-video
[35] https://wavespeed.ai/models/google/veo3.1/text-to-video
[36] https://wavespeed.ai/pricing
[37] https://wavespeed.ai/static/terms
[38] https://wavespeed.ai/about
[39] https://wavespeed.ai/cli
[40] https://kie.ai/kling-3-0
[41] https://kie.ai/minimax-h3
[42] https://kie.ai/seedance-2-5
[43] https://kie.ai/veo-3-1
[44] https://kie.ai/about
[45] https://kie.ai/market
[46] https://kie.ai/terms-of-use
[47] https://www.together.ai/pricing
[48] https://www.together.ai/terms-of-service
[49] https://www.together.ai/blog
[50] https://docs.freepik.com/llms.txt
[51] https://docs.freepik.com/pricing (https://www.freepik.com/api/pricing 403 döndü)
[52] https://higgsfield.ai/api
[53] https://higgsfield.ai/terms-of-use-agreement (§10.6, §11)
[54] https://higgsfield.ai/about
[55] https://higgsfield.ai/mcp
[56] https://klingai.com/global/dev/pricing
[57] https://platform.minimax.io/docs/guides/pricing
[58] https://www.byteplus.com/en/product/seedance · https://docs.byteplus.com/en/docs/ModelArk/1544106
[59] https://ai.google.dev/gemini-api/docs/pricing
[60] https://cloud.google.com/vertex-ai/generative-ai/pricing
[61] https://www.alibabacloud.com/help/en/model-studio/model-pricing
[62] https://elevenlabs.io/pricing/api
[63] https://runware.ai/kling-4