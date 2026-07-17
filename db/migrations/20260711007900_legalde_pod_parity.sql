-- 20260711007900_legalde_pod_parity.sql — R2.5 gap migration (audit F-08)
-- WHY: the legal-de department was RUNTIME-BORN on live (pre-migration era,
-- agency-agents import); 20260711003100 only set its parent ("mevcut
-- departmanı ... pod'u olur") and 20260711008000 (D2) reads its director_id
-- in a guardrail. A fresh chain never creates the row, so D2 fires
-- (measured: 'D2: legal-de pod director_id boş kaldı'). This file replays the
-- pod's birth at its true chain position. Its later runtime retirement is
-- replayed by 20260717060000_legalde_pod_retire.sql — on live, one bootstrap
-- run applies both (insert → delete), leaving live exactly unchanged.
-- Same parity family as 20260711004900 / 20260711005900 / 20260711006900.

BEGIN;

INSERT INTO public.departments (slug, display_name, mcp_profile, status)
VALUES ('legal-de', 'Legal (Germany)', 'default-deny', 'dormant')
ON CONFLICT (slug) DO NOTHING;

-- pod relation (re-runs 20260711003100's parent bind, which no-oped on a
-- fresh chain because the row did not exist yet at that position)
UPDATE public.departments
   SET parent_id = (SELECT id FROM public.departments WHERE slug = 'legal')
 WHERE slug = 'legal-de' AND parent_id IS NULL;

COMMIT;

-- ROLLBACK: DELETE FROM public.departments WHERE slug='legal-de';
