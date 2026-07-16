-- R1.2a — revenue_engines table + 6 seeds + revenue_ledger FK swap (U10).
-- Spec: REVENUE_ENGINE_SPEC §11/§22 (0028a). Adaptation U10 (00-INDEX):
-- the frozen CHECK enum on revenue_ledger.engine becomes a FK to
-- revenue_engines(slug) — engines are DATA; a new engine no longer needs a
-- migration. Seeds carry the 6 live enum values so the swap is data-lossless
-- (revenue_ledger measured 0 rows on 2026-07-16, but the guarantee holds
-- regardless of row count).

CREATE TABLE IF NOT EXISTS public.revenue_engines (
  slug             text PRIMARY KEY,
  title            text NOT NULL,
  title_tr         text NOT NULL,
  thesis           text,
  lifecycle        text NOT NULL DEFAULT 'candidate'
                     CHECK (lifecycle IN ('candidate','pilot','scale','sunset')),
  owner_department text REFERENCES public.departments(slug),
  unit_economics   jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_from     text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.revenue_engines IS
  'REVENUE_ENGINE_SPEC §11 — engines-as-data (U10). Talep §7.2: engines are a floor, not a ceiling. Mutations only via control_engine_* fns.';

-- Seeds = the 6 values of the retired CHECK enum (e65 D2 + physical).
-- lifecycle ''candidate'' is the honest state: live ledger had zero revenue
-- evidence for any engine at seed time.
INSERT INTO public.revenue_engines (slug, title, title_tr, lifecycle, created_from)
VALUES
  ('social_selling',       'Social Selling',        'Sosyal Satış',          'candidate', 'e65-enum-migration'),
  ('content_monetization', 'Content Monetization',  'İçerik Para Kazanımı',  'candidate', 'e65-enum-migration'),
  ('ecommerce',            'E-commerce',            'E-ticaret',             'candidate', 'e65-enum-migration'),
  ('consultancy',          'Consultancy',           'Danışmanlık',           'candidate', 'e65-enum-migration'),
  ('venture',              'Venture Building',      'Girişim İnşası',        'candidate', 'e65-enum-migration'),
  ('physical',             'Physical Products',     'Fiziksel Ürünler',      'candidate', 'e65-enum-migration')
ON CONFLICT (slug) DO NOTHING;

-- FK swap (idempotent both directions).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint
              WHERE conname = 'revenue_ledger_engine_check'
                AND conrelid = 'public.revenue_ledger'::regclass) THEN
    ALTER TABLE public.revenue_ledger DROP CONSTRAINT revenue_ledger_engine_check;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint
                  WHERE conname = 'fk_engine'
                    AND conrelid = 'public.revenue_ledger'::regclass) THEN
    ALTER TABLE public.revenue_ledger
      ADD CONSTRAINT fk_engine FOREIGN KEY (engine)
      REFERENCES public.revenue_engines(slug);
  END IF;
END $$;

-- Control seam only (P4): no direct client writes.
REVOKE ALL ON public.revenue_engines FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.revenue_engines TO authenticated;
ALTER TABLE public.revenue_engines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS revenue_engines_read ON public.revenue_engines;
CREATE POLICY revenue_engines_read ON public.revenue_engines
  FOR SELECT TO authenticated USING (true);
