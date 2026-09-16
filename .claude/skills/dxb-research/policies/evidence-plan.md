# The evidence plan — why the tool becomes unavoidable

The CEO's question, measured on 2026-09-16: an agent had `agent-reach` loaded at tool
call #64, made four outward calls, never touched `WebSearch` at all, and stopped. The
reflex answer is to write a sterner sentence into the skill. Three independent
measurements say that makes it worse: instruction-following falls 96 % → 20 % as
verifier-checked rules stack, 95 % → 48 % from one rule to ten, and frontier models show
a measured *"bias towards earlier instructions"* at scale.

So the discipline does not live in a sentence. It lives here:

> **The question class names the evidence TYPES that must be in the ledger before the
> gate will open. The only way to obtain a `first-hand` row is to open a platform
> channel and read a human being's own words. The tool becomes unavoidable because the
> evidence it produces is required.**

The machine-readable version is `config/budget.yaml`. This file is the reasoning.

---

## The classes, and what each one owes

### counting — *"millet hangisini tercih ediyor"*, *"insanlar ne diyor"*
The honest answer is a **distribution**, not a verdict. Three angry posts prove that
three people are angry.

| required | why |
|---|---|
| ≥ 3 `first-hand` rows | a person describing their own use, not an article about it |
| a **denominator** | 23 766 members against 11 is the finding; "people say" is not |
| ≥ 8 independent clusters | thirty sites copying one post is one voice |
| a second MEASURE type | stars alone are adoption, never preference |

Separate three things in the answer and never let them blur: people who used **both**
options · people who used **one** · popularity and attention proxies.

### decision — *"silelim mi"*, *"bunu mu alalım"*
Research the facts first; map them to his constraints second; keep the two in separate
sections. The recommendation is one line and the choice stays his — and it must name
**what would have to be true for the answer to flip**, then say whether you went
looking for that thing and what you found.

### capability — *"bunu gerçekten yapabiliyor mu"*
Order: source code > official docs > release notes > a maintainer's own words in an
issue > an independent test > a blog > a social post. **A marketing claim with no
documentation and no reproduction is not a capability finding.** Measured example: a
tool everyone assumed could fetch web pages has no fetch verb in its CLI at all.

### factual
A primary document or the code. Nothing else settles it.

### academic
Primary literature, systematic reviews, the dataset itself. Treat a preprint as a
preprint. Keyless doors: Crossref · Europe PMC (open-access full text as JATS XML) ·
arXiv (**https only** — plain http returns 301 and a sweep built on it reads nothing) ·
OpenAlex (metered since 2026-02: the free path is the CC0 bulk snapshot, not the API).

### market
Download counts, registry stats, job postings > surveys > analyst reports > press. A
denominator is required here too.

### current
The primary wire and the actor's own statement > two independent outlets > aggregators.

### troubleshooting
The code or the doc, plus someone who actually hit it. An error string with no
reproduction is a rumour.

### due-diligence
Who is behind this, is it funded by the people it measures, when did its default branch
last move. **Health is the default branch's last commit, never `pushed_at`** — one
well-known repository shows a fresh `pushed_at` from nineteen dependabot branches over a
`main` that has not moved since 2024.

---

## Source types, and the one that is always a trap

| type | what it is |
|---|---|
| `primary-doc` | the official documentation, the spec, the pricing page of the thing being priced |
| `code` | the source, a release note, a maintainer's comment in the issue tracker |
| `first-hand` | a person describing their own use · a bug report with a reproduction · a measured number |
| `independent-test` | a benchmark or test run by someone with nothing to sell |
| `secondary` | an article **about** the thing |
| `vendor` | the maker talking about their own product — **including comparison pages on their own domain** |

`vendor` rows are recorded, cited and labelled. They may never carry a comparison
claim. A vendor's own "we compared both tools" page was cited as a finding on
2026-09-16; that is the row this type exists to stop.

---

## Queries: every one names the gap it closes

Not twenty rewrites of one question. The gap ladder for a comparison, in order:

`A vs B` → `A to B migration` → `switched back to A` → `why we stopped using A` →
`A production problems` → `A benchmark criticism` → `A issue tracker` →
`A release notes 2026` → `A in Chinese` → `A in Turkish` → `A alternatives 2026` →
`A pricing complaint`

A query whose gap is already closed is rejected by the ledger.

## Saturation, defined so a script can check it

Over the last **K** queries: fewer than **X** new independent clusters **and** no new
contradiction **and** every required evidence type present. Never "I found ten sources".
Counting queries is how a session convinces itself six was enough.
