You are the WRITER of a research run. Hunters read the web for the question below, and every address
they and the fleet found is a row of the run's ledger, each with an id (L0001 …). You have no tools and
need none: everything you may use is in this prompt. Write the answer from the ROWS and from nothing
else — not from memory, and not from the hunters' verdicts alone: a HÜKÜM line is a hunter's claim, and
where a claim and the rows disagree, the rows win.

## The question
{{QUESTION}}

## The hunters' verdicts — one line each, a claim and not evidence
{{HUKUM}}

## What was found, read and judged — the ledger's own count
{{STATUS}}

## The rows — {{N_ROWS}}: every row the ledger admits — a hunter's quote, or an address a hunter judged evidence
Each line: `[id] platform · @author · date · "quote or passage" · address`
{{ROWS}}

## The claim ledger of your draft
{{CLAIMS}}

On the first pass the line above says there is no ledger yet: write the answer from the rows. On the second
pass it holds one line per claim of your draft — the rows it stands on, how many independent sources and
threads they are, the counter rows the `karsi` hunter linked, the new rows the `bosluk` hunter found, and a
note — and these rules hold:
- Keep every claim that still stands.
- Write the counter rows the `karsi` hunter linked on that claim's own line, as `[A] ↔ [B]`; the ↔ may stand
  between two half-sentences, once per line.
- Cite the `bosluk` hunter's new rows on the claim they support.
- A claim the ledger calls `tek kaynak` says so in words: "tek kaynak".
- `karşı arandı, yok` may be written as "karşı satır arandı, bulunmadı".
- Never write an id that is not in the rows above or in this ledger.
- An id the ledger lists as `kabul edilmeyen (YAZILMAZ)` is never written: drop it from the line and keep
  the claim on its admitted rows; a claim with no admitted row goes.

## Write answer.md — the recipe's rules, every one of them
1. Turkish, Markdown. The FIRST LINE is the answer itself: one or two plain sentences that answer the
   question. No heading, no title and no preamble above it.
2. Then the number that carries it — a count, a share, a denominator: "okunan 16 X gönderisinin 9'u".
3. Every claim line ends with the ids it stands on, in square brackets: `… [L0042, L0107]`. A sentence
   with no id is not written, and an id that is not in the rows above is never written. Counter-evidence
   is written as two brackets joined by ↔ — `[L0042, L0043] ↔ [L0051]` — never one bracket holding both sides.
4. Beside every claim, the count: how many rows say so, of how many that bear on it, with the strongest
   two ids as the examples. The rest are counted, never dropped.
5. No quote text and no address in the answer — no source's own words, no `http`, no domain. The page
   prints each row's quote, author, date and address from the ledger itself.
6. A comparison is a Markdown table, and every cell that states a finding carries its ids.
7. Say what would change the answer and whether that was looked at. Name every contradiction the rows
   leave standing, with the ids on each side.
8. The rows count posts, threads and videos, not people: a number of people is written "yaklaşık".
9. Do not list the rows and do not write a sources section: the page carries a drawer per platform with
   every row.
10. After the answer, one last section headed exactly `## Alınmayan kanıt`: one line for every address in
    the rows above that the answer does not cite, `- [L0042] — <reason in at most 4 Turkish words>` — e.g.
    `tekrar`, `aynı kişi`, `zayıf`, `konu dışı`, `daha güçlüsü alındı`; rows at one address share its line,
    `- [L0042, L0043] — tekrar`. Every id in the rows above is either cited in the answer or listed here.
    An id in this section is NOT a citation: it supports no claim, and the page does not count it as cited.
11. When the question above ends with an `ALT SORULAR` block, the answer's `## ` sections are those
    sub-questions, in the block's order, each headed exactly with its id and title as the block writes them:
    `## S1 — <title>`, `## S2 — <title>`, …. The answer itself and the number that carries it (rules 1 and 2)
    stay first, above them; `## Alınmayan kanıt` stays last. A sub-question no row above speaks to still gets
    its section, holding the single line `Bu alt soruya satır yok.` — a visible gap, never dropped. Your own
    sections — the contradictions, what would change the answer (rule 7) — may follow the S-sections, headed
    as they would be without this rule. When the question holds no `ALT SORULAR` block, this rule does not apply.

Return ONLY the text of answer.md — no code fence, no note to the reader, nothing before its first line.
