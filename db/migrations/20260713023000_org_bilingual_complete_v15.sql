-- ============================================================================
-- 20260713023000 — E6.3 wave 3d (CEO eye-test, 2026-07-13 ~01:25):
--   The TR locale still rendered a mixed-language tree:
--   (a) departments.display_name existed in English only — no Turkish
--       counterpart anywhere in the schema;
--   (b) title_tr covered just 67/199 employees — the wave-3b parser read the
--       persona H1 only and skipped the dossier "Unvan" field (18 recoverable
--       rows), and the 114 post-directive English personas never had a
--       Turkish title at all.
--
--   This migration completes bilingualism for the org surface:
--   1. departments.display_name_tr + full 22-row Turkish backfill.
--   2. v_org_graph v1.5 — department rows now carry display_name_tr in the
--      existing title_tr column (the RSC already picks label by locale, so
--      no UI change is needed).
--   3. agents.title_tr backfill to 199/199: 18 rows recovered from the
--      dossier "Unvan" field, 114 Turkish titles authored by Fable
--      (mechanical translations; platform/product proper nouns kept).
--
-- ROLLBACK: recreate the view from 20260713010000;
--   ALTER TABLE departments DROP COLUMN display_name_tr;
--   UPDATE agents SET title_tr=NULL WHERE slug IN (backfill list below).
-- ============================================================================

ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS display_name_tr text;

UPDATE public.departments SET display_name_tr = t.tr
FROM (VALUES
  ('ceo',                'CEO Ofisi'),
  ('commerce',           'Ticaret Operasyonları'),
  ('strategy',           'Kurumsal Strateji ve İş Operasyonları'),
  ('customer-success',   'Müşteri Başarısı ve Profesyonel Hizmetler'),
  ('data-ai',            'Veri, AI Platformu ve Değerlendirme'),
  ('design',             'Tasarım'),
  ('engineering',        'Mühendislik'),
  ('finance',            'Finans'),
  ('legal-de',           'Hukuk (Almanya)'),
  ('legal',              'Hukuk, Uyum ve Kurumsal Yönetişim'),
  ('marketing',          'Pazarlama'),
  ('paid-media',         'Ücretli Medya'),
  ('people-hr',          'İnsan / İK / Yetenek Operasyonları'),
  ('platform',           'Platform, Altyapı ve Güvenilirlik'),
  ('product',            'Ürün'),
  ('project-management', 'Proje Yönetimi'),
  ('quality',            'Kalite Yönetimi ve Operasyonel Mükemmellik'),
  ('revops',             'Gelir Operasyonları ve Ticari Mükemmellik'),
  ('risk-audit',         'Risk, İç Denetim ve Güvence'),
  ('sales',              'Satış'),
  ('security',           'Güvenlik, Güven ve Emniyet'),
  ('social-media',       'Sosyal Medya')
) AS t(slug, tr)
WHERE departments.slug = t.slug;

CREATE OR REPLACE VIEW public.v_org_graph AS
SELECT c.id::text AS node_id,
       'company'::text AS kind,
       c.name AS label,
       NULL::text AS role_level,
       NULL::text AS parent_node_id,
       c.status,
       NULL::text AS department,
       NULL::text AS model,
       NULL::text AS director_slug,
       NULL::text AS slug,
       NULL::text AS title_tr
FROM companies c
UNION ALL
SELECT d.id::text,
       'department'::text,
       d.display_name,
       NULL::text,
       COALESCE(d.parent_id::text, d.company_id::text),
       d.status,
       d.slug,
       NULL::text,
       dir.slug,
       d.slug,
       d.display_name_tr
FROM departments d
LEFT JOIN agents dir ON dir.id = d.director_id
UNION ALL
SELECT a.id::text,
       'employee'::text,
       COALESCE(a.title, a.slug),
       a.role_level,
       COALESCE(
         -- Nest under the manager only when the manager is in the same
         -- department AND still in the tree (an archived manager would be
         -- an invisible parent — the report falls back to the department).
         CASE WHEN m.department = a.department
               AND m.employment_status <> 'archived'
              THEN a.manager_id::text END,
         d.id::text),
       a.employment_status,
       a.department,
       a.brain,
       NULL::text,
       a.slug,
       a.title_tr
FROM agents a
JOIN departments d ON d.slug = a.department
LEFT JOIN agents m ON m.id = a.manager_id
WHERE a.role_level IS DISTINCT FROM 'sub_agent'
  AND a.employment_status <> 'archived';

