-- 20260711006900_agent_org_parity_backfill.sql — R2.5 gap migration (audit F-08)
-- WHY THIS EXISTS: the E5-era persona/org waves (D1..D7, e56) carry DATA
-- guardrails (orphan workers = 0, exact headcounts, director bindings) that on
-- the LIVE database were satisfied by runtime control-fn mutations — agents
-- born through HR flows, never through a migration. A fresh bootstrap replays
-- only migrations, so those guardrails fire (measured: drill break #3,
-- 'D1: yetim worker sayısı 2'). This file backfills the runtime-born roster —
-- same pattern as 20260711004900 (departments) and 20260711005900 (chro).
--
-- GENERATED deterministically from the live roster (2026-07-17) diffed against
-- the drill container state at this exact chain position. All slug references
-- use the slug AS IT EXISTS AT THIS POINT in the chain (pre-rename form);
-- later wave renames keep row identity (same id), so early manager/director
-- bindings survive renames and the waves' own rebindings become no-ops.
--
-- IDEMPOTENT: safe on live (every INSERT hits ON CONFLICT DO NOTHING; every
-- UPDATE is IS DISTINCT FROM-guarded). Live ledger gains this version on the
-- next bootstrap-db.sh run (file set 83 = ledger 83).

BEGIN;

-- Data-restore window: enforce_persona_gate_on_activation() guards FUTURE
-- activation acts; live reached the state below THROUGH that gate (audit_log:
-- fn_persona_gate passed verdicts). Replaying the measured RESULT is a data
-- restore — same contract as pg_dump --disable-triggers. Re-enabled before
-- COMMIT; a failure anywhere rolls back the whole file, window included.
ALTER TABLE public.agents DISABLE TRIGGER trg_agents_activation_gate;
ALTER TABLE public.agents DISABLE TRIGGER trg_agents_persona_passed;

-- A) RUNTIME-BORN AGENTS (live roster rows absent from the migration chain).
--    persona_id / hook_version stay NULL here: persona binding is a runtime
--    act (file-first architecture — personas/ tree syncs post-bootstrap).
INSERT INTO public.agents
  (id, slug, department, role, brain, mcp_profile, skills, autonomy_level,
   persona_path, persona_version, status, created_at, updated_at,
   role_level, employment_status)
