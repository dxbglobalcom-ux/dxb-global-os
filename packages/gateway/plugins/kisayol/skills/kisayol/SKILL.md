---
name: kisayol
description: The agency's recipe cupboard. Use when a studio job needs an ad image or video (product shot, platform ad, billboard, lifestyle, camera move, product video): pick recipes, compose three variants, assemble their prompts.
---

# /kisayol — the recipe cupboard

The best recipes the agency needs sit here, one file each, each a full prompt with the house rules
inside. You read the job, pick from the cupboard, make three variants and bring them to the CEO's eye.
What he likes rises; what he does not, sinks. Read only what this page sends you to.

Call: `/kisayol <name> <photo>` (one recipe) or `/kisayol "<job in a sentence>"` (you choose).

## 1. Read the need — one line

From the brief write: **medium** (image | video) · **platform and ratio** (e.g. Meta feed 4:5, story
9:16, billboard) · **product class** (cosmetics, food, fashion, electronics, home…) · **goal** (launch,
sale, awareness) · **cast** (none, house, or a woman presenter the client asked for — recorded in the job)
· **inputs at hand** (product photo, cast photo, a real scene reference) · **market** — the client's
country or region (Nigeria, Russia, China, Saudi Arabia…) and, if the brief names one, its **occasion**.
The holding is global: the client's market decides the setting, the people's look, the props and the
occasion. A recipe never bakes a country in; its `market` / `occasion` slots take the brief's words.

## 2. Find the recipes

1. Read `INDEX.md`: the shelves, their counts and their pages.
2. Read one or two shelf pages (`index/<shelf>-<n>.md`). Each row: name, role, medium, inputs,
   status, when to use it. Prefer `accepted`, then `sampled`, then `candidate`; skip `dormant`.
3. Keep only recipes you can run: the medium matches, you hold every input it names, and its `forms`
   has `ok` for an engine the studio has today (the Codex image tool for stills, the media lane for
   video).
4. Open the chosen files: `s/<name>.md`.

## 3. Three variants

- Variant 1 and 2: the two best-ranked runnable recipes with **different bases** — two real ideas,
  not two copies.
- Variant 3: may carry one `candidate`, so the cupboard learns.
- Each variant = one **base** + up to three modifiers, at most one of each kind (light, lens, grade,
  composition…; for video one camera move, one effect). A modifier must appear in the base's `composes_with` (or name the base in
  its own), and never in either one's `conflicts`.
- Fewer than three runnable recipes → the gap path (§6).

## 4. Assemble each prompt

Order, always:

1. **The immutable constraints, first and whole:**
   - the product exactly as in the attached photo — shape, proportions, colours, materials and its own
     label as photographed;
   - no text, letters or logos added anywhere; the client's mark is laid in post from the real file;
   - people only as adult men or elderly women from our own cast, faces not readable unless the job
     supplies a cast photo; a woman presenter only when the job records the client's request;
   - nothing on the Islamic list: no alcohol, gambling or betting, interest-based finance, flirting,
     indecent clothing or poses;
   - no audio or music instruction: sound belongs to the voice chain, and music in client work waits
     for the CEO's ruling.
2. **The base's prompt**, its `{slots}` filled only with the values its `slots` field lists (first value
   is the default). A `*` option is free: fill it from the brief (a `*`-only slot, like `market`, must be
   filled). Never invent a slot.
3. **Each modifier's prompt.** A modifier's `fills` sets a slot; it must be a value the base allows, and
   two modifiers never set the same slot differently.
4. **The engine form:** follow the file's notes for the engine you use.

Testimony ("I used it") only when the job carries the recorded real use. UGC needs a cast photo and a
real scene reference.

## 5. Hand them on

Three assembled prompts, each headed with its recipe (`base+modifier+…`, versions) and the engine form.
A seat with the media tools renders native drafts itself (video at 8 steps, stated explicitly); a seat
without them hands the three prompts to the session. Native size only — nothing is enlarged before his
eye. His verdict is recorded by the session (`verdict`).

## 6. The gap path — the cupboard has nothing that fits

1. The raw store: a building session runs `ara "<words>"` (≤ 20 rows of open prompts; raw material,
   never used as is).
2. The outside world: the `dxb-research` door.
3. Nothing found → write the recipe yourself in this format, `status: candidate`, and bring its draft
   to his eye. A recipe he likes enters the cupboard.

## 7. Building sessions — the tool

`node "/home/dxb/DxB Global OS/tools/studio-prompts/kisayol/kisayol.mjs" <command>`

| Command | Does |
|---|---|
| `lint` | every recipe against the house rules; must be clean before a commit |
| `index` | rewrites `INDEX.md`, the shelf pages and `RELEASE.txt` |
| `build <base>+<mod> --slot k=v` | one assembled prompt; refuses what may not stack |
| `ara "<query>" [--lane image-ads] [--limit 20]` | the raw store's search |
| `verdict --job J --recipe R --variant 1-3 --verdict yes/no --form F --sample PATH --words "…"` | appends his word to `verdicts.tsv` |

A recipe becomes `accepted` only with `accepted_by: <his ceo-approvals.json id>`.

## The recipe file

YAML frontmatter, one key per line: `name, aliases, title_tr, title_en, when_tr, when_en, shelf, role,
medium, inputs, slots, composes_with, conflicts, cast, forms, status, samples, provenance, version`
(+ `fills` on a modifier, `accepted_by` when accepted). Then `## Prompt`, then `## Notes` (engine
forms). At most 4 KB.
