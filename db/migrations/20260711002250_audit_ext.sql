-- 0022x-b (E4.1) — audit extensions on the 0022x family + audit_log bridge.
-- Normative source: AUDIT_AND_LOGGING_SPEC §4 (recorded addition, folded into
-- DATA_MODEL §20 at Dalga 4 close). review_status/reverted_by answer the
-- directive 10.4 review/rollback questions; audit_log.detail_ref bridges the
-- top-level audit row to its family detail row ({"table":...,"id":...}).
-- Review marking is the ONLY writable audit field and goes through
-- control_audit_mark_reviewed (SECURITY DEFINER, later block) — the 0022x
-- role-level append-only revoke stays intact.
-- Idempotent: safe to re-run.

ALTER TABLE public.file_changes
  ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'unreviewed'
    CHECK (review_status IN ('unreviewed','reviewed_ok','reviewed_flagged')),
  ADD COLUMN IF NOT EXISTS reverted_by bigint REFERENCES public.file_changes(id);

ALTER TABLE public.audit_log
  ADD COLUMN IF NOT EXISTS detail_ref jsonb;

COMMENT ON COLUMN public.audit_log.detail_ref is
  '0022x-b bridge to family detail logs: {"table":"decision_log","id":123}.';
COMMENT ON COLUMN public.file_changes.review_status is
  '0022x-b: only writable audit field, via control_audit_mark_reviewed fn.';
COMMENT ON COLUMN public.file_changes.reverted_by is
  '0022x-b rollback chain: id of the file_changes row that reverted this one.';

-- ROLLBACK:
--   ALTER TABLE public.audit_log DROP COLUMN IF EXISTS detail_ref;
--   ALTER TABLE public.file_changes DROP COLUMN IF EXISTS review_status,
--     DROP COLUMN IF EXISTS reverted_by;