VALUES
  ('0b863fea-ffe4-423c-a593-cdbe6fe49817'::uuid, $dxb$accounts-payable-agent$dxb$, $dxb$finance$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/finance/accounts-payable-agent.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.633991+00'::timestamptz, '2026-07-12 21:33:56.808676+00'::timestamptz, $dxb$specialist$dxb$, $dxb$active$dxb$),
  ('46e53165-700e-4e40-b4e7-e8f6d43e7bb0'::uuid, $dxb$agentic-identity-trust$dxb$, $dxb$security$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/security/agentic-identity-trust.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.641239+00'::timestamptz, '2026-07-12 02:41:00.168384+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('19c52d4f-f750-410a-84a8-7c2c22a417bf'::uuid, $dxb$agents-orchestrator$dxb$, $dxb$ceo$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/ceo/agents-orchestrator.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.646932+00'::timestamptz, '2026-07-12 02:41:00.168384+00'::timestamptz, $dxb$orchestrator$dxb$, $dxb$dormant$dxb$),
  ('2860fc97-5bee-4b96-97df-09fa2ca2a82b'::uuid, $dxb$ai-engineer$dxb$, $dxb$data-ai$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/data-ai/ai-engineer.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.148638+00'::timestamptz, '2026-07-11 23:13:53.236216+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('1666367c-ed84-4840-b137-a6925b2ec478'::uuid, $dxb$ai-model-risk-officer$dxb$, $dxb$risk-audit$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/risk-audit/ai-model-risk-officer.md$dxb$, $dxb$v0-add$dxb$, $dxb$dormant$dxb$, '2026-07-11 20:42:44.90028+00'::timestamptz, '2026-07-11 21:11:45.800943+00'::timestamptz, $dxb$specialist$dxb$, $dxb$draft$dxb$),
  ('08659939-ecc2-43cf-80b8-5a97eb348d2c'::uuid, $dxb$ai-observability-finops-analyst$dxb$, $dxb$data-ai$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/data-ai/ai-observability-finops-analyst.md$dxb$, $dxb$v0-add$dxb$, $dxb$dormant$dxb$, '2026-07-11 22:15:16.783665+00'::timestamptz, '2026-07-11 23:13:53.236216+00'::timestamptz, $dxb$specialist$dxb$, $dxb$draft$dxb$),
  ('fb11c2ab-c477-4441-96e6-3bf29649324c'::uuid, $dxb$ai-safety-red-team-lead$dxb$, $dxb$security$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/security/ai-safety-red-team-lead.md$dxb$, $dxb$v0-add$dxb$, $dxb$dormant$dxb$, '2026-07-11 20:42:44.90028+00'::timestamptz, '2026-07-11 20:42:44.90028+00'::timestamptz, $dxb$senior_specialist$dxb$, $dxb$draft$dxb$),
  ('d860268c-73c0-4dac-a9ea-111a53f43367'::uuid, $dxb$analytics-reporter$dxb$, $dxb$data-ai$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/data-ai/analytics-reporter.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.846602+00'::timestamptz, '2026-07-11 23:13:53.236216+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('cb5148f7-b592-4f31-b258-f0548897c0ce'::uuid, $dxb$automation-governance-architect$dxb$, $dxb$risk-audit$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/risk-audit/automation-governance-architect.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.650635+00'::timestamptz, '2026-07-12 02:41:00.168384+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('073905e6-3a0e-4a98-ab84-015921f0e0c1'::uuid, $dxb$backup-dr-officer$dxb$, $dxb$platform$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/platform/backup-dr-officer.md$dxb$, $dxb$v0-add$dxb$, $dxb$dormant$dxb$, '2026-07-11 22:15:16.783665+00'::timestamptz, '2026-07-11 23:13:53.236216+00'::timestamptz, $dxb$senior_specialist$dxb$, $dxb$draft$dxb$),
  ('12d7b70e-3f95-493b-a70f-800723cdf588'::uuid, $dxb$blockchain-security-auditor$dxb$, $dxb$security$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/security/blockchain-security-auditor.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.655128+00'::timestamptz, '2026-07-12 02:41:00.168384+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('95759221-c954-428a-b6b9-30c2808f2667'::uuid, $dxb$board-decision-secretary$dxb$, $dxb$ceo$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/ceo/board-decision-secretary.md$dxb$, $dxb$v0-add$dxb$, $dxb$dormant$dxb$, '2026-07-11 19:17:09.836353+00'::timestamptz, '2026-07-11 19:41:58.731424+00'::timestamptz, $dxb$specialist$dxb$, $dxb$draft$dxb$),
  ('352b867f-c135-4bf8-9cbd-469e14203dea'::uuid, $dxb$business-automation-solutions-architect$dxb$, $dxb$customer-success$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/customer-success/business-automation-solutions-architect.md$dxb$, $dxb$v2.0-fable$dxb$, $dxb$dormant$dxb$, '2026-07-12 15:28:09.287068+00'::timestamptz, '2026-07-12 15:40:52.378346+00'::timestamptz, $dxb$senior_specialist$dxb$, $dxb$draft$dxb$),
  ('c74ccb32-e4f6-48c6-a0f3-fbc0023259cd'::uuid, $dxb$catalog-pim-specialist$dxb$, $dxb$commerce$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/commerce/catalog-pim-specialist.md$dxb$, $dxb$v2.0-fable$dxb$, $dxb$dormant$dxb$, '2026-07-12 14:56:39.975409+00'::timestamptz, '2026-07-12 15:18:55.609624+00'::timestamptz, $dxb$specialist$dxb$, $dxb$draft$dxb$),
  ('2bf98829-f821-4daf-b16a-7d76efa9b2ac'::uuid, $dxb$chief-of-staff$dxb$, $dxb$ceo$dxb$, $dxb$head$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/ceo/chief-of-staff.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.776284+00'::timestamptz, '2026-07-11 19:41:58.731424+00'::timestamptz, $dxb$director$dxb$, $dxb$dormant$dxb$),
  ('70d89216-9339-4ff0-87d9-6addeae0d5f2'::uuid, $dxb$commerce-analytics-specialist$dxb$, $dxb$commerce$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/commerce/commerce-analytics-specialist.md$dxb$, $dxb$v2.0-fable$dxb$, $dxb$dormant$dxb$, '2026-07-12 14:56:39.975409+00'::timestamptz, '2026-07-12 15:18:55.609624+00'::timestamptz, $dxb$specialist$dxb$, $dxb$draft$dxb$),
  ('378cfe16-5095-4888-bff8-c7ca17807178'::uuid, $dxb$commerce-integration-engineer$dxb$, $dxb$commerce$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/commerce/commerce-integration-engineer.md$dxb$, $dxb$v2.0-fable$dxb$, $dxb$dormant$dxb$, '2026-07-12 14:56:39.975409+00'::timestamptz, '2026-07-12 15:18:55.609624+00'::timestamptz, $dxb$senior_specialist$dxb$, $dxb$draft$dxb$),
  ('f2f14980-45a8-4918-b232-2c64080668b0'::uuid, $dxb$commerce-returns-specialist$dxb$, $dxb$commerce$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/commerce/commerce-returns-specialist.md$dxb$, $dxb$v2.0-fable$dxb$, $dxb$dormant$dxb$, '2026-07-12 14:56:39.975409+00'::timestamptz, '2026-07-12 15:18:55.609624+00'::timestamptz, $dxb$specialist$dxb$, $dxb$draft$dxb$),
  ('ff23f7e5-640a-4999-8d33-fb7664831577'::uuid, $dxb$commercial-contracts-manager$dxb$, $dxb$legal$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/legal/commercial-contracts-manager.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.728162+00'::timestamptz, '2026-07-11 21:02:01.92513+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('c4067614-502c-4dbc-804b-3d910c96e8e0'::uuid, $dxb$compliance-auditor$dxb$, $dxb$security$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/security/compliance-auditor.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.659218+00'::timestamptz, '2026-07-12 02:41:00.168384+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('3b560a5d-4b37-4f04-a94c-39c55ac7a4ed'::uuid, $dxb$corporate-communications-lead$dxb$, $dxb$marketing$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/marketing/corporate-communications-lead.md$dxb$, $dxb$v2.0-fable$dxb$, $dxb$dormant$dxb$, '2026-07-12 14:34:38.619272+00'::timestamptz, '2026-07-12 14:45:56.75235+00'::timestamptz, $dxb$specialist$dxb$, $dxb$draft$dxb$),
  ('4aa67c8f-10b7-4599-bb73-372d57905213'::uuid, $dxb$corporate-development-analyst$dxb$, $dxb$strategy$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/strategy/corporate-development-analyst.md$dxb$, $dxb$v0-add$dxb$, $dxb$dormant$dxb$, '2026-07-11 19:17:09.836353+00'::timestamptz, '2026-07-11 19:55:12.504047+00'::timestamptz, $dxb$specialist$dxb$, $dxb$draft$dxb$),
  ('08b9f6b8-ba76-4572-8c30-e544513c7877'::uuid, $dxb$corporate-training-designer$dxb$, $dxb$people-hr$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/people-hr/corporate-training-designer.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.66429+00'::timestamptz, '2026-07-12 02:41:00.168384+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('42a0e354-d14a-4008-95e5-347a7a472b9f'::uuid, $dxb$crm-data-steward$dxb$, $dxb$revops$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/revops/crm-data-steward.md$dxb$, $dxb$v2.0-fable$dxb$, $dxb$dormant$dxb$, '2026-07-12 14:34:38.619272+00'::timestamptz, '2026-07-12 14:45:56.75235+00'::timestamptz, $dxb$specialist$dxb$, $dxb$draft$dxb$),
  ('99b123f2-a92d-4baa-b58e-0cb5fd34bbcb'::uuid, $dxb$cro-checkout-specialist$dxb$, $dxb$commerce$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/commerce/cro-checkout-specialist.md$dxb$, $dxb$v2.0-fable$dxb$, $dxb$dormant$dxb$, '2026-07-12 14:56:39.975409+00'::timestamptz, '2026-07-12 15:18:55.609624+00'::timestamptz, $dxb$specialist$dxb$, $dxb$draft$dxb$),
  ('3de5589a-78ec-4938-ae63-5c38789ddc16'::uuid, $dxb$customer-service$dxb$, $dxb$customer-success$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$agency-agents/specialized/customer-service.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.671044+00'::timestamptz, '2026-07-11 15:50:11.734451+00'::timestamptz, NULL, $dxb$archived$dxb$),
  ('409da79c-19f0-47fc-9ed9-4585f69026b4'::uuid, $dxb$data-consolidation-agent$dxb$, $dxb$revops$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$agency-agents/specialized/data-consolidation-agent.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.675242+00'::timestamptz, '2026-07-11 15:50:11.734451+00'::timestamptz, NULL, $dxb$archived$dxb$),
  ('8245e0f8-e136-45ef-b210-acd8261793c7'::uuid, $dxb$data-engineer$dxb$, $dxb$data-ai$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/data-ai/data-engineer.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.174806+00'::timestamptz, '2026-07-11 23:13:53.236216+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('256500ab-0d36-49e5-8a03-87b259738750'::uuid, $dxb$database-optimizer$dxb$, $dxb$platform$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/platform/database-optimizer.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.17877+00'::timestamptz, '2026-07-11 23:13:53.236216+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('13906cea-2f4c-4ced-a47c-4cca0a7c8109'::uuid, $dxb$design-brand-guardian$dxb$, $dxb$design$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/design/design-brand-guardian.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.106542+00'::timestamptz, '2026-07-12 11:48:31.863565+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('d2e90c95-a6da-4c05-83aa-411dc36a7463'::uuid, $dxb$design-image-prompt-engineer$dxb$, $dxb$design$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/design/design-image-prompt-engineer.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.11715+00'::timestamptz, '2026-07-12 11:48:31.863565+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('a7d68e15-2207-4086-a7bc-4a8432947c30'::uuid, $dxb$design-inclusive-visuals-specialist$dxb$, $dxb$design$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/design/design-inclusive-visuals-specialist.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.124579+00'::timestamptz, '2026-07-12 11:48:31.863565+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('d2a0076e-dc1d-4385-9969-3f0a65939186'::uuid, $dxb$design-ui-designer$dxb$, $dxb$design$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/design/design-ui-designer.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.127791+00'::timestamptz, '2026-07-12 11:48:31.863565+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('6ee64116-91eb-4415-9517-facbecf0b4cb'::uuid, $dxb$design-ux-architect$dxb$, $dxb$design$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/design/design-ux-architect.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.13069+00'::timestamptz, '2026-07-12 11:48:31.863565+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('9ac1c422-3880-46c8-83e4-f3afa9856267'::uuid, $dxb$design-ux-researcher$dxb$, $dxb$design$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/design/design-ux-researcher.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.133597+00'::timestamptz, '2026-07-12 11:48:31.863565+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('642ba8e8-6055-4610-affd-8705463ae74f'::uuid, $dxb$design-visual-storyteller$dxb$, $dxb$design$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/design/design-visual-storyteller.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.137877+00'::timestamptz, '2026-07-12 11:48:31.863565+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('1ed71cb2-168f-4513-82b7-8e8a31e5c62a'::uuid, $dxb$design-whimsy-injector$dxb$, $dxb$design$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/design/design-whimsy-injector.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.142072+00'::timestamptz, '2026-07-12 11:48:31.863565+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('8a7bb33c-d375-44ef-93ce-2fb6290a2f72'::uuid, $dxb$document-generator$dxb$, $dxb$ceo$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/ceo/document-generator.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.795166+00'::timestamptz, '2026-07-11 19:41:58.731424+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('85850c2c-93b5-41d4-974a-490569f63d0d'::uuid, $dxb$engineering-ai-data-remediation-engineer$dxb$, $dxb$engineering$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/engineering/engineering-ai-data-remediation-engineer.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.145836+00'::timestamptz, '2026-07-12 03:13:34.864103+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('8a339a27-c22d-4c6b-8f75-c5de06e3ae4f'::uuid, $dxb$engineering-autonomous-optimization-architect$dxb$, $dxb$engineering$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/engineering/engineering-autonomous-optimization-architect.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.151674+00'::timestamptz, '2026-07-12 03:13:34.864103+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('eaf297ac-e6e3-416f-92bd-7397ca095dc9'::uuid, $dxb$engineering-backend-architect$dxb$, $dxb$engineering$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/engineering/engineering-backend-architect.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.156764+00'::timestamptz, '2026-07-12 02:41:00.168384+00'::timestamptz, $dxb$senior_specialist$dxb$, $dxb$dormant$dxb$),
  ('0cb1178c-0a5a-4c52-97fc-df6b6f2ba4b8'::uuid, $dxb$engineering-cms-developer$dxb$, $dxb$engineering$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/engineering/engineering-cms-developer.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.161425+00'::timestamptz, '2026-07-12 02:41:00.168384+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('450428a9-d854-41cf-8bf3-40429dc6bfb3'::uuid, $dxb$engineering-code-reviewer$dxb$, $dxb$engineering$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/engineering/engineering-code-reviewer.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.165956+00'::timestamptz, '2026-07-12 02:41:00.168384+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('7d767fe6-688c-4967-be18-12c66c9915a2'::uuid, $dxb$engineering-codebase-onboarding-engineer$dxb$, $dxb$engineering$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/engineering/engineering-codebase-onboarding-engineer.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.170636+00'::timestamptz, '2026-07-12 02:41:00.168384+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('48e1ac06-044a-4701-8498-91e55e4656e1'::uuid, $dxb$engineering-devops-automator$dxb$, $dxb$engineering$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/engineering/engineering-devops-automator.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.183032+00'::timestamptz, '2026-07-12 02:41:00.168384+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('80b4f72e-2af5-497b-9fa3-a539b614295f'::uuid, $dxb$engineering-email-intelligence-engineer$dxb$, $dxb$engineering$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/engineering/engineering-email-intelligence-engineer.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.187065+00'::timestamptz, '2026-07-12 16:04:10.639748+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('2ac30fd6-5dc6-4413-9557-9da9c565ae52'::uuid, $dxb$engineering-embedded-firmware-engineer$dxb$, $dxb$engineering$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/engineering/engineering-embedded-firmware-engineer.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.190121+00'::timestamptz, '2026-07-12 03:13:34.864103+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('10aedb91-3c7b-40e7-99fa-ae76455bcce1'::uuid, $dxb$engineering-feishu-integration-developer$dxb$, $dxb$engineering$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/engineering/engineering-feishu-integration-developer.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.193096+00'::timestamptz, '2026-07-12 02:44:09.41386+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('0fc8cde2-7a5d-43b1-a21f-d73209e0dcdc'::uuid, $dxb$engineering-filament-optimization-specialist$dxb$, $dxb$engineering$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/engineering/engineering-filament-optimization-specialist.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.195931+00'::timestamptz, '2026-07-12 02:44:09.41386+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('2a9c8e50-ce22-47d9-9b6c-ced0142cf0a5'::uuid, $dxb$engineering-frontend-developer$dxb$, $dxb$engineering$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/engineering/engineering-frontend-developer.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.198868+00'::timestamptz, '2026-07-12 02:41:00.168384+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('2668c7b0-34d3-4fbc-beef-40f19bbf1be4'::uuid, $dxb$engineering-git-workflow-master$dxb$, $dxb$engineering$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/engineering/engineering-git-workflow-master.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.202456+00'::timestamptz, '2026-07-12 02:41:00.168384+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('50b009bd-06cb-49e2-b45a-bec2b50052b5'::uuid, $dxb$engineering-minimal-change-engineer$dxb$, $dxb$engineering$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/engineering/engineering-minimal-change-engineer.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.20955+00'::timestamptz, '2026-07-12 02:41:00.168384+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('59b1f85a-82c1-4aec-875d-3724ff472618'::uuid, $dxb$engineering-mobile-app-builder$dxb$, $dxb$engineering$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/engineering/engineering-mobile-app-builder.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.214638+00'::timestamptz, '2026-07-12 02:41:00.168384+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('8f74e033-478b-49ba-a4c0-905526958e0b'::uuid, $dxb$engineering-rapid-prototyper$dxb$, $dxb$engineering$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/engineering/engineering-rapid-prototyper.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.222091+00'::timestamptz, '2026-07-12 02:41:00.168384+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('18fa104d-2d80-4c7b-a4f3-cca4d5048331'::uuid, $dxb$engineering-senior-developer$dxb$, $dxb$engineering$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/engineering/engineering-senior-developer.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.233349+00'::timestamptz, '2026-07-12 02:41:00.168384+00'::timestamptz, $dxb$senior_specialist$dxb$, $dxb$dormant$dxb$),
  ('ec57a05c-50ab-44a1-aa20-110936ef1a07'::uuid, $dxb$engineering-software-architect$dxb$, $dxb$engineering$dxb$, $dxb$head$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/engineering/engineering-software-architect.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.238752+00'::timestamptz, '2026-07-12 02:41:00.168384+00'::timestamptz, $dxb$director$dxb$, $dxb$dormant$dxb$),
  ('f16a96cf-cf9e-4200-89f2-822fbbcf37a8'::uuid, $dxb$engineering-solidity-smart-contract-engineer$dxb$, $dxb$engineering$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/engineering/engineering-solidity-smart-contract-engineer.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.243548+00'::timestamptz, '2026-07-12 02:44:09.41386+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('c8a5daef-0ddf-41a6-a3c6-8de71e89de60'::uuid, $dxb$engineering-technical-writer$dxb$, $dxb$engineering$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/engineering/engineering-technical-writer.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.253154+00'::timestamptz, '2026-07-12 03:13:34.864103+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('a170136c-a3c8-43ed-ad5e-44121b72d57e'::uuid, $dxb$engineering-voice-ai-integration-engineer$dxb$, $dxb$engineering$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/engineering/engineering-voice-ai-integration-engineer.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.262892+00'::timestamptz, '2026-07-12 03:13:34.864103+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('274d3d25-ae18-4be8-bd74-2ca329edd7dd'::uuid, $dxb$engineering-wechat-mini-program-developer$dxb$, $dxb$engineering$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/engineering/engineering-wechat-mini-program-developer.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.266654+00'::timestamptz, '2026-07-12 02:44:09.41386+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('04cd9d7b-ca9b-42af-9347-fc31a46c6e44'::uuid, $dxb$executive-operations-manager$dxb$, $dxb$ceo$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/ceo/executive-operations-manager.md$dxb$, $dxb$v0-add$dxb$, $dxb$dormant$dxb$, '2026-07-11 19:17:09.836353+00'::timestamptz, '2026-07-11 19:41:58.731424+00'::timestamptz, $dxb$senior_specialist$dxb$, $dxb$draft$dxb$),
  ('ba3d7b85-747f-41f3-80d3-a543831326f9'::uuid, $dxb$executive-summary-generator$dxb$, $dxb$ceo$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/ceo/executive-summary-generator.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.851616+00'::timestamptz, '2026-07-11 19:41:58.731424+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('0fd55543-ac83-456b-a5c7-2f111923bfe9'::uuid, $dxb$finance-bookkeeper-controller$dxb$, $dxb$finance$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/finance/finance-bookkeeper-controller.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.271446+00'::timestamptz, '2026-07-12 02:41:00.168384+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('a46d91ae-941e-48ec-8b84-10af91e773c1'::uuid, $dxb$finance-financial-analyst$dxb$, $dxb$finance$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/finance/finance-financial-analyst.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.275386+00'::timestamptz, '2026-07-12 02:41:00.168384+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('7cec0459-b31c-44b1-b366-683b0900c0b3'::uuid, $dxb$finance-fpa-analyst$dxb$, $dxb$finance$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/finance/finance-fpa-analyst.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.278752+00'::timestamptz, '2026-07-12 02:41:00.168384+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('bac42230-fdd5-4357-8665-769e2b074c8c'::uuid, $dxb$finance-investment-researcher$dxb$, $dxb$finance$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/finance/finance-investment-researcher.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.282039+00'::timestamptz, '2026-07-12 02:41:00.168384+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('2307612a-60f9-4dc5-a100-3a7c46eb99b2'::uuid, $dxb$finance-tax-strategist$dxb$, $dxb$finance$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/finance/finance-tax-strategist.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.285263+00'::timestamptz, '2026-07-12 02:41:00.168384+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('f2929e17-8fd6-493f-ac50-cd898e93e6e3'::uuid, $dxb$global-expansion-lead$dxb$, $dxb$strategy$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/strategy/global-expansion-lead.md$dxb$, $dxb$v0-add$dxb$, $dxb$dormant$dxb$, '2026-07-11 19:17:09.836353+00'::timestamptz, '2026-07-11 19:55:12.504047+00'::timestamptz, $dxb$senior_specialist$dxb$, $dxb$draft$dxb$),
  ('0f6b8209-c6ab-48c8-867a-5a9f09ddbd16'::uuid, $dxb$government-digital-presales-consultant$dxb$, $dxb$people-hr$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$agency-agents/specialized/government-digital-presales-consultant.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.682716+00'::timestamptz, '2026-07-11 15:50:11.734451+00'::timestamptz, NULL, $dxb$archived$dxb$),
  ('1c138270-a4c3-4d68-9035-dbb50915766b'::uuid, $dxb$head-of-commerce$dxb$, $dxb$commerce$dxb$, $dxb$head$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/commerce/head-of-commerce.md$dxb$, $dxb$v2.0-fable$dxb$, $dxb$dormant$dxb$, '2026-07-12 14:56:39.975409+00'::timestamptz, '2026-07-12 15:18:55.609624+00'::timestamptz, $dxb$director$dxb$, $dxb$draft$dxb$),
  ('ab38ab02-154b-4133-a9fa-432fd8da1463'::uuid, $dxb$healthcare-customer-service$dxb$, $dxb$people-hr$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$agency-agents/specialized/healthcare-customer-service.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.689621+00'::timestamptz, '2026-07-11 15:50:11.734451+00'::timestamptz, NULL, $dxb$archived$dxb$),
  ('4108770a-92a5-45ae-b244-7bb9fdc408aa'::uuid, $dxb$healthcare-marketing-compliance$dxb$, $dxb$people-hr$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$agency-agents/specialized/healthcare-marketing-compliance.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.694984+00'::timestamptz, '2026-07-11 15:50:11.734451+00'::timestamptz, NULL, $dxb$archived$dxb$),
  ('e7e7168a-88a3-4a84-8534-ac69738d7122'::uuid, $dxb$hospitality-guest-services$dxb$, $dxb$people-hr$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$agency-agents/specialized/hospitality-guest-services.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.699993+00'::timestamptz, '2026-07-11 15:50:11.734451+00'::timestamptz, NULL, $dxb$archived$dxb$),
  ('fa00616d-5754-4c48-ad9f-cb068747a4a9'::uuid, $dxb$hr-onboarding$dxb$, $dxb$people-hr$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/people-hr/hr-onboarding.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.704295+00'::timestamptz, '2026-07-12 02:41:00.168384+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('45ccec6f-589d-4e1f-a963-b448831e02b0'::uuid, $dxb$iam-secrets-officer$dxb$, $dxb$security$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/security/iam-secrets-officer.md$dxb$, $dxb$v0-add$dxb$, $dxb$dormant$dxb$, '2026-07-11 20:42:44.90028+00'::timestamptz, '2026-07-11 20:42:44.90028+00'::timestamptz, $dxb$senior_specialist$dxb$, $dxb$draft$dxb$),
  ('857ea164-64f0-4adb-93f8-bcf76deafc6e'::uuid, $dxb$identity-graph-operator$dxb$, $dxb$data-ai$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/data-ai/identity-graph-operator.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.708458+00'::timestamptz, '2026-07-12 01:34:13.987067+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('9ef411ae-fa98-43ef-9ede-e332de922208'::uuid, $dxb$incident-response-commander$dxb$, $dxb$platform$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/platform/incident-response-commander.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.205833+00'::timestamptz, '2026-07-11 23:13:53.236216+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('ab760761-7909-4148-ad56-18a34327e957'::uuid, $dxb$infrastructure-maintainer$dxb$, $dxb$platform$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/platform/infrastructure-maintainer.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.862157+00'::timestamptz, '2026-07-11 23:13:53.236216+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('307a3f92-9a8a-4241-a049-c60b77528bb4'::uuid, $dxb$internal-auditor$dxb$, $dxb$risk-audit$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/risk-audit/internal-auditor.md$dxb$, $dxb$v0-add$dxb$, $dxb$dormant$dxb$, '2026-07-11 20:42:44.90028+00'::timestamptz, '2026-07-11 21:11:45.800943+00'::timestamptz, $dxb$senior_specialist$dxb$, $dxb$draft$dxb$),
  ('0380bd22-d037-4ce6-9410-d33c73b1fad5'::uuid, $dxb$inventory-fulfillment-manager$dxb$, $dxb$commerce$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/commerce/inventory-fulfillment-manager.md$dxb$, $dxb$v2.0-fable$dxb$, $dxb$dormant$dxb$, '2026-07-12 14:56:39.975409+00'::timestamptz, '2026-07-12 15:18:55.609624+00'::timestamptz, $dxb$specialist$dxb$, $dxb$draft$dxb$),
  ('30c0335c-e9c7-46af-9a96-a9bcc867ef22'::uuid, $dxb$knowledge-architect$dxb$, $dxb$data-ai$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/data-ai/knowledge-architect.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.841233+00'::timestamptz, '2026-07-11 23:13:53.236216+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('0e81237d-5736-4e02-9659-00b988435589'::uuid, $dxb$language-translator$dxb$, $dxb$people-hr$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$agency-agents/specialized/language-translator.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.712966+00'::timestamptz, '2026-07-11 15:50:11.734451+00'::timestamptz, NULL, $dxb$archived$dxb$),
  ('732b2d17-a49a-46cf-908d-929bf499d7d6'::uuid, $dxb$legal-billing-time-tracking$dxb$, $dxb$people-hr$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$agency-agents/specialized/legal-billing-time-tracking.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.718047+00'::timestamptz, '2026-07-11 15:50:11.734451+00'::timestamptz, NULL, $dxb$archived$dxb$),
  ('4316d8aa-62af-49d9-a7ee-1c1ec9203070'::uuid, $dxb$legal-client-intake$dxb$, $dxb$people-hr$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$agency-agents/specialized/legal-client-intake.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.722747+00'::timestamptz, '2026-07-11 15:50:11.734451+00'::timestamptz, NULL, $dxb$archived$dxb$),
  ('c71e2379-f6e6-49cf-8f71-2a9d8d3b0f63'::uuid, $dxb$legal-compliance-checker$dxb$, $dxb$legal$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/legal/legal-compliance-checker.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.867183+00'::timestamptz, '2026-07-11 21:02:01.92513+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('a008f70e-54cf-4494-8840-8b997d0be924'::uuid, $dxb$legal-de-counsel$dxb$, $dxb$legal$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/legal/legal-de-counsel.md$dxb$, $dxb$v0-add$dxb$, $dxb$dormant$dxb$, '2026-07-11 20:42:44.90028+00'::timestamptz, '2026-07-12 16:04:10.639748+00'::timestamptz, $dxb$senior_specialist$dxb$, $dxb$draft$dxb$),
  ('441154c0-2c65-4b62-8ec6-d8e3f030a29c'::uuid, $dxb$legal-tr-counsel$dxb$, $dxb$legal$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/legal/legal-tr-counsel.md$dxb$, $dxb$v0-add$dxb$, $dxb$dormant$dxb$, '2026-07-11 20:42:44.90028+00'::timestamptz, '2026-07-11 21:02:01.92513+00'::timestamptz, $dxb$specialist$dxb$, $dxb$draft$dxb$),
  ('154ddf27-34e3-4441-b72c-289717d0b956'::uuid, $dxb$loan-officer-assistant$dxb$, $dxb$people-hr$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$agency-agents/specialized/loan-officer-assistant.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.733046+00'::timestamptz, '2026-07-11 15:50:11.734451+00'::timestamptz, NULL, $dxb$archived$dxb$),
  ('3834036b-b5a0-4792-b467-ad63985ffd09'::uuid, $dxb$lsp-index-engineer$dxb$, $dxb$engineering$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/engineering/lsp-index-engineer.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.738359+00'::timestamptz, '2026-07-12 03:13:34.864103+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('83d7e4a3-c69a-4c5e-ba73-5303a79959f9'::uuid, $dxb$managed-automation-services-engineer$dxb$, $dxb$customer-success$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/customer-success/managed-automation-services-engineer.md$dxb$, $dxb$v2.0-fable$dxb$, $dxb$dormant$dxb$, '2026-07-12 15:28:09.287068+00'::timestamptz, '2026-07-12 15:40:52.378346+00'::timestamptz, $dxb$specialist$dxb$, $dxb$draft$dxb$),
  ('8fb0bc10-6393-4efa-94b9-b1d883718e15'::uuid, $dxb$market-intelligence-lead$dxb$, $dxb$strategy$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/strategy/market-intelligence-lead.md$dxb$, $dxb$v0-add$dxb$, $dxb$dormant$dxb$, '2026-07-11 19:17:09.836353+00'::timestamptz, '2026-07-11 19:55:12.504047+00'::timestamptz, $dxb$senior_specialist$dxb$, $dxb$draft$dxb$),
  ('ed60508c-fddb-48fc-8743-d8bab04d7792'::uuid, $dxb$marketing-agentic-search-optimizer$dxb$, $dxb$marketing$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/marketing/marketing-agentic-search-optimizer.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.288389+00'::timestamptz, '2026-07-11 16:49:32.335517+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('a10d8af5-e7d8-44eb-95e2-f27796529ba4'::uuid, $dxb$marketing-ai-citation-strategist$dxb$, $dxb$marketing$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/marketing/marketing-ai-citation-strategist.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.293093+00'::timestamptz, '2026-07-11 16:49:32.335517+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('53c6662c-bc52-40c7-930f-290cf69ea210'::uuid, $dxb$marketing-app-store-optimizer$dxb$, $dxb$marketing$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/marketing/marketing-app-store-optimizer.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.298032+00'::timestamptz, '2026-07-11 16:49:32.335517+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('f8e35288-95f3-471e-ae1d-f9cb65907619'::uuid, $dxb$marketing-baidu-seo-specialist$dxb$, $dxb$marketing$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/marketing/marketing-baidu-seo-specialist.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.303023+00'::timestamptz, '2026-07-11 16:49:32.335517+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('11fa913d-1c42-4be5-8f44-9680eb8b7caf'::uuid, $dxb$marketing-bilibili-content-strategist$dxb$, $dxb$marketing$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/marketing/marketing-bilibili-content-strategist.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.307852+00'::timestamptz, '2026-07-11 16:49:32.335517+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('37e5af4e-9818-4853-8cd1-5d49ae8c52d6'::uuid, $dxb$marketing-book-co-author$dxb$, $dxb$marketing$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/marketing/marketing-book-co-author.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.312028+00'::timestamptz, '2026-07-11 16:49:32.335517+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('9921fc1d-cdab-45dd-99f5-4cfc41b63724'::uuid, $dxb$marketing-carousel-growth-engine$dxb$, $dxb$marketing$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/marketing/marketing-carousel-growth-engine.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.31633+00'::timestamptz, '2026-07-11 16:49:32.335517+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('51c92f41-1977-4909-afb5-b0b22e78fe56'::uuid, $dxb$marketing-china-ecommerce-operator$dxb$, $dxb$marketing$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/marketing/marketing-china-ecommerce-operator.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.320895+00'::timestamptz, '2026-07-11 16:49:32.335517+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('610c43d1-8ac7-4f1d-970d-edffa6d8b00e'::uuid, $dxb$marketing-china-market-localization-strategist$dxb$, $dxb$marketing$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/marketing/marketing-china-market-localization-strategist.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.325254+00'::timestamptz, '2026-07-11 16:49:32.335517+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('af9463dc-dec7-46d9-a978-b7615c2dce6b'::uuid, $dxb$marketing-content-creator$dxb$, $dxb$marketing$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/marketing/marketing-content-creator.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.330015+00'::timestamptz, '2026-07-11 16:49:32.335517+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('afd41ad8-e3b8-47ca-abf1-a259c72f3bc9'::uuid, $dxb$marketing-cross-border-ecommerce$dxb$, $dxb$marketing$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/marketing/marketing-cross-border-ecommerce.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.335958+00'::timestamptz, '2026-07-12 16:04:10.639748+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('f2db08d9-c532-496f-9ad5-488a2ecb001c'::uuid, $dxb$marketing-douyin-strategist$dxb$, $dxb$marketing$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/marketing/marketing-douyin-strategist.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.341285+00'::timestamptz, '2026-07-11 16:49:32.335517+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('5ce5340a-2a47-4d05-ae3f-6050472b7c62'::uuid, $dxb$marketing-growth-hacker$dxb$, $dxb$marketing$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/marketing/marketing-growth-hacker.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.347026+00'::timestamptz, '2026-07-11 16:49:32.335517+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('0a2655c4-7986-44a0-9df9-b54c7df45168'::uuid, $dxb$marketing-instagram-curator$dxb$, $dxb$marketing$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/marketing/marketing-instagram-curator.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.353567+00'::timestamptz, '2026-07-11 16:49:32.335517+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('d149f8ac-9857-4606-9a06-d942c8558c16'::uuid, $dxb$marketing-kuaishou-strategist$dxb$, $dxb$marketing$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/marketing/marketing-kuaishou-strategist.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.359968+00'::timestamptz, '2026-07-11 16:49:32.335517+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('915b6ca6-a64b-44e6-ae9b-68b683977b1c'::uuid, $dxb$marketing-linkedin-content-creator$dxb$, $dxb$marketing$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/marketing/marketing-linkedin-content-creator.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.365356+00'::timestamptz, '2026-07-11 16:49:32.335517+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('a5d27f0e-6724-4dd7-b3b2-46050155c2c2'::uuid, $dxb$marketing-livestream-commerce-coach$dxb$, $dxb$marketing$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/marketing/marketing-livestream-commerce-coach.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.374076+00'::timestamptz, '2026-07-11 16:49:32.335517+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('c13abbd6-e04f-4292-bfbb-6a8ff3fbeb94'::uuid, $dxb$marketing-podcast-strategist$dxb$, $dxb$marketing$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/marketing/marketing-podcast-strategist.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.380663+00'::timestamptz, '2026-07-11 16:49:32.335517+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('93466d71-3f56-4eec-91e4-1dda5dd9e256'::uuid, $dxb$marketing-private-domain-operator$dxb$, $dxb$marketing$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/marketing/marketing-private-domain-operator.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.386656+00'::timestamptz, '2026-07-11 16:49:32.335517+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('7dd08773-cd45-479d-85bf-6c8f7c5cf4fe'::uuid, $dxb$marketing-reddit-community-builder$dxb$, $dxb$marketing$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/marketing/marketing-reddit-community-builder.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.393448+00'::timestamptz, '2026-07-11 16:49:32.335517+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('6955e850-9bbc-4a0b-9975-323de24eb543'::uuid, $dxb$marketing-seo-specialist$dxb$, $dxb$marketing$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/marketing/marketing-seo-specialist.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.3999+00'::timestamptz, '2026-07-11 16:49:32.335517+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('261c72e9-96cc-465e-accd-9f7bd9fb81ef'::uuid, $dxb$marketing-short-video-editing-coach$dxb$, $dxb$marketing$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/marketing/marketing-short-video-editing-coach.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.405673+00'::timestamptz, '2026-07-11 16:49:32.335517+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('2c375113-b68e-477d-9d3f-634ed9ac1b4d'::uuid, $dxb$marketing-social-media-strategist$dxb$, $dxb$marketing$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/marketing/marketing-social-media-strategist.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.412205+00'::timestamptz, '2026-07-11 16:49:32.335517+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('57b76f99-b623-4ff9-8983-10fe3e3ba18a'::uuid, $dxb$marketing-tiktok-strategist$dxb$, $dxb$marketing$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/marketing/marketing-tiktok-strategist.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.4186+00'::timestamptz, '2026-07-11 16:49:32.335517+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('e0409fbc-a2eb-4144-9eb6-91573aa8ef24'::uuid, $dxb$marketing-twitter-engager$dxb$, $dxb$marketing$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/marketing/marketing-twitter-engager.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.426809+00'::timestamptz, '2026-07-11 16:49:32.335517+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('8962becf-a3f7-4aeb-8442-421a82dd1b97'::uuid, $dxb$marketing-video-optimization-specialist$dxb$, $dxb$marketing$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/marketing/marketing-video-optimization-specialist.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.433041+00'::timestamptz, '2026-07-11 16:49:32.335517+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('ea3d3a68-f764-452a-8ea3-d0c642157cbf'::uuid, $dxb$marketing-wechat-official-account$dxb$, $dxb$marketing$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/marketing/marketing-wechat-official-account.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.438356+00'::timestamptz, '2026-07-11 16:49:32.335517+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('36b17e22-64fa-4240-9174-aaad50a7a465'::uuid, $dxb$marketing-weibo-strategist$dxb$, $dxb$marketing$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/marketing/marketing-weibo-strategist.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.449362+00'::timestamptz, '2026-07-11 16:49:32.335517+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('9f656f2b-47cd-40e0-9d56-ee6cd9dc9798'::uuid, $dxb$marketing-xiaohongshu-specialist$dxb$, $dxb$marketing$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/marketing/marketing-xiaohongshu-specialist.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.45772+00'::timestamptz, '2026-07-11 16:49:32.335517+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('8d063cbb-1a69-4fcc-a240-75d462563645'::uuid, $dxb$marketing-zhihu-strategist$dxb$, $dxb$marketing$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/marketing/marketing-zhihu-strategist.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.467925+00'::timestamptz, '2026-07-11 16:49:32.335517+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('1fe5a152-0122-4570-8cc6-74ff0041ca9e'::uuid, $dxb$mcp-builder$dxb$, $dxb$data-ai$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/data-ai/mcp-builder.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.809014+00'::timestamptz, '2026-07-11 23:13:53.236216+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('8dbbd149-4c76-4ef7-9f6e-32ccaba8b6b8'::uuid, $dxb$merchandising-pricing-manager$dxb$, $dxb$commerce$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/commerce/merchandising-pricing-manager.md$dxb$, $dxb$v2.0-fable$dxb$, $dxb$dormant$dxb$, '2026-07-12 14:56:39.975409+00'::timestamptz, '2026-07-12 15:18:55.609624+00'::timestamptz, $dxb$specialist$dxb$, $dxb$draft$dxb$),
  ('6e2e63bc-82e4-412f-b52b-8ad4be46256f'::uuid, $dxb$model-evaluation-lead$dxb$, $dxb$data-ai$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/data-ai/model-evaluation-lead.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.814447+00'::timestamptz, '2026-07-11 23:13:53.236216+00'::timestamptz, $dxb$senior_specialist$dxb$, $dxb$dormant$dxb$),
  ('51fc556b-35c4-4e49-825c-83ccafb7e8f0'::uuid, $dxb$okr-performance-manager$dxb$, $dxb$strategy$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/strategy/okr-performance-manager.md$dxb$, $dxb$v0-add$dxb$, $dxb$dormant$dxb$, '2026-07-11 19:17:09.836353+00'::timestamptz, '2026-07-11 19:55:12.504047+00'::timestamptz, $dxb$specialist$dxb$, $dxb$draft$dxb$),
  ('282d45a3-c248-4607-87f3-7e75068b95c0'::uuid, $dxb$onboarding-implementation-lead$dxb$, $dxb$customer-success$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/customer-success/onboarding-implementation-lead.md$dxb$, $dxb$v2.0-fable$dxb$, $dxb$dormant$dxb$, '2026-07-12 14:34:38.619272+00'::timestamptz, '2026-07-12 14:45:56.75235+00'::timestamptz, $dxb$specialist$dxb$, $dxb$draft$dxb$),
  ('63a9b31e-cbb2-43bb-abdf-94fc3156bc66'::uuid, $dxb$paid-media-auditor$dxb$, $dxb$paid-media$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/paid-media/paid-media-auditor.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.476126+00'::timestamptz, '2026-07-11 16:49:32.878175+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('e956e041-1a6c-48c4-934c-ed90c23bde11'::uuid, $dxb$paid-media-creative-strategist$dxb$, $dxb$paid-media$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/paid-media/paid-media-creative-strategist.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.480252+00'::timestamptz, '2026-07-11 16:49:32.878175+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('4e7ada5a-b051-4826-8a2b-a713e1e3eea1'::uuid, $dxb$paid-media-paid-social-strategist$dxb$, $dxb$paid-media$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/paid-media/paid-media-paid-social-strategist.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.483785+00'::timestamptz, '2026-07-11 16:49:32.878175+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('ad5f4023-65f3-42f3-9ace-045e888bfa6b'::uuid, $dxb$paid-media-ppc-strategist$dxb$, $dxb$paid-media$dxb$, $dxb$head$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/paid-media/paid-media-ppc-strategist.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.491169+00'::timestamptz, '2026-07-12 02:41:00.168384+00'::timestamptz, $dxb$director$dxb$, $dxb$dormant$dxb$),
  ('ebd8ab6b-13a4-4820-9b50-aca8260a9d53'::uuid, $dxb$paid-media-programmatic-buyer$dxb$, $dxb$paid-media$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/paid-media/paid-media-programmatic-buyer.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.497324+00'::timestamptz, '2026-07-11 16:49:32.878175+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('5a0f69fc-5fa3-4d1b-ba37-6f445344906a'::uuid, $dxb$paid-media-search-query-analyst$dxb$, $dxb$paid-media$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/paid-media/paid-media-search-query-analyst.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.503306+00'::timestamptz, '2026-07-11 16:49:32.878175+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('38b514c8-5fef-4b97-849d-035301bd6b01'::uuid, $dxb$paid-media-tracking-specialist$dxb$, $dxb$paid-media$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/paid-media/paid-media-tracking-specialist.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.508263+00'::timestamptz, '2026-07-11 16:49:32.878175+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('50bc1c2c-5833-421f-b5c1-d8d96ff62f70'::uuid, $dxb$partnerships-ecosystem-lead$dxb$, $dxb$strategy$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/strategy/partnerships-ecosystem-lead.md$dxb$, $dxb$v0-add$dxb$, $dxb$dormant$dxb$, '2026-07-11 19:17:09.836353+00'::timestamptz, '2026-07-11 19:55:12.504047+00'::timestamptz, $dxb$senior_specialist$dxb$, $dxb$draft$dxb$),
  ('6f3822f1-8248-4390-b1e2-f096443d34e5'::uuid, $dxb$payroll-manager$dxb$, $dxb$finance$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/finance/payroll-manager.md$dxb$, $dxb$v0-add$dxb$, $dxb$dormant$dxb$, '2026-07-11 19:17:09.836353+00'::timestamptz, '2026-07-11 20:16:16.976143+00'::timestamptz, $dxb$specialist$dxb$, $dxb$draft$dxb$),
  ('876e0433-8e5e-4c5a-8cbd-da533ad54ece'::uuid, $dxb$policy-writer$dxb$, $dxb$legal$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/legal/policy-writer.md$dxb$, $dxb$v0-add$dxb$, $dxb$dormant$dxb$, '2026-07-11 20:42:44.90028+00'::timestamptz, '2026-07-11 21:02:01.92513+00'::timestamptz, $dxb$specialist$dxb$, $dxb$draft$dxb$),
  ('9ef780fc-9913-408c-86c4-2457ac590079'::uuid, $dxb$pricing-deal-desk-manager$dxb$, $dxb$revops$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/revops/pricing-deal-desk-manager.md$dxb$, $dxb$v2.0-fable$dxb$, $dxb$dormant$dxb$, '2026-07-12 14:34:38.619272+00'::timestamptz, '2026-07-12 14:45:56.75235+00'::timestamptz, $dxb$specialist$dxb$, $dxb$draft$dxb$),
  ('3541116e-3034-4660-aa2c-f02f9f65415d'::uuid, $dxb$privacy-dpo$dxb$, $dxb$legal$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/legal/privacy-dpo.md$dxb$, $dxb$v0-add$dxb$, $dxb$dormant$dxb$, '2026-07-11 20:42:44.90028+00'::timestamptz, '2026-07-11 21:02:01.92513+00'::timestamptz, $dxb$senior_specialist$dxb$, $dxb$draft$dxb$),
  ('5af8379b-55cd-4520-b913-602bf7b5e17a'::uuid, $dxb$product-behavioral-nudge-engine$dxb$, $dxb$product$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/product/product-behavioral-nudge-engine.md$dxb$, $dxb$v2.0-fable$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.517614+00'::timestamptz, '2026-07-12 11:56:14.149378+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('5af79556-620a-4ec7-91b0-b97ebe51d0e9'::uuid, $dxb$product-feedback-synthesizer$dxb$, $dxb$product$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/product/product-feedback-synthesizer.md$dxb$, $dxb$v2.0-fable$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.522269+00'::timestamptz, '2026-07-12 11:56:14.149378+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('7e906242-1ae5-488d-83c8-3ba543592920'::uuid, $dxb$product-manager$dxb$, $dxb$product$dxb$, $dxb$head$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/product/product-manager.md$dxb$, $dxb$v2.0-fable$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.528218+00'::timestamptz, '2026-07-11 17:08:38.484851+00'::timestamptz, $dxb$director$dxb$, $dxb$dormant$dxb$),
  ('a6b8abbc-7c24-48bd-b043-3263a1c1dd72'::uuid, $dxb$product-sprint-prioritizer$dxb$, $dxb$product$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/product/product-sprint-prioritizer.md$dxb$, $dxb$v2.0-fable$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.532529+00'::timestamptz, '2026-07-12 11:56:14.149378+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('44ee3204-1f93-4975-b7fc-c3b5a5878f2d'::uuid, $dxb$product-trend-researcher$dxb$, $dxb$product$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/product/product-trend-researcher.md$dxb$, $dxb$v2.0-fable$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.537427+00'::timestamptz, '2026-07-12 11:56:14.149378+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('bf2b6ccc-7cff-4ebe-b851-38027dd89a7e'::uuid, $dxb$project-management-experiment-tracker$dxb$, $dxb$project-management$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/project-management/project-management-experiment-tracker.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.542914+00'::timestamptz, '2026-07-12 11:29:53.602685+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('2f1b7d3c-25a1-4270-beb7-6010a0f52a0a'::uuid, $dxb$project-management-jira-workflow-steward$dxb$, $dxb$project-management$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/project-management/project-management-jira-workflow-steward.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.548192+00'::timestamptz, '2026-07-12 11:29:53.602685+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('afff168f-c98b-4a2a-a79a-a0760f43fed6'::uuid, $dxb$project-management-project-shepherd$dxb$, $dxb$project-management$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/project-management/project-management-project-shepherd.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.552175+00'::timestamptz, '2026-07-12 11:29:53.602685+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('401d46c9-f391-43a7-9d33-e72a62f6aa8e'::uuid, $dxb$project-management-studio-operations$dxb$, $dxb$project-management$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/project-management/project-management-studio-operations.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.556238+00'::timestamptz, '2026-07-12 11:29:53.602685+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('84e873d3-d48b-4991-a391-6eb45d25f00e'::uuid, $dxb$project-management-studio-producer$dxb$, $dxb$project-management$dxb$, $dxb$head$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/project-management/project-management-studio-producer.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.562464+00'::timestamptz, '2026-07-12 02:41:00.168384+00'::timestamptz, $dxb$director$dxb$, $dxb$dormant$dxb$),
  ('9f2aea7d-3cf0-4f44-82e3-da6af8559f04'::uuid, $dxb$project-manager-senior$dxb$, $dxb$project-management$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$agency-agents/project-management/project-manager-senior.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.566461+00'::timestamptz, '2026-07-11 15:50:11.734451+00'::timestamptz, NULL, $dxb$archived$dxb$),
  ('1d91fe1e-f16e-4bef-a27f-11d3180577df'::uuid, $dxb$prompt-context-engineer$dxb$, $dxb$data-ai$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/data-ai/prompt-context-engineer.md$dxb$, $dxb$v0-add$dxb$, $dxb$dormant$dxb$, '2026-07-11 22:15:16.783665+00'::timestamptz, '2026-07-11 23:13:53.236216+00'::timestamptz, $dxb$senior_specialist$dxb$, $dxb$draft$dxb$),
  ('c68b7646-5dd4-43c1-adde-f94abbd73d24'::uuid, $dxb$real-estate-buyer-seller$dxb$, $dxb$people-hr$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$agency-agents/specialized/real-estate-buyer-seller.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.742867+00'::timestamptz, '2026-07-11 15:50:11.734451+00'::timestamptz, NULL, $dxb$archived$dxb$),
  ('57d22079-5eb5-4512-b0f6-561236af0533'::uuid, $dxb$recruitment-specialist$dxb$, $dxb$people-hr$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/people-hr/recruitment-specialist.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.747272+00'::timestamptz, '2026-07-12 02:41:00.168384+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('8aae0e40-ff0a-4182-957d-2ae5e71721a1'::uuid, $dxb$report-distribution-agent$dxb$, $dxb$revops$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$agency-agents/specialized/report-distribution-agent.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.75207+00'::timestamptz, '2026-07-11 15:50:11.734451+00'::timestamptz, NULL, $dxb$archived$dxb$),
  ('870ed85c-8943-4ce4-9e13-a2852dc0e3ce'::uuid, $dxb$retail-customer-returns$dxb$, $dxb$people-hr$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$agency-agents/specialized/retail-customer-returns.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.755581+00'::timestamptz, '2026-07-11 15:50:11.734451+00'::timestamptz, NULL, $dxb$archived$dxb$),
  ('8c4fb88f-e8c7-4783-bb15-7bba9fe81388'::uuid, $dxb$revenue-growth-specialist$dxb$, $dxb$revops$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/revops/revenue-growth-specialist.md$dxb$, $dxb$v2.0-fable$dxb$, $dxb$dormant$dxb$, '2026-07-12 14:34:38.619272+00'::timestamptz, '2026-07-12 14:45:56.75235+00'::timestamptz, $dxb$specialist$dxb$, $dxb$draft$dxb$),
  ('b5aaba98-afbb-494a-b8d8-5b669e3e37af'::uuid, $dxb$revenue-reporting-agent$dxb$, $dxb$revops$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/revops/revenue-reporting-agent.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.762438+00'::timestamptz, '2026-07-12 11:16:42.145408+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('a8a3b6be-d0fe-4d1b-99f4-6b81e77f8bbe'::uuid, $dxb$sales-account-strategist$dxb$, $dxb$customer-success$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/customer-success/sales-account-strategist.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.57379+00'::timestamptz, '2026-07-12 11:21:13.74621+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('6966f9cc-73e1-4d98-ae3a-27ce55cb30f9'::uuid, $dxb$sales-coach$dxb$, $dxb$sales$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/sales/sales-coach.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.582048+00'::timestamptz, '2026-07-12 11:09:14.470751+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('2ab98243-2494-4490-a9ea-8bc671d43add'::uuid, $dxb$sales-deal-strategist$dxb$, $dxb$sales$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/sales/sales-deal-strategist.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.587804+00'::timestamptz, '2026-07-12 11:09:14.470751+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('dc57ca4e-6bd2-4fbc-9967-9d2b22923470'::uuid, $dxb$sales-discovery-coach$dxb$, $dxb$sales$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/sales/sales-discovery-coach.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.596113+00'::timestamptz, '2026-07-12 11:09:14.470751+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('6a8fc07c-4252-4e1e-a158-a40d6068fb71'::uuid, $dxb$sales-engineer$dxb$, $dxb$sales$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/sales/sales-engineer.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.607041+00'::timestamptz, '2026-07-12 11:09:14.470751+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('dd4cf266-032f-488e-8fbe-26fe9bbf127f'::uuid, $dxb$sales-outbound-strategist$dxb$, $dxb$sales$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/sales/sales-outbound-strategist.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.617018+00'::timestamptz, '2026-07-12 11:09:14.470751+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('840196a0-b7de-4412-9ea8-396487756f58'::uuid, $dxb$sales-outreach$dxb$, $dxb$sales$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$agency-agents/specialized/sales-outreach.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.769325+00'::timestamptz, '2026-07-11 15:50:11.734451+00'::timestamptz, NULL, $dxb$archived$dxb$),
  ('d2e225d0-c10e-4809-8a15-2526f5d3ad9b'::uuid, $dxb$sales-pipeline-analyst$dxb$, $dxb$revops$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/revops/sales-pipeline-analyst.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.6233+00'::timestamptz, '2026-07-12 11:16:42.145408+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('276cfbbc-459b-401a-a9a4-0725a1a1a71d'::uuid, $dxb$sales-proposal-strategist$dxb$, $dxb$sales$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/sales/sales-proposal-strategist.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.628223+00'::timestamptz, '2026-07-12 11:09:14.470751+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('b4d461d1-b991-4533-a9e3-dd7fdde60e1b'::uuid, $dxb$security-engineer$dxb$, $dxb$security$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/security/security-engineer.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.228659+00'::timestamptz, '2026-07-11 20:42:44.90028+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('eaa67b12-4ff6-4790-9af7-164b3ce2d76a'::uuid, $dxb$social-commerce-creator-lead$dxb$, $dxb$social-media$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/social-media/social-commerce-creator-lead.md$dxb$, $dxb$v2.0-fable$dxb$, $dxb$dormant$dxb$, '2026-07-12 15:28:09.287068+00'::timestamptz, '2026-07-12 15:40:52.378346+00'::timestamptz, $dxb$specialist$dxb$, $dxb$draft$dxb$),
  ('f83ccfd0-f391-4ed2-83e5-f23715c7916d'::uuid, $dxb$specialized-civil-engineer$dxb$, $dxb$people-hr$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$agency-agents/specialized/specialized-civil-engineer.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.782112+00'::timestamptz, '2026-07-11 15:50:11.734451+00'::timestamptz, NULL, $dxb$archived$dxb$),
  ('3aaf03ac-f096-46ee-8206-7afff91de2ac'::uuid, $dxb$specialized-cultural-intelligence-strategist$dxb$, $dxb$design$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/design/specialized-cultural-intelligence-strategist.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.786979+00'::timestamptz, '2026-07-12 11:48:31.863565+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('827ca0eb-7082-46fb-bbe0-967df9627262'::uuid, $dxb$specialized-developer-advocate$dxb$, $dxb$marketing$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/marketing/specialized-developer-advocate.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.791119+00'::timestamptz, '2026-07-11 16:49:32.335517+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('7c9ff067-3b37-4537-ac5e-cc658b8eae10'::uuid, $dxb$specialized-french-consulting-market$dxb$, $dxb$people-hr$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$agency-agents/specialized/specialized-french-consulting-market.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.800189+00'::timestamptz, '2026-07-11 15:50:11.734451+00'::timestamptz, NULL, $dxb$archived$dxb$),
  ('2521451f-3884-40d8-8c86-dec4c680a0e5'::uuid, $dxb$specialized-korean-business-navigator$dxb$, $dxb$people-hr$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$agency-agents/specialized/specialized-korean-business-navigator.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.80347+00'::timestamptz, '2026-07-11 15:50:11.734451+00'::timestamptz, NULL, $dxb$archived$dxb$),
  ('b820d6be-5dff-4ec5-bb92-d626aac745c4'::uuid, $dxb$specialized-salesforce-architect$dxb$, $dxb$people-hr$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$agency-agents/specialized/specialized-salesforce-architect.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.820085+00'::timestamptz, '2026-07-11 15:50:11.734451+00'::timestamptz, NULL, $dxb$archived$dxb$),
  ('6024b471-362c-4ea3-b6b5-670c128a1ac3'::uuid, $dxb$sre$dxb$, $dxb$platform$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/platform/sre.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.247971+00'::timestamptz, '2026-07-11 23:13:53.236216+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('5662031e-c1df-4b18-acca-d80082000501'::uuid, $dxb$stock-lot-sourcing-specialist$dxb$, $dxb$commerce$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/commerce/stock-lot-sourcing-specialist.md$dxb$, $dxb$v2.0-fable$dxb$, $dxb$dormant$dxb$, '2026-07-12 14:56:39.975409+00'::timestamptz, '2026-07-12 15:18:55.609624+00'::timestamptz, $dxb$specialist$dxb$, $dxb$draft$dxb$),
  ('4784451c-be8c-454b-adaa-1dd7012c4061'::uuid, $dxb$study-abroad-advisor$dxb$, $dxb$people-hr$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$agency-agents/specialized/study-abroad-advisor.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.830814+00'::timestamptz, '2026-07-11 15:50:11.734451+00'::timestamptz, NULL, $dxb$archived$dxb$),
  ('a5e5500e-c0b3-4be1-aba1-056aaefcc7af'::uuid, $dxb$supply-chain-strategist$dxb$, $dxb$finance$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/finance/supply-chain-strategist.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.836805+00'::timestamptz, '2026-07-12 02:41:00.168384+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('bbdbd53b-0322-4be7-8f61-f30bc1e0c48e'::uuid, $dxb$support-finance-tracker$dxb$, $dxb$finance$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$agency-agents/support/support-finance-tracker.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.856483+00'::timestamptz, '2026-07-11 15:50:11.734451+00'::timestamptz, NULL, $dxb$archived$dxb$),
  ('a25d8959-e54b-44a0-b109-fbae4b370f0b'::uuid, $dxb$support-support-responder$dxb$, $dxb$customer-success$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/customer-success/support-support-responder.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.872392+00'::timestamptz, '2026-07-12 11:21:13.74621+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('b421d51d-1dcf-4382-96bf-7a2c5f1b1a49'::uuid, $dxb$testing-accessibility-auditor$dxb$, $dxb$quality$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/quality/testing-accessibility-auditor.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.877515+00'::timestamptz, '2026-07-12 03:33:05.154628+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('cc4cea70-1fca-4187-81e7-32aa4517cf28'::uuid, $dxb$testing-api-tester$dxb$, $dxb$quality$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/quality/testing-api-tester.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.882305+00'::timestamptz, '2026-07-12 03:33:05.154628+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('f617fb28-0161-4070-9047-aec8702ceea2'::uuid, $dxb$testing-evidence-collector$dxb$, $dxb$quality$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/quality/testing-evidence-collector.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.885818+00'::timestamptz, '2026-07-12 03:33:05.154628+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('75b99c44-d2df-46b3-9fe7-b5f702cc2b70'::uuid, $dxb$testing-performance-benchmarker$dxb$, $dxb$quality$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/quality/testing-performance-benchmarker.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.889187+00'::timestamptz, '2026-07-12 03:33:05.154628+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('98fad5fd-54be-4f05-98d2-b64e4d62f22c'::uuid, $dxb$testing-reality-checker$dxb$, $dxb$quality$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/quality/testing-reality-checker.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.893037+00'::timestamptz, '2026-07-12 03:33:05.154628+00'::timestamptz, $dxb$senior_specialist$dxb$, $dxb$dormant$dxb$),
  ('122d0bc9-5cdd-468e-8e86-58998af6d0c5'::uuid, $dxb$testing-test-results-analyzer$dxb$, $dxb$quality$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/quality/testing-test-results-analyzer.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.900312+00'::timestamptz, '2026-07-12 03:33:05.154628+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('571c28a5-0750-4a3e-bc96-c367721e482d'::uuid, $dxb$testing-tool-evaluator$dxb$, $dxb$quality$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/quality/testing-tool-evaluator.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.904856+00'::timestamptz, '2026-07-12 03:33:05.154628+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('0b399828-a2c1-44b7-b83c-0706590dbb3e'::uuid, $dxb$testing-workflow-optimizer$dxb$, $dxb$quality$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/quality/testing-workflow-optimizer.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.910879+00'::timestamptz, '2026-07-12 03:33:05.154628+00'::timestamptz, $dxb$senior_specialist$dxb$, $dxb$dormant$dxb$),
  ('0488615b-3037-42a6-b511-b48e0084cf03'::uuid, $dxb$threat-detection-engineer$dxb$, $dxb$security$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/security/threat-detection-engineer.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.258497+00'::timestamptz, '2026-07-11 20:42:44.90028+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$),
  ('407676ae-31bc-41b1-b773-9137488a477c'::uuid, $dxb$treasury-ar-manager$dxb$, $dxb$finance$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/finance/treasury-ar-manager.md$dxb$, $dxb$v0-add$dxb$, $dxb$dormant$dxb$, '2026-07-11 19:17:09.836353+00'::timestamptz, '2026-07-12 16:04:10.639748+00'::timestamptz, $dxb$senior_specialist$dxb$, $dxb$draft$dxb$),
  ('fae9a40b-c6c9-4091-badc-dc8ae5d7651a'::uuid, $dxb$venture-builder$dxb$, $dxb$strategy$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/strategy/venture-builder.md$dxb$, $dxb$v2.0-fable$dxb$, $dxb$dormant$dxb$, '2026-07-12 15:28:09.287068+00'::timestamptz, '2026-07-12 15:40:52.378346+00'::timestamptz, $dxb$senior_specialist$dxb$, $dxb$draft$dxb$),
  ('4143079e-67eb-45af-8478-677067b5461a'::uuid, $dxb$woocommerce-architect$dxb$, $dxb$commerce$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/commerce/woocommerce-architect.md$dxb$, $dxb$v2.0-fable$dxb$, $dxb$dormant$dxb$, '2026-07-12 14:56:39.975409+00'::timestamptz, '2026-07-12 15:18:55.609624+00'::timestamptz, $dxb$senior_specialist$dxb$, $dxb$draft$dxb$),
  ('9866a61a-6add-4895-8a61-05936d663e42'::uuid, $dxb$workflow-architect$dxb$, $dxb$data-ai$dxb$, $dxb$worker$dxb$, $dxb$glm-5.2$dxb$, $dxb$inherit$dxb$, $dxb$[]$dxb$::jsonb, 0, $dxb$personas/data-ai/workflow-architect.md$dxb$, $dxb$v1.0-legacy$dxb$, $dxb$dormant$dxb$, '2026-07-08 21:46:13.825771+00'::timestamptz, '2026-07-11 23:13:53.236216+00'::timestamptz, $dxb$specialist$dxb$, $dxb$dormant$dxb$)
ON CONFLICT (slug) DO NOTHING;

-- B) FIELD ALIGNMENT for rows the chain already carries (seeds and future
--    rename sources): role_level / employment_status / role / department to
--    live values, so wave guardrails (role_level NULL = 0, exact headcounts)
--    hold. Keyed by the at-this-point slug; values from the live row.
UPDATE public.agents SET role_level=$dxb$director$dxb$, employment_status=$dxb$draft$dxb$, role=$dxb$head$dxb$, department=$dxb$finance$dxb$, updated_at=now()
 WHERE slug=$dxb$cfo$dxb$
   AND (role_level IS DISTINCT FROM $dxb$director$dxb$ OR employment_status IS DISTINCT FROM $dxb$draft$dxb$ OR role IS DISTINCT FROM $dxb$head$dxb$ OR department IS DISTINCT FROM $dxb$finance$dxb$);
UPDATE public.agents SET role_level=$dxb$director$dxb$, employment_status=$dxb$draft$dxb$, role=$dxb$head$dxb$, department=$dxb$data-ai$dxb$, updated_at=now()
 WHERE slug=$dxb$chief-ai-officer$dxb$
   AND (role_level IS DISTINCT FROM $dxb$director$dxb$ OR employment_status IS DISTINCT FROM $dxb$draft$dxb$ OR role IS DISTINCT FROM $dxb$head$dxb$ OR department IS DISTINCT FROM $dxb$data-ai$dxb$);
UPDATE public.agents SET role_level=$dxb$director$dxb$, employment_status=$dxb$draft$dxb$, role=$dxb$head$dxb$, department=$dxb$people-hr$dxb$, updated_at=now()
 WHERE slug=$dxb$chro$dxb$
   AND (role_level IS DISTINCT FROM $dxb$director$dxb$ OR employment_status IS DISTINCT FROM $dxb$draft$dxb$ OR role IS DISTINCT FROM $dxb$head$dxb$ OR department IS DISTINCT FROM $dxb$people-hr$dxb$);
UPDATE public.agents SET role_level=$dxb$director$dxb$, employment_status=$dxb$draft$dxb$, role=$dxb$head$dxb$, department=$dxb$security$dxb$, updated_at=now()
 WHERE slug=$dxb$ciso$dxb$
   AND (role_level IS DISTINCT FROM $dxb$director$dxb$ OR employment_status IS DISTINCT FROM $dxb$draft$dxb$ OR role IS DISTINCT FROM $dxb$head$dxb$ OR department IS DISTINCT FROM $dxb$security$dxb$);
UPDATE public.agents SET role_level=$dxb$director$dxb$, employment_status=$dxb$draft$dxb$, role=$dxb$head$dxb$, department=$dxb$marketing$dxb$, updated_at=now()
 WHERE slug=$dxb$cmo$dxb$
   AND (role_level IS DISTINCT FROM $dxb$director$dxb$ OR employment_status IS DISTINCT FROM $dxb$draft$dxb$ OR role IS DISTINCT FROM $dxb$head$dxb$ OR department IS DISTINCT FROM $dxb$marketing$dxb$);
UPDATE public.agents SET role_level=$dxb$director$dxb$, employment_status=$dxb$draft$dxb$, role=$dxb$head$dxb$, department=$dxb$risk-audit$dxb$, updated_at=now()
 WHERE slug=$dxb$enterprise-risk-manager$dxb$
   AND (role_level IS DISTINCT FROM $dxb$director$dxb$ OR employment_status IS DISTINCT FROM $dxb$draft$dxb$ OR role IS DISTINCT FROM $dxb$head$dxb$ OR department IS DISTINCT FROM $dxb$risk-audit$dxb$);
UPDATE public.agents SET role_level=$dxb$director$dxb$, employment_status=$dxb$draft$dxb$, role=$dxb$head$dxb$, department=$dxb$legal$dxb$, updated_at=now()
 WHERE slug=$dxb$general-counsel$dxb$
   AND (role_level IS DISTINCT FROM $dxb$director$dxb$ OR employment_status IS DISTINCT FROM $dxb$draft$dxb$ OR role IS DISTINCT FROM $dxb$head$dxb$ OR department IS DISTINCT FROM $dxb$legal$dxb$);
UPDATE public.agents SET role_level=$dxb$director$dxb$, employment_status=$dxb$draft$dxb$, role=$dxb$head$dxb$, department=$dxb$customer-success$dxb$, updated_at=now()
 WHERE slug=$dxb$head-of-customer-success$dxb$
   AND (role_level IS DISTINCT FROM $dxb$director$dxb$ OR employment_status IS DISTINCT FROM $dxb$draft$dxb$ OR role IS DISTINCT FROM $dxb$head$dxb$ OR department IS DISTINCT FROM $dxb$customer-success$dxb$);
UPDATE public.agents SET role_level=$dxb$director$dxb$, employment_status=$dxb$draft$dxb$, role=$dxb$head$dxb$, department=$dxb$design$dxb$, updated_at=now()
 WHERE slug=$dxb$head-of-design$dxb$
   AND (role_level IS DISTINCT FROM $dxb$director$dxb$ OR employment_status IS DISTINCT FROM $dxb$draft$dxb$ OR role IS DISTINCT FROM $dxb$head$dxb$ OR department IS DISTINCT FROM $dxb$design$dxb$);
UPDATE public.agents SET role_level=$dxb$director$dxb$, employment_status=$dxb$draft$dxb$, role=$dxb$head$dxb$, department=$dxb$sales$dxb$, updated_at=now()
 WHERE slug=$dxb$head-of-sales$dxb$
   AND (role_level IS DISTINCT FROM $dxb$director$dxb$ OR employment_status IS DISTINCT FROM $dxb$draft$dxb$ OR role IS DISTINCT FROM $dxb$head$dxb$ OR department IS DISTINCT FROM $dxb$sales$dxb$);
UPDATE public.agents SET role_level=$dxb$director$dxb$, employment_status=$dxb$draft$dxb$, role=$dxb$head$dxb$, department=$dxb$strategy$dxb$, updated_at=now()
 WHERE slug=$dxb$head-of-strategy$dxb$
   AND (role_level IS DISTINCT FROM $dxb$director$dxb$ OR employment_status IS DISTINCT FROM $dxb$draft$dxb$ OR role IS DISTINCT FROM $dxb$head$dxb$ OR department IS DISTINCT FROM $dxb$strategy$dxb$);
UPDATE public.agents SET role_level=$dxb$senior_specialist$dxb$, employment_status=$dxb$draft$dxb$, role=$dxb$worker$dxb$, department=$dxb$people-hr$dxb$, updated_at=now()
 WHERE slug=$dxb$performance-calibration-manager$dxb$
   AND (role_level IS DISTINCT FROM $dxb$senior_specialist$dxb$ OR employment_status IS DISTINCT FROM $dxb$draft$dxb$ OR role IS DISTINCT FROM $dxb$worker$dxb$ OR department IS DISTINCT FROM $dxb$people-hr$dxb$);
UPDATE public.agents SET role_level=$dxb$senior_specialist$dxb$, employment_status=$dxb$draft$dxb$, role=$dxb$worker$dxb$, department=$dxb$people-hr$dxb$, updated_at=now()
 WHERE slug=$dxb$persona-workforce-architect$dxb$
   AND (role_level IS DISTINCT FROM $dxb$senior_specialist$dxb$ OR employment_status IS DISTINCT FROM $dxb$draft$dxb$ OR role IS DISTINCT FROM $dxb$worker$dxb$ OR department IS DISTINCT FROM $dxb$people-hr$dxb$);
UPDATE public.agents SET role_level=$dxb$director$dxb$, employment_status=$dxb$draft$dxb$, role=$dxb$head$dxb$, department=$dxb$platform$dxb$, updated_at=now()
 WHERE slug=$dxb$platform-head$dxb$
   AND (role_level IS DISTINCT FROM $dxb$director$dxb$ OR employment_status IS DISTINCT FROM $dxb$draft$dxb$ OR role IS DISTINCT FROM $dxb$head$dxb$ OR department IS DISTINCT FROM $dxb$platform$dxb$);
UPDATE public.agents SET role_level=$dxb$director$dxb$, employment_status=$dxb$draft$dxb$, role=$dxb$head$dxb$, department=$dxb$quality$dxb$, updated_at=now()
 WHERE slug=$dxb$quality-head$dxb$
   AND (role_level IS DISTINCT FROM $dxb$director$dxb$ OR employment_status IS DISTINCT FROM $dxb$draft$dxb$ OR role IS DISTINCT FROM $dxb$head$dxb$ OR department IS DISTINCT FROM $dxb$quality$dxb$);
UPDATE public.agents SET role_level=$dxb$director$dxb$, employment_status=$dxb$draft$dxb$, role=$dxb$head$dxb$, department=$dxb$revops$dxb$, updated_at=now()
 WHERE slug=$dxb$revops-head$dxb$
   AND (role_level IS DISTINCT FROM $dxb$director$dxb$ OR employment_status IS DISTINCT FROM $dxb$draft$dxb$ OR role IS DISTINCT FROM $dxb$head$dxb$ OR department IS DISTINCT FROM $dxb$revops$dxb$);
UPDATE public.agents SET role_level=$dxb$specialist$dxb$, employment_status=$dxb$dormant$dxb$, role=$dxb$worker$dxb$, department=$dxb$social-media$dxb$, updated_at=now()
 WHERE slug=$dxb$social-account-connector$dxb$
   AND (role_level IS DISTINCT FROM $dxb$specialist$dxb$ OR employment_status IS DISTINCT FROM $dxb$dormant$dxb$ OR role IS DISTINCT FROM $dxb$worker$dxb$ OR department IS DISTINCT FROM $dxb$social-media$dxb$);
UPDATE public.agents SET role_level=$dxb$specialist$dxb$, employment_status=$dxb$dormant$dxb$, role=$dxb$worker$dxb$, department=$dxb$social-media$dxb$, updated_at=now()
 WHERE slug=$dxb$social-analytics-agent$dxb$
   AND (role_level IS DISTINCT FROM $dxb$specialist$dxb$ OR employment_status IS DISTINCT FROM $dxb$dormant$dxb$ OR role IS DISTINCT FROM $dxb$worker$dxb$ OR department IS DISTINCT FROM $dxb$social-media$dxb$);
UPDATE public.agents SET role_level=$dxb$specialist$dxb$, employment_status=$dxb$dormant$dxb$, role=$dxb$worker$dxb$, department=$dxb$social-media$dxb$, updated_at=now()
 WHERE slug=$dxb$social-approval-workflow$dxb$
   AND (role_level IS DISTINCT FROM $dxb$specialist$dxb$ OR employment_status IS DISTINCT FROM $dxb$dormant$dxb$ OR role IS DISTINCT FROM $dxb$worker$dxb$ OR department IS DISTINCT FROM $dxb$social-media$dxb$);
UPDATE public.agents SET role_level=$dxb$specialist$dxb$, employment_status=$dxb$dormant$dxb$, role=$dxb$worker$dxb$, department=$dxb$social-media$dxb$, updated_at=now()
 WHERE slug=$dxb$social-client-workspace$dxb$
   AND (role_level IS DISTINCT FROM $dxb$specialist$dxb$ OR employment_status IS DISTINCT FROM $dxb$dormant$dxb$ OR role IS DISTINCT FROM $dxb$worker$dxb$ OR department IS DISTINCT FROM $dxb$social-media$dxb$);
UPDATE public.agents SET role_level=$dxb$specialist$dxb$, employment_status=$dxb$dormant$dxb$, role=$dxb$worker$dxb$, department=$dxb$social-media$dxb$, updated_at=now()
 WHERE slug=$dxb$social-content-strategist$dxb$
   AND (role_level IS DISTINCT FROM $dxb$specialist$dxb$ OR employment_status IS DISTINCT FROM $dxb$dormant$dxb$ OR role IS DISTINCT FROM $dxb$worker$dxb$ OR department IS DISTINCT FROM $dxb$social-media$dxb$);
UPDATE public.agents SET role_level=$dxb$specialist$dxb$, employment_status=$dxb$dormant$dxb$, role=$dxb$worker$dxb$, department=$dxb$social-media$dxb$, updated_at=now()
 WHERE slug=$dxb$social-copywriter$dxb$
   AND (role_level IS DISTINCT FROM $dxb$specialist$dxb$ OR employment_status IS DISTINCT FROM $dxb$dormant$dxb$ OR role IS DISTINCT FROM $dxb$worker$dxb$ OR department IS DISTINCT FROM $dxb$social-media$dxb$);
UPDATE public.agents SET role_level=$dxb$specialist$dxb$, employment_status=$dxb$dormant$dxb$, role=$dxb$worker$dxb$, department=$dxb$social-media$dxb$, updated_at=now()
 WHERE slug=$dxb$social-creative-asset$dxb$
   AND (role_level IS DISTINCT FROM $dxb$specialist$dxb$ OR employment_status IS DISTINCT FROM $dxb$dormant$dxb$ OR role IS DISTINCT FROM $dxb$worker$dxb$ OR department IS DISTINCT FROM $dxb$social-media$dxb$);
UPDATE public.agents SET role_level=$dxb$specialist$dxb$, employment_status=$dxb$dormant$dxb$, role=$dxb$worker$dxb$, department=$dxb$social-media$dxb$, updated_at=now()
 WHERE slug=$dxb$social-inbox-agent$dxb$
   AND (role_level IS DISTINCT FROM $dxb$specialist$dxb$ OR employment_status IS DISTINCT FROM $dxb$dormant$dxb$ OR role IS DISTINCT FROM $dxb$worker$dxb$ OR department IS DISTINCT FROM $dxb$social-media$dxb$);
UPDATE public.agents SET role_level=$dxb$specialist$dxb$, employment_status=$dxb$dormant$dxb$, role=$dxb$worker$dxb$, department=$dxb$social-media$dxb$, updated_at=now()
 WHERE slug=$dxb$social-mcp-api-agent$dxb$
   AND (role_level IS DISTINCT FROM $dxb$specialist$dxb$ OR employment_status IS DISTINCT FROM $dxb$dormant$dxb$ OR role IS DISTINCT FROM $dxb$worker$dxb$ OR department IS DISTINCT FROM $dxb$social-media$dxb$);
UPDATE public.agents SET role_level=$dxb$director$dxb$, employment_status=$dxb$dormant$dxb$, role=$dxb$head$dxb$, department=$dxb$social-media$dxb$, updated_at=now()
 WHERE slug=$dxb$social-media-orchestrator$dxb$
   AND (role_level IS DISTINCT FROM $dxb$director$dxb$ OR employment_status IS DISTINCT FROM $dxb$dormant$dxb$ OR role IS DISTINCT FROM $dxb$head$dxb$ OR department IS DISTINCT FROM $dxb$social-media$dxb$);
UPDATE public.agents SET role_level=$dxb$specialist$dxb$, employment_status=$dxb$dormant$dxb$, role=$dxb$worker$dxb$, department=$dxb$social-media$dxb$, updated_at=now()
 WHERE slug=$dxb$social-reporting-agent$dxb$
   AND (role_level IS DISTINCT FROM $dxb$specialist$dxb$ OR employment_status IS DISTINCT FROM $dxb$dormant$dxb$ OR role IS DISTINCT FROM $dxb$worker$dxb$ OR department IS DISTINCT FROM $dxb$social-media$dxb$);
UPDATE public.agents SET role_level=$dxb$specialist$dxb$, employment_status=$dxb$dormant$dxb$, role=$dxb$worker$dxb$, department=$dxb$social-media$dxb$, updated_at=now()
 WHERE slug=$dxb$social-scheduler-publisher$dxb$
   AND (role_level IS DISTINCT FROM $dxb$specialist$dxb$ OR employment_status IS DISTINCT FROM $dxb$dormant$dxb$ OR role IS DISTINCT FROM $dxb$worker$dxb$ OR department IS DISTINCT FROM $dxb$social-media$dxb$);
-- B2) persona_path alignment for the one seed row the wave normalizers skip:
--     social-media-orchestrator is role='head' on live, and 20260712004000
--     normalizes only role='worker' rows while its guardrail checks ALL active
--     social-media rows (measured drill break: 'E5.6 guardrail: 1 rows still
--     off-convention'). Live value, not a blanket rewrite — 21 live rows keep
--     historic agency-agents/ paths by design (archived/merge rows).
UPDATE public.agents SET persona_path=$dxb$personas/social-media/social-media-orchestrator.md$dxb$, updated_at=now()
 WHERE slug=$dxb$social-media-orchestrator$dxb$
   AND persona_path IS DISTINCT FROM $dxb$personas/social-media/social-media-orchestrator.md$dxb$;

-- C) MANAGER CHAINS (live pairs; both sides referenced by their at-this-point
--    slug — renames keep ids, so these bindings survive the waves).
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cfo$dxb$), updated_at=now()
 WHERE slug=$dxb$accounts-payable-agent$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cfo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$ciso$dxb$), updated_at=now()
 WHERE slug=$dxb$agentic-identity-trust$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$ciso$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$chief-ai-officer$dxb$), updated_at=now()
 WHERE slug=$dxb$ai-engineer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$chief-ai-officer$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$enterprise-risk-manager$dxb$), updated_at=now()
 WHERE slug=$dxb$ai-model-risk-officer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$enterprise-risk-manager$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$chief-ai-officer$dxb$), updated_at=now()
 WHERE slug=$dxb$ai-observability-finops-analyst$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$chief-ai-officer$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$ciso$dxb$), updated_at=now()
 WHERE slug=$dxb$ai-safety-red-team-lead$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$ciso$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$chief-ai-officer$dxb$), updated_at=now()
 WHERE slug=$dxb$analytics-reporter$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$chief-ai-officer$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$enterprise-risk-manager$dxb$), updated_at=now()
 WHERE slug=$dxb$automation-governance-architect$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$enterprise-risk-manager$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$platform-head$dxb$), updated_at=now()
 WHERE slug=$dxb$backup-dr-officer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$platform-head$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$ciso$dxb$), updated_at=now()
 WHERE slug=$dxb$blockchain-security-auditor$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$ciso$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$chief-of-staff$dxb$), updated_at=now()
 WHERE slug=$dxb$board-decision-secretary$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$chief-of-staff$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-customer-success$dxb$), updated_at=now()
 WHERE slug=$dxb$business-automation-solutions-architect$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-customer-success$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-commerce$dxb$), updated_at=now()
 WHERE slug=$dxb$catalog-pim-specialist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-commerce$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$), updated_at=now()
 WHERE slug=$dxb$cfo$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$), updated_at=now()
 WHERE slug=$dxb$chief-ai-officer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$), updated_at=now()
 WHERE slug=$dxb$chief-of-staff$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$), updated_at=now()
 WHERE slug=$dxb$chro$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$), updated_at=now()
 WHERE slug=$dxb$ciso$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$), updated_at=now()
 WHERE slug=$dxb$cmo$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-commerce$dxb$), updated_at=now()
 WHERE slug=$dxb$commerce-analytics-specialist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-commerce$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-commerce$dxb$), updated_at=now()
 WHERE slug=$dxb$commerce-integration-engineer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-commerce$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-commerce$dxb$), updated_at=now()
 WHERE slug=$dxb$commerce-returns-specialist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-commerce$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$general-counsel$dxb$), updated_at=now()
 WHERE slug=$dxb$commercial-contracts-manager$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$general-counsel$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$ciso$dxb$), updated_at=now()
 WHERE slug=$dxb$compliance-auditor$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$ciso$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$), updated_at=now()
 WHERE slug=$dxb$corporate-communications-lead$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-strategy$dxb$), updated_at=now()
 WHERE slug=$dxb$corporate-development-analyst$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-strategy$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$chro$dxb$), updated_at=now()
 WHERE slug=$dxb$corporate-training-designer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$chro$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$revops-head$dxb$), updated_at=now()
 WHERE slug=$dxb$crm-data-steward$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$revops-head$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-commerce$dxb$), updated_at=now()
 WHERE slug=$dxb$cro-checkout-specialist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-commerce$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$chief-ai-officer$dxb$), updated_at=now()
 WHERE slug=$dxb$data-engineer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$chief-ai-officer$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$platform-head$dxb$), updated_at=now()
 WHERE slug=$dxb$database-optimizer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$platform-head$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-design$dxb$), updated_at=now()
 WHERE slug=$dxb$design-brand-guardian$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-design$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-design$dxb$), updated_at=now()
 WHERE slug=$dxb$design-image-prompt-engineer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-design$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-design$dxb$), updated_at=now()
 WHERE slug=$dxb$design-inclusive-visuals-specialist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-design$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-design$dxb$), updated_at=now()
 WHERE slug=$dxb$design-ui-designer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-design$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-design$dxb$), updated_at=now()
 WHERE slug=$dxb$design-ux-architect$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-design$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-design$dxb$), updated_at=now()
 WHERE slug=$dxb$design-ux-researcher$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-design$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-design$dxb$), updated_at=now()
 WHERE slug=$dxb$design-visual-storyteller$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-design$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-design$dxb$), updated_at=now()
 WHERE slug=$dxb$design-whimsy-injector$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-design$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$chief-of-staff$dxb$), updated_at=now()
 WHERE slug=$dxb$document-generator$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$chief-of-staff$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$), updated_at=now()
 WHERE slug=$dxb$engineering-ai-data-remediation-engineer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$), updated_at=now()
 WHERE slug=$dxb$engineering-autonomous-optimization-architect$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$), updated_at=now()
 WHERE slug=$dxb$engineering-backend-architect$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$), updated_at=now()
 WHERE slug=$dxb$engineering-cms-developer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$), updated_at=now()
 WHERE slug=$dxb$engineering-code-reviewer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$), updated_at=now()
 WHERE slug=$dxb$engineering-codebase-onboarding-engineer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$), updated_at=now()
 WHERE slug=$dxb$engineering-devops-automator$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$), updated_at=now()
 WHERE slug=$dxb$engineering-email-intelligence-engineer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$), updated_at=now()
 WHERE slug=$dxb$engineering-embedded-firmware-engineer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$), updated_at=now()
 WHERE slug=$dxb$engineering-feishu-integration-developer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$), updated_at=now()
 WHERE slug=$dxb$engineering-filament-optimization-specialist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$), updated_at=now()
 WHERE slug=$dxb$engineering-frontend-developer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$), updated_at=now()
 WHERE slug=$dxb$engineering-git-workflow-master$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$), updated_at=now()
 WHERE slug=$dxb$engineering-minimal-change-engineer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$), updated_at=now()
 WHERE slug=$dxb$engineering-mobile-app-builder$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$), updated_at=now()
 WHERE slug=$dxb$engineering-rapid-prototyper$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$), updated_at=now()
 WHERE slug=$dxb$engineering-senior-developer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$), updated_at=now()
 WHERE slug=$dxb$engineering-software-architect$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$), updated_at=now()
 WHERE slug=$dxb$engineering-solidity-smart-contract-engineer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$), updated_at=now()
 WHERE slug=$dxb$engineering-technical-writer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$), updated_at=now()
 WHERE slug=$dxb$engineering-voice-ai-integration-engineer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$), updated_at=now()
 WHERE slug=$dxb$engineering-wechat-mini-program-developer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$), updated_at=now()
 WHERE slug=$dxb$enterprise-risk-manager$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$chief-of-staff$dxb$), updated_at=now()
 WHERE slug=$dxb$executive-operations-manager$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$chief-of-staff$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$chief-of-staff$dxb$), updated_at=now()
 WHERE slug=$dxb$executive-summary-generator$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$chief-of-staff$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cfo$dxb$), updated_at=now()
 WHERE slug=$dxb$finance-bookkeeper-controller$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cfo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cfo$dxb$), updated_at=now()
 WHERE slug=$dxb$finance-financial-analyst$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cfo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cfo$dxb$), updated_at=now()
 WHERE slug=$dxb$finance-fpa-analyst$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cfo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cfo$dxb$), updated_at=now()
 WHERE slug=$dxb$finance-investment-researcher$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cfo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cfo$dxb$), updated_at=now()
 WHERE slug=$dxb$finance-tax-strategist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cfo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$), updated_at=now()
 WHERE slug=$dxb$general-counsel$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-strategy$dxb$), updated_at=now()
 WHERE slug=$dxb$global-expansion-lead$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-strategy$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$), updated_at=now()
 WHERE slug=$dxb$head-of-commerce$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$), updated_at=now()
 WHERE slug=$dxb$head-of-customer-success$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$), updated_at=now()
 WHERE slug=$dxb$head-of-design$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$), updated_at=now()
 WHERE slug=$dxb$head-of-sales$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$), updated_at=now()
 WHERE slug=$dxb$head-of-strategy$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$chro$dxb$), updated_at=now()
 WHERE slug=$dxb$hr-onboarding$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$chro$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$ciso$dxb$), updated_at=now()
 WHERE slug=$dxb$iam-secrets-officer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$ciso$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$chief-ai-officer$dxb$), updated_at=now()
 WHERE slug=$dxb$identity-graph-operator$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$chief-ai-officer$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$platform-head$dxb$), updated_at=now()
 WHERE slug=$dxb$incident-response-commander$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$platform-head$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$platform-head$dxb$), updated_at=now()
 WHERE slug=$dxb$infrastructure-maintainer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$platform-head$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$enterprise-risk-manager$dxb$), updated_at=now()
 WHERE slug=$dxb$internal-auditor$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$enterprise-risk-manager$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-commerce$dxb$), updated_at=now()
 WHERE slug=$dxb$inventory-fulfillment-manager$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-commerce$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$chief-ai-officer$dxb$), updated_at=now()
 WHERE slug=$dxb$knowledge-architect$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$chief-ai-officer$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$general-counsel$dxb$), updated_at=now()
 WHERE slug=$dxb$legal-compliance-checker$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$general-counsel$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$general-counsel$dxb$), updated_at=now()
 WHERE slug=$dxb$legal-de-counsel$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$general-counsel$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$general-counsel$dxb$), updated_at=now()
 WHERE slug=$dxb$legal-tr-counsel$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$general-counsel$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$), updated_at=now()
 WHERE slug=$dxb$lsp-index-engineer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-customer-success$dxb$), updated_at=now()
 WHERE slug=$dxb$managed-automation-services-engineer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-customer-success$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-strategy$dxb$), updated_at=now()
 WHERE slug=$dxb$market-intelligence-lead$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-strategy$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$), updated_at=now()
 WHERE slug=$dxb$marketing-agentic-search-optimizer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$), updated_at=now()
 WHERE slug=$dxb$marketing-ai-citation-strategist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$), updated_at=now()
 WHERE slug=$dxb$marketing-app-store-optimizer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$), updated_at=now()
 WHERE slug=$dxb$marketing-baidu-seo-specialist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$), updated_at=now()
 WHERE slug=$dxb$marketing-bilibili-content-strategist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$), updated_at=now()
 WHERE slug=$dxb$marketing-book-co-author$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$), updated_at=now()
 WHERE slug=$dxb$marketing-carousel-growth-engine$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$), updated_at=now()
 WHERE slug=$dxb$marketing-china-ecommerce-operator$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$), updated_at=now()
 WHERE slug=$dxb$marketing-china-market-localization-strategist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$), updated_at=now()
 WHERE slug=$dxb$marketing-content-creator$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$), updated_at=now()
 WHERE slug=$dxb$marketing-cross-border-ecommerce$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$), updated_at=now()
 WHERE slug=$dxb$marketing-douyin-strategist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$), updated_at=now()
 WHERE slug=$dxb$marketing-growth-hacker$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$), updated_at=now()
 WHERE slug=$dxb$marketing-instagram-curator$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$), updated_at=now()
 WHERE slug=$dxb$marketing-kuaishou-strategist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$), updated_at=now()
 WHERE slug=$dxb$marketing-linkedin-content-creator$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$), updated_at=now()
 WHERE slug=$dxb$marketing-livestream-commerce-coach$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$), updated_at=now()
 WHERE slug=$dxb$marketing-podcast-strategist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$), updated_at=now()
 WHERE slug=$dxb$marketing-private-domain-operator$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$), updated_at=now()
 WHERE slug=$dxb$marketing-reddit-community-builder$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$), updated_at=now()
 WHERE slug=$dxb$marketing-seo-specialist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$), updated_at=now()
 WHERE slug=$dxb$marketing-short-video-editing-coach$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$), updated_at=now()
 WHERE slug=$dxb$marketing-social-media-strategist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$), updated_at=now()
 WHERE slug=$dxb$marketing-tiktok-strategist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$), updated_at=now()
 WHERE slug=$dxb$marketing-twitter-engager$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$), updated_at=now()
 WHERE slug=$dxb$marketing-video-optimization-specialist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$), updated_at=now()
 WHERE slug=$dxb$marketing-wechat-official-account$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$), updated_at=now()
 WHERE slug=$dxb$marketing-weibo-strategist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$), updated_at=now()
 WHERE slug=$dxb$marketing-xiaohongshu-specialist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$), updated_at=now()
 WHERE slug=$dxb$marketing-zhihu-strategist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$chief-ai-officer$dxb$), updated_at=now()
 WHERE slug=$dxb$mcp-builder$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$chief-ai-officer$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-commerce$dxb$), updated_at=now()
 WHERE slug=$dxb$merchandising-pricing-manager$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-commerce$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$chief-ai-officer$dxb$), updated_at=now()
 WHERE slug=$dxb$model-evaluation-lead$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$chief-ai-officer$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-strategy$dxb$), updated_at=now()
 WHERE slug=$dxb$okr-performance-manager$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-strategy$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-customer-success$dxb$), updated_at=now()
 WHERE slug=$dxb$onboarding-implementation-lead$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-customer-success$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$paid-media-ppc-strategist$dxb$), updated_at=now()
 WHERE slug=$dxb$paid-media-auditor$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$paid-media-ppc-strategist$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$paid-media-ppc-strategist$dxb$), updated_at=now()
 WHERE slug=$dxb$paid-media-creative-strategist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$paid-media-ppc-strategist$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$paid-media-ppc-strategist$dxb$), updated_at=now()
 WHERE slug=$dxb$paid-media-paid-social-strategist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$paid-media-ppc-strategist$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$), updated_at=now()
 WHERE slug=$dxb$paid-media-ppc-strategist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$paid-media-ppc-strategist$dxb$), updated_at=now()
 WHERE slug=$dxb$paid-media-programmatic-buyer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$paid-media-ppc-strategist$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$paid-media-ppc-strategist$dxb$), updated_at=now()
 WHERE slug=$dxb$paid-media-search-query-analyst$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$paid-media-ppc-strategist$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$paid-media-ppc-strategist$dxb$), updated_at=now()
 WHERE slug=$dxb$paid-media-tracking-specialist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$paid-media-ppc-strategist$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-strategy$dxb$), updated_at=now()
 WHERE slug=$dxb$partnerships-ecosystem-lead$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-strategy$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cfo$dxb$), updated_at=now()
 WHERE slug=$dxb$payroll-manager$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cfo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$chro$dxb$), updated_at=now()
 WHERE slug=$dxb$performance-calibration-manager$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$chro$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$chro$dxb$), updated_at=now()
 WHERE slug=$dxb$persona-workforce-architect$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$chro$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$), updated_at=now()
 WHERE slug=$dxb$platform-head$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$general-counsel$dxb$), updated_at=now()
 WHERE slug=$dxb$policy-writer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$general-counsel$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$revops-head$dxb$), updated_at=now()
 WHERE slug=$dxb$pricing-deal-desk-manager$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$revops-head$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$general-counsel$dxb$), updated_at=now()
 WHERE slug=$dxb$privacy-dpo$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$general-counsel$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$product-manager$dxb$), updated_at=now()
 WHERE slug=$dxb$product-behavioral-nudge-engine$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$product-manager$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$product-manager$dxb$), updated_at=now()
 WHERE slug=$dxb$product-feedback-synthesizer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$product-manager$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$), updated_at=now()
 WHERE slug=$dxb$product-manager$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$product-manager$dxb$), updated_at=now()
 WHERE slug=$dxb$product-sprint-prioritizer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$product-manager$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$product-manager$dxb$), updated_at=now()
 WHERE slug=$dxb$product-trend-researcher$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$product-manager$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$project-management-studio-producer$dxb$), updated_at=now()
 WHERE slug=$dxb$project-management-experiment-tracker$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$project-management-studio-producer$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$project-management-studio-producer$dxb$), updated_at=now()
 WHERE slug=$dxb$project-management-jira-workflow-steward$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$project-management-studio-producer$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$project-management-studio-producer$dxb$), updated_at=now()
 WHERE slug=$dxb$project-management-project-shepherd$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$project-management-studio-producer$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$project-management-studio-producer$dxb$), updated_at=now()
 WHERE slug=$dxb$project-management-studio-operations$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$project-management-studio-producer$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$), updated_at=now()
 WHERE slug=$dxb$project-management-studio-producer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$chief-ai-officer$dxb$), updated_at=now()
 WHERE slug=$dxb$prompt-context-engineer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$chief-ai-officer$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$), updated_at=now()
 WHERE slug=$dxb$quality-head$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$chro$dxb$), updated_at=now()
 WHERE slug=$dxb$recruitment-specialist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$chro$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$revops-head$dxb$), updated_at=now()
 WHERE slug=$dxb$revenue-growth-specialist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$revops-head$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$revops-head$dxb$), updated_at=now()
 WHERE slug=$dxb$revenue-reporting-agent$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$revops-head$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$), updated_at=now()
 WHERE slug=$dxb$revops-head$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-customer-success$dxb$), updated_at=now()
 WHERE slug=$dxb$sales-account-strategist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-customer-success$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-sales$dxb$), updated_at=now()
 WHERE slug=$dxb$sales-coach$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-sales$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-sales$dxb$), updated_at=now()
 WHERE slug=$dxb$sales-deal-strategist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-sales$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-sales$dxb$), updated_at=now()
 WHERE slug=$dxb$sales-discovery-coach$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-sales$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-sales$dxb$), updated_at=now()
 WHERE slug=$dxb$sales-engineer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-sales$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-sales$dxb$), updated_at=now()
 WHERE slug=$dxb$sales-outbound-strategist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-sales$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$revops-head$dxb$), updated_at=now()
 WHERE slug=$dxb$sales-pipeline-analyst$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$revops-head$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-sales$dxb$), updated_at=now()
 WHERE slug=$dxb$sales-proposal-strategist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-sales$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$ciso$dxb$), updated_at=now()
 WHERE slug=$dxb$security-engineer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$ciso$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$social-media-orchestrator$dxb$), updated_at=now()
 WHERE slug=$dxb$social-account-connector$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$social-media-orchestrator$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$social-media-orchestrator$dxb$), updated_at=now()
 WHERE slug=$dxb$social-analytics-agent$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$social-media-orchestrator$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$social-media-orchestrator$dxb$), updated_at=now()
 WHERE slug=$dxb$social-approval-workflow$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$social-media-orchestrator$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$social-media-orchestrator$dxb$), updated_at=now()
 WHERE slug=$dxb$social-client-workspace$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$social-media-orchestrator$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$social-media-orchestrator$dxb$), updated_at=now()
 WHERE slug=$dxb$social-commerce-creator-lead$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$social-media-orchestrator$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$social-media-orchestrator$dxb$), updated_at=now()
 WHERE slug=$dxb$social-content-strategist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$social-media-orchestrator$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$social-media-orchestrator$dxb$), updated_at=now()
 WHERE slug=$dxb$social-copywriter$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$social-media-orchestrator$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$social-media-orchestrator$dxb$), updated_at=now()
 WHERE slug=$dxb$social-creative-asset$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$social-media-orchestrator$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$social-media-orchestrator$dxb$), updated_at=now()
 WHERE slug=$dxb$social-inbox-agent$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$social-media-orchestrator$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$social-media-orchestrator$dxb$), updated_at=now()
 WHERE slug=$dxb$social-mcp-api-agent$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$social-media-orchestrator$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$), updated_at=now()
 WHERE slug=$dxb$social-media-orchestrator$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$agents-orchestrator$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$social-media-orchestrator$dxb$), updated_at=now()
 WHERE slug=$dxb$social-reporting-agent$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$social-media-orchestrator$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$social-media-orchestrator$dxb$), updated_at=now()
 WHERE slug=$dxb$social-scheduler-publisher$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$social-media-orchestrator$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-design$dxb$), updated_at=now()
 WHERE slug=$dxb$specialized-cultural-intelligence-strategist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-design$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$), updated_at=now()
 WHERE slug=$dxb$specialized-developer-advocate$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$platform-head$dxb$), updated_at=now()
 WHERE slug=$dxb$sre$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$platform-head$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-commerce$dxb$), updated_at=now()
 WHERE slug=$dxb$stock-lot-sourcing-specialist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-commerce$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cfo$dxb$), updated_at=now()
 WHERE slug=$dxb$supply-chain-strategist$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cfo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-customer-success$dxb$), updated_at=now()
 WHERE slug=$dxb$support-support-responder$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-customer-success$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$quality-head$dxb$), updated_at=now()
 WHERE slug=$dxb$testing-accessibility-auditor$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$quality-head$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$quality-head$dxb$), updated_at=now()
 WHERE slug=$dxb$testing-api-tester$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$quality-head$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$quality-head$dxb$), updated_at=now()
 WHERE slug=$dxb$testing-evidence-collector$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$quality-head$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$quality-head$dxb$), updated_at=now()
 WHERE slug=$dxb$testing-performance-benchmarker$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$quality-head$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$quality-head$dxb$), updated_at=now()
 WHERE slug=$dxb$testing-reality-checker$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$quality-head$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$quality-head$dxb$), updated_at=now()
 WHERE slug=$dxb$testing-test-results-analyzer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$quality-head$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$quality-head$dxb$), updated_at=now()
 WHERE slug=$dxb$testing-tool-evaluator$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$quality-head$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$quality-head$dxb$), updated_at=now()
 WHERE slug=$dxb$testing-workflow-optimizer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$quality-head$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$ciso$dxb$), updated_at=now()
 WHERE slug=$dxb$threat-detection-engineer$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$ciso$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$cfo$dxb$), updated_at=now()
 WHERE slug=$dxb$treasury-ar-manager$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cfo$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-strategy$dxb$), updated_at=now()
 WHERE slug=$dxb$venture-builder$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-strategy$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-commerce$dxb$), updated_at=now()
 WHERE slug=$dxb$woocommerce-architect$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-commerce$dxb$);
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug=$dxb$chief-ai-officer$dxb$), updated_at=now()
 WHERE slug=$dxb$workflow-architect$dxb$
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$chief-ai-officer$dxb$);

