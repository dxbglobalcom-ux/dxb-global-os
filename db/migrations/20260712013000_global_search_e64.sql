-- ============================================================================
-- 0028 — E6.4 Global Search + intent audit chain (GAP-07)
-- CEO_COMMAND_CENTER_SPEC §4 (v_global_search) + §8 (GET /api/search) +
-- IMPLEMENTATION_ROADMAP E6.4 (intent → classification → task → audit chain
-- watched from the screen).
--
-- Registered adaptations (master-plan fidelity — visible, never silent):
--   A1. Spec §4 lists "org_units" — the live schema's organizational unit
--       table is `departments` (0001 base schema); mapped 1:1.
--   A2. Spec §4 lists "employees" — live runtime employees are `agents`
--       rows (persona-backed, HR-factory born); mapped 1:1.
--   A3. Detail routes (/org/employees/[id], /ops/tasks/[id]) are not built
--       yet (E12 drill-down family). Search hrefs land on the module LIST
--       page with ?q=<term> preseeded so results are navigable TODAY and
--       deepen automatically when detail pages ship. No dead links.
--   A4. `workflows` has no timestamp column — updated_at is NULL for that
--       entity type; ordering falls back to match position (route-side).
--
-- Intent audit triggers close the roadmap's DoD chain: every intents INSERT
-- (CEO submit) and every terminal transition (dispatched / failed_dispatch)
-- lands in append-only audit_log, so /gov/audit shows the full journey.
-- Trigger fn is SECURITY DEFINER: the dashboard session has no audit_log
-- INSERT grant by design — audit writes must not depend on caller grants.
--
-- Idempotent: CREATE OR REPLACE + DROP TRIGGER IF EXISTS. Run twice = same
-- end state.
-- ============================================================================

-- ── v_global_search — 10 entity families (spec §4 row "v_global_search") ──
create or replace view public.v_global_search as
  select
    'employee'::text                          as entity_type,
    a.id::text                                as entity_id,
    a.slug                                    as label,
    a.department || ' · ' || a.role           as sublabel,
    '/org/employees?q=' || a.slug             as href,
    lower(a.slug || ' ' || a.department || ' ' || a.role) as haystack,
    a.updated_at                              as updated_at
  from public.agents a
  union all
  select
    'department', d.id::text, d.display_name, d.slug,
    '/org/departments?q=' || d.slug,
    lower(d.display_name || ' ' || d.slug),
    d.created_at
  from public.departments d
  union all
  select
    'company', c.id::text, c.name, coalesce(c.mission, c.slug),
    '/org/companies?q=' || c.slug,
    lower(c.name || ' ' || c.slug || ' ' || coalesce(c.mission, '')),
    c.created_at
  from public.companies c
  union all
  select
    'project', p.id::text, p.name, coalesce(p.purpose, p.status),
    '/ops/projects?q=' || p.slug,
    lower(p.name || ' ' || p.slug || ' ' || coalesce(p.purpose, '')),
    p.created_at
  from public.projects p
  union all
  select
    'task', t.id::text, left(t.objective, 120), t.department || ' · ' || t.status,
    '/ops/tasks?q=' || t.id::text,
    lower(t.objective || ' ' || t.department || ' ' || t.status),
    t.updated_at
  from public.tasks t
  union all
  select
    'workflow', w.id::text, w.name, w.slug || ' · ' || w.risk,
    '/ops/workflows?q=' || w.slug,
    lower(w.name || ' ' || w.slug),
    null::timestamptz
  from public.workflows w
  union all
  select
    'approval', ap.id::text, ap.action_type, ap.status || ' · ' || ap.risk_class,
    '/approvals?q=' || ap.id::text,
    lower(ap.action_type || ' ' || ap.status || ' ' || ap.risk_class),
    ap.created_at
  from public.approvals ap
  union all
  select
    'decision', dl.id::text, left(dl.decision, 120), dl.decided_by,
    '/gov/decisions?q=' || dl.id::text,
    lower(dl.decision || ' ' || coalesce(dl.rationale, '') || ' ' || dl.decided_by),
    dl.created_at
  from public.decision_log dl
  union all
  select
    'library', li.id::text, li.name, li.kind || ' · ' || coalesce(ld.slug, '—'),
    '/ai/library?q=' || li.name,
    lower(li.name || ' ' || li.kind || ' ' || coalesce(ld.slug, '')),
    li.updated_at
  from public.library_items li
  left join public.departments ld on ld.id = li.owner_dept
  union all
  select
    'audit', al.id::text, al.action, al.actor || ' · ' || al.actor_type,
    '/gov/audit?q=' || al.action,
    lower(al.action || ' ' || al.actor),
    al.created_at
  from public.audit_log al;

comment on view public.v_global_search is
  'E6.4 command-palette global search (CC-SPEC §4). READ-ONLY union of 10 entity families; ranked/limited route-side (LIMIT 50, CC-SPEC §21).';

revoke all on public.v_global_search from anon;
grant select on public.v_global_search to authenticated, service_role;

-- ── Intent audit chain (roadmap E6.4 DoD: submit → audit row visible) ──────
create or replace function public.fn_intents_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into audit_log (actor, actor_type, action, payload)
    values (
      new.actor,
      case when new.actor = 'ceo' then 'ceo' else 'system' end,
      'intent.submitted',
      jsonb_build_object(
        'intent_id', new.id, 'text', new.text,
        'lang', new.lang, 'source', new.source
      )
    );
  elsif tg_op = 'UPDATE'
    and new.status is distinct from old.status
    and new.status in ('dispatched', 'failed_dispatch') then
    insert into audit_log (actor, actor_type, action, task_id, payload)
    values (
      'kernel', 'system',
      'intent.' || new.status,
      new.task_ids[1],
      jsonb_build_object(
        'intent_id', new.id, 'task_ids', new.task_ids, 'error', new.error
      )
    );
  end if;
  return new;
end;
$$;

revoke all on function public.fn_intents_audit() from public, anon, authenticated;

drop trigger if exists trg_intents_audit_ins on public.intents;
create trigger trg_intents_audit_ins
  after insert on public.intents
  for each row execute function public.fn_intents_audit();

drop trigger if exists trg_intents_audit_upd on public.intents;
create trigger trg_intents_audit_upd
  after update on public.intents
  for each row execute function public.fn_intents_audit();
