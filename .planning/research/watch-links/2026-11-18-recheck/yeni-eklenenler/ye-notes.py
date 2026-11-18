"""Adds one short column, 'İkinci okuma (18 Kas)', to the 'Yeni eklenenler' tab. Usage: python -I ye-notes.py notes.json in.xlsx out.xlsx"""
import json, sys, openpyxl
from copy import copy
notes = json.load(open(sys.argv[1], encoding="utf-8"))
wb = openpyxl.load_workbook(sys.argv[2]); ws = wb["Yeni eklenenler"]; HEAD = "İkinci okuma (18 Kas)"
hdr = [c.value for c in ws[1]]
col = hdr.index(HEAD) + 1 if HEAD in hdr else len([h for h in hdr if h is not None]) + 1
h = ws.cell(row=1, column=col, value=HEAD); src = ws.cell(row=1, column=1)
h.font, h.fill, h.alignment, h.border = copy(src.font), copy(src.fill), copy(src.alignment), copy(src.border)
ws.column_dimensions[h.column_letter].width = 46; done = 0
for r in range(2, ws.max_row + 1):
    oid = ws.cell(row=r, column=1).value
    if oid in notes:
        c = ws.cell(row=r, column=col, value=notes[oid]); c.alignment = copy(ws.cell(row=r, column=2).alignment); done += 1
wb.save(sys.argv[3]); print("column", h.column_letter, "written", done)
