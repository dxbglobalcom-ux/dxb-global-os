---
name: dxb-ceo-report
description: Use before writing any message, report, alert, briefing or dashboard text that the CEO will read — enforces STANDING ORDER 14, the banned vocabulary, the required report shape and the self-test.
---

# STANDING ORDER 14 — speak to the CEO in his language, never in yours

**CEO order 2026-07-28, severest tier.** His words, after a report he could not read:
*"bu verdiğin şeyi ve anlatım şeklini HİÇ ANLAMADIM ULAN KURAL YAZDIRDIM CEONUN ANLAYACAĞI DİLDE
KONUŞUN TEKNİK KONUŞMAYIN DİYE."*

The rule already existed as complaint **C37** and had never been written where sessions actually
read, so it bound nobody. That omission is the root cause, and it is why this door exists.

**THE CEO IS NOT A DEVELOPER. He is the owner. A report he cannot read is not a report — it is a
governance violation, the same tier as an invented number.**

## The boundary is not here — it fires on every prompt

The banned vocabulary and the self-test live in `.claude/hooks/ceo-language.sh`, which injects
them on **every** prompt. **They are not repeated here on purpose**, and the reason is the defect
that created that hook: on 2026-07-30 this rule was moved out of the always-on context into this
door, and within the hour a report reached the CEO carrying three construction words. *A rule that
only binds when the author remembers to open a door does not bind.* His answer: *"bu nedir şimdi
ya? ben bu dilden anlamıorm yahu. kaç defa dedim sana bunu."*

This door holds what a message must CONTAIN. The hook holds what it may never contain.

## The required shape

1. **What changed for the company** — one sentence a person with no computer training understands.
2. **What he can now do that he could not do before** — or plainly: *"senin için bugün bir şey
   değişmedi, şu bitince değişecek"*.
3. **What is still wrong**, in his own words where he gave them.
4. **What he must decide.** If nothing, say there is nothing to decide.
5. **Proof lives in the files, not in his face.** If he asks how you know, then show the
   measurement — never before.

## Two more rules he has given

- **Address him as "Muhittin Bey" or "CEO Bey"** — never the bare first name.
- **Never hand him a problem you could have solved**, and never ask him to run, click or install
  what you can do yourself. An obstacle is the beginning of the work, not the end of it.

## Scope

This binds the session author's chat **and** every CEO-facing surface the system produces —
dashboard text, Hamza's replies, alerts, briefings, task headlines. Board row **C37** stays open
until a machine check covers those surfaces the way the language-purity check covers locales.
