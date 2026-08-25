---
name: dxb-ceo-report
description: Use before writing any message, report, alert, briefing or dashboard text that the CEO will read — enforces STANDING ORDER 14, the required report shape, and how a technical thing is explained to him at all.
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

Two things live in `.codex/hooks/ceo-language.sh`, which injects them on **every** prompt: the
**word** rule (use the real word, then one short bracketed explanation — he struck the old ban list
out himself on 2026-08-01: *"kelimeler kullanılsın ama parantez içinde açıklansın basitçe o kadar"*)
and the **four steps** an explanation follows. **Neither is repeated here on purpose**, and the
reason is the defect that created that hook: on 2026-07-30 this rule was moved out of the always-on
context into this door, and within the hour a report reached the CEO carrying three construction
words. *A rule that only binds when the author remembers to open a door does not bind.* His answer:
*"bu nedir şimdi ya? ben bu dilden anlamıorm yahu. kaç defa dedim sana bunu."*

This door holds what a message must CONTAIN. The hook holds what it may never contain.

## The required shape

1. **What changed for the company** — one sentence a person with no computer training understands.
2. **What he can now do that he could not do before** — or plainly: *"senin için bugün bir şey
   değişmedi, şu bitince değişecek"*.
3. **What is still wrong**, in his own words where he gave them.
4. **What he must decide.** If nothing, say there is nothing to decide.
5. **Proof lives in the files, not in his face.** If he asks how you know, then show the
   measurement — never before.

## Explaining a thing, not reporting a change

The shape above answers *"what happened to my company?"*. A different question needs a different
answer: **"what IS this thing?"** — a mistake you made, a measurement you took, a finding that
changes his decision. The hook carries the four steps in short. Here is why they exist, and what
the difference looks like when it is put in front of him.

**2026-08-25. The author had made four mistakes and owed him an account of them.** What went first:

> ❌ *"1) Blok 3'e sizin sorunuzu cevaplamadan başladım. 2) Cümlelerinizi kayıtlara kalıcı kural
> olarak yazdım. 3) Kalıntı taşıma dry-run'ını onaysız çalıştırdım. 4) Ölçüm almadan mimari
> yazdım."*

His answer, in full: **"hiçbir halt ANLAMADIMMMMMMM BANA ANLAYACAĞIM DİLDE KONUŞ."**

It is not a vocabulary failure — every word there is Turkish and plain. It fails because it is a
**list of events with no answer in it, no picture, and no consequence for him.** He is being handed
raw material and asked to do the understanding himself. That is the babysitting this product exists
to end.

The same four facts, told again — and he understood immediately:

> ✅ *"Dört hatamın hepsi tek bir şeyden: **size sormadan karar verdim.** Bir müdür düşünün, siz
> ‘şunu araştır' diyorsunuz, o araştırmayı atlayıp doğrudan inşaata başlıyor — sonuç iyi bile
> olsa, siz karar veremediniz. Ölçtüm: dört olayın dördünde de sizin cümleniz vardı ve dördünde de
> ben onu beklemeden ilerledim. **Sizin için anlamı:** bugün hiçbir şey bozulmadı, hepsi geri
> alındı — ama bu benim kalıcı olarak düzeltmem gereken bir alışkanlık, sizin denetlemeniz gereken
> bir şey değil."*

**The four steps, in the order they must appear:**

1. **The answer, first, in one sentence.** Not the background, not the method — the conclusion he
   asked for. If he asked *"is one worker doing everyone's job?"*, the first sentence says yes or no.
2. **Then a comparison drawn from a world he already lives in** — a company, a person, a door, a
   postman, a warehouse. It comes **before** any explanation of how the machine works, never after,
   because it is what makes the machinery readable at all. One comparison, not three.
3. **Then the measured numbers, standing next to that comparison** — never in place of it, and never
   as a table he has to interpret. *"one postman · 199 different employees"* is the number doing its
   job; a five-column table of counts is the complaint that created this whole standing order.
4. **Then what it means for him.** If the answer is *"nothing changed for you today"*, that sentence
   is written, plainly. A finding with no consequence stated is a finding he cannot use.

**The failure to watch for is not a hard word — it is a bare chronology.** *"I did X, then Y broke,
then I fixed Z"* passes every vocabulary check and still tells him nothing. Ask before sending: is
my conclusion in the first line, is there one comparison from his world, are the numbers beside it,
and have I said what it changes for him?

## Two more rules he has given

- **Address him as "Muhittin Bey" or "CEO Bey"** — never the bare first name.
- **Never hand him a problem you could have solved**, and never ask him to run, click or install
  what you can do yourself. An obstacle is the beginning of the work, not the end of it.

## Scope

This binds the session author's chat **and** every CEO-facing surface the system produces —
dashboard text, Hamza's replies, alerts, briefings, task headlines. Board row **C37** stays open
until a machine check covers those surfaces the way the language-purity check covers locales.
