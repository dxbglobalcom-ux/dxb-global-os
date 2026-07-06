#!/usr/bin/env python3
"""odt-sanitize.py — SEC-04 sanitization engine (plan 01-05).

Reads /tmp/odt-original-work.odt (credential-bearing copy), removes the
credentials section + any key-shaped block, writes:
  - /tmp/odt-sanitized-check.odt   (fresh zip container, sanitized content.xml)
  - docs/source-architecture-notes-sanitized.md (markdown export)
  - /tmp/odt-wordmatch-review.md   (full matched lines — CEO eyes only, never committed)
  - /tmp/odt-wordmatch-summary.txt (line numbers + categories only — safe for evidence)

Prints ONLY counts/indices — never document content. Agent context stays clean.
"""
import zipfile, re, html, sys, shutil, os

ORIG = "/tmp/odt-original-work.odt"
SAN  = "/tmp/odt-sanitized-check.odt"
MD   = "/home/ghost/DxB Global OS/docs/source-architecture-notes-sanitized.md"
REVIEW  = "/tmp/odt-wordmatch-review.md"
SUMMARY = "/tmp/odt-wordmatch-summary.txt"

PATS = {
 'password': re.compile(r'password|passwd|şifre|parola', re.I),
 'api key' : re.compile(r'api[ _-]?key|anahtar', re.I),
 'token'   : re.compile(r'\btoken\b', re.I),
 'secret'  : re.compile(r'\bsecret\b', re.I),
}
SUSP = re.compile(r'password|passwd|şifre|parola|api[ _-]?key|token|secret|anahtar|smtp|imap|app.?password|\busername\b|kullanıcı adı|login:', re.I)
KEYSHAPE = re.compile(r'sk-[A-Za-z0-9]{15,}|sk-or-[A-Za-z0-9-]{8,}|nvapi-[A-Za-z0-9_-]{8,}|apify_api_[A-Za-z0-9]{8,}|AIza[A-Za-z0-9_-]{10,}|ghp_[A-Za-z0-9]{20,}|xox[bp]-')

z = zipfile.ZipFile(ORIG)
xml = z.read('content.xml').decode('utf-8', 'replace')

# ── body block enumeration: h / p / list / table, document order ──
BLOCK_RE = re.compile(r'<text:(h|p)\b[^>]*?>.*?</text:\1>|<text:list\b.*?</text:list>|<table:table\b.*?</table:table>', re.S)
blocks = [(m.start(), m.end(), m.group(0)) for m in BLOCK_RE.finditer(xml)]

def plain(s):
    return html.unescape(re.sub(r'<[^>]+>', ' ', s)).strip()

# suspicious index map (recomputed here, self-contained)
susp_idx = [i for i, (_, _, b) in enumerate(blocks) if SUSP.search(plain(b))]
key_idx  = [i for i, (_, _, b) in enumerate(blocks) if KEYSHAPE.search(plain(b))]

# cluster suspicious indices with gap > 30 as separators; final cluster = credentials tail
clusters, cur = [], []
for i in susp_idx:
    if cur and i - cur[-1] > 30:
        clusters.append(cur); cur = []
    cur.append(i)
if cur: clusters.append(cur)
if not clusters:
    print("HATA: şüpheli küme yok — beklenmedik"); sys.exit(1)
tail = clusters[-1]
# sanity: tail must reach near document end and hold the key-shape mass
if tail[-1] < len(blocks) - 15:
    print(f"HATA: son küme doküman sonuna ulaşmıyor (küme sonu {tail[-1]}, toplam {len(blocks)})"); sys.exit(1)
cut_from = max(0, tail[0] - 5)

drop = set(range(cut_from, len(blocks)))          # credentials section + margin
drop |= set(key_idx)                               # any key-shaped block anywhere
kept = [i for i in range(len(blocks)) if i not in drop]
print(f"blok toplam={len(blocks)} kesilen-kuyruk={len(blocks)-cut_from} (idx {cut_from}..{len(blocks)-1}) ekstra-keyshape={sorted(set(key_idx) - set(range(cut_from, len(blocks))))} kalan={len(kept)}")

