-- C5 remediation (CEO complaint ledger 2026-07-19): the tasks screen and the
-- approval center told different truths — qa.ts moves a task to
-- awaiting_approval without creating an approvals row, so "Onay bekliyor"
-- tasks existed while the approval center showed "Bekleyen (0)".
--
-- Invariant restored at the DATABASE level (code paths can never diverge
-- again): whenever a task enters awaiting_approval and holds no undecided
-- approval row, a pending approval materializes in the same transaction.

create or replace function fn_task_awaiting_approval_bridge()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'awaiting_approval'
     and (old.status is distinct from new.status)
     and not exists (
       select 1 from approvals a
       where a.task_id = new.id and a.status in ('draft','pending')
     )
  then
    insert into approvals (
      task_id, action_type, payload, risk_class, status,
      department_id, purpose, operation_class, reasoning_summary
    )
    values (
      new.id,
      'task_completion',
      jsonb_build_object(
        'objective', new.objective,
        'result_excerpt', left(coalesce(new.result::text, ''), 2000),
        'source', 'fn_task_awaiting_approval_bridge'
      ),
      case when new.approval_class in ('money_out','contract','identity') then 'high' else 'medium' end,
      'pending',
      (select d.id from departments d where d.slug = new.department limit 1),
      'Task finished its work and waits for the CEO''s go-ahead',
      case when new.approval_class in ('money_out','contract','identity','high_cost')
           then new.approval_class else 'other' end,
      'Auto-created gate: quality check passed; approval_class '''
        || coalesce(new.approval_class, 'default')
        || ''' requires a human decision before the result ships.'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_task_awaiting_approval_bridge on tasks;
create trigger trg_task_awaiting_approval_bridge
  after update of status on tasks
  for each row
  execute function fn_task_awaiting_approval_bridge();

comment on function fn_task_awaiting_approval_bridge() is
  'C5 (2026-07-19): tasks in awaiting_approval always have a pending approvals row — the two CEO surfaces can never contradict each other again.';
