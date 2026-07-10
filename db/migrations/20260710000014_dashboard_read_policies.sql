-- dashboard_read_policies: authenticated CEO read surface for the cockpit
-- (master-plan PHASE-08 LOCKED: "RLS: authenticated CEO rolü read, yazım
-- YALNIZ intents+approval kararları"). ADAPT (08-02, recorded): operational
-- tables were RLS-enabled with zero policies since Phase 3 (backend uses
-- postgres/service paths) — the dashboard's PostgREST reads need explicit
-- SELECT grants. Single-user system: authenticated == the CEO.
-- Deliberately EXCLUDED (least privilege, not cockpit surface): outbox,
-- relations, routing_rules, tool_pins, memory_index, memory_embeddings.
-- Write policies arrive with their owning plans (approval decisions 08-03,
-- intents 08-05, CRM CEO-editable fields 08-06). ⛔ RLS change: Fable-only.
-- NOTE: RLS policies alone are not enough — PostgREST also needs table-level
-- SELECT grants (auto_expose is off in this project; anon gets NOTHING).

GRANT SELECT ON tasks, task_events, agents, departments, approvals,
  cost_ledger, audit_log, budget_state, crm_clients, crm_contacts,
  crm_deals, crm_requests TO authenticated;

CREATE POLICY tasks_ceo_read ON tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY task_events_ceo_read ON task_events FOR SELECT TO authenticated USING (true);
CREATE POLICY agents_ceo_read ON agents FOR SELECT TO authenticated USING (true);
CREATE POLICY departments_ceo_read ON departments FOR SELECT TO authenticated USING (true);
CREATE POLICY approvals_ceo_read ON approvals FOR SELECT TO authenticated USING (true);
CREATE POLICY cost_ledger_ceo_read ON cost_ledger FOR SELECT TO authenticated USING (true);
CREATE POLICY audit_log_ceo_read ON audit_log FOR SELECT TO authenticated USING (true);
CREATE POLICY budget_state_ceo_read ON budget_state FOR SELECT TO authenticated USING (true);
CREATE POLICY crm_clients_ceo_read ON crm_clients FOR SELECT TO authenticated USING (true);
CREATE POLICY crm_contacts_ceo_read ON crm_contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY crm_deals_ceo_read ON crm_deals FOR SELECT TO authenticated USING (true);
CREATE POLICY crm_requests_ceo_read ON crm_requests FOR SELECT TO authenticated USING (true);
