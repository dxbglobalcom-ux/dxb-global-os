#!/usr/bin/env python3
"""THE SHORT QUERY — what a human types into a site's own search box, AND THE GATE that
refuses a paragraph before a channel ever sees one.

WHY THIS FILE EXISTS. Measured 2026-09-20, on the CEO's own question. The whole
700-character task sentence was handed verbatim to every channel, including the ones
that are a SITE'S OWN SEARCH BOX. No human types a paragraph into a search box, and
the sites answered accordingly:

    quora        0 bytes  NOT_FOUND    "We couldn't find any results for 'Do professional
                                        developers and other professionals prefer Astra 6…'"
    hackernews   0 bytes  FETCH_ERROR  (Algolia, 400 on the URL-encoded paragraph)

The same two channels with a short query, same minute, same machine:

    hackernews  "GPT-6 Astra vs Claude Fable 5.1"  ->  rank 1 in 1.4 s
    quora        the question page opened          ->  19 739 bytes of real answers

The CEO saw the paragraph sitting in his Quora tab and named it: *"yahu belki çıkmıorrr
benim sorduguğum şeyin aynısı orada"* — searching for the sentence is not searching.

WHAT IT IS NOT — HIS SECOND FINDING, THE SAME NIGHT. *"skill beni boru yaptı"*: the door
took his COMPLAINT and pushed it down a pipe into a search box. Shortening the paragraph
is not thinking about it. From 2026-09-20 the session types the short queries itself
(SKILL.md §0), and this file is only the GATE beneath that — never the thinker. It derives a
box query for ONE short question the session already chose, and it refuses anything that is
still a paragraph.

WHAT IT DOES NOT DO. It is not a summariser and never calls a model — a keyword line must
be free, instant and identical on every run, or the same question produces two different
sweeps. It reads the FIRST SENTENCE only and keeps the DISTINCTIVE tokens: the ones
carrying a digit, an inner capital, a hyphen or a dot. Those are the names — `Astra 6`,
`Fable 5.1`, `GPT-6`, `claude-code`. When a question has no such token (`why do people
leave their jobs`), it falls back to the content words with the stop-words removed.

THREE DEFECTS THE CHECKER MEASURED ON THE FIRST VERSION, 2026-09-20 21:06, each one
reproduced by running this file, and each one repaired below:

  1. `"codex'in 200 dolarlık paketinde %50 astra sınırı yok ama fable 5.1'de var"`
     -> `"200 %50 5.1'de 5.1'i"`. A percentage and a price are DIGITS, not names, and a
     Turkish suffix was riding on the version number. A line with no word in it is not a
     search: a bare number is now never distinctive on its own (only a version number
     RIDING ON a name survives — `Fable 5.1`), the suffix is cut at the apostrophe, and a
     result carrying no real word falls back to the content words.
  2. `"Hetzner Storage Box mu Backblaze B2 mi daha ucuz"` -> `"Storage Box Backblaze B2"`:
     the FIRST word was exempted from the capital rule, and the first word of a question is
     very often the name the whole question is about. The exemption is gone.
  3. A stop-word list that knew `nasıl` but not `neden`/`niçin` kept the interrogatives.

The engines that read natural language keep the WHOLE sub-question — exa, parallel, tavily,
firecrawl, google. They are built for a sentence and measured to answer one. Only the
search BOXES get the short form.
"""
from __future__ import annotations

import re
import sys

# Sentence-enders. The digit guard belongs to the DOT alone — it is there for "5.1" and for
# a domain. It used to cover "?" and "!" as well, and measured 2026-09-20 that swallowed a
# whole sentence boundary: "…for coding tasks in 2026? Read the crowd." was read as ONE
# sentence and the instruction word "Read" travelled into the search box as a name.
_SENTENCE_END = re.compile(r"(?<![0-9])\.(?:\s|$)|[!?](?:\s|$)|\n")

