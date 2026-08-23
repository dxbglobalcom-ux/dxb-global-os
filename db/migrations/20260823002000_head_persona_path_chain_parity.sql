-- persona_path for the thirteen department heads — CHAIN PARITY (B36 Block 2).
--
-- WHY THIS FILE EXISTS. On the company these thirteen rows point at their own
-- dossier — `personas/finance/cfo.md`, `personas/security/ciso.md` and so on.
-- On a database built from the migration chain they point at
-- `HOLDING-OS-MASTER-PLAN/WORKFORCE-GAP-MATRIX.md`, which is a PLANNING
-- DOCUMENT: the E5.3/E5.5 wave migrations created them with the matrix as a
-- placeholder, a later session repointed them directly on the company database,
-- and that act was never written into the chain. Same disease as
-- 20260823001000: the chain and the company drifted apart in silence.
--
-- It is the CFO, the CISO, the CMO, the CHRO, the Chief AI Officer, the General
-- Counsel and seven more department heads — so on a fresh environment the
-- holding's entire senior layer reads a gap analysis as its own identity.
--
-- Measured 2026-08-23 on a database built from the chain into a fresh engine:
-- 13 rows carrying that path, and all thirteen have a real dossier on disk
-- (checked file by file, `ls personas/*/<slug>.md`). The map below is that
-- check written down, in the explicit-slug idiom 20260718030000 already uses —
-- a path is never derived from a department name, because `cfo` lives under
-- `finance` and `ciso` under `security` and no rule connects the two.
--
-- On the company this is a no-op: no row there carries the matrix path.
-- The guard makes it a no-op anywhere the path has already been corrected.
--
-- tests/e125/workforce-gate.test.ts case (4) does NOT catch this, and that is
-- worth saying: it asserts the stored path EXISTS on disk, and the gap matrix
-- does exist. A path can point at a real file and still be the wrong file.

BEGIN;

UPDATE public.agents a
   SET persona_path = m.target
  FROM (VALUES
    ('cfo', 'personas/finance/cfo.md'),
    ('chief-ai-officer', 'personas/data-ai/chief-ai-officer.md'),
    ('chro', 'personas/people-hr/chro.md'),
    ('ciso', 'personas/security/ciso.md'),
    ('cmo', 'personas/marketing/cmo.md'),
    ('enterprise-risk-manager', 'personas/risk-audit/enterprise-risk-manager.md'),
    ('general-counsel', 'personas/legal/general-counsel.md'),
    ('head-of-customer-success', 'personas/customer-success/head-of-customer-success.md'),
    ('head-of-design', 'personas/design/head-of-design.md'),
    ('head-of-sales', 'personas/sales/head-of-sales.md'),
    ('head-of-strategy', 'personas/strategy/head-of-strategy.md'),
    ('platform-head', 'personas/platform/platform-head.md'),
    ('revops-head', 'personas/revops/revops-head.md')
  ) AS m(slug, target)
 WHERE a.slug = m.slug
   AND a.persona_path = 'HOLDING-OS-MASTER-PLAN/WORKFORCE-GAP-MATRIX.md';

COMMIT;

-- ROLLBACK: UPDATE public.agents SET persona_path = 'HOLDING-OS-MASTER-PLAN/WORKFORCE-GAP-MATRIX.md'
--            WHERE slug IN (…the thirteen…);  -- only ever correct on a chain-built database
