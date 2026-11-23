// The snapshot's lines of what a covered relation holds (piece 6a's SPEC §4.3): `constraint`, `index`, `trigger`,
// `trigger-internal`, `rule`, `policy`, `policy-using`, `policy-check`. Each definition is the server's own deparse,
// unchanged.
import type { Client } from "pg";
import { flag, inATemporarySchema, linesOf, orDash, role } from "./sql.ts";
import type { Covered } from "./sql.ts";

// `$1` is the covered schemas throughout: a part stands where its relation `c` stands.
const OF_A_COVERED_RELATION = "c.relnamespace = any ($1::pg_catalog.oid[])";

// Each table constraint; a domain's are `domain-constraint` lines (types.ts).
const CONSTRAINTS = `
select 'constraint ' || k.conrelid::pg_catalog.regclass::pg_catalog.text || ' ' || pg_catalog.quote_ident(k.conname)
       || ' type ' || k.contype::pg_catalog.text || ' deferrable ' || ${flag("k.condeferrable")} || ' deferred ' || ${flag("k.condeferred")}
       || ' validated ' || ${flag("k.convalidated")} || ' def ' || pg_catalog.pg_get_constraintdef(k.oid) as line
  from pg_catalog.pg_constraint k
  join pg_catalog.pg_class c on c.oid = k.conrelid
 where ${OF_A_COVERED_RELATION}`;

// Each index, said by its table and its definition, which names it — and whether it is the table's replica identity
// or the one it is clustered on (SPEC §11.1 row 2), which no definition says.
const INDEXES = `
select 'index ' || i.indrelid::pg_catalog.regclass::pg_catalog.text || ' valid ' || ${flag("i.indisvalid")}
       || ' replident ' || ${flag("i.indisreplident")} || ' clustered ' || ${flag("i.indisclustered")}
       || ' def ' || pg_catalog.pg_get_indexdef(i.indexrelid) as line
  from pg_catalog.pg_index i
  join pg_catalog.pg_class c on c.oid = i.indrelid
 where ${OF_A_COVERED_RELATION}`;

// Each trigger but those the server makes for a constraint of its own.
const TRIGGERS = `
select 'trigger ' || g.tgrelid::pg_catalog.regclass::pg_catalog.text || ' ' || pg_catalog.quote_ident(g.tgname)
       || ' enabled ' || g.tgenabled::pg_catalog.text || ' def ' || pg_catalog.pg_get_triggerdef(g.oid) as line
  from pg_catalog.pg_trigger g
  join pg_catalog.pg_class c on c.oid = g.tgrelid
 where ${OF_A_COVERED_RELATION} and not g.tgisinternal`;

// Each trigger the server made for a constraint, when it is not enabled as it was made (SPEC §11.1 row 1): `disable
// trigger all` silences a foreign key, and its constraint line says nothing of it. Said by its constraint — `-` when
// it hangs on none — and its function as `regprocedure` spells it, never by its name: the server generates the name
// from an oid, and a build makes another.
const SILENCED_INTERNAL_TRIGGERS = `
select 'trigger-internal ' || g.tgrelid::pg_catalog.regclass::pg_catalog.text
       || ' ' || ${orDash("(select pg_catalog.quote_ident(k.conname) from pg_catalog.pg_constraint k where k.oid = g.tgconstraint)")}
       || ' ' || g.tgfoid::pg_catalog.regprocedure::pg_catalog.text || ' enabled ' || g.tgenabled::pg_catalog.text as line
  from pg_catalog.pg_trigger g
  join pg_catalog.pg_class c on c.oid = g.tgrelid
 where ${OF_A_COVERED_RELATION} and g.tgisinternal and g.tgenabled <> 'O'`;

// Each rule but the `_RETURN` rule a view or a materialized view is made of: its definition is the `view` lines.
const RULES = `
select 'rule ' || w.ev_class::pg_catalog.regclass::pg_catalog.text || ' ' || pg_catalog.quote_ident(w.rulename)
       || ' enabled ' || w.ev_enabled::pg_catalog.text || ' def ' || pg_catalog.pg_get_ruledef(w.oid) as line
  from pg_catalog.pg_rewrite w
  join pg_catalog.pg_class c on c.oid = w.ev_class
 where ${OF_A_COVERED_RELATION} and not (w.rulename = '_RETURN' and c.relkind in ('v', 'm'))`;

// The policies read: each on a covered relation, and each anywhere that names a chain role (`$2`) — what a login is
// let see or write outside `os` is a chain role's meaning too (SPEC §11.1 row 3); its `outside in-policy` line stays.
// None on a temporary relation (§11.1 row 6).
const POLICIES_READ = `
  from pg_catalog.pg_policy y
  join pg_catalog.pg_class c on c.oid = y.polrelid
 where (${OF_A_COVERED_RELATION} or y.polroles && $2::pg_catalog.oid[]) and not ${inATemporarySchema("c.relnamespace")}`;

// Each policy, its roles sorted by their bytes; its predicates are lines of their own, below.
const POLICIES = `
select 'policy ' || y.polrelid::pg_catalog.regclass::pg_catalog.text || ' ' || pg_catalog.quote_ident(y.polname)
       || ' cmd ' || y.polcmd::pg_catalog.text || ' ' || case when y.polpermissive then 'permissive' else 'restrictive' end
       || ' to ' || (select pg_catalog.string_agg(r.spelled, ',' order by r.spelled collate pg_catalog."C")
                       from (select ${role("p.oid")} as spelled from pg_catalog.unnest(y.polroles) as p (oid)) r) as line
${POLICIES_READ}`;

/** A predicate that exists is a line of its own, so one changed predicate is one changed line (SPEC §4.3). */
const predicates = (kind: "policy-using" | "policy-check", expression: "polqual" | "polwithcheck"): string => `
select '${kind} ' || y.polrelid::pg_catalog.regclass::pg_catalog.text || ' ' || pg_catalog.quote_ident(y.polname)
       || ' ' || pg_catalog.pg_get_expr(y.${expression}, y.polrelid) as line
${POLICIES_READ} and y.${expression} is not null`;

/** What the covered relations hold beside their columns, and the policies anywhere that name a chain role. */
export async function relationPartLines(conn: Client, { schemas, roles }: Covered): Promise<string[]> {
  const lines: string[] = [];
  for (const sql of [CONSTRAINTS, INDEXES, TRIGGERS, SILENCED_INTERNAL_TRIGGERS, RULES]) lines.push(...(await linesOf(conn, sql, [schemas])));
  for (const sql of [POLICIES, predicates("policy-using", "polqual"), predicates("policy-check", "polwithcheck")]) {
    lines.push(...(await linesOf(conn, sql, [schemas, roles])));
  }
  return lines;
}