-- D) DEPARTMENT DIRECTOR BINDINGS (live pairs, same slug rule).
UPDATE public.departments SET director_id=(SELECT id FROM public.agents WHERE slug=$dxb$chief-of-staff$dxb$)
 WHERE slug=$dxb$ceo$dxb$
   AND director_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$chief-of-staff$dxb$);
UPDATE public.departments SET director_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-commerce$dxb$)
 WHERE slug=$dxb$commerce$dxb$
   AND director_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-commerce$dxb$);
UPDATE public.departments SET director_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-customer-success$dxb$)
 WHERE slug=$dxb$customer-success$dxb$
   AND director_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-customer-success$dxb$);
UPDATE public.departments SET director_id=(SELECT id FROM public.agents WHERE slug=$dxb$chief-ai-officer$dxb$)
 WHERE slug=$dxb$data-ai$dxb$
   AND director_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$chief-ai-officer$dxb$);
UPDATE public.departments SET director_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-design$dxb$)
 WHERE slug=$dxb$design$dxb$
   AND director_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-design$dxb$);
UPDATE public.departments SET director_id=(SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$)
 WHERE slug=$dxb$engineering$dxb$
   AND director_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$engineering-software-architect$dxb$);
UPDATE public.departments SET director_id=(SELECT id FROM public.agents WHERE slug=$dxb$cfo$dxb$)
 WHERE slug=$dxb$finance$dxb$
   AND director_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cfo$dxb$);
