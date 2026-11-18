"""Adds one short column, 'İkinci okuma (18 Kas)', to the four older tabs of the links workbook.
Usage: python -I excel-notes.py <all.json> <items.tsv> <identical.txt> <no-content.txt> <workbook.xlsx> [--write]
Without --write it only prints the notes. His word 2026-11-18: a small mark and a short note, no rework."""
import json, re, sys, collections
allp, itemsp, identp, nocp, wb_path = sys.argv[1:6]; write = "--write" in sys.argv
A = json.load(open(allp, encoding="utf-8"))
items = [l.rstrip("\n").split("\t") for l in list(open(itemsp, encoding="utf-8"))[1:]]
ident = {x.strip() for x in open(identp)}; noc = {x.strip() for x in open(nocp)}
TAB = {"e1": "Ekim 9-15 linkleri", "e2": "Ekim 15-21 linkleri", "k1": "Kasım 1 incelemeleri", "k3": "Kasım 3-4 web linkleri"}
ORDER = ["Kur", "Dene", "İkinci", "Yöntem", "Araştır", "İzle"]
HALF = {"k1-14", "k3-06"}                      # VoiceStudio: on disk as source, not set up
OVER = {"k1-22": "Bekler (müzik: ilk müşteride bakılır)"}
by = collections.defaultdict(list)
for d in A: by[d["rid"]].append(d)
def placed(d):
    rd = d.get("reading", ""); br = d.get("board_row", "")
    if rd.startswith(("Gerek yok", "Zaten kur")) and d.get("relation") in ("identical", "none"): return None
    if br.startswith("no row") and not any(k in d.get("item", "") for k in ("prompt_cache", "Per-agent", "Niche mobile", "LibreChat")): return None
    m = re.findall(r"[BC]\d+(?:-bis)?", br)
    if d["rid"] == "e1-08" and br.startswith("no row"): m = ["B51"]
    if br.startswith("no row") and ("Niche mobile" in d.get("item", "") or "LibreChat" in d.get("item", "")): m = ["B83"]
    if d["rid"] == "k1-20": m = ["B30"]
    return m[0] if m else None
notes = {}
for rid, tab, old_id, *_ in items:
    if rid in HALF: notes[(tab, old_id)] = "Kur — diskte yalnız kaynak kodu var, kurulumu yarım → B12, B43"; continue
    if rid in ident: notes[(tab, old_id)] = "Zaten kurulu — elendi"; continue
    if rid in noc: notes[(tab, old_id)] = "Okunacak içerik yok"; continue
    L = by[rid]; rows = []; reads = []
    for d in L:
        r = placed(d)
        if r:
            if r not in rows: rows.append(r)
            reads.append(d.get("reading", ""))
    rowline = next((d for d in L if not d.get("item")), L[0])
    v = rowline.get("reading", "")
    if rid in OVER: v = OVER[rid]
    elif not rows: v = "Gerek yok"
    elif not any(v.startswith(o) for o in ORDER):
        v = next((o for o in ORDER if any(x.startswith(o) for x in reads)), "Yöntem")
    else: v = next(o for o in ORDER if v.startswith(o))
    n = len([x for x in reads])
    notes[(tab, old_id)] = (f"{v} → {', '.join(rows)} · {n} kalem satır dosyasına yazıldı" if rows else
                            ("Gerek yok — kapalı (15 Eki denemesi, kararınız kayıtlı)" if rid == "k1-20" else "Gerek yok — ikinci okumada da alınacak bir şey çıkmadı"))
c = collections.Counter(v.split(" ")[0] for v in notes.values()); print(len(notes), dict(c))
if "--show" in sys.argv:
    for k, v in notes.items(): print(k[0], k[1][:14], "|", v)
if write:
    import openpyxl
    from copy import copy
    wb = openpyxl.load_workbook(wb_path); HEAD = "İkinci okuma (18 Kas)"; done = 0
    for key, title in TAB.items():
        ws = wb[title]; hdr = [c.value for c in ws[1]]
        col = hdr.index(HEAD) + 1 if HEAD in hdr else ws.max_column + 1
        h = ws.cell(row=1, column=col, value=HEAD); src = ws.cell(row=1, column=1)
        h.font, h.fill, h.alignment, h.border = copy(src.font), copy(src.fill), copy(src.alignment), copy(src.border)
        ws.column_dimensions[h.column_letter].width = 46
        for r in range(2, ws.max_row + 1):
            oid = ws.cell(row=r, column=1).value
            if oid is None: continue
            n = notes.get((key, str(oid)))
            if n is None: print("NO NOTE", title, oid); continue
            c = ws.cell(row=r, column=col, value=n); c.alignment = copy(ws.cell(row=r, column=1).alignment); done += 1
    wb.save(wb_path); print("written", done, "cells into", wb_path)
