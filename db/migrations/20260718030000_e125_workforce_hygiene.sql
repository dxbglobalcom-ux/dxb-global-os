-- E12.5 Workforce Completeness Gate — machine-gate hygiene (three concerns,
-- all measured live 2026-07-18 before authoring; each block idempotent).
--
-- (1) Test-fixture debris: `r23t-30019999-wf-agent` leaked into the live
--     registry on 2026-07-16 (tests/r23 orphan sweep archives fixtures that
--     accumulated agent_runs instead of deleting them). Measured: 1 agent_runs
--     row with 3 decision_log + 2 tool_calls + 3 hook_violations children;
--     0 tasks, 0 personas. A test fixture is not an employee — it leaves the
--     ledger entirely, children first. The r23 suite's own sweep prevents
--     recurrence for run-less fixtures; run-bearing ones are this migration's
--     precedent. All agent_runs child tables swept for replay parity (zero-row
--     deletes are no-ops elsewhere).
--
-- (2) Stale persona_path sweep → 0 (E12.5 gate SQL clause): 21 archived rows
--     still point at the removed `agency-agents/%` tree. Repoint per the
--     CEO-approved matrix §2 dispositions (WORKFORCE-GAP-MATRIX, approval
--     2026-07-11 ~17:35): 15 retired rows → their archived body in
--     `personas/_library/` (15/15 files verified on disk); 6 merged rows →
--     the surviving persona file that absorbed the role ("file dies, role
--     lives" — matrix rows 72/98/104/109/111/138-140).
--
-- (3) persona_version truth restoration: E5.5 D1–D6 / social / HR / head
--     waves bound v2 personas but never updated agents.persona_version,
--     leaving 175 non-archived rows tagged 'v1.0-legacy' (127, incl. the
--     ACTIVE finance employee) or 'v0-add' (48). Ground truth measured: ALL
--     199 non-archived rows have bound personas with author='fable-5' AND
--     quality_gate='passed' — the D7 waves' stamp 'v2.0-fable' is the correct
--     tag (24 rows carry it already). hook.preTask ctx ships this column live
--     (FABLE_5_HOOK_SPEC:39), so the stale tag was feeding wrong metadata
--     into every future hook evaluation.

BEGIN;

-- (1) fixture debris ---------------------------------------------------------
CREATE TEMP TABLE _e125_fixture_runs ON COMMIT DROP AS
  SELECT r.id FROM agent_runs r
  JOIN agents a ON a.id = r.employee_id
 WHERE a.slug = 'r23t-30019999-wf-agent';

DELETE FROM decision_log       WHERE run_id IN (SELECT id FROM _e125_fixture_runs);
DELETE FROM tool_calls         WHERE run_id IN (SELECT id FROM _e125_fixture_runs);
DELETE FROM file_changes       WHERE run_id IN (SELECT id FROM _e125_fixture_runs);
DELETE FROM hook_violations    WHERE run_id IN (SELECT id FROM _e125_fixture_runs);
DELETE FROM alerts             WHERE run_id IN (SELECT id FROM _e125_fixture_runs);
DELETE FROM library_usage_log  WHERE run_id IN (SELECT id FROM _e125_fixture_runs);
DELETE FROM memory_index       WHERE run_id IN (SELECT id FROM _e125_fixture_runs);
UPDATE approvals SET reanalysis_run_id = NULL
 WHERE reanalysis_run_id IN (SELECT id FROM _e125_fixture_runs);
DELETE FROM agent_runs         WHERE id     IN (SELECT id FROM _e125_fixture_runs);
DELETE FROM agents WHERE slug = 'r23t-30019999-wf-agent';

-- (2) stale-path repoint (archived rows only; explicit slug map) -------------
UPDATE agents SET persona_path = 'personas/_library/' || slug || '.md'
 WHERE persona_path LIKE 'agency-agents/%'
   AND employment_status = 'archived'
   AND slug IN (
     'government-digital-presales-consultant','healthcare-customer-service',
     'healthcare-marketing-compliance','hospitality-guest-services',
     'language-translator','legal-billing-time-tracking','legal-client-intake',
     'loan-officer-assistant','real-estate-buyer-seller','retail-customer-returns',
     'specialized-civil-engineer','specialized-french-consulting-market',
     'specialized-korean-business-navigator','specialized-salesforce-architect',
     'study-abroad-advisor'
   );

UPDATE agents SET persona_path = m.target
  FROM (VALUES
    ('customer-service',        'personas/customer-success/support-support-responder.md'),
    ('sales-outreach',          'personas/sales/sales-outbound-strategist.md'),
    ('project-manager-senior',  'personas/project-management/project-management-project-shepherd.md'),
    ('support-finance-tracker', 'personas/finance/finance-fpa-analyst.md'),
    ('data-consolidation-agent','personas/revops/revenue-reporting-agent.md'),
    ('report-distribution-agent','personas/revops/revenue-reporting-agent.md')
  ) AS m(slug, target)
 WHERE agents.slug = m.slug
   AND agents.persona_path LIKE 'agency-agents/%'
   AND agents.employment_status = 'archived';

-- (3) persona_version restoration (evidence-join, never a blanket write) -----
UPDATE agents a SET persona_version = 'v2.0-fable'
  FROM personas p
 WHERE p.id = a.persona_id
   AND a.employment_status != 'archived'
   AND p.author = 'fable-5'
   AND p.quality_gate = 'passed'
   AND a.persona_version IS DISTINCT FROM 'v2.0-fable';

COMMIT;
