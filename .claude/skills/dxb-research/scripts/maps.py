#!/usr/bin/env python3
"""GOOGLE MAPS PLACES — read from the results data Google's own Maps page asks for.

WHY IT EXISTS. Measured 2026-10-15: `hidden.py read https://www.google.com/maps/search/...` stopped at
Google's consent wall ("Google'a devam etmeden önce") and `--expand 'Tümünü reddet'` did not pass it.
A plain HTTPS request did not meet the wall: the Maps search page names its own data request in a
`<link href="/search?tbm=map&...&pb=...">`, and that request answers `)]}'` followed by JSON holding
the places. So this reader asks for the page, takes the data address the page names (the `pb`
parameter is Google's, never built here), and reads the places out of the answer.

  maps.py "<query>" [--limit N] [--json] [--from-file FILE]

One line per place, in the order Google returned them; `--json` prints a JSON list. A field Google
did not send is left out (null in JSON), never filled in. `--from-file` parses a saved answer (the
data, or a page) instead of fetching — the tests run on it offline.

Exit: 0 with at least one place · 2 usage · 3 consent wall · 4 no places / unparseable · 5 network.
Every failure is one line on stderr and nothing on stdout: an empty list is never a success.
"""
from __future__ import annotations

import argparse
import html
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/140.0 Safari/537.36")
HL = "tr"
# Google's "reject all" consent answer; a plain request was not shown the wall with or without it
# (measured 2026-10-15), so it is sent only so that a wall shown later has already been answered.
SOCS = "CAESHAgBEhJnd3NfMjAyMzA4MTAtMF9SQzIaAmVuIAEaBgiAo_CmBg"
DATA_LINK = re.compile(r'<link href="(/search\?tbm=map[^"]+)"')
RESULTS_SLOT = 64          # where the places list stood in the answer of 2026-10-15
CONSENT_MARKS = ("consent.google.", "google'a devam etmeden önce", "before you continue to google")


class MapsError(Exception):
    def __init__(self, code: int, reason: str):
        super().__init__(reason)
        self.code = code


def _get(url: str, timeout: int) -> tuple[str, str]:
    req = urllib.request.Request(url, headers={
        "User-Agent": UA, "Accept-Language": f"{HL},en;q=0.8", "Cookie": f"SOCS={SOCS}"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.geturl(), r.read().decode("utf-8", "replace")
    except Exception as e:
        raise MapsError(5, f"maps.py: ağ hatası ({type(e).__name__}: {str(e)[:100]})") from None


def _check_consent(final_url: str, body: str) -> None:
    low = (final_url + "\n" + body[:20000]).lower().replace("&#39;", "'")
    if any(m in low for m in CONSENT_MARKS) and not body.lstrip().startswith(")]}'"):
        raise MapsError(3, "maps.py: consent wall (Google'a devam etmeden önce) — sonuç yok")


def fetch(query: str, timeout: int = 20) -> str:
    page_url = "https://www.google.com/maps/search/" + urllib.parse.quote_plus(query) + f"?hl={HL}"
    final, page = _get(page_url, timeout)
    _check_consent(final, page)
    m = DATA_LINK.search(page)
    if not m:
        raise MapsError(4, "maps.py: Maps sayfası veri adresini (/search?tbm=map) vermedi — düzen değişmiş olabilir")
    final, body = _get("https://www.google.com" + html.unescape(m.group(1)), timeout)
    _check_consent(final, body)
    return body


def _decode(body: str):
    """The answer: `)]}'` + JSON, or the same wrapped as {"d": ")]}'..."} with a `/*""*/` tail."""
    s = body.strip()
    if s.endswith('/*""*/'):
        s = s[:-6].rstrip()
    if s.startswith("{"):
        try:
            s = json.loads(s).get("d", "").strip()
        except (ValueError, AttributeError):
            return None
    if not s.startswith(")]}'"):
        return None
    try:
        return json.loads(s[4:])
    except ValueError:
        return None


def _at(node, *path):
    for i in path:
        if not isinstance(node, list) or i >= len(node):
            return None
        node = node[i]
    return node


def _is_place(entry) -> bool:
    return isinstance(_at(entry, 1), list) and len(entry[1]) > 100 and isinstance(_at(entry, 1, 11), str)


def _results(data) -> list:
    slot = _at(data, RESULTS_SLOT)
    if isinstance(slot, list) and slot and all(_is_place(e) for e in slot):
        return slot
    for slot in data if isinstance(data, list) else []:     # the slot moved: take the list that holds places
        if isinstance(slot, list) and slot and all(_is_place(e) for e in slot):
            return slot
    return []


def _place(p: list) -> dict:
    rating, reviews = _at(p, 4, 7), _at(p, 4, 8)
    fid = _at(p, 10)
    cid = None
    if isinstance(fid, str) and re.fullmatch(r"0x[0-9a-f]+:0x[0-9a-f]+", fid):
        cid = str(int(fid.split(":")[1], 16))
    pid = _at(p, 78) if isinstance(_at(p, 78), str) else None
    name = p[11]
    q = {"api": "1", "query": name}
    if pid:
        q["query_place_id"] = pid
    address = _at(p, 39)
    if not isinstance(address, str):
        full = _at(p, 18)
        address = full[len(name) + 2:] if isinstance(full, str) and full.startswith(name + ", ") else None
    website, phone, category = _at(p, 7, 0), _at(p, 178, 0, 0), _at(p, 13, 0)
    return {
        "name": name,
        "rating": rating if isinstance(rating, (int, float)) else None,
        "reviews": reviews if isinstance(reviews, int) else None,
        "category": category if isinstance(category, str) else None,
        "address": address,
        "phone": phone if isinstance(phone, str) else None,
        "website": website if isinstance(website, str) else None,
        "place_id": pid,
        "cid": cid,
        "url": "https://www.google.com/maps/search/?" + urllib.parse.urlencode(q),
    }


def parse(body: str) -> list[dict]:
    data = _decode(body)
    if data is None:
        _check_consent("", body)
        raise MapsError(4, "maps.py: yanıt Maps verisi değil ()]}' + JSON yok) — ayrıştırılamadı")
    places = [_place(e[1]) for e in _results(data)]
    if not places:
        raise MapsError(4, "maps.py: yanıtta yer yok — boş sonuç başarı sayılmaz")
    return places


def _line(i: int, p: dict) -> str:
    parts = [f"{i}. {p['name']}"]
    if p["rating"] is not None:
        parts.append(f"{p['rating']}★" + (f" ({p['reviews']} yorum)" if p["reviews"] is not None else ""))
    parts += [p[k] for k in ("category", "address", "phone", "website") if p[k]]
    parts.append(p["url"])
    return " · ".join(parts)


def main() -> int:
    ap = argparse.ArgumentParser(prog="maps.py")
    ap.add_argument("query")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--from-file", help="parse a saved answer instead of fetching")
    ap.add_argument("--timeout", type=int, default=20)
    a = ap.parse_args()
    try:
        body = Path(a.from_file).read_text(encoding="utf-8") if a.from_file else fetch(a.query, a.timeout)
        places = parse(body)
    except MapsError as e:
        print(str(e), file=sys.stderr)
        return e.code
    except OSError as e:
        print(f"maps.py: dosya okunamadı ({e})", file=sys.stderr)
        return 2
    if a.limit > 0:
        places = places[:a.limit]
    if a.json:
        print(json.dumps(places, ensure_ascii=False, indent=2))
    else:
        for i, p in enumerate(places, 1):
            print(_line(i, p))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
