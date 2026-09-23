"""Acceptance item 8 of Job 2 P5: every bucket-1 hunk of the prompt audit is in place.

For each hunk the old text must be absent from its file and the new text present, exactly once.
Item 11 is checked here too: both prose lists of the research reading chain name the twelve doors
of scripts/fetch.py in the same order. Prints one line per check; exits 1 on any failure.
"""
import os
import re
import sys

R = "/home/dxb/DxB Global OS/"
H = os.path.expanduser("~/")

# (id, path, old, new) — the old text is what the audit found; the new text replaces it.
HUNKS = [
    ("B1-1 scout routing", H + ".claude/agents/scout.md",
     "Keşif gerektiğinde proaktif kullan.",
     "Çok dizine yayılan bir konum taraması gerektiğinde kullan; birkaç grep'le bulunacak şey için değil."),
    ("B1-2 scout output cap", H + ".claude/agents/scout.md",
     "- Çıktı en fazla 40 satır. Daha fazlası varsa en alakalı 40'ı ver ve kaç tane daha olduğunu söyle.",
     "- Çıktını baş mühendis okur ve bağlamı dardır: en alakalı konumları başa koy; liste uzunsa yalnız işine yarayacakları ver ve kaç tanesini dışarıda bıraktığını söyle."),
    ("B1-3 builder routing", H + ".claude/agents/builder.md",
     "description: Net bir spec'ten kodu yazar ve testleri koşar. Uygulama işi geldiğinde kullan.\n",
     "description: Net bir spec'ten kodu yazar ve testleri koşar. Uygulama işi geldiğinde kullan — DxB Global OS'ta değil: orada her satırı oturumun yazarı yazar, alt-ajan yazmaz.\n"),
    ("B1-4 brief output cap", H + ".claude/CLAUDE.md",
     "  çıktı formatı · çıktı uzunluk sınırı · zaten bilinenler (yeniden keşfetmesin).",
     "  çıktı formatı · çıktıyı kimin, ne için okuyacağı · zaten bilinenler (yeniden keşfetmesin)."),
    ("B1-5 crew report cap", R + ".claude/skills/dxb-crew/SKILL.md",
     "  7. TELL THE CEO      — 5–6 lines, `dxb-ceo-report` shape; the position first; never a question.",
     "  7. TELL THE CEO      — short, `dxb-ceo-report` shape; the position first; never a question."),
    ("B1-6 crew four lines", R + ".claude/skills/dxb-crew/SKILL.md",
     "- Every report he will read on return states the position in four lines (`CLAUDE.md` §0) and\n  then the phase result.",
     "- Every report he will read on return opens with the position (`CLAUDE.md` §0 — a line with\n  nothing in it is dropped, not announced) and then the phase result."),
    ("B1-7 start stale pointer", R + ".claude/skills/dxb-start/SKILL.md",
     "  sweep; they never write. The two required subagent uses are in `dxb-verify`.",
     "  sweep; they never write. When a second pair of eyes is required: `dxb-verify` § The audit twin."),
    ("B1-8 start tombstone", R + ".claude/skills/dxb-start/SKILL.md",
     "## The working discipline\n\n> Standing order 11 (invoke the superpowers process skills) was **deleted on the CEO's word \"sil\",\n> 2026-08-10, LAW A** — the plugin is off (`~/.claude/settings.json`, measured).\n\n- Root cause",
     "## The working discipline\n\n- Root cause"),
    ("B1-9 rival-intel tombstone", R + ".claude/skills/dxb-rival-intel/SKILL.md",
     "   read against. A report that would fit any company has failed.\n\n*(A third item told the author how long to write. **Deleted on his live order, 2026-08-13** — he\nnever asked for it to be a rule. How long a report should be is his call in the session he is in.)*\n\n## Evidence labels",
     "   read against. A report that would fit any company has failed.\n\n## Evidence labels"),
    ("B1-10a channels heading", R + ".claude/skills/dxb-research/references/channels.md",
     "## The reading chain — twelve doors, and a page is unread only when all eleven fail",
     "## The reading chain — twelve doors, and a page is unread only when all twelve fail"),
    ("B1-10b channels list", R + ".claude/skills/dxb-research/references/channels.md",
     "`hackernews read`, `twitter read`, `v2ex`, `youtube`, `zhihu`, `stackoverflow`) →\n`tavily_extract` →",
     "`hackernews read`, `twitter read`, `v2ex`, `youtube`, `zhihu`, `stackoverflow`) →\n**his own signed-in browser** (`opencli browser`, his Chrome session) → `tavily_extract` →"),
    ("B1-10c skill list", R + ".claude/skills/dxb-research/SKILL.md",
     "the platform's own reader (`opencli reddit|twitter|youtube|hackernews …`) → tavily-extract →\nfirecrawl-scrape →",
     "the platform's own reader (`opencli reddit|twitter|youtube|hackernews …`) → his signed-in\nbrowser (`opencli browser`) → tavily-extract → firecrawl-scrape →"),
    ("B1-11 surface defaults", R + ".claude/skills/dxb-surface/SKILL.md",
     "   specification a builder can be given.\n\n## Cleaning up after a design pass",
     "\n## Opus 5.5's default looks — a prompting aid, not his ruling\n\n"
     "Anthropic's Opus 5.5 migration guide (\"Frontend design defaults\"): left without direction, the\n"),
    ("B1-12 STATE four lines", R + ".planning/STATE.md",
     "The next session's first reply gives him the position in four lines (core §0).",
     "The next session's first reply opens with the position (core §0 — a line with nothing in it is dropped, not announced)."),
]

