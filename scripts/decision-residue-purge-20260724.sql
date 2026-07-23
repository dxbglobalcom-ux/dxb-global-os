-- CEO order 2026-07-24 (in-chat, "sil sil bitmiyor"): one-sweep removal of the
-- construction/exam-week (13-19 Jul) machine decision residue from
-- decision_log. CEO-made decisions are kept. Measured before running:
-- inflow since 2026-07-20 = 0 rows, so this is stale residue, not live flow.
-- Audited: one audit_log row records the count and rationale.
BEGIN;
CREATE TEMP TABLE _cp AS
  SELECT id FROM decision_log WHERE decided_by <> 'ceo';
DELETE FROM decision_log WHERE id IN (SELECT id FROM _cp);
INSERT INTO audit_log (actor, actor_type, action, payload)
VALUES ('ceo','ceo','records.purge', jsonb_build_object(
  'entity','decision',
  'purged',(SELECT count(*) FROM _cp),
  'rationale','CEO order 2026-07-24: construction/exam-week machine decision residue swept in one pass; CEO decisions kept; inflow measured 0 since 2026-07-20.'));
COMMIT;
SELECT count(*) AS remaining_rows FROM decision_log;
