#!/usr/bin/env python3
"""THE KEPT ANSWER CARRIES NO SESSION TOKEN (2026-11-07).

WHY. keep.sh copies a run's answer into the repository, and the repository is public. On 2026-11-07 the
kept answer of the viral-format run carried rednote.com addresses with `xsec_token=…` — 150 in
evidence.jsonl, 37 in final.html — and gitleaks stopped the commit (generic-api-key). An address a
search engine or a logged-in reader handed us can hold the session that opened it. So every text file
keep.sh writes is passed through here: in every http(s) address, a query parameter whose NAME says it is
a token, a signature, a session, a key, a secret, a credential or a password is removed — the address
still opens the page, the session does not travel. Other parameters stay as they were, and so does the
separator style (`&` or HTML's `&amp;`).

THE AUDITOR'S SHAPES (Sol, 2026-11-07). A token does not travel only in an absolute, `&`-joined address:
it came relative (`../p?token=`), JSON-escaped (`https:\\/\\/…`), with an encoded name (`?%74oken=`), in a
fragment (`#access_token=`), after `;`, `&#38;` or `\\u0026`, upper-cased, and inside an encoded redirect
address (`?url=…%3Ftoken%3D…`). So no address is parsed out first: every parameter the text holds — a
name and `=` after one of those separators, at plain, %-encoded or doubly encoded level — is read where
it stands, its name decoded, and a value is read again for the parameters it carries. A name is a secret
by the list below, never by containing a word: `max_tokens` and `session_type` stay. Every file is
scanned — one that is not UTF-8 as bytes, the bytes around an address untouched; one that cannot be read
(an OSError, or a compressed archive no address can be read out of) fails the scrub, so keep.sh stops.

  scrub-urls.py <folder>        rewrites the files under it in place; prints one line of counts;
                                exit 1, naming each file, when one could not be scanned
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path
from urllib.parse import unquote

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
import rlib  # noqa: E402  — the ledger's own text fingerprint

# A PARAMETER NAME THAT CARRIES A SESSION OR A SECRET — compared with `_`, `-` and `.` taken out and in
# lower case (api_key = apikey = API-Key), or one of the patterns after it.
SECRET_NAMES = {
    "token", "accesstoken", "idtoken", "refreshtoken", "authtoken", "oauthtoken", "xsectoken", "sessiontoken",
    "securitytoken", "csrftoken", "sig", "signature", "oauthsignature", "auth", "authorization", "session",
    "sessionid", "sid", "phpsessid", "jsessionid", "key", "apikey", "accesskey", "accesskeyid", "secretkey",
    "privatekey", "secret", "clientsecret", "password", "passwd", "pwd", "jwt", "hmac", "credential",
    "credentials"}
# …_token, …-secret, …_signature, …_sig, …_password, camelCase …Token / …Secret, and every X-Amz-* / X-Goog-*
SECRET_PATTERN = re.compile(r"(?:[_.\-](?i:token|secret|signature|sig|password|passwd)|(?<=[a-z])(?:Token|Secret|Signature|Password))$"
                            r"|^(?i:x-amz-|x-goog-)")


def sensitive(name: str) -> bool:
    n = unquote(unquote(name))
    return re.sub(r"[_.\-]", "", n.lower()) in SECRET_NAMES or bool(SECRET_PATTERN.search(n))


# ONE PARAMETER, at three levels: plain (`?` `#` lead a query or fragment; `&`, HTML `&amp;` `&#38;` `&#x26;`,
# JSON `&` and `;` join), %-encoded inside another address's value, and doubly encoded.
_STOP = r"&;#\s\"'<>\\)\]`"
LEVELS = (  # (leaders, joiners, equals, value)
    (r"\?|#", r"&amp;|&#38;|&#x26;|\\u0026|&|;", r"=", rf"[^{_STOP}]*"),
    (r"%3[Ff]|%23", r"%26|%3[Bb]", r"%3[Dd]", rf"(?:(?!%(?:26|23|3[Bb]))[^{_STOP}])*"),
    (r"%253[Ff]|%2523", r"%2526|%253[Bb]", r"%253[Dd]", rf"(?:(?!%25(?:26|23|3[Bb]))[^{_STOP}])*"),
)
PARAM = re.compile("|".join(rf"(?P<s{i}>{lead}|{join})(?P<n{i}>[A-Za-z0-9_.\-\[\]%]+?)(?P<e{i}>{eq})(?P<v{i}>{val})"
                            for i, (lead, join, eq, val) in enumerate(LEVELS)))
LEADS = tuple(re.compile(lead) for lead, _, _, _ in LEVELS)


def scrub_text(text: str) -> tuple[str, int]:
    """Every secret parameter out of `text`. A removed FIRST parameter hands its `?` or `#` to the one
    after it (`?token=X&a=1` -> `?a=1`), or takes it along when none follows (`?token=X` -> ``)."""
    out: list[str] = []
    pos = total = 0
    lead: tuple[int, str] | None = None        # (level, leader) a removed first parameter left behind
    for m in PARAM.finditer(text):
        lvl = next(i for i in range(len(LEVELS)) if m.group(f"s{i}") is not None)
        sep, name, eq, val = (m.group(f"{g}{lvl}") for g in "snev")
        if lead and (m.start() != pos or lead[0] != lvl):
            lead = None                            # nothing joined the removed one: its leader went with it
        out.append(text[pos:m.start()])
        if sensitive(name):
            total += 1
            if LEADS[lvl].fullmatch(sep):
                lead = (lvl, sep)
        else:
            inner, n = scrub_text(val)             # a redirect address inside the value carries its own
            total += n
            out.append((lead[1] if lead else sep) + name + eq + inner)
            lead = None
        pos = m.end()
    out.append(text[pos:])
    return "".join(out), total


# what no address can be read out of as bytes: gzip, zip, bzip2, xz, zstd, 7z
COMPRESSED = re.compile(rb"\A(?:\x1f\x8b|PK\x03\x04|BZh[1-9]1AY&SY|\xfd7zXZ\x00|\x28\xb5\x2f\xfd|7z\xbc\xaf\x27\x1c)")


def scrub_bytes(data: bytes) -> tuple[bytes, int]:
    """A file's bytes scrubbed: UTF-16 with its mark as text, anything else as UTF-8 whose undecodable
    bytes pass through unchanged (surrogateescape)."""
    for bom, enc in ((b"\xff\xfe", "utf-16-le"), (b"\xfe\xff", "utf-16-be")):
        if data.startswith(bom):
            try:
                new, n = scrub_text(data[2:].decode(enc))
                return bom + new.encode(enc), n
            except UnicodeError:
                break
    new, n = scrub_text(data.decode("utf-8", "surrogateescape"))
    return (new.encode("utf-8", "surrogateescape") if n else data), n


def _rows(path: Path) -> list[dict] | None:
    try:
        return [json.loads(l) for l in path.read_text(encoding="utf-8").splitlines() if l.strip()]
    except (OSError, ValueError):
        return None


def realign(folder: Path, before: list[dict] | None) -> int:
    """The kept ledger stays checkable after the scrub: a body is filed under the SHA-256 of its row's
    url_canonical, and a row's body_sha256 / bytes / passage_sha256 fingerprint its texts. Where the
    scrub changed a canonical address the body file is renamed to the new name; where it changed a body
    or a passage the fingerprints are recomputed. Returns the rows realigned."""
    ev = folder / "evidence.jsonl"
    after = _rows(ev) if before is not None else None
    if not before or not after or len(before) != len(after):
        return 0
    bodies = folder / "bodies"

    def hexname(s: str) -> str:
        return hashlib.sha256(s.encode("utf-8")).hexdigest()

    # TWO ADDRESSES THE SCRUB MADE ONE (`?session=A`, `?session=B` -> the same address) stay two: each
    # scrubbed one is told apart by a stable suffix from its old address's hash — never one body for both.
    olds: dict[str, set[str]] = {}
    for old, new in zip(before, after):
        oc, nc = old.get("url_canonical"), new.get("url_canonical")
        if isinstance(oc, str) and isinstance(nc, str):
            olds.setdefault(nc, set()).add(oc)
    final = {oc: nc if len(ocs) == 1 or oc == nc else f"{nc}#scrubbed-{hexname(oc)[:12]}"
             for nc, ocs in olds.items() for oc in ocs}
    renamed: set[str] = set()
    fixed = 0
    for old, new in zip(before, after):
        oc, nc = old.get("url_canonical"), new.get("url_canonical")
        touched = False
        if isinstance(oc, str) and isinstance(nc, str):
            if final[oc] != nc:
                new["url_canonical"] = nc = final[oc]
                touched = True
            src, dst = bodies / (hexname(oc) + ".txt"), bodies / (hexname(nc) + ".txt")
            if oc != nc and oc not in renamed and src.is_file():
                if dst.exists():
                    raise OSError(f"{dst}: {old.get('id')}'s body would replace another body")
                src.rename(dst)
                renamed.add(oc)
                touched = True
            # only the row's OWN body is fingerprinted: never a file another row's address names
            if (oc == nc or oc in renamed) and dst.is_file() and new.get("body_sha256"):
                data = dst.read_bytes()
                sha = hashlib.sha256(data).hexdigest()
                if sha != new["body_sha256"]:
                    new.update(body_sha256=sha, bytes=len(data))
                    touched = True
        if isinstance(new.get("passage"), str) and new.get("passage") != old.get("passage") and new.get("passage_sha256"):
            new["passage_sha256"] = rlib.sha256(new["passage"])
            touched = True
        fixed += touched
    if fixed:
        ev.write_text("".join(json.dumps(r, ensure_ascii=False) + "\n" for r in after), encoding="utf-8")
    return fixed


def main(argv: list[str]) -> int:
    if len(argv) != 1 or not Path(argv[0]).is_dir():
        print("usage: scrub-urls.py <folder>", file=sys.stderr)
        return 2
    before = _rows(Path(argv[0]) / "evidence.jsonl") if (Path(argv[0]) / "evidence.jsonl").is_file() else None
    files = changed = params = 0
    unscanned: list[str] = []
    for f in sorted(Path(argv[0]).rglob("*")):
        if not f.is_file():
            continue
        try:
            data = f.read_bytes()
            if COMPRESSED.match(data):
                unscanned.append(f"{f}: compressed — no address can be read out of it")
                continue
            new, n = scrub_bytes(data)
            if n:
                f.write_bytes(new)
        except OSError as e:
            unscanned.append(f"{f}: {e}")
            continue
        files += 1
        if n:
            changed += 1
            params += n
    try:
        fixed = realign(Path(argv[0]), before) if params else 0
    except OSError as e:
        unscanned.append(str(e))
        fixed = 0
    print(f"adres temizligi: {files} dosya okundu · {changed} dosyada {params} oturum/anahtar parametresi silindi"
          + (f" · {fixed} satirin govde adi/parmak izi yenilendi" if fixed else ""))
    for u in unscanned:
        print(f"adres temizligi: TARANAMADI {u}", file=sys.stderr)
    return 1 if unscanned else 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
