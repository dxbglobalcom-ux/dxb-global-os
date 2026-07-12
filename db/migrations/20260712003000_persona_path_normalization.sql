-- 20260712003000_persona_path_normalization.sql
-- Corrective data-fix (idempotent): normalize agents.persona_path to the file-tree convention
-- 'personas/<department>/<slug>.md'.
--
-- Root cause (systemic, found 2026-07-12 session audit): E5.3/E5.4/E5.5 wave migrations
-- repointed persona_path ONLY for department-crossing moves (D1/D3 slug moves). In-place
-- rewrites (D1 finance, D2 security/risk-audit, E5.4a people-hr, D4a engineering) and the
-- E5.3 director wave kept their pre-rewrite paths: either the removed 'agency-agents/' tree
-- (archived to ~/dxb-archive/agency-agents-20260711.tar.gz) or the E5.3b ADD placeholder
-- (WORKFORCE-GAP-MATRIX.md / directive files). 20260712002001 fixed one such row
-- (identity-graph-operator); this migration fixes the class.
--
-- Scope A (44 rows): every non-archived agent with persona_id bound (written + gated) whose
--   persona_path is off-convention. Disk verified 2026-07-12: all 44 files exist (loop:
--   [ -f personas/<dept>/<slug>.md ] -> 0 MISSING).
-- Scope B (19 rows): engineering + quality remaining rows (D4 wave in progress — 4 authored
--   awaiting submit, 15 skeletons). Disk verified: 0 MISSING. Other departments' unwritten
--   rows keep wave convention (their wave migration repoints; E12.5 gate sweeps remainder:
--   stale persona_path = 0 — roadmap E12.5 row updated 2026-07-12).
--
-- Pre-image (old values, for manual rollback) — Scope A:
--   agents-orchestrator <= agency-agents/specialized/agents-orchestrator.md
--   head-of-customer-success <= HOLDING-OS-MASTER-PLAN/WORKFORCE-GAP-MATRIX.md
--   chief-ai-officer <= HOLDING-OS-MASTER-PLAN/WORKFORCE-GAP-MATRIX.md
--   head-of-design <= HOLDING-OS-MASTER-PLAN/WORKFORCE-GAP-MATRIX.md
--   engineering-backend-architect <= agency-agents/engineering/engineering-backend-architect.md
--   engineering-cms-developer <= agency-agents/engineering/engineering-cms-developer.md
--   engineering-code-reviewer <= agency-agents/engineering/engineering-code-reviewer.md
--   engineering-codebase-onboarding-engineer <= agency-agents/engineering/engineering-codebase-onboarding-engineer.md
--   engineering-devops-automator <= agency-agents/engineering/engineering-devops-automator.md
--   engineering-frontend-developer <= agency-agents/engineering/engineering-frontend-developer.md
--   engineering-git-workflow-master <= agency-agents/engineering/engineering-git-workflow-master.md
--   engineering-minimal-change-engineer <= agency-agents/engineering/engineering-minimal-change-engineer.md
--   engineering-mobile-app-builder <= agency-agents/engineering/engineering-mobile-app-builder.md
--   engineering-rapid-prototyper <= agency-agents/engineering/engineering-rapid-prototyper.md
--   engineering-senior-developer <= agency-agents/engineering/engineering-senior-developer.md
--   engineering-software-architect <= agency-agents/engineering/engineering-software-architect.md
--   accounts-payable-agent <= agency-agents/specialized/accounts-payable-agent.md
--   cfo <= HOLDING-OS-MASTER-PLAN/WORKFORCE-GAP-MATRIX.md
--   finance-bookkeeper-controller <= agency-agents/finance/finance-bookkeeper-controller.md
--   finance-financial-analyst <= agency-agents/finance/finance-financial-analyst.md
--   finance-fpa-analyst <= agency-agents/finance/finance-fpa-analyst.md
--   finance-investment-researcher <= agency-agents/finance/finance-investment-researcher.md
--   finance-tax-strategist <= agency-agents/finance/finance-tax-strategist.md
--   supply-chain-strategist <= agency-agents/specialized/supply-chain-strategist.md
--   general-counsel <= HOLDING-OS-MASTER-PLAN/WORKFORCE-GAP-MATRIX.md
--   cmo <= HOLDING-OS-MASTER-PLAN/WORKFORCE-GAP-MATRIX.md
--   paid-media-ppc-strategist <= agency-agents/paid-media/paid-media-ppc-strategist.md
--   chro <= HOLDING-OS-MASTER-PLAN/WORKFORCE-GAP-MATRIX.md
--   corporate-training-designer <= agency-agents/specialized/corporate-training-designer.md
--   hr-onboarding <= agency-agents/specialized/hr-onboarding.md
--   recruitment-specialist <= agency-agents/specialized/recruitment-specialist.md
--   platform-head <= HOLDING-OS-MASTER-PLAN/WORKFORCE-GAP-MATRIX.md
--   project-management-studio-producer <= agency-agents/project-management/project-management-studio-producer.md
--   quality-head <= HOLDING-OS-MASTER-PLAN/WORKFORCE-GAP-MATRIX.md
--   revops-head <= HOLDING-OS-MASTER-PLAN/WORKFORCE-GAP-MATRIX.md
--   automation-governance-architect <= agency-agents/specialized/automation-governance-architect.md
--   enterprise-risk-manager <= HOLDING-OS-MASTER-PLAN/WORKFORCE-GAP-MATRIX.md
--   head-of-sales <= HOLDING-OS-MASTER-PLAN/WORKFORCE-GAP-MATRIX.md
--   agentic-identity-trust <= agency-agents/specialized/agentic-identity-trust.md
--   blockchain-security-auditor <= agency-agents/specialized/blockchain-security-auditor.md
--   ciso <= HOLDING-OS-MASTER-PLAN/WORKFORCE-GAP-MATRIX.md
--   compliance-auditor <= agency-agents/specialized/compliance-auditor.md
--   social-media-orchestrator <= HOLDING-OS-MASTER-PLAN/00-CEO-DIRECTIVE-SOCIAL-MEDIA-DEPT.md
--   head-of-strategy <= HOLDING-OS-MASTER-PLAN/WORKFORCE-GAP-MATRIX.md
-- Pre-image — Scope B (engineering/quality unbound):
--   engineering-ai-data-remediation-engineer <= agency-agents/engineering/engineering-ai-data-remediation-engineer.md
--   engineering-autonomous-optimization-architect <= agency-agents/engineering/engineering-autonomous-optimization-architect.md
--   engineering-email-intelligence-engineer <= agency-agents/engineering/engineering-email-intelligence-engineer.md
--   engineering-embedded-firmware-engineer <= agency-agents/engineering/engineering-embedded-firmware-engineer.md
--   engineering-feishu-integration-developer <= agency-agents/engineering/engineering-feishu-integration-developer.md
--   engineering-filament-optimization-specialist <= agency-agents/engineering/engineering-filament-optimization-specialist.md
--   engineering-solidity-smart-contract-engineer <= agency-agents/engineering/engineering-solidity-smart-contract-engineer.md
--   engineering-technical-writer <= agency-agents/engineering/engineering-technical-writer.md
--   engineering-voice-ai-integration-engineer <= agency-agents/engineering/engineering-voice-ai-integration-engineer.md
--   engineering-wechat-mini-program-developer <= agency-agents/engineering/engineering-wechat-mini-program-developer.md
--   lsp-index-engineer <= agency-agents/specialized/lsp-index-engineer.md
--   testing-accessibility-auditor <= agency-agents/testing/testing-accessibility-auditor.md
--   testing-api-tester <= agency-agents/testing/testing-api-tester.md
--   testing-evidence-collector <= agency-agents/testing/testing-evidence-collector.md
--   testing-performance-benchmarker <= agency-agents/testing/testing-performance-benchmarker.md
--   testing-reality-checker <= agency-agents/testing/testing-reality-checker.md
--   testing-test-results-analyzer <= agency-agents/testing/testing-test-results-analyzer.md
--   testing-tool-evaluator <= agency-agents/testing/testing-tool-evaluator.md
--   testing-workflow-optimizer <= agency-agents/testing/testing-workflow-optimizer.md

