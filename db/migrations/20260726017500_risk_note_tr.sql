-- W5.1 audit follow-up (2026-07-26, same turn) — the risk NOTE is the same
-- surface as the risk title.
--
-- Measured on the eye pass right after the title fix landed: /gov/risks in
-- Turkish rendered Turkish titles above an English notes block ("Closed
-- 2026-07-14: E11.1 shipped v_cost_breakdown day drill…"). Half a translated
-- register is still a register the CEO half-reads, and the standing rule is
-- that DB text IS an i18n surface — the note is not an exception because it is
-- technical.
--
-- Rule from here: whoever writes a risk note writes both legs, exactly as for
-- project purpose, opportunity title and task label. The gate enforces it.

BEGIN;

ALTER TABLE public.project_risks
  ADD COLUMN IF NOT EXISTS note_tr text;

UPDATE public.project_risks SET note_tr =
  'Gözlem 2026-07-13 (org keşfi): yalnız Accounts Payable Agent aktifti. Aktivasyon İK runtime dalgalarının işi. [KAPANDI 2026-07-19 (C22): ölçülen gerçek — 198 aktif çalışan, 0 engelleyici uykuda; aktivasyon dalgası 2026-07-18''de tamamlandı. Risk defteri tazeleme disiplini: riskler her dalga sonunda yeniden ölçülür.]'
 WHERE title LIKE 'Workforce activation gap%' AND note_tr IS NULL;

UPDATE public.project_risks SET note_tr =
  'globals.css şampanya değerleri + siyah üstüne düşük-alfa altının kahverengi çamura düşme tuzağı kontrol edilecek (globals.css:196 uyarısı).'
 WHERE title LIKE 'Approvals brown-token audit deferred%' AND note_tr IS NULL;

UPDATE public.project_risks SET note_tr =
  'Kapandı 2026-07-14: E11.1 /fin/costs üzerinde v_cost_breakdown gün kırılımını yayına aldı (commit f3f0bfc); E12.1-C /fin/tokens + /fin/budgets + /fin/providers + /fin/capacity ekranlarını gerçek defter/bütçe verisine bağladı (commit ff4c924). Dashboard tarafında harcama görünürlüğü artık 50-150 EUR bandını kapsıyor; P7 kalemleri (toplamalar, koruma işleri, LiteLLM anahtar senkronu) bu riskin değil, kayıtlı sınırların parçası.'
 WHERE title LIKE 'Cost Intelligence surface%' AND note_tr IS NULL;

COMMENT ON COLUMN public.project_risks.note_tr IS
  'Turkish leg of the risk note (W5.1 audit follow-up 2026-07-26). NULL falls back to `note` at render time.';

COMMIT;

-- ROLLBACK:
--   ALTER TABLE public.project_risks DROP COLUMN IF EXISTS note_tr;
