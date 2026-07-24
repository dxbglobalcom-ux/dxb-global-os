-- Ledger 9c (C9 atomic: "How is it deleted/reset?"): the cost data reset
-- door. Deletes cost_ledger rows STRICTLY BEFORE Berlin midnight of the
-- given day — a period close, not a row-picker (row-level cleanup already
-- exists via task purge cascades). Same audited-door discipline as
-- control_records_purge: SECURITY DEFINER, one audit_log row per call.
-- cost_ledger has REVOKE DELETE (20260707000004); this fn is the only door.

create or replace function control_cost_reset(
  p_before date,
  p_rationale text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_actor text := coalesce(auth.jwt() ->> 'email', 'ceo');
  v_cutoff timestamptz;
  v_count int := 0;
begin
  if p_before is null then
    raise exception 'VALIDATION_FAILED: cutoff day required';
  end if;
  -- Berlin "today" may be deleted up to its midnight only — a cutoff beyond
  -- today would silently include rows that do not exist yet.
  if p_before > (now() at time zone 'Europe/Berlin')::date then
    raise exception 'VALIDATION_FAILED: cutoff must not be in the future';
  end if;

  v_cutoff := p_before::timestamp at time zone 'Europe/Berlin';

  delete from cost_ledger where created_at < v_cutoff;
  get diagnostics v_count = row_count;

  insert into audit_log (actor, actor_type, action, payload)
  values (
    v_actor, 'ceo', 'costs.reset',
    jsonb_build_object(
      'before', p_before::text,
      'purged', v_count,
      'rationale', coalesce(p_rationale, 'CEO cost data reset')
    )
  );

  return jsonb_build_object('ok', true, 'purged', v_count, 'before', p_before::text);
end;
$fn$;

revoke all on function control_cost_reset(date, text) from public, anon;
grant execute on function control_cost_reset(date, text) to authenticated, service_role;
