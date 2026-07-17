-- 20260717070000_grant_hardening_parity.sql — R2.5 gap migration (audit F-08)
-- WHY: the live database carries a grant-hardening posture that was applied
-- at RUNTIME, outside the migration chain (measured 2026-07-17: anon holds
-- ZERO DML on all 52 public tables, service_role is stripped to 15 DML
-- surfaces, authenticated keeps its dashboard read/write set) — while a fresh
-- bootstrap inherits the supabase image's permissive defaults (anon with full
-- DML — measured drill diff: 603 inventory lines). Without this file every
-- fresh deploy would be born INSECURE and staging ≠ production.
-- This file replays the exact live per-(relation × role) privilege sets for
-- the three stack roles. Grantees postgres/supabase_admin are ownership
-- domain (bootstrap runs as postgres) and are not touched here.
-- GENERATED from live pg_class ACLs; REVOKE ALL + exact re-GRANT per pair is
-- idempotent by construction — a no-op on live, the hardening act on fresh.
-- NOTE (CEO-visible): live keeps TRUNCATE for anon on 47 tables — mirrored
-- here verbatim (parity file, not a policy decision); flagged in the R2.5
-- report as a deferred-hardening follow-up.

BEGIN;

REVOKE ALL ON public.agent_runs FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.agent_runs TO anon;
REVOKE ALL ON public.agent_runs FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER ON public.agent_runs TO authenticated;
REVOKE ALL ON public.agent_runs FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.agent_runs TO service_role;
REVOKE ALL ON public.agents FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.agents TO anon;
REVOKE ALL ON public.agents FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.agents TO authenticated;
REVOKE ALL ON public.agents FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.agents TO service_role;
REVOKE ALL ON public.alerts FROM anon;
REVOKE ALL ON public.alerts FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.alerts TO authenticated;
REVOKE ALL ON public.alerts FROM service_role; GRANT INSERT,MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.alerts TO service_role;
REVOKE ALL ON public.approval_rules FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.approval_rules TO anon;
REVOKE ALL ON public.approval_rules FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.approval_rules TO authenticated;
REVOKE ALL ON public.approval_rules FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.approval_rules TO service_role;
REVOKE ALL ON public.approvals FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.approvals TO anon;
REVOKE ALL ON public.approvals FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER ON public.approvals TO authenticated;
REVOKE ALL ON public.approvals FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.approvals TO service_role;
REVOKE ALL ON public.audit_log FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.audit_log TO anon;
REVOKE ALL ON public.audit_log FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER ON public.audit_log TO authenticated;
REVOKE ALL ON public.audit_log FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.audit_log TO service_role;
REVOKE ALL ON SEQUENCE public.audit_log_id_seq FROM anon; GRANT UPDATE ON SEQUENCE public.audit_log_id_seq TO anon;
REVOKE ALL ON SEQUENCE public.audit_log_id_seq FROM authenticated; GRANT UPDATE ON SEQUENCE public.audit_log_id_seq TO authenticated;
REVOKE ALL ON SEQUENCE public.audit_log_id_seq FROM service_role; GRANT UPDATE ON SEQUENCE public.audit_log_id_seq TO service_role;
REVOKE ALL ON public.budget_state FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.budget_state TO anon;
REVOKE ALL ON public.budget_state FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.budget_state TO authenticated;
REVOKE ALL ON public.budget_state FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.budget_state TO service_role;
REVOKE ALL ON public.companies FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.companies TO anon;
REVOKE ALL ON public.companies FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.companies TO authenticated;
REVOKE ALL ON public.companies FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.companies TO service_role;
REVOKE ALL ON public.control_idempotency FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.control_idempotency TO anon;
REVOKE ALL ON public.control_idempotency FROM authenticated; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.control_idempotency TO authenticated;
REVOKE ALL ON public.control_idempotency FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.control_idempotency TO service_role;
REVOKE ALL ON public.cost_ledger FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.cost_ledger TO anon;
REVOKE ALL ON public.cost_ledger FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER ON public.cost_ledger TO authenticated;
REVOKE ALL ON public.cost_ledger FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.cost_ledger TO service_role;
REVOKE ALL ON SEQUENCE public.cost_ledger_id_seq FROM anon; GRANT UPDATE ON SEQUENCE public.cost_ledger_id_seq TO anon;
REVOKE ALL ON SEQUENCE public.cost_ledger_id_seq FROM authenticated; GRANT UPDATE ON SEQUENCE public.cost_ledger_id_seq TO authenticated;
REVOKE ALL ON SEQUENCE public.cost_ledger_id_seq FROM service_role; GRANT UPDATE ON SEQUENCE public.cost_ledger_id_seq TO service_role;
REVOKE ALL ON public.crm_clients FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.crm_clients TO anon;
REVOKE ALL ON public.crm_clients FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.crm_clients TO authenticated;
REVOKE ALL ON public.crm_clients FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.crm_clients TO service_role;
REVOKE ALL ON public.crm_contacts FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.crm_contacts TO anon;
REVOKE ALL ON public.crm_contacts FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.crm_contacts TO authenticated;
REVOKE ALL ON public.crm_contacts FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.crm_contacts TO service_role;
REVOKE ALL ON public.crm_deals FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.crm_deals TO anon;
REVOKE ALL ON public.crm_deals FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.crm_deals TO authenticated;
REVOKE ALL ON public.crm_deals FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.crm_deals TO service_role;
REVOKE ALL ON public.crm_requests FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.crm_requests TO anon;
REVOKE ALL ON public.crm_requests FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.crm_requests TO authenticated;
REVOKE ALL ON public.crm_requests FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.crm_requests TO service_role;
REVOKE ALL ON public.decision_log FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.decision_log TO anon;
REVOKE ALL ON public.decision_log FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER ON public.decision_log TO authenticated;
REVOKE ALL ON public.decision_log FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.decision_log TO service_role;
REVOKE ALL ON SEQUENCE public.decision_log_id_seq FROM anon; GRANT UPDATE ON SEQUENCE public.decision_log_id_seq TO anon;
REVOKE ALL ON SEQUENCE public.decision_log_id_seq FROM authenticated; GRANT UPDATE ON SEQUENCE public.decision_log_id_seq TO authenticated;
REVOKE ALL ON SEQUENCE public.decision_log_id_seq FROM service_role; GRANT UPDATE ON SEQUENCE public.decision_log_id_seq TO service_role;
REVOKE ALL ON public.departments FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.departments TO anon;
REVOKE ALL ON public.departments FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.departments TO authenticated;
REVOKE ALL ON public.departments FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.departments TO service_role;
REVOKE ALL ON public.employee_records FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.employee_records TO anon;
REVOKE ALL ON public.employee_records FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.employee_records TO authenticated;
REVOKE ALL ON public.employee_records FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.employee_records TO service_role;
REVOKE ALL ON public.file_changes FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.file_changes TO anon;
REVOKE ALL ON public.file_changes FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER ON public.file_changes TO authenticated;
REVOKE ALL ON public.file_changes FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.file_changes TO service_role;
REVOKE ALL ON SEQUENCE public.file_changes_id_seq FROM anon; GRANT UPDATE ON SEQUENCE public.file_changes_id_seq TO anon;
REVOKE ALL ON SEQUENCE public.file_changes_id_seq FROM authenticated; GRANT UPDATE ON SEQUENCE public.file_changes_id_seq TO authenticated;
REVOKE ALL ON SEQUENCE public.file_changes_id_seq FROM service_role; GRANT UPDATE ON SEQUENCE public.file_changes_id_seq TO service_role;
REVOKE ALL ON public.hook_policies FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.hook_policies TO anon;
REVOKE ALL ON public.hook_policies FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.hook_policies TO authenticated;
REVOKE ALL ON public.hook_policies FROM service_role; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.hook_policies TO service_role;
REVOKE ALL ON public.hook_violations FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.hook_violations TO anon;
REVOKE ALL ON public.hook_violations FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.hook_violations TO authenticated;
REVOKE ALL ON public.hook_violations FROM service_role; GRANT INSERT,MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.hook_violations TO service_role;
REVOKE ALL ON SEQUENCE public.hook_violations_id_seq FROM anon; GRANT UPDATE ON SEQUENCE public.hook_violations_id_seq TO anon;
REVOKE ALL ON SEQUENCE public.hook_violations_id_seq FROM authenticated; GRANT UPDATE ON SEQUENCE public.hook_violations_id_seq TO authenticated;
REVOKE ALL ON SEQUENCE public.hook_violations_id_seq FROM service_role; GRANT UPDATE,USAGE ON SEQUENCE public.hook_violations_id_seq TO service_role;
REVOKE ALL ON public.intents FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.intents TO anon;
REVOKE ALL ON public.intents FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.intents TO authenticated;
REVOKE ALL ON public.intents FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.intents TO service_role;
REVOKE ALL ON public.library_change_log FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.library_change_log TO anon;
REVOKE ALL ON public.library_change_log FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER ON public.library_change_log TO authenticated;
REVOKE ALL ON public.library_change_log FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.library_change_log TO service_role;
REVOKE ALL ON SEQUENCE public.library_change_log_id_seq FROM anon; GRANT UPDATE ON SEQUENCE public.library_change_log_id_seq TO anon;
REVOKE ALL ON SEQUENCE public.library_change_log_id_seq FROM authenticated; GRANT UPDATE ON SEQUENCE public.library_change_log_id_seq TO authenticated;
REVOKE ALL ON SEQUENCE public.library_change_log_id_seq FROM service_role; GRANT UPDATE ON SEQUENCE public.library_change_log_id_seq TO service_role;
REVOKE ALL ON public.library_grants FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.library_grants TO anon;
REVOKE ALL ON public.library_grants FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER ON public.library_grants TO authenticated;
REVOKE ALL ON public.library_grants FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.library_grants TO service_role;
REVOKE ALL ON SEQUENCE public.library_grants_id_seq FROM anon; GRANT UPDATE ON SEQUENCE public.library_grants_id_seq TO anon;
REVOKE ALL ON SEQUENCE public.library_grants_id_seq FROM authenticated; GRANT UPDATE ON SEQUENCE public.library_grants_id_seq TO authenticated;
REVOKE ALL ON SEQUENCE public.library_grants_id_seq FROM service_role; GRANT UPDATE ON SEQUENCE public.library_grants_id_seq TO service_role;
REVOKE ALL ON public.library_items FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.library_items TO anon;
REVOKE ALL ON public.library_items FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER ON public.library_items TO authenticated;
REVOKE ALL ON public.library_items FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.library_items TO service_role;
REVOKE ALL ON public.library_usage_log FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.library_usage_log TO anon;
REVOKE ALL ON public.library_usage_log FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER ON public.library_usage_log TO authenticated;
REVOKE ALL ON public.library_usage_log FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.library_usage_log TO service_role;
REVOKE ALL ON SEQUENCE public.library_usage_log_id_seq FROM anon; GRANT UPDATE ON SEQUENCE public.library_usage_log_id_seq TO anon;
REVOKE ALL ON SEQUENCE public.library_usage_log_id_seq FROM authenticated; GRANT UPDATE ON SEQUENCE public.library_usage_log_id_seq TO authenticated;
REVOKE ALL ON SEQUENCE public.library_usage_log_id_seq FROM service_role; GRANT UPDATE ON SEQUENCE public.library_usage_log_id_seq TO service_role;
REVOKE ALL ON public.memory_embeddings FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.memory_embeddings TO anon;
REVOKE ALL ON public.memory_embeddings FROM authenticated; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.memory_embeddings TO authenticated;
REVOKE ALL ON public.memory_embeddings FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.memory_embeddings TO service_role;
REVOKE ALL ON public.memory_index FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.memory_index TO anon;
REVOKE ALL ON public.memory_index FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER ON public.memory_index TO authenticated;
REVOKE ALL ON public.memory_index FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.memory_index TO service_role;
REVOKE ALL ON public.model_catalog FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.model_catalog TO anon;
REVOKE ALL ON public.model_catalog FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.model_catalog TO authenticated;
REVOKE ALL ON public.model_catalog FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.model_catalog TO service_role;
REVOKE ALL ON public.objectives FROM anon;
REVOKE ALL ON public.objectives FROM authenticated; GRANT SELECT ON public.objectives TO authenticated;
REVOKE ALL ON public.objectives FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.objectives TO service_role;
REVOKE ALL ON public.opportunities FROM anon;
REVOKE ALL ON public.opportunities FROM authenticated; GRANT SELECT ON public.opportunities TO authenticated;
REVOKE ALL ON public.opportunities FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.opportunities TO service_role;
REVOKE ALL ON public.outbox FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.outbox TO anon;
REVOKE ALL ON public.outbox FROM authenticated; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.outbox TO authenticated;
REVOKE ALL ON public.outbox FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.outbox TO service_role;
REVOKE ALL ON public.personas FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.personas TO anon;
REVOKE ALL ON public.personas FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.personas TO authenticated;
REVOKE ALL ON public.personas FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.personas TO service_role;
REVOKE ALL ON public.portfolio_allocations FROM anon;
REVOKE ALL ON public.portfolio_allocations FROM authenticated; GRANT SELECT ON public.portfolio_allocations TO authenticated;
REVOKE ALL ON public.portfolio_allocations FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.portfolio_allocations TO service_role;
REVOKE ALL ON public.project_members FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.project_members TO anon;
REVOKE ALL ON public.project_members FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.project_members TO authenticated;
REVOKE ALL ON public.project_members FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.project_members TO service_role;
REVOKE ALL ON public.project_milestones FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.project_milestones TO anon;
REVOKE ALL ON public.project_milestones FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.project_milestones TO authenticated;
REVOKE ALL ON public.project_milestones FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.project_milestones TO service_role;
REVOKE ALL ON public.project_risks FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.project_risks TO anon;
REVOKE ALL ON public.project_risks FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.project_risks TO authenticated;
REVOKE ALL ON public.project_risks FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.project_risks TO service_role;
REVOKE ALL ON public.projects FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.projects TO anon;
REVOKE ALL ON public.projects FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER ON public.projects TO authenticated;
REVOKE ALL ON public.projects FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.projects TO service_role;
REVOKE ALL ON public.revenue_engines FROM anon;
REVOKE ALL ON public.revenue_engines FROM authenticated; GRANT SELECT ON public.revenue_engines TO authenticated;
REVOKE ALL ON public.revenue_engines FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.revenue_engines TO service_role;
REVOKE ALL ON public.revenue_ledger FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.revenue_ledger TO anon;
REVOKE ALL ON public.revenue_ledger FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER ON public.revenue_ledger TO authenticated;
REVOKE ALL ON public.revenue_ledger FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.revenue_ledger TO service_role;
REVOKE ALL ON SEQUENCE public.revenue_ledger_id_seq FROM anon; GRANT UPDATE ON SEQUENCE public.revenue_ledger_id_seq TO anon;
REVOKE ALL ON SEQUENCE public.revenue_ledger_id_seq FROM authenticated; GRANT UPDATE ON SEQUENCE public.revenue_ledger_id_seq TO authenticated;
REVOKE ALL ON SEQUENCE public.revenue_ledger_id_seq FROM service_role; GRANT UPDATE ON SEQUENCE public.revenue_ledger_id_seq TO service_role;
REVOKE ALL ON public.routing_rules FROM anon;
REVOKE ALL ON public.routing_rules FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.routing_rules TO authenticated;
REVOKE ALL ON public.routing_rules FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.routing_rules TO service_role;
REVOKE ALL ON public.settings_change_log FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.settings_change_log TO anon;
REVOKE ALL ON public.settings_change_log FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER ON public.settings_change_log TO authenticated;
REVOKE ALL ON public.settings_change_log FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.settings_change_log TO service_role;
REVOKE ALL ON SEQUENCE public.settings_change_log_id_seq FROM anon; GRANT UPDATE ON SEQUENCE public.settings_change_log_id_seq TO anon;
REVOKE ALL ON SEQUENCE public.settings_change_log_id_seq FROM authenticated; GRANT UPDATE ON SEQUENCE public.settings_change_log_id_seq TO authenticated;
REVOKE ALL ON SEQUENCE public.settings_change_log_id_seq FROM service_role; GRANT UPDATE ON SEQUENCE public.settings_change_log_id_seq TO service_role;
REVOKE ALL ON public.settings_registry FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.settings_registry TO anon;
REVOKE ALL ON public.settings_registry FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.settings_registry TO authenticated;
REVOKE ALL ON public.settings_registry FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.settings_registry TO service_role;
REVOKE ALL ON public.settings_values FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.settings_values TO anon;
REVOKE ALL ON public.settings_values FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.settings_values TO authenticated;
REVOKE ALL ON public.settings_values FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.settings_values TO service_role;
REVOKE ALL ON public.system_health_snapshots FROM anon;
REVOKE ALL ON public.system_health_snapshots FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.system_health_snapshots TO authenticated;
REVOKE ALL ON public.system_health_snapshots FROM service_role; GRANT INSERT,MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.system_health_snapshots TO service_role;
REVOKE ALL ON public.task_dependencies FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.task_dependencies TO anon;
REVOKE ALL ON public.task_dependencies FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.task_dependencies TO authenticated;
REVOKE ALL ON public.task_dependencies FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.task_dependencies TO service_role;
REVOKE ALL ON public.task_events FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.task_events TO anon;
REVOKE ALL ON public.task_events FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER ON public.task_events TO authenticated;
REVOKE ALL ON public.task_events FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.task_events TO service_role;
REVOKE ALL ON SEQUENCE public.task_events_id_seq FROM anon; GRANT UPDATE ON SEQUENCE public.task_events_id_seq TO anon;
REVOKE ALL ON SEQUENCE public.task_events_id_seq FROM authenticated; GRANT UPDATE ON SEQUENCE public.task_events_id_seq TO authenticated;
REVOKE ALL ON SEQUENCE public.task_events_id_seq FROM service_role; GRANT UPDATE ON SEQUENCE public.task_events_id_seq TO service_role;
REVOKE ALL ON public.tasks FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.tasks TO anon;
REVOKE ALL ON public.tasks FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.tasks TO authenticated;
REVOKE ALL ON public.tasks FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.tasks TO service_role;
REVOKE ALL ON public.tool_calls FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.tool_calls TO anon;
REVOKE ALL ON public.tool_calls FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER ON public.tool_calls TO authenticated;
REVOKE ALL ON public.tool_calls FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.tool_calls TO service_role;
REVOKE ALL ON SEQUENCE public.tool_calls_id_seq FROM anon; GRANT UPDATE ON SEQUENCE public.tool_calls_id_seq TO anon;
REVOKE ALL ON SEQUENCE public.tool_calls_id_seq FROM authenticated; GRANT UPDATE ON SEQUENCE public.tool_calls_id_seq TO authenticated;
REVOKE ALL ON SEQUENCE public.tool_calls_id_seq FROM service_role; GRANT UPDATE ON SEQUENCE public.tool_calls_id_seq TO service_role;
REVOKE ALL ON public.tool_pins FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.tool_pins TO anon;
REVOKE ALL ON public.tool_pins FROM authenticated; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.tool_pins TO authenticated;
REVOKE ALL ON public.tool_pins FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.tool_pins TO service_role;
REVOKE ALL ON public.v_alerts_active FROM anon;
REVOKE ALL ON public.v_alerts_active FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_alerts_active TO authenticated;
REVOKE ALL ON public.v_alerts_active FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_alerts_active TO service_role;
REVOKE ALL ON public.v_approval_fatigue FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_approval_fatigue TO anon;
REVOKE ALL ON public.v_approval_fatigue FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_approval_fatigue TO authenticated;
REVOKE ALL ON public.v_approval_fatigue FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_approval_fatigue TO service_role;
REVOKE ALL ON public.v_approvals_center FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_approvals_center TO anon;
REVOKE ALL ON public.v_approvals_center FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_approvals_center TO authenticated;
REVOKE ALL ON public.v_approvals_center FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_approvals_center TO service_role;
REVOKE ALL ON public.v_audit_trail FROM anon;
REVOKE ALL ON public.v_audit_trail FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_audit_trail TO authenticated;
REVOKE ALL ON public.v_audit_trail FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_audit_trail TO service_role;
REVOKE ALL ON public.v_automation_schedules FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_automation_schedules TO anon;
REVOKE ALL ON public.v_automation_schedules FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_automation_schedules TO authenticated;
REVOKE ALL ON public.v_automation_schedules FROM service_role; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_automation_schedules TO service_role;
REVOKE ALL ON public.v_cost_breakdown FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_cost_breakdown TO anon;
REVOKE ALL ON public.v_cost_breakdown FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_cost_breakdown TO authenticated;
REVOKE ALL ON public.v_cost_breakdown FROM service_role; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_cost_breakdown TO service_role;
REVOKE ALL ON public.v_decision_log FROM anon;
REVOKE ALL ON public.v_decision_log FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_decision_log TO authenticated;
REVOKE ALL ON public.v_decision_log FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_decision_log TO service_role;
REVOKE ALL ON public.v_exec_overview FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_exec_overview TO anon;
REVOKE ALL ON public.v_exec_overview FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_exec_overview TO authenticated;
REVOKE ALL ON public.v_exec_overview FROM service_role; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_exec_overview TO service_role;
REVOKE ALL ON public.v_exec_overview_v1 FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_exec_overview_v1 TO anon;
REVOKE ALL ON public.v_exec_overview_v1 FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_exec_overview_v1 TO authenticated;
REVOKE ALL ON public.v_exec_overview_v1 FROM service_role; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_exec_overview_v1 TO service_role;
REVOKE ALL ON public.v_global_search FROM anon;
REVOKE ALL ON public.v_global_search FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_global_search TO authenticated;
REVOKE ALL ON public.v_global_search FROM service_role; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_global_search TO service_role;
REVOKE ALL ON public.v_hr_equipment_check FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_hr_equipment_check TO anon;
REVOKE ALL ON public.v_hr_equipment_check FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_hr_equipment_check TO authenticated;
REVOKE ALL ON public.v_hr_equipment_check FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_hr_equipment_check TO service_role;
REVOKE ALL ON public.v_hr_probation_queue FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_hr_probation_queue TO anon;
REVOKE ALL ON public.v_hr_probation_queue FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_hr_probation_queue TO authenticated;
REVOKE ALL ON public.v_hr_probation_queue FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_hr_probation_queue TO service_role;
REVOKE ALL ON public.v_hr_roster FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_hr_roster TO anon;
REVOKE ALL ON public.v_hr_roster FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_hr_roster TO authenticated;
REVOKE ALL ON public.v_hr_roster FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_hr_roster TO service_role;
REVOKE ALL ON public.v_library_catalog FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_library_catalog TO anon;
REVOKE ALL ON public.v_library_catalog FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_library_catalog TO authenticated;
REVOKE ALL ON public.v_library_catalog FROM service_role; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_library_catalog TO service_role;
REVOKE ALL ON public.v_live_ops FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_live_ops TO anon;
REVOKE ALL ON public.v_live_ops FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_live_ops TO authenticated;
REVOKE ALL ON public.v_live_ops FROM service_role; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_live_ops TO service_role;
REVOKE ALL ON public.v_model_stats FROM anon;
REVOKE ALL ON public.v_model_stats FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_model_stats TO authenticated;
REVOKE ALL ON public.v_model_stats FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_model_stats TO service_role;
REVOKE ALL ON public.v_morning_briefing FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_morning_briefing TO anon;
REVOKE ALL ON public.v_morning_briefing FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_morning_briefing TO authenticated;
REVOKE ALL ON public.v_morning_briefing FROM service_role; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_morning_briefing TO service_role;
REVOKE ALL ON public.v_objective_progress FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_objective_progress TO anon;
REVOKE ALL ON public.v_objective_progress FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_objective_progress TO authenticated;
REVOKE ALL ON public.v_objective_progress FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_objective_progress TO service_role;
REVOKE ALL ON public.v_opportunity_pipeline FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_opportunity_pipeline TO anon;
REVOKE ALL ON public.v_opportunity_pipeline FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_opportunity_pipeline TO authenticated;
REVOKE ALL ON public.v_opportunity_pipeline FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_opportunity_pipeline TO service_role;
REVOKE ALL ON public.v_org_graph FROM anon;
REVOKE ALL ON public.v_org_graph FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_org_graph TO authenticated;
REVOKE ALL ON public.v_org_graph FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_org_graph TO service_role;
REVOKE ALL ON public.v_org_node_detail FROM anon;
REVOKE ALL ON public.v_org_node_detail FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_org_node_detail TO authenticated;
REVOKE ALL ON public.v_org_node_detail FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_org_node_detail TO service_role;
REVOKE ALL ON public.v_org_tree FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_org_tree TO anon;
REVOKE ALL ON public.v_org_tree FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_org_tree TO authenticated;
REVOKE ALL ON public.v_org_tree FROM service_role; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_org_tree TO service_role;
REVOKE ALL ON public.v_outbox_status FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_outbox_status TO anon;
REVOKE ALL ON public.v_outbox_status FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_outbox_status TO authenticated;
REVOKE ALL ON public.v_outbox_status FROM service_role; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_outbox_status TO service_role;
REVOKE ALL ON public.v_pnl_daily FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_pnl_daily TO anon;
REVOKE ALL ON public.v_pnl_daily FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_pnl_daily TO authenticated;
REVOKE ALL ON public.v_pnl_daily FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_pnl_daily TO service_role;
REVOKE ALL ON public.v_pnl_engine FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_pnl_engine TO anon;
REVOKE ALL ON public.v_pnl_engine FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_pnl_engine TO authenticated;
REVOKE ALL ON public.v_pnl_engine FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_pnl_engine TO service_role;
REVOKE ALL ON public.v_pnl_platform FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_pnl_platform TO anon;
REVOKE ALL ON public.v_pnl_platform FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_pnl_platform TO authenticated;
REVOKE ALL ON public.v_pnl_platform FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_pnl_platform TO service_role;
REVOKE ALL ON public.v_project_command FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_project_command TO anon;
REVOKE ALL ON public.v_project_command FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_project_command TO authenticated;
REVOKE ALL ON public.v_project_command FROM service_role; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_project_command TO service_role;
REVOKE ALL ON public.v_role_slots FROM anon;
REVOKE ALL ON public.v_role_slots FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_role_slots TO authenticated;
REVOKE ALL ON public.v_role_slots FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_role_slots TO service_role;
REVOKE ALL ON public.v_snev FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_snev TO anon;
REVOKE ALL ON public.v_snev FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER,TRUNCATE ON public.v_snev TO authenticated;
REVOKE ALL ON public.v_snev FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER,TRUNCATE ON public.v_snev TO service_role;
REVOKE ALL ON public.workflow_runs FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.workflow_runs TO anon;
REVOKE ALL ON public.workflow_runs FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER ON public.workflow_runs TO authenticated;
REVOKE ALL ON public.workflow_runs FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.workflow_runs TO service_role;
REVOKE ALL ON public.workflow_steps FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.workflow_steps TO anon;
REVOKE ALL ON public.workflow_steps FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER ON public.workflow_steps TO authenticated;
REVOKE ALL ON public.workflow_steps FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.workflow_steps TO service_role;
REVOKE ALL ON public.workflows FROM anon; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.workflows TO anon;
REVOKE ALL ON public.workflows FROM authenticated; GRANT MAINTAIN,REFERENCES,SELECT,TRIGGER ON public.workflows TO authenticated;
REVOKE ALL ON public.workflows FROM service_role; GRANT MAINTAIN,REFERENCES,TRIGGER ON public.workflows TO service_role;

-- COLUMN-LEVEL grant restore: REVOKE ALL ON TABLE also wipes column ACLs
-- (measured 2026-07-17: pg_attribute.attacl on intents emptied by the pass
-- above, caught by tests/phase8 command-bar privilege-wall regression).
-- The chain's only column grant is the dashboard command-bar wall from
-- 20260710000016_intents_intake.sql:35 — re-granted here so the posture
-- survives this file on every environment.
GRANT INSERT (text, lang, source, actor) ON public.intents TO authenticated;

-- DEFAULT PRIVILEGES parity (measured live pg_default_acl, grantor postgres,
-- schema public): future TABLES carry no DML for the stack roles (TRUNCATE/
-- REFERENCES/TRIGGER/MAINTAIN retained — live's exact posture), future
-- SEQUENCES keep only UPDATE, future FUNCTIONS lose default EXECUTE.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLES FROM anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE SELECT, USAGE ON SEQUENCES FROM anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM anon, authenticated, service_role;

COMMIT;

-- ROLLBACK: re-run the supabase image default GRANT set for the three roles
-- (or restore from a pre-migration snapshot); the REVOKE/GRANT pairs above are
-- the authoritative record of the intended posture.