_STOP = {
    # English
    "a", "about", "actually", "after", "all", "also", "am", "an", "and", "any", "are",
    "as", "at", "be", "because", "been", "being", "best", "better", "between", "both",
    "but", "by", "can", "could", "did", "do", "does", "each", "find", "for", "from",
    "get", "gets", "give", "had", "has", "have", "how", "i", "if", "in", "into", "is",
    "it", "its", "just", "like", "make", "many", "may", "me", "more", "most", "much",
    "must", "my", "no", "not", "now", "of", "on", "one", "only", "or", "other", "our",
    "out", "over", "own", "people", "prefer", "really", "right", "said", "say", "says",
    "should", "since", "so", "some", "still", "such", "than", "that", "the", "their",
    "them", "then", "there", "these", "they", "this", "those", "through", "to", "too",
    "up", "use", "used", "using", "very", "want", "was", "way", "we", "well", "were",
    "what", "when", "where", "which", "while", "who", "why", "will", "with", "would",
    "you", "your",
    # Turkish
    "ama", "bana", "bir", "biri", "bu", "bunu", "çok", "da", "daha", "de", "değil",
    "diye", "en", "gibi", "hangi", "hangisi", "için", "ile", "ise", "kadar", "ki",
    "kim", "mi", "mı", "mu", "mü", "ne", "neden", "ni", "niçin", "nasıl", "o", "olan",
    "olarak", "sen", "siz", "şu", "var", "ve", "veya", "ya", "yok", "yoksa",
    # calendar noise — a month or a year is a date stamp, not a search term
    "january", "february", "march", "april", "may", "june", "july", "august",
    "september", "october", "november", "december",
    "ocak", "şubat", "mart", "nisan", "mayıs", "haziran", "temmuz", "ağustos",
    "eylül", "ekim", "kasım", "aralık",
}

_YEAR = re.compile(r"^(19|20)\d{2}$")
_STRIP = '"“”‘’()[]{}<>,;:!?*`—–'

# A TURKISH SUFFIX RIDES ON THE APOSTROPHE — `5.1'de`, `Fable'ın`, `Astra'yı`. The name is
# what a search box wants; the case ending is noise that no site indexes.
_SUFFIX = re.compile(r"['’](?:[a-zçğıöşü]{1,4})$")

# A token with no letter in it at all: "200", "%50", "13%", "2,5". A number is a name only
# when it rides on one (`Fable 5.1`), which is why this is checked against the PREVIOUS pick.
_HAS_LETTER = re.compile(r"[^\W\d_]", re.UNICODE)

MAX_TOKENS = 6

# ── THE GATE ────────────────────────────────────────────────────────────────────────────
# The wall the CEO's own diagnosis asked for. It is HERE, beside the producer, because the
# producer is the only place that knows what a box query looks like; sweep.sh and fleet.sh
# call it and print its reason. Measured 2026-09-20: his complaint was 650 characters and it
# went to 37 channels verbatim.
MAX_QUERY_CHARS = 120
MIN_WORD_LETTERS = 3


def gate_reason(query: str) -> str | None:
    """Why this text may NOT be fired at a channel — or None when it may.

    Three ways a text fails: it is too long for any search box, it carries more than one
    sentence (a paragraph), or it holds no real word at all (`200 %50 5.1'de`)."""
    q = query.strip()
    if not q:
        return "boş sorgu"
    if "\n" in query.strip("\n"):
        return "sorgu birden çok satır taşıyor"
    n = len(q)
    if n > MAX_QUERY_CHARS:
        sentences = len([m for m in _SENTENCE_END.finditer(q)]) + 1
        return f"bu bir sorgu değil, paragraf ({n} karakter, {sentences} cümle)"
    if len([m for m in _SENTENCE_END.finditer(q)]) >= 2:
        return f"bu bir sorgu değil, paragraf ({n} karakter, {len([m for m in _SENTENCE_END.finditer(q)]) + 1} cümle)"
    if not _real_word(q):
        return f"sorguda tek bir gerçek kelime yok (\"{q}\")"
    return None


