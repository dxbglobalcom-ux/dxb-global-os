#!/usr/bin/env python3
"""Sync employee_records (sicil) from persona dossier files — file-first.

HR_OPERATING_SYSTEM_SPEC: employee_records is the sicil skeleton; the persona
dossier (personas/<dept>/<slug>.md, EMPLOYEE_PERSONA_STANDARD §5 table) is the
authoring source. This script copies the dossier's sicil fields VERBATIM into
employee_records — zero authorship happens here, so re-running after a dossier
edit is always safe (upsert by employee_id).

Field map (dossier row number → column; row numbers are stable across the
TR/EN label eras, labels are not — match by number only):
  10 → responsibilities   11 → authority_limits   12 → decision_scope
  13 → expertise          15 → methodology        17 → reporting_standard
  18 → quality_standard   20 → escalation_rules   26 → kpis (as [{"ref": ...}])
  31 → version_history (as [{"note": ...}])
Operational columns (performance/error/review histories, training_needs) are
NOT touched — they fill with real operation, never from files.

Usage: python3 scripts/sync-employee-records.py [--dry-run]
Prints the generated SQL to stdout; apply via psql. Rows whose dossier UUID
does not match a live agents row are SKIPPED and reported on stderr.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PERSONAS = ROOT / "personas"

ROW_MAP = {
    10: "responsibilities",
    11: "authority_limits",
    12: "decision_scope",
    13: "expertise",
    15: "methodology",
    17: "reporting_standard",
    18: "quality_standard",
    20: "escalation_rules",
    26: "kpis",
    31: "version_history",
}
ARRAY_COLS = {"responsibilities", "authority_limits", "expertise"}
EMPTY_MARKERS = {"", "—", "-", "–"}


def parse_dossier(path: Path):
    fields = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        m = re.match(r"^\|\s*(\d+)\s*\|[^|]*\|(.*)\|\s*$", line)
        if not m:
            continue
        n = int(m.group(1))
        if n == 1 or n in ROW_MAP:
            val = m.group(2).strip().strip("`").strip()
            fields.setdefault(n, val)  # first occurrence wins (the sicil table)
    return fields


def sql_quote(s: str) -> str:
    return "'" + s.replace("'", "''") + "'"


def sql_text_array(s: str) -> str:
    return f"ARRAY[{sql_quote(s)}]::text[]"


def main() -> int:
    files = sorted(
        p for p in PERSONAS.glob("*/*.md")
        if p.parent.name != "_library" and p.name != "README.md"
    )
    stmts, skipped = [], []
    for f in files:
        fields = parse_dossier(f)
        uuid = fields.get(1, "")
        if not re.fullmatch(r"[0-9a-f-]{36}", uuid):
            skipped.append(f"{f.relative_to(ROOT)}: no valid Employee ID")
            continue
        cols, vals = ["employee_id"], [f"'{uuid}'::uuid"]
        for n, col in ROW_MAP.items():
            raw = fields.get(n, "").strip()
            if raw in EMPTY_MARKERS:
                continue
            if col == "kpis":
                cols.append(col)
                vals.append(sql_quote(json.dumps([{"ref": raw}], ensure_ascii=False)) + "::jsonb")
            elif col == "version_history":
                cols.append(col)
                vals.append(sql_quote(json.dumps([{"note": raw}], ensure_ascii=False)) + "::jsonb")
            elif col in ARRAY_COLS:
                cols.append(col)
                vals.append(sql_text_array(raw))
            else:
                cols.append(col)
                vals.append(sql_quote(raw))
        upd = ", ".join(f"{c} = EXCLUDED.{c}" for c in cols[1:])
        stmts.append(
            # Guard: only live (non-archived) agents get a sicil row.
            f"INSERT INTO employee_records ({', '.join(cols)})\n"
            f"SELECT {', '.join(vals)}\n"
            f"WHERE EXISTS (SELECT 1 FROM agents WHERE id = '{uuid}'::uuid AND employment_status <> 'archived')\n"
            f"ON CONFLICT (employee_id) DO UPDATE SET {upd}, updated_at = now();"
        )
    print("BEGIN;")
    for s in stmts:
        print(s)
    print("COMMIT;")
    print(
        f"-- generated from {len(files)} dossiers: {len(stmts)} upserts, {len(skipped)} skipped",
    )
    for s in skipped:
        print(f"SKIP {s}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