UPDATE public.departments SET director_id=(SELECT id FROM public.agents WHERE slug=$dxb$general-counsel$dxb$)
 WHERE slug=$dxb$legal$dxb$
   AND director_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$general-counsel$dxb$);
UPDATE public.departments SET director_id=(SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$)
 WHERE slug=$dxb$marketing$dxb$
   AND director_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$cmo$dxb$);
UPDATE public.departments SET director_id=(SELECT id FROM public.agents WHERE slug=$dxb$paid-media-ppc-strategist$dxb$)
 WHERE slug=$dxb$paid-media$dxb$
   AND director_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$paid-media-ppc-strategist$dxb$);
UPDATE public.departments SET director_id=(SELECT id FROM public.agents WHERE slug=$dxb$chro$dxb$)
 WHERE slug=$dxb$people-hr$dxb$
   AND director_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$chro$dxb$);
UPDATE public.departments SET director_id=(SELECT id FROM public.agents WHERE slug=$dxb$platform-head$dxb$)
 WHERE slug=$dxb$platform$dxb$
   AND director_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$platform-head$dxb$);
UPDATE public.departments SET director_id=(SELECT id FROM public.agents WHERE slug=$dxb$product-manager$dxb$)
 WHERE slug=$dxb$product$dxb$
   AND director_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$product-manager$dxb$);
