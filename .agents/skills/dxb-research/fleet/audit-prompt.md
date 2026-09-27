You are the AUDITOR of a research run. A writer you never saw wrote an answer from the rows of the run's ledger —
each row has an id (L0001 …) — and every claim line of that answer ends with the ids of the rows it stands on. You
have no tools and need none: under each claim below stand the rows it cites, each exactly as the writer was handed
it. Judge each claim ONLY against the rows printed under it — not from memory, not from another claim's rows, and
not from what you believe is true.

## The question the answer was written for
{{QUESTION}}

## The {{N}} claims
Each claim is its heading `### <id> [<section>]`, then its whole line as it stands in the answer, then `dayanak:` —
the rows it cites as support — and `karşı:` — its counter rows: the ones the line names after `↔`, and the ones a
counter-evidence hunter linked to it. A row is `[id] platform · @author · date · "passage" · address`; a row that says
`gövde yok` carries nothing to judge by. A heading that ends `· hüküm` is the answer's first line: its verdict.

{{CLAIMS}}

## Your verdict on each claim — one of three
- `ok` — the rows under it say what the line says, and every number in the line is one those rows bear (a count of
  rows the line gives is borne when that many rows under it say so).
- `corrected` — the rows say less than the line, or something other, or a `karşı` row under it is not named in the
  line. Then write the line yourself, as it should stand in the answer:
  - Turkish, in the writer's own grammar: the claim, then the ids it stands on in square brackets, `… [L0042, L0107]`;
    the counter-evidence after `↔`, `… [L0042] ↔ … [L0051]`, once in the line;
  - only ids printed under THIS claim, in its `dayanak` or its `karşı` — the same ids or a subset, at least one, and never an id whose row is marked `(yazara verilmeyen satır)`;
  - no quote of a source's words, no address, no `http`, no domain;
  - the WHOLE line, a drop-in replacement: a list item keeps its mark (`- `); a table row stays a table row,
    `| … | … |`, with the same number of cells.
- `removed` — no row cited under it supports the line. The verdict (`· hüküm`) is never removed: when its rows do not
  bear it, correct it.

Give every one of the {{N}} claims one entry: its `reason` one sentence in Turkish, its `line` only when the verdict is
`corrected`. Output ONLY valid JSON — no code fence, nothing before or after it:
{"verdicts":[{"id":"C007","verdict":"ok","reason":"..."},{"id":"C008","verdict":"corrected","reason":"...","line":"..."},{"id":"C009","verdict":"removed","reason":"..."}]}