# ── sanitized content.xml: splice out dropped block spans ──
out, pos = [], 0
for i, (s, e, _) in enumerate(blocks):
    if i in drop:
        out.append(xml[pos:s]); pos = e
out.append(xml[pos:])
new_xml = ''.join(out)
# strip tracked-changes containers defensively
new_xml = re.sub(r'<text:tracked-changes\b.*?</text:tracked-changes>', '', new_xml, flags=re.S)
if KEYSHAPE.search(re.sub(r'<[^>]+>', ' ', new_xml)):
    print("HATA: sanitized content.xml hâlâ key-shape içeriyor"); sys.exit(1)

# ── other container parts: check, refuse if dirty (headers/footers/meta) ──
dirty_parts = []
for name in z.namelist():
    if name == 'content.xml' or not name.endswith('.xml'): continue
    try: t = re.sub(r'<[^>]+>', ' ', z.read(name).decode('utf-8', 'replace'))
    except Exception: continue
    if KEYSHAPE.search(t): dirty_parts.append(name)
if dirty_parts:
    print(f"HATA: konteyner parçalarında key-shape: {dirty_parts}"); sys.exit(1)

# ── write fresh sanitized container (full rewrite = Save-As equivalent) ──
with zipfile.ZipFile(SAN, 'w', zipfile.ZIP_DEFLATED) as zo:
    for name in z.namelist():
        if name in ('content.xml',):
            zo.writestr(name, new_xml)
        elif name == 'VersionList.xml' or name.startswith('Versions/'):
            continue  # stored versions carry unredacted history — drop
        else:
            zo.writestr(name, z.read(name))
print(f"sanitized container yazıldı: {SAN} ({os.path.getsize(SAN)} bytes)")

# ── markdown export from kept blocks ──
def block_to_md(raw):
    m = re.match(r'<text:h[^>]*outline-level="(\d+)"', raw)
    if m:
        return '#' * int(m.group(1)) + ' ' + plain(raw)
    if raw.startswith('<text:list'):
        items = re.findall(r'<text:list-item\b.*?</text:list-item>', raw, re.S)
        return '\n'.join('- ' + plain(it) for it in items if plain(it))
    if raw.startswith('<table:table'):
        rows = re.findall(r'<table:table-row\b.*?</table:table-row>', raw, re.S)
        lines = []
        for r_i, r in enumerate(rows):
            cells = [plain(c) for c in re.findall(r'<table:table-cell\b.*?</table:table-cell>', r, re.S)]
            lines.append('| ' + ' | '.join(cells) + ' |')
            if r_i == 0: lines.append('|' + '---|' * len(cells))
        return '\n'.join(lines)
    return plain(raw)

md_parts = [block_to_md(blocks[i][2]) for i in kept]
md = "# DXB Global — Source Architecture Notes (sanitized)\n\n> Sanitized export per SEC-04 (plan 01-05). Credentials section removed; see ODT-SANITIZATION-EVIDENCE.md.\n\n" + '\n\n'.join(p for p in md_parts if p)
os.makedirs(os.path.dirname(MD), exist_ok=True)
open(MD, 'w', encoding='utf-8').write(md)
mdlines = md.count('\n') + 1
if KEYSHAPE.search(md):
    print("HATA: markdown key-shape içeriyor"); os.remove(MD); sys.exit(1)
print(f"markdown yazıldı: {MD} ({mdlines} satır)")

# ── word-match review (full lines -> CEO scratch; numbers+categories -> summary) ──
rev, summ = [], []
for n, line in enumerate(md.splitlines(), 1):
    cats = [c for c, p in PATS.items() if p.search(line)]
    if cats:
        rev.append(f"line {n} [{', '.join(cats)}]: {line.strip()}")
        summ.append(f"- line {n} — {cats[0]}")
open(REVIEW, 'w', encoding='utf-8').write(
    "# Word-match review — CEO ONLY (asla commit edilmez, Task 3 sonrası silinir)\n\n" + '\n'.join(rev) + '\n')
open(SUMMARY, 'w', encoding='utf-8').write('\n'.join(summ) + '\n')
print(f"word-match: {len(rev)} satır -> {REVIEW} (tam metin, CEO) + {SUMMARY} (sadece numara+kategori)")