BEGIN;

-- Scope A: bound (persona_id set) non-archived rows, any department
UPDATE public.agents
   SET persona_path = 'personas/'||department||'/'||slug||'.md',
       updated_at   = now()
 WHERE employment_status <> 'archived'
   AND persona_id IS NOT NULL
   AND persona_path IS DISTINCT FROM 'personas/'||department||'/'||slug||'.md';

-- Scope B: engineering + quality remaining non-archived rows (D4 wave file tree fully on disk)
UPDATE public.agents
   SET persona_path = 'personas/'||department||'/'||slug||'.md',
       updated_at   = now()
 WHERE department IN ('engineering','quality')
   AND employment_status <> 'archived'
   AND persona_path IS DISTINCT FROM 'personas/'||department||'/'||slug||'.md';

-- Guardrails (fail loudly)
DO $$
DECLARE
  v_bound_stale int; v_d4_stale int;
BEGIN
  SELECT count(*) INTO v_bound_stale FROM public.agents
   WHERE employment_status <> 'archived' AND persona_id IS NOT NULL
     AND persona_path NOT LIKE 'personas/%';
  IF v_bound_stale <> 0 THEN
    RAISE EXCEPTION 'persona_path normalization guardrail: % bound rows still off personas/', v_bound_stale;
  END IF;
  SELECT count(*) INTO v_d4_stale FROM public.agents
   WHERE department IN ('engineering','quality') AND employment_status <> 'archived'
     AND persona_path NOT LIKE 'personas/%';
  IF v_d4_stale <> 0 THEN
    RAISE EXCEPTION 'persona_path normalization guardrail: % engineering/quality rows still off personas/', v_d4_stale;
  END IF;
END $$;

COMMIT;

-- ROLLBACK: restore individual rows from the pre-image comment block above, e.g.
--   UPDATE public.agents SET persona_path='<old value>' WHERE slug='<slug>';
