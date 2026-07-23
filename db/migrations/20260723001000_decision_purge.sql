-- Decision Logs join the C4/C18 list-page standard (CEO order 2026-07-23):
-- selection + audited bulk removal on /gov/decisions. decision_log ids are
-- bigint (identity), so the door is a dedicated fn rather than a new entity
-- inside control_records_purge(uuid[]).
--
-- Registered adaptation: the earlier "decision_log is a permanent ledger"
-- stance (20260719005000) is superseded for CEO-initiated cleanup — the CEO
-- may remove rows; every removal leaves an audit_log record with the ids.

create or replace function control_decision_purge(
  p_ids bigint[],
  p_rationale text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_actor text := coalesce(auth.jwt() ->> 'email', 'ceo');
  v_count int := 0;
begin
  if p_ids is null or array_length(p_ids, 1) is null then
    raise exception 'VALIDATION_FAILED: empty id list';
  end if;
  if array_length(p_ids, 1) > 500 then
    raise exception 'VALIDATION_FAILED: max 500 ids per call';
  end if;

  delete from decision_log where id = any(p_ids);
  get diagnostics v_count = row_count;

  insert into audit_log (actor, actor_type, action, payload)
  values (
    v_actor, 'ceo', 'records.purge',
    jsonb_build_object(
      'entity', 'decision',
      'requested', array_length(p_ids, 1),
      'purged', v_count,
      'ids', to_jsonb(p_ids),
      'rationale', coalesce(p_rationale, 'CEO list cleanup')
    )
  );

  return jsonb_build_object('ok', true, 'purged', v_count);
end;
$fn$;

revoke all on function control_decision_purge(bigint[], text) from public;
grant execute on function control_decision_purge(bigint[], text) to authenticated, service_role;