GRANT SELECT ON public.v_org_graph TO authenticated;
REVOKE ALL ON public.v_org_graph FROM anon;
-- agent title_tr completion (wave 3d)
UPDATE public.agents SET title_tr='Borç/Ödeme Hazırlık Uzmanı' WHERE slug='accounts-payable-agent';
UPDATE public.agents SET title_tr='Karar Sicili ve Kurumsal Kayıt Sorumlusu' WHERE slug='board-decision-secretary';
UPDATE public.agents SET title_tr='İş Otomasyonu Çözüm Mimarı' WHERE slug='business-automation-solutions-architect';
UPDATE public.agents SET title_tr='Katalog ve PIM Otomasyon Uzmanı' WHERE slug='catalog-pim-specialist';
UPDATE public.agents SET title_tr='CEO Ofisi Müdürü' WHERE slug='chief-of-staff';
UPDATE public.agents SET title_tr='Ticaret Analitiği ve Gelir İstihbaratı Uzmanı' WHERE slug='commerce-analytics-specialist';
UPDATE public.agents SET title_tr='Ticaret Otomasyonu ve Entegrasyon Mühendisi' WHERE slug='commerce-integration-engineer';
UPDATE public.agents SET title_tr='Ticaret Müşteri Operasyonları ve İade Uzmanı' WHERE slug='commerce-returns-specialist';
UPDATE public.agents SET title_tr='Kurumsal İletişim Lideri' WHERE slug='corporate-communications-lead';
UPDATE public.agents SET title_tr='Kurumsal Gelişim Analisti' WHERE slug='corporate-development-analyst';
UPDATE public.agents SET title_tr='CRM ve Veri Sorumlusu' WHERE slug='crm-data-steward';
UPDATE public.agents SET title_tr='CRO ve Ödeme Akışı Optimizasyon Uzmanı' WHERE slug='cro-checkout-specialist';
UPDATE public.agents SET title_tr='Marka Muhafızı' WHERE slug='design-brand-guardian';
UPDATE public.agents SET title_tr='Görsel Prompt Mühendisi' WHERE slug='design-image-prompt-engineer';
UPDATE public.agents SET title_tr='Kapsayıcı Görseller Uzmanı' WHERE slug='design-inclusive-visuals-specialist';
UPDATE public.agents SET title_tr='UI Tasarımcısı' WHERE slug='design-ui-designer';
UPDATE public.agents SET title_tr='UX Mimarı' WHERE slug='design-ux-architect';
UPDATE public.agents SET title_tr='UX Araştırmacısı' WHERE slug='design-ux-researcher';
UPDATE public.agents SET title_tr='Görsel Hikâye Anlatıcısı' WHERE slug='design-visual-storyteller';
UPDATE public.agents SET title_tr='Yaratıcı Dokunuş Uzmanı' WHERE slug='design-whimsy-injector';
UPDATE public.agents SET title_tr='Kurumsal Doküman Üreticisi' WHERE slug='document-generator';
UPDATE public.agents SET title_tr='AI Veri İyileştirme Mühendisi' WHERE slug='engineering-ai-data-remediation-engineer';
UPDATE public.agents SET title_tr='Otonom Optimizasyon Mimarı' WHERE slug='engineering-autonomous-optimization-architect';
UPDATE public.agents SET title_tr='E-posta İstihbarat Mühendisi' WHERE slug='engineering-email-intelligence-engineer';
UPDATE public.agents SET title_tr='Gömülü Yazılım (Firmware) Mühendisi' WHERE slug='engineering-embedded-firmware-engineer';
UPDATE public.agents SET title_tr='Feishu Entegrasyon Geliştiricisi' WHERE slug='engineering-feishu-integration-developer';
UPDATE public.agents SET title_tr='Filament Optimizasyon Uzmanı' WHERE slug='engineering-filament-optimization-specialist';
UPDATE public.agents SET title_tr='Solidity Akıllı Kontrat Mühendisi' WHERE slug='engineering-solidity-smart-contract-engineer';
UPDATE public.agents SET title_tr='Teknik Yazar' WHERE slug='engineering-technical-writer';
UPDATE public.agents SET title_tr='Sesli AI Entegrasyon Mühendisi' WHERE slug='engineering-voice-ai-integration-engineer';
UPDATE public.agents SET title_tr='WeChat Mini Program Geliştiricisi' WHERE slug='engineering-wechat-mini-program-developer';
UPDATE public.agents SET title_tr='Yönetişim Ritmi İşletmeni' WHERE slug='executive-operations-manager';
UPDATE public.agents SET title_tr='Yönetici Özeti Üreticisi' WHERE slug='executive-summary-generator';
UPDATE public.agents SET title_tr='Defter ve Kontrol Uzmanı' WHERE slug='finance-bookkeeper-controller';
UPDATE public.agents SET title_tr='Finansal Analist' WHERE slug='finance-financial-analyst';
UPDATE public.agents SET title_tr='Bütçe-Planlama ve Analiz Uzmanı' WHERE slug='finance-fpa-analyst';
UPDATE public.agents SET title_tr='Yatırım Araştırmacısı' WHERE slug='finance-investment-researcher';
UPDATE public.agents SET title_tr='Vergi Stratejisti' WHERE slug='finance-tax-strategist';
UPDATE public.agents SET title_tr='Küresel Genişleme Lideri' WHERE slug='global-expansion-lead';
UPDATE public.agents SET title_tr='Ticaret Direktörü' WHERE slug='head-of-commerce';
UPDATE public.agents SET title_tr='Envanter, Sipariş ve Lojistik Yöneticisi' WHERE slug='inventory-fulfillment-manager';
UPDATE public.agents SET title_tr='LSP/İndeks Mühendisi' WHERE slug='lsp-index-engineer';
UPDATE public.agents SET title_tr='Yönetilen Otomasyon Hizmetleri Mühendisi' WHERE slug='managed-automation-services-engineer';
UPDATE public.agents SET title_tr='Pazar İstihbaratı Lideri' WHERE slug='market-intelligence-lead';
UPDATE public.agents SET title_tr='Ajanik Arama Optimizasyon Uzmanı' WHERE slug='marketing-agentic-search-optimizer';
UPDATE public.agents SET title_tr='AI Atıf Stratejisti' WHERE slug='marketing-ai-citation-strategist';
UPDATE public.agents SET title_tr='App Store Optimizasyon Uzmanı' WHERE slug='marketing-app-store-optimizer';
UPDATE public.agents SET title_tr='Baidu SEO Uzmanı' WHERE slug='marketing-baidu-seo-specialist';
UPDATE public.agents SET title_tr='Bilibili İçerik Stratejisti' WHERE slug='marketing-bilibili-content-strategist';
UPDATE public.agents SET title_tr='Kitap Eş-Yazarı' WHERE slug='marketing-book-co-author';
UPDATE public.agents SET title_tr='Carousel Büyüme Motoru' WHERE slug='marketing-carousel-growth-engine';
UPDATE public.agents SET title_tr='Çin E-Ticaret Operatörü' WHERE slug='marketing-china-ecommerce-operator';
UPDATE public.agents SET title_tr='Çin Pazarı Yerelleştirme Stratejisti' WHERE slug='marketing-china-market-localization-strategist';
UPDATE public.agents SET title_tr='İçerik Üreticisi' WHERE slug='marketing-content-creator';
UPDATE public.agents SET title_tr='Sınır Ötesi E-Ticaret Uzmanı' WHERE slug='marketing-cross-border-ecommerce';
UPDATE public.agents SET title_tr='Douyin Stratejisti' WHERE slug='marketing-douyin-strategist';
UPDATE public.agents SET title_tr='Growth Hacker' WHERE slug='marketing-growth-hacker';
UPDATE public.agents SET title_tr='Instagram Küratörü' WHERE slug='marketing-instagram-curator';
UPDATE public.agents SET title_tr='Kuaishou Stratejisti' WHERE slug='marketing-kuaishou-strategist';
UPDATE public.agents SET title_tr='LinkedIn İçerik Üreticisi' WHERE slug='marketing-linkedin-content-creator';
UPDATE public.agents SET title_tr='Canlı Yayın Ticareti Koçu' WHERE slug='marketing-livestream-commerce-coach';
UPDATE public.agents SET title_tr='Podcast Stratejisti' WHERE slug='marketing-podcast-strategist';
UPDATE public.agents SET title_tr='Private Domain Operatörü' WHERE slug='marketing-private-domain-operator';
UPDATE public.agents SET title_tr='Reddit Topluluk Kurucusu' WHERE slug='marketing-reddit-community-builder';
UPDATE public.agents SET title_tr='SEO Uzmanı' WHERE slug='marketing-seo-specialist';
UPDATE public.agents SET title_tr='Kısa Video Kurgu Koçu' WHERE slug='marketing-short-video-editing-coach';
UPDATE public.agents SET title_tr='Sosyal Medya Stratejisti' WHERE slug='marketing-social-media-strategist';
UPDATE public.agents SET title_tr='TikTok Stratejisti' WHERE slug='marketing-tiktok-strategist';
UPDATE public.agents SET title_tr='Twitter Etkileşim Uzmanı' WHERE slug='marketing-twitter-engager';
UPDATE public.agents SET title_tr='Video Optimizasyon Uzmanı' WHERE slug='marketing-video-optimization-specialist';
UPDATE public.agents SET title_tr='WeChat Resmî Hesap Yöneticisi' WHERE slug='marketing-wechat-official-account';
UPDATE public.agents SET title_tr='Weibo Stratejisti' WHERE slug='marketing-weibo-strategist';
UPDATE public.agents SET title_tr='Xiaohongshu Uzmanı' WHERE slug='marketing-xiaohongshu-specialist';
UPDATE public.agents SET title_tr='Zhihu Stratejisti' WHERE slug='marketing-zhihu-strategist';
UPDATE public.agents SET title_tr='Ürün Yönetimi, Fiyatlandırma ve Promosyon Yöneticisi' WHERE slug='merchandising-pricing-manager';
UPDATE public.agents SET title_tr='Hedef Sistemi Yöneticisi' WHERE slug='okr-performance-manager';
UPDATE public.agents SET title_tr='Devreye Alma ve Uygulama Lideri' WHERE slug='onboarding-implementation-lead';
UPDATE public.agents SET title_tr='Ücretli Medya Denetçisi' WHERE slug='paid-media-auditor';
UPDATE public.agents SET title_tr='Reklam Kreatif Stratejisti' WHERE slug='paid-media-creative-strategist';
UPDATE public.agents SET title_tr='Ücretli Sosyal Medya Stratejisti' WHERE slug='paid-media-paid-social-strategist';
UPDATE public.agents SET title_tr='Programatik ve Display Satın Alma Uzmanı' WHERE slug='paid-media-programmatic-buyer';
UPDATE public.agents SET title_tr='Arama Sorgusu Analisti' WHERE slug='paid-media-search-query-analyst';
UPDATE public.agents SET title_tr='İzleme ve Ölçümleme Uzmanı' WHERE slug='paid-media-tracking-specialist';
UPDATE public.agents SET title_tr='Ortaklık ve Ekosistem Lideri' WHERE slug='partnerships-ecosystem-lead';
UPDATE public.agents SET title_tr='Bordro Yöneticisi' WHERE slug='payroll-manager';
UPDATE public.agents SET title_tr='Fiyatlandırma ve Teklif Masası Yöneticisi' WHERE slug='pricing-deal-desk-manager';
UPDATE public.agents SET title_tr='Davranışsal Dürtme Motoru' WHERE slug='product-behavioral-nudge-engine';
UPDATE public.agents SET title_tr='Geri Bildirim Sentezleyicisi' WHERE slug='product-feedback-synthesizer';
UPDATE public.agents SET title_tr='Sprint Önceliklendirme Uzmanı' WHERE slug='product-sprint-prioritizer';
UPDATE public.agents SET title_tr='Trend Araştırmacısı' WHERE slug='product-trend-researcher';
UPDATE public.agents SET title_tr='Deney Takip Uzmanı' WHERE slug='project-management-experiment-tracker';
UPDATE public.agents SET title_tr='Teslimat İzlenebilirlik Sorumlusu' WHERE slug='project-management-jira-workflow-steward';
UPDATE public.agents SET title_tr='Proje Rehberi' WHERE slug='project-management-project-shepherd';
UPDATE public.agents SET title_tr='Stüdyo Operasyonları Uzmanı' WHERE slug='project-management-studio-operations';
UPDATE public.agents SET title_tr='Gelir Büyüme Uzmanı' WHERE slug='revenue-growth-specialist';
UPDATE public.agents SET title_tr='Gelir Raporlama Uzmanı' WHERE slug='revenue-reporting-agent';
UPDATE public.agents SET title_tr='Müşteri Hesabı Stratejisti' WHERE slug='sales-account-strategist';
UPDATE public.agents SET title_tr='Satış Koçu' WHERE slug='sales-coach';
UPDATE public.agents SET title_tr='Anlaşma Stratejisti' WHERE slug='sales-deal-strategist';
UPDATE public.agents SET title_tr='Keşif Görüşmesi Koçu' WHERE slug='sales-discovery-coach';
UPDATE public.agents SET title_tr='Satış Mühendisi' WHERE slug='sales-engineer';
UPDATE public.agents SET title_tr='Outbound Satış Stratejisti' WHERE slug='sales-outbound-strategist';
UPDATE public.agents SET title_tr='Satış Hunisi Analisti' WHERE slug='sales-pipeline-analyst';
UPDATE public.agents SET title_tr='Teklif Stratejisti' WHERE slug='sales-proposal-strategist';
UPDATE public.agents SET title_tr='Sosyal Hesap Bağlantı Uzmanı' WHERE slug='social-account-connector';
UPDATE public.agents SET title_tr='Sosyal Analitik Analisti' WHERE slug='social-analytics-agent';
UPDATE public.agents SET title_tr='Onay Akışı Sorumlusu' WHERE slug='social-approval-workflow';
UPDATE public.agents SET title_tr='Müşteri Çalışma Alanı Yöneticisi' WHERE slug='social-client-workspace';
UPDATE public.agents SET title_tr='Sosyal Ticaret ve Kreatör/Affiliate Lideri' WHERE slug='social-commerce-creator-lead';
UPDATE public.agents SET title_tr='Sosyal İçerik Stratejisti' WHERE slug='social-content-strategist';
UPDATE public.agents SET title_tr='Sosyal Medya Metin Yazarı' WHERE slug='social-copywriter';
UPDATE public.agents SET title_tr='Sosyal Kreatif Varlık Üreticisi' WHERE slug='social-creative-asset';
UPDATE public.agents SET title_tr='Sosyal Gelen Kutusu Yöneticisi' WHERE slug='social-inbox-agent';
UPDATE public.agents SET title_tr='Sosyal MCP ve API Entegrasyon Mühendisi' WHERE slug='social-mcp-api-agent';
UPDATE public.agents SET title_tr='Sosyal Raporlama Uzmanı' WHERE slug='social-reporting-agent';
UPDATE public.agents SET title_tr='Zamanlama ve Yayınlama Uzmanı' WHERE slug='social-scheduler-publisher';
UPDATE public.agents SET title_tr='Kültürel İstihbarat Stratejisti' WHERE slug='specialized-cultural-intelligence-strategist';
UPDATE public.agents SET title_tr='Geliştirici Savunucusu' WHERE slug='specialized-developer-advocate';
UPDATE public.agents SET title_tr='Stok Lotu ve Tasfiye Tedarik Uzmanı' WHERE slug='stock-lot-sourcing-specialist';
UPDATE public.agents SET title_tr='Tedarik ve Vendor Yönetimi Uzmanı' WHERE slug='supply-chain-strategist';
UPDATE public.agents SET title_tr='Destek Yanıt Uzmanı' WHERE slug='support-support-responder';
UPDATE public.agents SET title_tr='Erişilebilirlik Denetçisi' WHERE slug='testing-accessibility-auditor';
UPDATE public.agents SET title_tr='API Test Uzmanı' WHERE slug='testing-api-tester';
UPDATE public.agents SET title_tr='Kanıt Toplama Uzmanı' WHERE slug='testing-evidence-collector';
UPDATE public.agents SET title_tr='Performans Kıyaslama Uzmanı' WHERE slug='testing-performance-benchmarker';
UPDATE public.agents SET title_tr='Gerçeklik Kontrolcüsü' WHERE slug='testing-reality-checker';
UPDATE public.agents SET title_tr='Test Sonuçları Analisti' WHERE slug='testing-test-results-analyzer';
UPDATE public.agents SET title_tr='Araç Değerlendirme Uzmanı' WHERE slug='testing-tool-evaluator';
UPDATE public.agents SET title_tr='İş Akışı Optimizasyon Uzmanı' WHERE slug='testing-workflow-optimizer';
UPDATE public.agents SET title_tr='Nakit ve Alacak Yöneticisi' WHERE slug='treasury-ar-manager';
UPDATE public.agents SET title_tr='Girişim Kurucusu' WHERE slug='venture-builder';
UPDATE public.agents SET title_tr='WooCommerce ve WordPress Ticaret Mimarı' WHERE slug='woocommerce-architect';
