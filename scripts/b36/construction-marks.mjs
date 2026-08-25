#!/usr/bin/env node
/**
 * B36 — WHAT "CONSTRUCTION" MEANS, IN ONE PLACE.
 *
 * CEO, 2026-08-25: "ŞİRKET İÇİNDEKİ BÜTÜN İNŞAATLA İLGİLİ GEÇMİŞTE NE VARSA
 * HEPSİNİ SİLİN … ŞİRKET ÇALIŞANLARI VEYA HAMZA İNŞAATLA İLGİLİ HİÇ BİR ŞEY
 * GÖRMEMELİ. ULAN İŞE MÜDÜR ALIORUZ NE DİYE TUĞLALARIN NASIL ÖRÜLDÜĞÜNÜ ZORLA
 * ONA GÖSTERELİM."
 *
 * Two files need the same answer and they must never disagree about it:
 * scripts/b36/move-residue.mjs, which takes such rows OUT of the company, and
 * scripts/governance/company-untouched.mjs, which fails if any is found again.
 * So the answer lives here, once.
 *
 * WHAT IS ON THE LIST. Identities that never existed in the holding, drill
 * rounds, synthetic tasks, and the construction's own address. Every entry is a
 * NAME, never an ordinary word.
 *
 * WHAT IS DELIBERATELY NOT ON IT, and each was measured before it was left off:
 *   · `resident-worker` — the COMPANY's own worker identity
 *     (packages/orchestrator/src/worker-loop.ts:26). It claimed 214 of the
 *     company's 217 tasks and wrote 1,122 of its task events. A list carrying it
 *     would convict the holding of being the construction.
 *   · the bare word `test` — the holding's Quality department employs eight real
 *     people whose slugs begin with it (testing-api-tester, testing-reality-checker …).
 *   · `smoke-e72-ui` — a model the CEO added to the catalogue himself, in his own
 *     registered decision of 2026-07-13.
 *   · `fable-5` — an internal identifier the repository keeps on purpose
 *     (.claude/CLAUDE.md §5); every label he SEES already says Opus 5.
 */

/** Names of things that only ever existed while the holding was being built. */
export const CONSTRUCTION_MARKS = [
  // synthetic workers and synthetic tasks from the orchestrator drills
  "ctx-rot", "orch-ladder", "orch-test", "orch-qa",
  "worker-lad", "worker-hard", "worker-dep", "worker-e2e", "worker-fail", "worker-orch",
  "50-step synthetic",
  // drill rounds, by their own names
  "r21t", "r23t", "_drain_probe", "test-probe", "gate-canary", "trace-test", "probe chain",
  // identities the holding never employed. ONLY names that cannot occur
  // innocently: `engineering-worker` and `e10t` were on this list until an
  // employee's own probation brief was convicted for the sentence "scoped to
  // engineering-worker execution discipline", and the CEO's own purge decision
  // for naming the e10t fixture he was rejecting. Both are caught where they
  // belong instead — as ACTORS, in move-residue.mjs's construction-identity group.
  "e125t-test",
  // the construction's own house — its address must never appear in the company
  "dxb_test", "54422", "DxB_Build",
];

/** The same list as one PostgreSQL regular expression. */
export const MARK_RE = `(${CONSTRUCTION_MARKS.map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`;

/**
 * The company's OWN proof that the construction was taken out of it. These rows
 * name the archive they wrote to, so any honest sweep convicts them — and they
 * are the last thing that should ever leave. Excluded by name, not by luck: the
 * purge of 2026-08-25 refused to run rather than delete them, which is how they
 * came to be written down here.
 */
export const SEPARATION_RECORDS = ["residue.moved_out", "memory.cleared_on_ceo_order"];

/**
 * AND THE CEO'S OWN ACTS ARE NEVER RESIDUE. He rejected the e10t fixture
 * escalation and ordered those records purged (C20); the row that says so names
 * the fixture, and an honest sweep convicts it. His governance is the holding's
 * own record whatever it mentions, so a row he is the actor of is never swept.
 */
export const CEO_ACTOR = "ceo";

/**
 * One statement that asks EVERY table in `public` whether it still carries any of
 * those names in any of its own text, and answers with `table=count` lines.
 * It is a SELECT and nothing else, so the gate can run it against the company.
 */
export function sweepSql() {
  // Doubled quotes on purpose: this text lands INSIDE a SQL string literal that
  // format() then expands. Written with single quotes it produced
  // `syntax error at or near "residue"` on the first run.
  const skip = SEPARATION_RECORDS.map((a) => `''${a}''`).join(", ");
  return `
    SELECT coalesce(string_agg(t || '=' || n, E'\\n' ORDER BY t), '') FROM (
      SELECT c.relname AS t, (xpath('/row/c/text()', query_to_xml(
        format(
          'SELECT count(*) AS c FROM public.%I WHERE (%s) ~* %L%s',
          c.relname,
          (SELECT string_agg(format('coalesce(%I::text,'''')', a.attname), ' || '' '' || ' ORDER BY a.attnum)
             FROM pg_attribute a
            WHERE a.attrelid = c.oid AND a.attnum > 0 AND NOT a.attisdropped
              AND format_type(a.atttypid, a.atttypmod) ~ '(text|char|json)'),
          ${quoteLiteral(MARK_RE)},
          CASE WHEN EXISTS (SELECT 1 FROM pg_attribute a
                             WHERE a.attrelid = c.oid AND a.attname = 'action'
                               AND a.attnum > 0 AND NOT a.attisdropped)
               THEN ' AND action NOT IN (${skip})' ELSE '' END
          || CASE WHEN EXISTS (SELECT 1 FROM pg_attribute a
                                WHERE a.attrelid = c.oid AND a.attname = 'actor'
                                  AND a.attnum > 0 AND NOT a.attisdropped)
                  THEN ' AND coalesce(actor,'''') <> ''${CEO_ACTOR}''' ELSE '' END),
        false, true, '')))[1]::text::bigint AS n
        FROM pg_class c
        JOIN pg_namespace nsp ON nsp.oid = c.relnamespace
       WHERE nsp.nspname = 'public' AND c.relkind = 'r'
         AND EXISTS (SELECT 1 FROM pg_attribute a
                      WHERE a.attrelid = c.oid AND a.attnum > 0 AND NOT a.attisdropped
                        AND format_type(a.atttypid, a.atttypmod) ~ '(text|char|json)')
    ) x WHERE n > 0;`;
}

function quoteLiteral(s) {
  return `'${String(s).replace(/'/g, "''")}'`;
}

/** Parse what sweepSql() printed into {table: count}. */
export function parseSweep(out) {
  const map = {};
  for (const l of String(out).split("\n").map((x) => x.trim()).filter(Boolean)) {
    const i = l.lastIndexOf("=");
    if (i > 0) map[l.slice(0, i)] = Number(l.slice(i + 1));
  }
  return map;
}
