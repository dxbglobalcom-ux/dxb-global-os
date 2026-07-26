-- W5.1 audit finding (2026-07-26) — the risk register had no Turkish leg.
--
-- Measured: `project_risks` carries `title` and nothing else; /gov/risks:117,
-- /gov/risks:254 and /ops/projects/[slug]:593 all render `{r.title}` with no
-- locale branch, so the CEO's Turkish board reads three English sentences.
-- Same class as the project card heading (U33, migration 20260726012500):
-- DB text IS an i18n surface, and a risk register the CEO half-reads is a
-- register he does not read.
--
-- Risk titles are written by agents and by the build, never by the CEO, so a
-- Turkish leg is a translation of the holding's own words — not a rewrite of
-- his. The three live rows are translated here by hand; anything born later
-- carries its own leg from whoever writes it.

BEGIN;

ALTER TABLE public.project_risks
  ADD COLUMN IF NOT EXISTS title_tr text;

UPDATE public.project_risks SET title_tr =
  'İşgücü aktivasyon boşluğu: 220 çalışan kaydının 219''u uykuda; İK yaşam-döngüsü motoru yazıldı ama henüz aktive edilmedi'
 WHERE title LIKE 'Workforce activation gap%' AND title_tr IS NULL;

UPDATE public.project_risks SET title_tr =
  'Onay ekranındaki kahve-token denetimi CEO emriyle ertelendi (2026-07-14) — ilk tasarım geçişine planlandı'
 WHERE title LIKE 'Approvals brown-token audit deferred%' AND title_tr IS NULL;

UPDATE public.project_risks SET title_tr =
  'Maliyet İstihbaratı yüzeyi (E11) bekliyor — aylık 50-150 EUR bandı uygulanırken dashboard tarafında harcama görünürlüğü yalnız Kâr-Zarar ile sınırlı'
 WHERE title LIKE 'Cost Intelligence surface%' AND title_tr IS NULL;

COMMENT ON COLUMN public.project_risks.title_tr IS
  'Turkish leg of the risk title — the CEO reads the register in Turkish (W5.1 audit finding 2026-07-26). NULL falls back to `title` at render time: honest over blank.';

COMMIT;

-- ROLLBACK:
--   ALTER TABLE public.project_risks DROP COLUMN IF EXISTS title_tr;
