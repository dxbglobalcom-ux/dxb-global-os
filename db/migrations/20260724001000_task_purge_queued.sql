-- Registered adaptation (CEO complaint 2026-07-24, in-chat: "queued'lar
-- secilemiyor, silemiyoruz"): the task purge door widens from terminal-only
-- (failed/returned/done) to ALSO cover never-started rows (queued/inbox) --
-- a queued mistake the CEO wants gone must be removable from the list page.
-- Live states (claimed/running/review/awaiting_approval) stay untouchable:
-- work in flight can never silently vanish. Same audited door, same 500-id
-- cap; only the task-branch status filter changes.
CREATE OR REPLACE FUNCTION public.control_records_purge(p_entity text, p_ids uuid[], p_rationale text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_actor text := coalesce(auth.jwt() ->> 'email', 'ceo');
  v_count int := 0;
begin
  if p_entity not in ('task','alert','intent','approval','voice_call') then
    raise exception 'VALIDATION_FAILED: unknown entity %', p_entity;
  end if;
  if p_ids is null or array_length(p_ids, 1) is null then
    raise exception 'VALIDATION_FAILED: empty id list';
  end if;
  if array_length(p_ids, 1) > 500 then
    raise exception 'VALIDATION_FAILED: max 500 ids per call';
  end if;

  if p_entity = 'task' then
    create temp table _purge_tasks on commit drop as
      select id from tasks
      where id = any(p_ids) and status in ('failed','returned','done','queued','inbox');
    delete from tool_calls where run_id in (select id from agent_runs where task_id in (select id from _purge_tasks));
    delete from hook_violations where run_id in (select id from agent_runs where task_id in (select id from _purge_tasks));
    delete from file_changes where run_id in (select id from agent_runs where task_id in (select id from _purge_tasks));
    delete from library_usage_log where run_id in (select id from agent_runs where task_id in (select id from _purge_tasks));
    update memory_index set run_id = null where run_id in (select id from agent_runs where task_id in (select id from _purge_tasks));
    update decision_log set run_id = null where run_id in (select id from agent_runs where task_id in (select id from _purge_tasks));
    update approvals set reanalysis_run_id = null where reanalysis_run_id in (select id from agent_runs where task_id in (select id from _purge_tasks));
    delete from alerts where task_id in (select id from _purge_tasks)
      or run_id in (select id from agent_runs where task_id in (select id from _purge_tasks));
    delete from cost_ledger where task_id in (select id from _purge_tasks);
    delete from task_events where task_id in (select id from _purge_tasks);
    delete from outbox where approval_id in (select id from approvals where task_id in (select id from _purge_tasks));
    -- decision_log is a permanent ledger: keep the rows, detach the reference
    update decision_log set approval_id = null
      where approval_id in (select id from approvals where task_id in (select id from _purge_tasks));
    delete from approvals where task_id in (select id from _purge_tasks);
    delete from crm_requests where task_id in (select id from _purge_tasks);
    delete from task_dependencies where task_id in (select id from _purge_tasks)
      or depends_on in (select id from _purge_tasks);
    delete from agent_runs where task_id in (select id from _purge_tasks);
    update tasks set parent_task_id = null where parent_task_id in (select id from _purge_tasks);
    delete from tasks where id in (select id from _purge_tasks);
    get diagnostics v_count = row_count;
  elsif p_entity = 'alert' then
    delete from alerts where id = any(p_ids);
    get diagnostics v_count = row_count;
  elsif p_entity = 'approval' then
    -- terminal-only, like tasks: a pending gate still guards an action —
    -- the UI chains bulk-reject first, so nothing disappears while live.
    create temp table _purge_approvals on commit drop as
      select id from approvals
      where id = any(p_ids) and status in ('approved','rejected','expired');
    delete from outbox where approval_id in (select id from _purge_approvals);
    -- decision_log is a permanent ledger: keep the rows, detach the reference
    update decision_log set approval_id = null
      where approval_id in (select id from _purge_approvals);
    delete from approvals where id in (select id from _purge_approvals);
    get diagnostics v_count = row_count;
  elsif p_entity = 'voice_call' then
    -- voice history rows: terminal calls only (ended/failed) — a call
    -- still in flight is never deletable from a list checkbox.
    delete from voice_calls where id = any(p_ids)
      and status in ('ended','failed');
    get diagnostics v_count = row_count;
  else
    delete from intents where id = any(p_ids)
      and status in ('dispatched','failed_dispatch','done','failed');
    get diagnostics v_count = row_count;
  end if;

  insert into audit_log (actor, actor_type, action, payload)
  values (
    v_actor, 'ceo', 'records.purge',
    jsonb_build_object(
      'entity', p_entity,
      'requested', array_length(p_ids, 1),
      'purged', v_count,
      'ids', to_jsonb(p_ids),
      'rationale', coalesce(p_rationale, 'CEO list cleanup')
    )
  );

  return jsonb_build_object('ok', true, 'purged', v_count);
end;
$function$

;