# fetch.py's door order, and the words each prose list uses for that door.
DOORS = [
    ("media-transcript", ("subtitles",)), ("pdf-text", ("PDF",)), ("scrapling", ("scrapling",)),
    ("scrapling-stealth", ("stealth",)), ("opencli-reader", ("platform's own reader",)),
    ("browser-signed-in", ("signed-in",)), ("tavily-extract", ("tavily",)),
    ("firecrawl-scrape", ("firecrawl",)), ("exa-fetch", ("exa",)), ("playwright", ("Playwright",)),
    ("jina-reader", ("jina",)), ("curl", ("curl",)),
]


def check_hunks():
    ok = True
    for hid, path, old, new in HUNKS:
        text = open(path, encoding="utf-8").read()
        n_old = text.count(old) if old not in new else text.replace(new, "").count(old)
        n_new = text.count(new)
        good = n_old == 0 and n_new == 1
        ok &= good
        print(f"{'OK  ' if good else 'FAIL'} {hid:26} old×{n_old} new×{n_new}  {path.replace(H, '~/')}")
    return ok


def check_doors():
    ok = True
    code = open(R + ".claude/skills/dxb-research/scripts/fetch.py", encoding="utf-8").read()
    order = re.findall(r'^\s+\("([a-z-]+)", door_', code, re.M)
    good = order == [d for d, _ in DOORS]
    ok &= good
    print(f"{'OK  ' if good else 'FAIL'} fetch.py door order      {len(order)} doors")
    for label, path, start in (
        ("channels.md list", R + ".claude/skills/dxb-research/references/channels.md", "**the video's own subtitles**"),
        ("SKILL.md §4 list", R + ".claude/skills/dxb-research/SKILL.md", "video subtitles (`yt-dlp`)"),
    ):
        text = open(path, encoding="utf-8").read()
        i = text.index(start)
        para = text[i:text.index("\n\n", i)]
        pos = [para.find(w[0]) for _, w in DOORS]
        good = all(p >= 0 for p in pos) and pos == sorted(pos)
        ok &= good
        print(f"{'OK  ' if good else 'FAIL'} {label:26} doors named {sum(p >= 0 for p in pos)}/12, in order: {pos == sorted(pos)}")
    return ok


if __name__ == "__main__":
    a = check_hunks()
    b = check_doors()
    sys.exit(0 if a and b else 1)
