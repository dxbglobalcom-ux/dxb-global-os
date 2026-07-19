-- CEO Chat Board (complaint ledger C1+C7+C10, CEO orders 2026-07-19):
-- the CEO talks to Hamza (the orchestrator) BEFORE anything is dispatched —
-- planning, idea exchange, questions. Text lane now; the voice line (R3.x)
-- joins the same board later. Dispatch happens only on an explicit CEO
-- action from the conversation, never from a greeting.
--
-- Architecture: dashboard is a projection client (PHASE-08 LOCKED — no LLM
-- surface there); pending CEO rows drain in the resident scheduler
-- (chat.drain self-chain, the voice.drain idiom). Broadcast channel dxb:chat
-- (broadcast_changes only — postgres_changes forbidden project-wide).

create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('ceo','hamza')),
  content text not null,
  -- plan mode: Hamza discusses and drafts a plan, NOTHING dispatches.
  mode text not null default 'normal' check (mode in ('normal','plan')),
  -- lifecycle of a CEO row: pending → answered | failed. Hamza rows are
  -- terminal on insert ('answered').
  status text not null default 'pending' check (status in ('pending','answered','failed')),
  error text,
  -- set when the CEO explicitly dispatched this exchange as an intent
  intent_id uuid references intents(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_chat_messages_pending on chat_messages (created_at)
  where role = 'ceo' and status = 'pending';
create index idx_chat_messages_created on chat_messages (created_at desc);

alter table chat_messages enable row level security;
-- Base grants (RLS filters on top of these): the CEO session reads the board
-- and writes his own lane; column list on insert mirrors the intents idiom
-- (nothing beyond content/mode is writable from the dashboard session).
grant select on chat_messages to authenticated;
grant insert (role, content, mode) on chat_messages to authenticated;
-- The CEO (sole authenticated human) reads and writes his own lane; Hamza
-- rows are written by the resident worker over the service connection
-- (bypasses RLS), same trust model as intents.
create policy chat_ceo_read on chat_messages for select to authenticated using (true);
create policy chat_ceo_write on chat_messages for insert to authenticated
  with check (role = 'ceo');

create or replace function broadcast_chat_messages() returns trigger as $$
begin
  perform realtime.broadcast_changes(
    'dxb:chat', TG_OP, TG_OP, TG_TABLE_NAME, TG_TABLE_SCHEMA, NEW, OLD);
  return new;
end $$ language plpgsql security definer;

create trigger trg_broadcast_chat_messages after insert or update on chat_messages
  for each row execute function broadcast_chat_messages();

comment on table chat_messages is
  'CEO Chat Board with Hamza (C1/C7/C10 2026-07-19): conversation-first lane; dispatch is an explicit action, never implicit.';
