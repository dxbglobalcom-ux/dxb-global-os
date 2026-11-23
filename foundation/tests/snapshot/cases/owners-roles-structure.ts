import type { Step } from "../../roles/fixtures/the-run.ts";
import { aChange, asTheInstaller, asTheOwner } from "../fixtures/changes.ts";
import { asTheSuperuser } from "../fixtures/superuser.ts";

// SPEC §6 B.8, the second part: an owner in os, a role's attribute, a membership, and the structure of os's own
// objects — each difference written down whole from SPEC §4.3.

const NEXT_TICKET = "function os.next_ticket(text,double precision) kind f owner os_owner language sql returns text definer f volatility v strict f parallel u leakproof f cost 100 rows 0";
const READER = "role os_reader super f inherit f createrole f createdb f login t replication f bypassrls f connlimit -1 validuntil -";
const PARTS = "relation os.parts kind r owner os_owner persistence p rowsecurity t force t replident d options autovacuum_enabled=false,fillfactor=90";
const TRIGGER = "trigger os.parts parts_touch enabled O def CREATE TRIGGER parts_touch BEFORE INSERT OR UPDATE ON os.parts FOR EACH ROW EXECUTE FUNCTION os.parts_touch()";
const QTY = "column os.parts 3 qty type integer not-null t identity - generated - collation - default 1";
const TICKETS = "sequence os.ticket_seq type bigint start 100 increment 5 min 1 max 9223372036854775807 cache 1 cycle f owned-by -";

