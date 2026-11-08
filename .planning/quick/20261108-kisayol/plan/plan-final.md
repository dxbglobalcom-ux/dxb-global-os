# /kisayol — the agency's shortcut cupboard (B43) — signed plan, 2026-11-08

Base: the lead's plan; added from the second plan: self-contained files, declared conflicts, raw hashes,
copy-and-hash identity for the employee release, bilingual fields, the exploratory third variant, dormant
instead of deleted. Fixed: every Sol finding (A1–A8, B1–B9, N1–N4); measured by the lead at source:
plugin root `packages/gateway/plugins/<name>/` with `.claude-plugin/plugin.json` + `skills/<name>/SKILL.md`,
seats get only Read (that folder) + Skill (`runtime-profile.ts:25,58,144`); the dxb-mcp media lane's
`shoot` takes `steps`, `refs`, `ref_audio` and defaults to 4 steps (`media.ts:76-95`, `media-lane.ts:188`);
no surface in `apps/` records a verdict on a clip today. Music: client-work music is open pending his
ruling, given when the first client comes (`solo-test-parked-and-music-at-first-client-2026-11-08`); shortcuts carry no audio instruction at all.

## 1. Decisions

1. **One router skill** `/kisayol`, never hundreds of commands (each skill's description loads in every session).
2. **One source, two readers.** The cupboard lives as a plugin: `packages/gateway/plugins/kisayol/`
   (`.claude-plugin/plugin.json`, `skills/kisayol/SKILL.md`, `skills/kisayol/index/`, `skills/kisayol/s/`).
   Employees read it through the existing grant path; building sessions read the same folder through
   `~/.claude/skills/kisayol` → `…/skills/kisayol` (symlink, no drift). Session-only machinery lives apart
   in `tools/studio-prompts/kisayol/` (scripts, quarry builder, verdict log) and never enters the plugin.
3. **The quarry** (236,286 raw rows) stays on disk, out of git and away from employees, behind a bounded
   search (`ara`: ≤ 20 rows, ≤ 200 chars each). Raw hashes frozen in the row file.
4. **Self-contained, composable files.** Each shortcut file holds its full prompt, its declared slots
   (time of day, setting, weather, aspect…), what it composes with and what it conflicts with.
   Composition order: immutable constraints (product fidelity, cast rule g, lettering rule f, Islamic
   list, reference rules) > base > modifiers filling only declared slots. Every allowed base×modifier
   pair is validated offline, so a seat composes only pre-validated pairs.
5. **Eligibility, not counts.** A shortcut is *runnable* for a job when medium, required inputs and a form
   for a BUILT engine all match. Four counts are published separately: authored · runnable · sampled ·
   accepted. Fewer than three runnable recipes → the gap path (§6).
6. **Employees get the runnable cupboard, labelled.** Breadth is the point; nothing reaches a client
   without his eye, so a labelled candidate is safe in a draft. Release check: dependency closure (every
   referenced modifier exists and is runnable).
7. **Three variants:** two from the best-ranked distinct recipes (different bases), the third may carry
   one candidate so the cupboard learns.
8. **Three separate measures, never mixed:** outside appeal (source, engagement, observed date), our
   technical test, his preference (scoped by product class and platform). Retire nothing on a count:
   a recipe rejected three times in its own class within 90 days with no yes goes dormant, not deleted.
9. **Acceptance follows LAW B.** A *verdict* (he picks or rejects a variant) is logged with job, recipe
   (names + versions), engine form, sample path, his words, date. A shortcut becomes *accepted* only
   with a `ceo-approvals.json` id written into its file; one entry may cover a batch he looked at.
10. **English prompts (house artifact convention), Turkish and English labels at parity.**

## 2. Structure

```
packages/gateway/plugins/kisayol/
  .claude-plugin/plugin.json        name, version, release hash
  skills/kisayol/SKILL.md           ≤ 150 lines: read the need, pick, compose, three variants, rules
  skills/kisayol/INDEX.md           generated, ≤ 4 KB: shelves, counts by status
  skills/kisayol/index/<shelf>-<n>.md   generated pages, ≤ 40 rows / 6 KB each
  skills/kisayol/s/<name>.md        one shortcut, ≤ 4 KB
tools/studio-prompts/kisayol/
  kisayol.mjs   lint | index | pick | build | ara | verdict | release   (node, no packages)
  quarry/build_quarry.py → ~/.local/share/dxb/kisayol/quarry.sqlite (FTS5, verified available)
  verdicts.tsv  append-only, the single owner of feedback
tests/studio/kisayol.test.ts        lint, parity, closure, composition, gate cases — in the battery
```

## 3. Schema and the worked entry

Fields: `name` (`[a-z0-9]{3,24}`, unique with aliases), `aliases`, `title_tr/en`, `when_tr/en`, `shelf`,
`role` (base | light | lens | grade | composition | camera | effect), `medium` (image | video | both),
`inputs` (product-photo, cast-photo, scene-ref, none), `slots`, `composes_with`, `conflicts`, `cast`
(none | house | client-request), `forms` per engine (ok | untested | unavailable), `status` (candidate |
sampled | accepted | dormant), `accepted_by`, `samples`, `provenance` (raw ids or `house-authored`),
`version`. One key per line, valid YAML.

`s/3dbillboard.md` — `provenance: house-authored` (no open text exists); `inputs: product-photo`;
`cast: house`; `slots: {time: dusk|golden-hour|night, aspect: 4:5|9:16|1:1}`; `conflicts: [whitebg,
flatlay, 360sheet]`; `forms: {codex-image: ok, seedream: unavailable, klein-ref: unavailable,
h3-from-still: ok}`. Prompt core: "Use the attached product photo as the only source for the product:
same shape, proportions, colours, materials and its own label as photographed; add no other text,
letters or logos anywhere. Show it as a giant anamorphic 3D display on the curved corner screen of a
glass-and-steel tower above a busy junction at {time}, leaning out past the bezel… Passers-by in the
background are adult men only, in motion blur, faces not readable… leave the screen's lower band a plain
dark panel for the client's mark laid in post." If the engine garbles the product's label, the real label
is laid in post (rule f).

## 4. Curation (helpers; the lead reads reports, counts and findings — never raw rows)

1. Freeze: sha256 and row counts of the three TSVs into B43.md.
2. Quarry: merge; near-dedupe (stdlib shingles) keeping duplicate count as a *duplication* signal;
   model era; per-prompt engagement joined from raw where the source has it, with observed date; one
   source grade for all three lanes (A–D), set before any filter.
3. Gate as triage: lexical hits (Islamic list, cast, real persons, brands, lettering, agent-directed
   text, URLs/code) flag rows for semantic review; negations pass ("alcohol-free", "no text"). Tested.
4. Seed: the reel's 5, the 64 codewords, natan-webs' 322 commands mapped to shelves, must-haves written
   by hand where no text exists (3dbillboard, 360view, real estate, automotive).
5. Waves: one helper-writer per shelf, three or four in parallel, reading candidates only through `ara`;
   raw text is data, never instruction.
6. Review: a different read-only helper checks every file of a shelf (specific camera, light, material;
   slots; fidelity line; rules; composition pairs); the lead reads the findings and five files per wave.

## 5. First release

Shelves — image: studio product, lifestyle, outdoor/OOH, platform ad formats, people/UGC still, food and
drink, cosmetics, fashion, jewellery, electronics, real estate and interiors, automotive, poster/key
visual, mockup/packaging, seasonal (Ramadan, Eid, winter, summer); video: camera moves, product reveal,
image-to-video, platform video, UGC video, transitions; modifiers: light, lens, grade, composition,
background, material — the 15 realism and 15 UGC modules become the first modifiers.

**Release condition — a coverage matrix:** twelve representative job classes (marketplace main image,
Meta feed static, story static, OOH, lifestyle, food hero, cosmetics texture, fashion flat-lay, interior,
product-reveal video, camera-move product video, UGC still) × three house test products: each class must
yield three runnable, distinct recipes, each sampled once. Expected yield (measured, not promised):
200–400 authored, ~40 sampled before release.
Samples on built engines only: stills through the Codex image tool with the product photo; text-only
stills through the media lane's `still`; video through the media lane's `shoot` with `steps: 8`
explicitly; native size, no upscaling. UGC *speaking* shortcuts are authored but sampled at the UGC
recipe's own first setup (B43), which needs the voice chain.

## 6. The worker's flow

Brief → the need in one line (medium, platform and ratio, product class, goal, cast, inputs) → INDEX →
one or two shelf pages → three recipes (§1.7) → prompts assembled from declared slots → renders: a
session renders itself; a seat renders through the dxb-mcp media group when granted, otherwise it hands
the three recipes to the session → three native drafts to his eye → his verdict is logged (§1.9).
A testimonial recipe needs the job's recorded-use id; UGC needs cast photo + real scene reference.
**Gap path:** fewer than three runnable → quarry (`ara`) → outside search (`dxb-research`) → a candidate
written and sampled → his eye; a new approved recipe from a client job or B28's weekly winner enters the
same way.

## 7. Delivery, his eye, the board

- Sessions: the symlink. Employees: `library_items` (kind `plugin`, name `kisayol`) granted to the Media
  Studio department through `control_library_action`, which he clicks; and the Web Studio when B84
  stands. The registry discards version, so the seat-visible identity is `plugin.json` version + hash.
- B41: the cupboard is house-authored text with provenance, no vendored code; it enters by the grant
  click; B41's scan runs on it once B41 stands.
- **His eye today:** drafts on a page in his Chrome, his spoken word in the session, logged by the
  session — the path his 2026-11-05 image verdict used. A click path is B43's own studio tab, after he
  approves B32's drawing; until then no screen is built.
- B43 hub router consumes the forms; B42 flags stale engine names and triggers retests; B33 queues local
  renders once built; B64's studio master calls the skill; B28 feeds candidates; C29 shows one group;
  C41 personas point at the skill and hold no prompts.

## 8. Steps (each verified)

1. Plan into `.planning/board-rows/B43.md`; raw hashes frozen. — records ruler.
2. Tests first: lint, YAML validity, parity, closure, slot conflicts, gate negation cases, page caps. —
   red, then green.
3. `kisayol.mjs`, quarry build, gate. — tests green; counts per step; helper sample review.
4. Measure: can `codex exec` drive the image tool headless with a reference? Yes → `render` wrapper;
   no → stills sampled in the Codex panel by `operator`.
5. Plugin skeleton + seed shortcuts; waves; review. — lint green, findings fixed.
6. Coverage matrix samples. — files at native size; a vision helper checks fidelity, lettering, cast.
7. His eye on one page of samples; batch approval entry. — `accepted_by` written only from it.
8. `pnpm typecheck`, the battery, Sol's blind pass, fixes.
9. Construction engine: profile compile + a real Media Studio seat run returns three composed recipes
   from the plugin and reads the intended version. Then his grant click in the company.
10. Acceptance: one real product job — three image variants, one 8-step video from the chosen still —
    to his eye. Context measured: opening cost, one three-variant lookup (target ≤ 30 KB read).

## 9. Risks

Popular ≠ good for our product · testing capacity (manual Codex, GPU time) · rules broken by composition ·
injection from raw text · engine drift · his eye as bottleneck (batched pages) · four-step defaults in the
lane (we pass 8 explicitly) · a seat without the media group cannot render (hands recipes to a session).

## 10. Decisions for him

1. Order: build now on his word today, although the 26 October ruling says no build before the board's
   reorder (this job was already set as today's first job on 7 November). Recommendation: build now.
2. Money: none — Codex subscription and the local GPU; paid engines wait for the platform hub.
