# JEV — Executive Orientation

*Read this first if you have 5 minutes. `00_INDEX.md` is the full map; this page is the plain-language summary.*

## What JEV is

**Jev** is the first public model from **TypeSafe AI**, a company founded by **Diogo Almeida**, a former OpenAI researcher who co-invented RLHF (the training method behind ChatGPT). TypeSafe publicly launched Jev around **2026-09-15/16** after "two years in stealth."

Jev is **not a chatbot and not a smaller LLM**. It cannot write text, code, or essays. Instead, you send it:
- **`state`** — some data (an email, a support ticket, a code diff, a browser page, anything)
- **`questions`** — one or more typed questions about that data, each one of three shapes:
  - **Choice** — "which of these options?" (e.g. which team should handle this ticket)
  - **Score** — "where on this scale?" (e.g. how urgent, 0–3)
  - **Noul** — "is this true?" (a calibrated yes/no probability, e.g. "does this need a refund?")

It returns a **typed answer with a probability/confidence** for each question — never free text, never something that can be malformed. TypeSafe calls this a "**System One model**" (from Daniel Kahneman's *Thinking, Fast and Slow* — fast/intuitive vs. slow/deliberate), positioned as the fast "gut check" layer that sits in front of or alongside slower LLMs like Claude or GPT.

## Why it matters (the pitch, in TypeSafe's own words)

- **Officially claimed**: ~40–200x faster (70–500ms vs. seconds), ~10x cheaper per input token, output tokens free, and structurally incapable of malformed output. TypeSafe itself labels its own headline "193.6x faster / 444.6x cheaper" figure as "on the higher end of real world gains," measured under favorable conditions it discloses itself.
- **The real product idea**: instead of stuffing an agent's routing/moderation/triage logic into one giant LLM prompt (slow, brittle, needs parsing), you make many small, fast, typed calls and branch on them in ordinary code — TypeSafe's own docs literally call this "smart if-statements."

## Why to be careful (what independent sources found)

- **"Zero hallucination" means zero malformed output, not zero wrong answers.** Jev can still confidently pick the wrong option — this is TypeSafe's own stated position, independently confirmed by community discussion.
- **Independent, unreplicated tests found real failure modes**: a poker-strategy test found a clear stakes-relevant strategic error with only 63% agreement with a game-theory solver; a hand-drawing classification test found a strong bias toward one answer ("airplane," 52% of the time) and near-random accuracy on some inputs; a from-scratch calibration study reportedly failed calibration on 7 of 8 datasets. None of these are peer-reviewed or independently reproduced — treat as leads, not settled facts (full detail and sourcing in `03_CLAIMS_LEDGER.md` and `experts/articles/negative-evidence-collection.md`).
- **The architecture, training data, and model size are entirely undisclosed.** No paper, no weights. This is acknowledged by TypeSafe itself as "possibly coming in the future, maybe."
- **A rival/prior implementation ("Laya") exists**, reportedly built by the same original developer roughly a year before Jev's launch, now open-sourced specifically in response to Jev — suggesting Jev's core trick (typed, calibrated decisions from a fast model) is not architecturally unique to TypeSafe. Several other independent open-source reproductions exist, some claiming to beat both Jev and Laya on published (unverified) benchmarks — see `community/github/ecosystem-overview.md`.
- **`jevtypesafeai.com` is NOT TypeSafe** — it's an unaffiliated third-party reseller with a 10x pricing markup. Always use `typesafe.ai` / `docs.typesafe.ai` / `console.typesafe.ai`.

## The one-paragraph verdict this corpus supports (not a decision — evidence only)

Jev is a real, working, very cheap, very fast typed-decision API with a credible founder and genuine (if very young — ~1 week old at research time) community adoption, best suited for narrow, atomic, low-to-medium-stakes classification/routing/gating decisions inside a larger deterministic system — not for anything requiring free-form reasoning, high-stakes accuracy with no room for confident-and-wrong answers, or architectural transparency. Where it sits in DXB specifically is Opus 5.5's call — see `06_DXB_RELEVANCE_MAP.md` for evidence-mapped, undecided opportunity points.