export function ownersRolesStructure(step: Step): void {
  aChange(step, "B.8 **the owner of one object in os** (the bench's superuser): its function line and its stored grant, the owner's name in each", {
    change: () => asTheSuperuser("alter function os.next_ticket(text, double precision) owner to os_engine"),
    undo: () => asTheSuperuser("alter function os.next_ticket(text, double precision) owner to os_owner"),
    expectedOnly: [NEXT_TICKET, "grant function os.next_ticket(text,double precision) to os_owner EXECUTE option f by os_owner stored"],
    actualOnly: [
      NEXT_TICKET.replace(" owner os_owner ", " owner os_engine "),
      "grant function os.next_ticket(text,double precision) to os_engine EXECUTE option f by os_engine stored",
    ],
  });

  aChange(step, "B.8 a role's attribute: the role line, connlimit -1 out, 3 in", {
    change: () => asTheInstaller("alter role os_reader connection limit 3"),
    undo: () => asTheInstaller("alter role os_reader connection limit -1"),
    expectedOnly: [READER],
    actualOnly: [READER.replace(" connlimit -1 ", " connlimit 3 ")],
  });

  aChange(step, "B.8 a membership: one member line in", {
    change: () => asTheInstaller("grant os_reader to os_engine"),
    undo: () => asTheInstaller("revoke os_reader from os_engine"),
    actualOnly: ["member os_reader has os_engine admin f inherit f set t by postgres"],
  });

  aChange(step, "B.8 a trigger disabled: the trigger line, enabled O out, D in", {
    change: () => asTheOwner("alter table os.parts disable trigger parts_touch"),
    undo: () => asTheOwner("alter table os.parts enable trigger parts_touch"),
    expectedOnly: [TRIGGER],
    actualOnly: [TRIGGER.replace(" enabled O ", " enabled D ")],
  });

  aChange(step, "B.8 row security off: the relation line, rowsecurity t out, f in", {
    change: () => asTheOwner("alter table os.parts disable row level security"),
    undo: () => asTheOwner("alter table os.parts enable row level security"),
    expectedOnly: [PARTS],
    actualOnly: [PARTS.replace(" rowsecurity t ", " rowsecurity f ")],
  });

  aChange(step, "B.8 force off: the relation line, force t out, f in", {
    change: () => asTheOwner("alter table os.parts no force row level security"),
    undo: () => asTheOwner("alter table os.parts force row level security"),
    expectedOnly: [PARTS],
    actualOnly: [PARTS.replace(" force t ", " force f ")],
  });

  aChange(step, "B.8 an index dropped: its index line out", {
    change: () => asTheOwner("drop index os.parts_kind_idx"),
    undo: () => asTheOwner("create index parts_kind_idx on os.parts (kind) where qty > 1"),
    expectedOnly: ["index os.parts valid t replident f clustered f def CREATE INDEX parts_kind_idx ON os.parts USING btree (kind) WHERE (qty > 1)"],
  });

  aChange(step, "B.8 a constraint dropped: its constraint line out", {
    change: () => asTheOwner("alter table os.parts drop constraint parts_qty_check"),
    undo: () => asTheOwner("alter table os.parts add constraint parts_qty_check check (qty > 0)"),
    expectedOnly: ["constraint os.parts parts_qty_check type c deferrable f deferred f validated t def CHECK ((qty > 0))"],
  });

  aChange(step, "B.8 a column's default: the column line, default 1 out, 2 in", {
    change: () => asTheOwner("alter table os.parts alter column qty set default 2"),
    undo: () => asTheOwner("alter table os.parts alter column qty set default 1"),
    expectedOnly: [QTY],
    actualOnly: [QTY.replace(/ default 1$/, " default 2")],
  });

  aChange(step, "B.8 the vocabulary's comment, its mark taken away: the comment line changes and the table's reference lines go", {
    change: () => asTheOwner("comment on table os.kinds is 'kinds of parts'"),
    undo: () => asTheOwner("comment on table os.kinds is 'vocabulary: kinds of parts'"),
    expectedOnly: [
      "comment table os.kinds 00001|vocabulary: kinds of parts",
      'reference os.kinds {"name": "bolt", "label": "Bolt", "weight": 0.1}',
      'reference os.kinds {"name": "nut", "label": "Nut", "weight": 0.0000001}',
      'reference os.kinds {"name": "washer", "label": "Washer", "weight": 0.30000000000000004}',
    ],
    actualOnly: ["comment table os.kinds 00001|kinds of parts"],
  });

  aChange(step, "B.8 a sequence's increment: the sequence line, increment 5 out, 7 in", {
    change: () => asTheOwner("alter sequence os.ticket_seq increment by 7"),
    undo: () => asTheOwner("alter sequence os.ticket_seq increment by 5"),
    expectedOnly: [TICKETS],
    actualOnly: [TICKETS.replace(" increment 5 ", " increment 7 ")],
  });

  aChange(step, "B.8 the view: the one view line that changed, out and in", {
    change: () => asTheOwner("create or replace view os.parts_view as select id, ratio8 * 3 as twice from os.parts where qty > 0"),
    undo: () => asTheOwner("create or replace view os.parts_view as select id, ratio8 * 2 as twice from os.parts where qty > 0"),
    expectedOnly: ["view os.parts_view 00002|    (ratio8 * (2)::double precision) AS twice"],
    actualOnly: ["view os.parts_view 00002|    (ratio8 * (3)::double precision) AS twice"],
  });

  const STRAY_GRANTS = ["DELETE", "INSERT", "MAINTAIN", "REFERENCES", "SELECT", "TRIGGER", "TRUNCATE", "UPDATE"].map(
    (privilege) => `grant relation os.stray to os_owner ${privilege} option f by os_owner stored`,
  );
  aChange(step, "B.8 a table nobody's file made: its relation, its column, and its grants — the owner's stored, os_reader's by the default privilege", {
    change: () => asTheOwner("create table os.stray (id integer)"),
    undo: () => asTheOwner("drop table os.stray"),
    actualOnly: [
      "relation os.stray kind r owner os_owner persistence p rowsecurity f force f replident d options -",
      "column os.stray 1 id type integer not-null f identity - generated - collation - default -",
      ...STRAY_GRANTS,
      "grant relation os.stray to os_reader SELECT option f by os_owner stored",
    ],
  });
}
