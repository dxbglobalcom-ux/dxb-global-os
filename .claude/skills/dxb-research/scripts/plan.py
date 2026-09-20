#!/usr/bin/env python3
"""THE RESEARCH PLAN — the layer between his complaint and the weapons.

WHY THIS FILE EXISTS. The CEO's diagnosis, 2026-09-20, in his own words: *"skill beni boru
yaptı"* — a pipe. He was stating a COMPLAINT: several sentences, a decision he was weighing,
one number he wanted from his own machine and one thing only he could decide. The door took
that paragraph and pushed it, unchanged, into 37 search boxes, and the boxes answered with
nothing. The defect was never the length of the query. The defect was that JUDGEMENT — what
is actually being asked, and who can answer it — had no place to happen, so the engine
substituted itself for it.

THE THREE LAYERS, and only one of them was missing:

    (1) HIS COMPLAINT  — the paragraph. It is NEVER searched, never shortened, never sent
                         anywhere. It is kept verbatim so the answer can be checked against
                         what he actually said.
    (2) THE PLAN       — THIS FILE'S SUBJECT. The complaint, broken into sub-questions, each
                         one tagged with WHO can answer it.
    (3) THE WEAPONS    — the fleet, the 37 channels, the crowd counter. They receive only
                         layer 2's output, one sub-question at a time.

THE TAG IS THE WHOLE POINT. Every sub-question carries exactly one:

    DISARIDA      the outside world knows it     → the fleet may hunt it
    MAKINE        our own machine knows it       → a COMMAND answers it; it never leaves here
    ONUN_KARARI   only he can answer it          → it is put to him as a question, not searched

Measured on his own complaint the night this was written: "dün neden %13'e çıktı" is MAKINE
(the transcripts on this machine hold it, no forum does), "Pro'nun 20 katı ne demek" is
DISARIDA, and "Fable'ı bırakayım mı" is ONUN_KARARI. The old engine sent all three to Quora.

WHO WRITES THE PLAN. The SESSION writes it — the model, the judgement. A script cannot decide
what is being asked; that is the very substitution this layer exists to end. This file only
READS the plan, refuses a broken one, and hands the DISARIDA rows to the fleet.

IT WRITES NOTHING, EVER. The first version filled a missing `kisa` itself and wrote the plan
back with a YAML dumper; measured by the checker on 2026-09-20, one `--check --fix` on a plan
that carried a front-matter fence, comments, a body and a `dert: |` literal block destroyed all
four — and the fleet called `--fix` on EVERY run, so every hunt overwrote the session's own
paperwork. A missing `kisa` is now REFUSED with the derivation printed as a suggestion; the
session writes it by its own hand. The judgement stays where it belongs and the file stays as
its author left it.
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import shortq  # noqa: E402

TAGS = ("DISARIDA", "MAKINE", "ONUN_KARARI")
# A PLAN THAT PASSES THE GATE MUST BE READABLE BY THE FLEET. Measured by an independent auditor
# on 2026-09-20: `diller: 5` was accepted by `--check` and then killed `--outside` with a
# TypeError, so the gate blessed a plan its own consumer could not read; `komut: [ls, -la]`
# answered with an AttributeError instead of a refusal, and a plan that exits 1 instead of 3 is
# counted as "not refused" by the ruler and by the acceptance run. Every field is checked here.
TEXT_FIELDS = ("soru", "kisa", "komut", "soru_ona", "kabul")
LIST_FIELDS = ("silah", "diller")
# A ceiling, because the fleet opens ONE 37-channel ground per row, in parallel: 200 rows is
# 7400 processes on a workstation with a freezing history, and one copy-pasted row would do it.
MAX_SUBQUESTIONS = 20
WEAPONS = ("crowd", "rival", "code", "video", "counter", "foreign", "measure")
# What a box query may be — 3-6 words, no paragraph, at least one real word — is owned by
# `shortq.box_reason`. A second copy of that rule here is how two floors drift apart.


def _load(path: Path) -> dict:
    """The plan is YAML. A front-matter fence is accepted; the body below it is never read."""
    import yaml

    text = path.read_text(encoding="utf-8")
    if text.lstrip().startswith("---"):
        body = text.lstrip()[3:]
        end = body.find("\n---")
        if end != -1:
            text = body[:end]
    data = yaml.safe_load(text)
    if not isinstance(data, dict):
        raise ValueError("plan bir YAML sözlüğü değil")
    return data


def validate(plan: dict) -> list[str]:
    """Every way a plan is refused. It never changes the plan."""
    errors: list[str] = []

    raw_dert = plan.get("dert")
    if raw_dert is not None and not isinstance(raw_dert, str):
        errors.append(f"`dert` bir metin değil ({type(raw_dert).__name__}) — CEO'nun cümlesi olduğu gibi yazılır")
        raw_dert = ""
    dert = (raw_dert or "").strip()
    if not dert:
        errors.append("`dert` yok — CEO'nun kendi cümlesi plana OLDUĞU GİBİ yazılır")

    subs = plan.get("alt_sorular")
    if not isinstance(subs, list) or not subs:
        errors.append("`alt_sorular` yok — DERT alt-sorulara ayrılmadan filo açılmaz")
        return errors

    if len(subs) > MAX_SUBQUESTIONS:
        errors.append(f"{len(subs)} alt-soru — en fazla {MAX_SUBQUESTIONS}. Her satır 37 kanallık bir zemin açar; "
                      f"bu makineyi kilitler. Derdi daha az, daha keskin soruya ayır.")
    seen_ids: set[str] = set()
    for i, sub in enumerate(subs, 1):
        if not isinstance(sub, dict):
            errors.append(f"alt-soru {i}: bir sözlük değil")
            continue
        sid = str(sub.get("id") or f"S{i}")
        # ONE ID, ONE QUESTION. Two rows called S2 and a finding that names S2 answers nobody.
        if sid in seen_ids:
            errors.append(f"{sid}: iki kez var — bir bulgu hangisine cevap verecek?")
        seen_ids.add(sid)
        bad_type = False
        for field in TEXT_FIELDS:
            v = sub.get(field)
            if v is not None and not isinstance(v, str):
                errors.append(f"{sid}: `{field}` bir metin değil ({type(v).__name__})")
                bad_type = True
        for field in LIST_FIELDS:
            v = sub.get(field)
            if v is not None and (not isinstance(v, list) or any(not isinstance(x, str) for x in v)):
                errors.append(f"{sid}: `{field}` bir metin listesi değil ({type(v).__name__})")
                bad_type = True
        if bad_type:
            continue
        raw_soru = sub.get("soru")
        soru = (raw_soru or "").strip()
        if not soru:
            errors.append(f"{sid}: `soru` yok")
            continue
        reason = shortq.gate_reason(soru)
        if reason:
            errors.append(f"{sid}: `soru` bir alt-soru değil — {reason}")

        raw_tag = sub.get("etiket")
        tags = [t.strip() for t in str(raw_tag or "").replace(",", " ").split() if t.strip()]
        if len(tags) != 1:
            errors.append(f"{sid}: tam bir etiket gerekir ({' | '.join(TAGS)}) — verilen: {raw_tag!r}")
            continue
        tag = tags[0].upper()
        if tag not in TAGS:
            errors.append(f"{sid}: bilinmeyen etiket {tag!r} — {' | '.join(TAGS)}")
            continue

        if tag == "DISARIDA":
            raw_kisa = sub.get("kisa")
            if raw_kisa is not None and not isinstance(raw_kisa, str):
                errors.append(f"{sid}: `kisa` bir metin değil ({type(raw_kisa).__name__})")
                continue
            kisa = (raw_kisa or "").strip()
            if not kisa:
                # THE SUGGESTION IS PRINTED, THE FILE IS NOT TOUCHED. The session decides what a
                # box is asked; a script that fills it in silently is the substitution Layer 2
                # exists to end, and the first version did it by REWRITING his plan.
                errors.append(f"{sid}: `kisa` yok — öneri: \"{shortq.short_query(soru)}\"  (kendi elinle plana yaz)")
                continue
            kreason = shortq.box_reason(kisa)
            if kreason:
                errors.append(f"{sid}: `kisa` kutuya yazılamaz — {kreason}")
            if dert and kisa and kisa.strip() == dert.strip()[: len(kisa.strip())]:
                errors.append(f"{sid}: `kisa` DERT'in kendisi — paragraf kısaltmak ayrıştırmak değildir")
            weapons = sub.get("silah")
            if not isinstance(weapons, list) or not weapons:
                errors.append(f"{sid}: `silah` boş — her şeyi ateşlemek bir karar değildir ({'|'.join(WEAPONS)})")
            else:
                for w in weapons:
                    if str(w).strip() not in WEAPONS:
                        errors.append(f"{sid}: bilinmeyen silah {w!r} — {'|'.join(WEAPONS)}")
        elif tag == "MAKINE":
            if not (sub.get("komut") or "").strip():
                errors.append(f"{sid}: MAKINE etiketli soru `komut` ister — cevabı bu makinede, aranmaz")
        elif tag == "ONUN_KARARI":
            if not (sub.get("soru_ona") or "").strip():
                errors.append(f"{sid}: ONUN_KARARI etiketli soru `soru_ona` ister — ona sorulur, aranmaz")

    return errors


def outside(plan: dict) -> list[dict]:
    """The sub-questions the fleet is allowed to hunt — and nothing else leaves the machine."""
    rows = []
    default_langs = plan.get("dil") or ["tr"]
    if not isinstance(default_langs, list):
        default_langs = [str(default_langs)]
    for i, sub in enumerate(plan.get("alt_sorular") or [], 1):
        if not isinstance(sub, dict):
            continue
        if str(sub.get("etiket") or "").strip().upper() != "DISARIDA":
            continue
        rows.append({
            "id": str(sub.get("id") or f"S{i}"),
            "soru": (sub.get("soru") or "").strip(),
            "kisa": (sub.get("kisa") or "").strip(),
            "diller": sub.get("diller") or default_langs,
            "silah": sub.get("silah") or [],
            "kabul": (sub.get("kabul") or "").strip(),
        })
    return rows


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print("usage: plan.py --check|--outside|--tags <plan.md>", file=sys.stderr)
        return 2
    mode, target = argv[0], Path(argv[1])
    if not target.is_file():
        print(f"plan dosyası yok: {target}", file=sys.stderr)
        return 3
    try:
        plan = _load(target)
    except Exception as exc:  # a plan that cannot be read is a plan that does not exist
        print(f"plan okunamadı: {exc}", file=sys.stderr)
        return 3

    try:
        errors = validate(plan)
    except Exception as exc:  # a refusal is a sentence, never a stack trace at the CEO's door
        print(f"plan okunamadı ({type(exc).__name__}): {exc}", file=sys.stderr)
        return 3
    if mode == "--check":
        for e in errors:
            print(e, file=sys.stderr)
        return 3 if errors else 0
    if errors:
        for e in errors:
            print(e, file=sys.stderr)
        return 3
    if mode == "--outside":
        try:
            rows = outside(plan)
        except Exception as exc:
            print(f"plan okunamadı ({type(exc).__name__}): {exc}", file=sys.stderr)
            return 3
        for r in rows:
            print("\t".join([r["id"], r["kisa"], ",".join(r["diller"]), ",".join(r["silah"]), r["soru"]]))
        return 0
    if mode == "--tags":
        for sub in plan.get("alt_sorular") or []:
            print(f"{sub.get('id')}\t{sub.get('etiket')}\t{(sub.get('soru') or '')[:80]}")
        return 0
    print(f"bilinmeyen mod: {mode}", file=sys.stderr)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
