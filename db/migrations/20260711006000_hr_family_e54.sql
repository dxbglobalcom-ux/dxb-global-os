-- 20260711006000_hr_family_e54.sql — E5.4a: HR ailesi ADD satırları (WORKFORCE-GAP-MATRIX §3 aile 3)
-- Persona/Workforce Architect (HR-fabrika sahibi) + Performance & Calibration Manager.
-- İkisi de people-hr worker (senior_specialist), manager = CHRO, draft — aktivasyon HR durum
-- makinesinden (persona passed + donanım zinciri; HR_OPERATING_SYSTEM_SPEC §4).
-- İdempotent: ON CONFLICT (slug) DO NOTHING + koşullu UPDATE'ler.

BEGIN;

-- A) ADD 2 worker satırı (E5.3b E-bloku idiomu)
INSERT INTO public.agents (slug, department, role, role_level, employment_status,
                           persona_path, persona_version, status)
SELECT v.slug, 'people-hr', 'worker', 'senior_specialist', 'draft',
       'personas/people-hr/' || v.slug || '.md', 'v0-add', 'dormant'
FROM (VALUES
  ('persona-workforce-architect'),
  ('performance-calibration-manager')
) AS v(slug)
ON CONFLICT (slug) DO NOTHING;

-- B) manager zinciri: iki ADD da CHRO'ya bağlanır (matris §5.2 backfill kuralı)
UPDATE public.agents
   SET manager_id = (SELECT id FROM public.agents WHERE slug='chro'),
       updated_at = now()
 WHERE slug IN ('persona-workforce-architect','performance-calibration-manager')
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug='chro');

-- C) güvenlik korkuluğu: people-hr aktif kadrosunda yetim worker kalmadı kanıtı
DO $$
DECLARE v_orphan integer;
BEGIN
  SELECT count(*) INTO v_orphan
    FROM public.agents
   WHERE department='people-hr' AND role='worker'
     AND employment_status NOT IN ('archived') AND manager_id IS NULL;
  IF v_orphan > 0 THEN
    RAISE EXCEPTION 'E5.4a: people-hr yetim worker sayısı % (beklenen 0)', v_orphan;
  END IF;
END $$;

COMMIT;

-- ROLLBACK:
-- 1. DELETE FROM agents WHERE slug IN ('persona-workforce-architect','performance-calibration-manager')
--    AND persona_id IS NULL;
-- (manager_id geri alımı gerekmez — satırlar silinince kalkar; mevcut 3 uzmanın
--  manager_id'sine bu migration dokunmaz.)
