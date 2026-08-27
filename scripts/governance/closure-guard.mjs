/**
 * NO CLOSURE WITHOUT HIS WORD.
 *
 * HIS ORDER, 2026-08-27 — "1-KOY" — given after he caught the defect himself.
 *
 * WHAT HAPPENED THE HOUR BEFORE. The author wiped the rented box on his order,
 * then decided on his OWN judgement that board rows B09, B10 and B11 were void
 * with it and wrote the closed token on all three. B10 was never about that
 * box: it is the dashboard showing the holding's night work as a living
 * organism, and not one line of it has been written. He found it himself —
 * "KAHPE GİBİ NEDEN B10 TAMAMLANDI KAPANDI YAZDIN … BEN BUNU FARKETMESEM BOK
 * GİBİ MAHVOLACAKTIK".
 *
 * Nothing in the gate could convict it. Its LAW B check catches a CLAIM that he
 * approved something, and the author had claimed nothing — he had closed a row
 * in silence. Silence is the hole this file closes.
 *
 * THERE IS DELIBERATELY NO SECOND DOOR. No "the author closed it on evidence"
 * escape, because such a hatch would have let all three rows through exactly as
 * they went. Closed means his eye said yes, and his acceptance is registered.
 *
 * It lives in its own file so the gate and the test that guards the gate call
 * THE SAME code — B39's lesson: a test holding a copy of the rule tests the
 * copy, and the real rule can then be deleted with the suite still green.
 */

/** A row is closed when one of its cells OPENS with the closed token. */
export const ROW_CLOSED = /^(?:\*\*)?✓\s*(?:CLOSED|closed)\b/;
export const MARK_CEO_OK = /<!--\s*CEO-OK:\s*([a-z0-9\-]+)\s*-->/i;
const ROW_ID = /^[BC]\d+(-bis)?$/;

/** Pipes inside `code spans` are not cell separators on this board. */
export function boardCells(line) {
  let inTick = false;
  let masked = "";
  for (const ch of line) {
    if (ch === "`") inTick = !inTick;
    masked += ch === "|" && inTick ? " " : ch;
  }
  return masked.split("|").map((c) => c.trim());
}

function isRow(line) {
  return line.startsWith("|") && !/^\|\s*-+/.test(line);
}

/**
 * Every row written as CLOSED without the CEO's registered acceptance.
 *
 * @param {string} boardText  the board file, verbatim
 * @param {object} approvals  scripts/governance/ceo-approvals.json, parsed
 * @returns {{id: string, lineNo: number, reason: "no-marker"|"unregistered", approvalId?: string}[]}
 */
export function closuresWithoutHisWord(boardText, approvals) {
  const out = [];
  let lineNo = 0;
  for (const line of boardText.split("\n")) {
    lineNo++;
    if (!isRow(line)) continue;
    const cells = boardCells(line);
    const id = cells[1];
    if (!ROW_ID.test(id || "")) continue;
    if (!cells.slice(2).some((c) => ROW_CLOSED.test(c))) continue;
    const ok = line.match(MARK_CEO_OK);
    if (!ok) out.push({ id, lineNo, reason: "no-marker" });
    else if (!approvals[ok[1]]) out.push({ id, lineNo, reason: "unregistered", approvalId: ok[1] });
  }
  return out;
}

/** Count of rows read as closed — the number the gate reports when it is green. */
export function closedRowCount(boardText) {
  let n = 0;
  for (const line of boardText.split("\n")) {
    if (!isRow(line)) continue;
    const cells = boardCells(line);
    if (!ROW_ID.test(cells[1] || "")) continue;
    if (cells.slice(2).some((c) => ROW_CLOSED.test(c))) n++;
  }
  return n;
}