UPDATE public.departments SET director_id=(SELECT id FROM public.agents WHERE slug=$dxb$project-management-studio-producer$dxb$)
 WHERE slug=$dxb$project-management$dxb$
   AND director_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$project-management-studio-producer$dxb$);
UPDATE public.departments SET director_id=(SELECT id FROM public.agents WHERE slug=$dxb$quality-head$dxb$)
 WHERE slug=$dxb$quality$dxb$
   AND director_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$quality-head$dxb$);
UPDATE public.departments SET director_id=(SELECT id FROM public.agents WHERE slug=$dxb$revops-head$dxb$)
 WHERE slug=$dxb$revops$dxb$
   AND director_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$revops-head$dxb$);
UPDATE public.departments SET director_id=(SELECT id FROM public.agents WHERE slug=$dxb$enterprise-risk-manager$dxb$)
 WHERE slug=$dxb$risk-audit$dxb$
   AND director_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$enterprise-risk-manager$dxb$);
UPDATE public.departments SET director_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-sales$dxb$)
 WHERE slug=$dxb$sales$dxb$
   AND director_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-sales$dxb$);
UPDATE public.departments SET director_id=(SELECT id FROM public.agents WHERE slug=$dxb$ciso$dxb$)
 WHERE slug=$dxb$security$dxb$
   AND director_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$ciso$dxb$);
