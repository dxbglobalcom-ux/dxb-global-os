"""Search the kisayol quarry.

    python3 -I search.py "<query>" [--lane image-general|image-ads|video] [--limit N] [--with-flagged]

Every word of the query must appear (FTS5, words quoted so FTS syntax in the query is inert).
The 200 most relevant matches (bm25) are ranked by grade, then era current, then relevance; at most 20 rows. Rows carrying any flag other
than brand-name are left out unless --with-flagged. Prints TSV:
id lane source_slug grade era dup_count flags prompt[:200]
"""
import argparse
import re
import sqlite3
from pathlib import Path

DB_PATH = Path.home() / ".local" / "share" / "dxb" / "kisayol" / "quarry.sqlite"
LANES = ("image-general", "image-ads", "video")
HARD_CAP = 20
RELEVANCE_POOL = 200
NON_EXCLUDING_FLAGS = ("", "brand-name")


def fts_query(text):
    """Each word of `text` as a quoted FTS5 term (implicit AND); '' when there is no word."""
    return " ".join(f'"{word}"' for word in re.findall(r"\w+", text))


def search(db_path, query, lane=None, limit=HARD_CAP, with_flagged=False):
    """Matching rows as (id, lane, source_slug, grade, era, dup_count, flags, prompt) tuples."""
    match = fts_query(query)
    if not match:
        return []
    sql = ("SELECT p.id, p.lane, p.source_slug, p.grade, p.era, p.dup_count, p.flags, p.prompt "
           "FROM prompts_fts JOIN prompts p ON p.rowid = prompts_fts.rowid "
           "WHERE prompts_fts MATCH ?")
    params = [match]
    if lane:
        sql += " AND p.lane = ?"
        params.append(lane)
    if not with_flagged:
        sql += f" AND p.flags IN ({', '.join('?' * len(NON_EXCLUDING_FLAGS))})"
        params.extend(NON_EXCLUDING_FLAGS)
    # bm25 scores almost never tie, so ordering by bm25 first left grade and era with no effect
    # (measured 2026-11-08: "3d billboard" returned C/D, short, older prompts first). Relevance now
    # picks the pool — the best RELEVANCE_POOL matches — and grade, then era, then relevance order it.
    sql = ("SELECT id, lane, source_slug, grade, era, dup_count, flags, prompt FROM ("
           + sql.replace("SELECT p.id,", "SELECT bm25(prompts_fts) AS score, p.id,", 1)
           + " ORDER BY score LIMIT ?) ORDER BY grade, era != 'current', score LIMIT ?")
    params.append(RELEVANCE_POOL)
    params.append(max(0, min(limit, HARD_CAP)))
    conn = sqlite3.connect(Path(db_path).resolve().as_uri() + "?mode=ro", uri=True)
    try:
        return conn.execute(sql, params).fetchall()
    finally:
        conn.close()


def main():
    parser = argparse.ArgumentParser(description="Search the kisayol prompt quarry.")
    parser.add_argument("query")
    parser.add_argument("--lane", choices=LANES)
    parser.add_argument("--limit", type=int, default=HARD_CAP, help=f"rows to show, at most {HARD_CAP}")
    parser.add_argument("--with-flagged", action="store_true",
                        help="also show rows flagged for anything other than brand-name")
    args = parser.parse_args()
    for row in search(DB_PATH, args.query, args.lane, args.limit, args.with_flagged):
        *fields, prompt = row
        print("\t".join(str(f) for f in fields) + "\t" + prompt[:200])


if __name__ == "__main__":
    main()
