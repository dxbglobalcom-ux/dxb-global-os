---
name: dxb-persona
description: Use when writing, correcting or filing an employee persona — the authorship rule, the section grammar, the quality gate, the sync path, and the delivery contract a persona must satisfy to reach the live agent.
---

# Writing an employee

A persona is not a document. It is a live employee's mind, and 199 of them are the largest
unclaimed asset in this holding.

## Authorship

Every persona is written **personally and inline by the session's authorized author** — whichever
model runs the session. A subagent may not write one, even a subagent running the same
model. The HR factory does not author a first-generation persona.

The database enforces it: `personas_author_check` accepts `opus-5 | fable-5 | hr-factory` only,
and `scripts/sync-personas-to-db.sh` requires `DXB_PERSONA_AUTHOR` with **no default** — a silent
wrong author is worse than a stopped script. Historical rows keep their original author: guessing
which past rows were mislabelled would replace one wrong record with another.

## Shape

Sections `## 1.` … `## 12.`, plus `## 13.` where the CEO has bound a specific character to a
specific role. §12 (Discipline DNA & Islamic conduct) is constitutional — one canonical text,
identical in all 199, and the single registered exception to the role-specific-depth rule. §13 is
**not** inherited; it belongs to the name and the trust behind it.

Section 13 is registered as **optional** in the compiler: making it required would have failed the
other 198 personas at the gate, and omitting it from the section list would have let an authored
section be silently dropped from the compiled prompt.

## Quality — the CEO's standard, not a template

Generic, copied or lazy personas are forbidden by his direct order. Zero invention: no fabricated
name, no invented history, no borrowed biography. Marketing and Sales personas carry sales DNA;
every persona carries a proactivity DNA. A department cannot be activated while its personas are
still first-generation.

**The trap he named himself:** *"Burj Al Arab was one throwaway example I gave at the start — and
it got written into the design department's persona as if it were the goal."* A construction-time
example frozen into a permanent instruction is a defect. When you touch personas, sweep for the
class, not the instance (board row C41).

## Filing it

1. Write the file under `personas/<department>/<slug>.md` — the file is the source of authorship;
   the database is runtime and gate.
2. Run the mechanical gate; a missing required section fails it.
3. Sync with the author variable set explicitly.
4. Sign the deep verdict yourself. A gate PASS is not a verdict.

## Delivery — the half that was missed for three weeks

A persona that is authored, gated, versioned and stored is worth nothing until the live agent
receives it. The boundary is the `# PERSONA — ` header; the body from there to the end of file is
the identity, and it crosses whole. The dossier table above that header is never sent.

`tests/r31/persona-delivery.test.ts` fails if any authored section does not arrive, if the dossier
leaks in, or if the last section is lost — a truncating loader passes a "contains §1" check and
fails that one.

Door `dxb-hamza-context` owns what an agent is told **besides** its persona.