def box_reason(query: str) -> str | None:
    """Why this text may not go into a SEARCH BOX — stricter than a sub-question's gate.

    A sub-question may be a whole sentence of up to 120 characters; a box query may not. The
    plan's `kisa` is held to the same 3-6 words the producer itself would make, whoever wrote
    it. Measured 2026-09-20: a 97-character single sentence passed the general gate and would
    have been typed into Hacker News's search box, which is the defect this layer exists for."""
    reason = gate_reason(query)
    if reason:
        return reason
    words = len(query.split())
    if words > MAX_TOKENS:
        return f"kutu sorgusu {words} kelime — en fazla {MAX_TOKENS}"
    return None


def _real_word(text: str) -> bool:
    """At least one alphabetic word of three letters or more."""
    for tok in text.split():
        letters = [c for c in tok if _HAS_LETTER.match(c)]
        if len(letters) >= MIN_WORD_LETTERS:
            return True
    return False


# ── THE PRODUCER ────────────────────────────────────────────────────────────────────────


def _first_sentence(text: str) -> str:
    """The question itself. Everything after the first sentence is instructions."""
    text = text.strip()
    m = _SENTENCE_END.search(text)
    head = text[: m.start()] if m else text
    return head.strip() or text


def _tokens(sentence: str) -> list[str]:
    raw = sentence.split()
    out: list[str] = []
    for tok in raw:
        tok = tok.strip(_STRIP)
        # a trailing dot is punctuation; a dot inside ("5.1") is part of the name
        while tok.endswith(".") and not re.search(r"\d\.\d", tok):
            tok = tok[:-1]
        # `5.1'de` -> `5.1`, `Fable'ın` -> `Fable`
        tok = _SUFFIX.sub("", tok)
        if tok:
            out.append(tok)
    return out


def _distinctive(tok: str, after_name: bool) -> bool:
    """A name, not a filler word: an inner capital, a hyphen, a dot, or a version number
    riding on a name that was just picked."""
    low = tok.lower().strip("'")
    if low in _STOP or _YEAR.match(low):
        return False
    has_letter = bool(_HAS_LETTER.search(tok))
    if not has_letter:
        # a bare number, a percentage, a price — a name only when it follows one
        return after_name and any(c.isdigit() for c in tok)
    if any(c.isdigit() for c in tok):
        return True
    if "-" in tok[1:] or "." in tok[1:] or "/" in tok[1:]:
        return True
    # THE FIRST WORD COUNTS. It used to be exempt, and "Hetzner Storage Box mu Backblaze
    # B2 mi" lost the very name it was asking about.
    if tok[:1].isupper():
        return True
    return False


def _content(tok: str) -> bool:
    low = tok.lower().strip("'")
    return len(low) >= 3 and low not in _STOP and not _YEAR.match(low) and bool(_HAS_LETTER.search(low))


def short_query(question: str, max_tokens: int = MAX_TOKENS) -> str:
    """The 3-6 word line a human would type into a site's own search box."""
    sentence = _first_sentence(question)
    toks = _tokens(sentence)
    if not toks:
        return question.strip()[:60]

    picked: list[str] = []
    for tok in toks:
        after_name = bool(picked) and bool(_HAS_LETTER.search(picked[-1]))
        if _distinctive(tok, after_name):
            picked.append(tok)
    # A LINE WITH NO WORD IN IT IS NOT A SEARCH — his paragraph produced "200 %50 5.1'de".
    if len(picked) < 2 or not _real_word(" ".join(picked)):
        picked = [t for t in toks if _content(t)]
    if not picked:
        picked = toks

    seen: set[str] = set()
    out: list[str] = []
    for t in picked:
        k = t.lower()
        if k in seen:
            continue
        seen.add(k)
        out.append(t)
        if len(out) >= max_tokens:
            break
    return " ".join(out)


if __name__ == "__main__":
    argv = sys.argv[1:]
    # `--gate "<text>"` — the wall, for sweep.sh and fleet.sh: prints the reason and exits 3.
    if argv and argv[0] in ("--gate", "--gate-box"):
        judge = box_reason if argv[0] == "--gate-box" else gate_reason
        reason = judge(" ".join(argv[1:]))
        if reason:
            print(reason)
            sys.exit(3)
        sys.exit(0)
    if not argv:
        sys.exit("usage: shortq.py '<question>'   |   shortq.py --gate|--gate-box '<query>'")
    print(short_query(" ".join(argv)))