UPDATE public.departments SET director_id=(SELECT id FROM public.agents WHERE slug=$dxb$social-media-orchestrator$dxb$)
 WHERE slug=$dxb$social-media$dxb$
   AND director_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$social-media-orchestrator$dxb$);
UPDATE public.departments SET director_id=(SELECT id FROM public.agents WHERE slug=$dxb$head-of-strategy$dxb$)
 WHERE slug=$dxb$strategy$dxb$
   AND director_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug=$dxb$head-of-strategy$dxb$);

-- E) VISIBILITY (no hard guard here — the wave guardrails downstream are the
--    contract; this block only reports what the backfill produced).
DO $$
DECLARE v_agents integer; v_orphans integer; v_dirs integer;
BEGIN
  SELECT count(*) INTO v_agents FROM public.agents;
  SELECT count(*) INTO v_orphans FROM public.agents
   WHERE role='worker' AND employment_status<>'archived'
     AND slug<>'agents-orchestrator' AND manager_id IS NULL;
  SELECT count(director_id) INTO v_dirs FROM public.departments;
  RAISE NOTICE 'parity backfill: agents=%, active orphan workers=%, director bindings=%',
    v_agents, v_orphans, v_dirs;
END $$;

-- Close the data-restore window (gate protects runtime mutations again).
ALTER TABLE public.agents ENABLE TRIGGER trg_agents_activation_gate;
ALTER TABLE public.agents ENABLE TRIGGER trg_agents_persona_passed;

COMMIT;

-- ROLLBACK: runtime-born rows are identified by this file's leg-A slug list;
-- deleting them reverses leg A. Legs B-D are value alignments to the live
-- reference and need no reversal (IS DISTINCT FROM-guarded no-ops on live).
