-- broadcast_triggers: Broadcast-from-DB for the CEO cockpit (master-plan PHASE-08 §3 kalıp, 3 tabloya uygulanır).
-- ADAPT (recorded in 08-01-PLAN frontmatter): logical slot 0011 was consumed by tool_pins;
-- filename follows Supabase CLI timestamp naming — pattern content unchanged.
-- Channels (LOCKED naming): dxb:task_events / dxb:approvals / dxb:cost_ledger.
-- postgres_changes is FORBIDDEN project-wide (Pattern 6) — broadcast_changes only.

CREATE OR REPLACE FUNCTION broadcast_task_events() RETURNS trigger AS $$
BEGIN
  PERFORM realtime.broadcast_changes(
    'dxb:task_events', TG_OP, TG_OP, TG_TABLE_NAME, TG_TABLE_SCHEMA, NEW, OLD);
  RETURN NEW;
END $$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER trg_broadcast_task_events AFTER INSERT ON task_events
  FOR EACH ROW EXECUTE FUNCTION broadcast_task_events();

CREATE OR REPLACE FUNCTION broadcast_approvals() RETURNS trigger AS $$
BEGIN
  PERFORM realtime.broadcast_changes(
    'dxb:approvals', TG_OP, TG_OP, TG_TABLE_NAME, TG_TABLE_SCHEMA, NEW, OLD);
  RETURN NEW;
END $$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER trg_broadcast_approvals AFTER INSERT OR UPDATE ON approvals
  FOR EACH ROW EXECUTE FUNCTION broadcast_approvals();

CREATE OR REPLACE FUNCTION broadcast_cost_ledger() RETURNS trigger AS $$
BEGIN
  PERFORM realtime.broadcast_changes(
    'dxb:cost_ledger', TG_OP, TG_OP, TG_TABLE_NAME, TG_TABLE_SCHEMA, NEW, OLD);
  RETURN NEW;
END $$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER trg_broadcast_cost_ledger AFTER INSERT ON cost_ledger
  FOR EACH ROW EXECUTE FUNCTION broadcast_cost_ledger();

-- Channel authorization: joining a private Broadcast channel is a SELECT on
-- realtime.messages under RLS. Only the authenticated CEO may read dxb:% topics;
-- anon has no policy and stays default-deny.
CREATE POLICY dxb_ceo_broadcast_read ON realtime.messages
  FOR SELECT TO authenticated
  USING (realtime.topic() LIKE 'dxb:%' AND extension = 'broadcast');
