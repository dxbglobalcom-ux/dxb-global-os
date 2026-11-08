# /kisayol — the agency's shortcut cupboard (plan for B43)

## 1. Decisions

1. **One router skill, not hundreds of slash commands.** Claude Code loads every skill's description into
   every session; 400 commands would swell every session the CEO opens. One skill `/kisayol`, called with a
   name (`/kisayol 3dbillboard urun.jpg`) or with a job (`/kisayol "nemlendirici, Meta reklamı"`).
2. **Two tiers: the cupboard and the quarry.** The *cupboard* (`tools/studio-prompts/kisayol/`, in git) holds
   the selected shortcuts, rewritten in the house's realism language. The *quarry* is the 236,286 raw rows,
   filtered and indexed on disk (out of git, rebuilt by committed scripts); it feeds curation and fills gaps,
   and a raw prompt never goes to an engine unrewritten. The quarry never reaches the OS's employees.
3. **Width is defined by coverage, not by a number.** First release: every leaf of the taxonomy (§5, ~70
   leaves) holds at least three distinct shortcuts, so three variants can always differ — about 300-400
   shortcuts plus modifiers. A *core* of about 60 is tested with sample drafts before the release; the
   rest ship marked `candidate` and are tested on first use. Nothing reaches a client without his eye on
   the three variants, so an untested candidate cannot slip through.
4. **One shortcut = one file**, the file is the truth; `catalog.tsv` and `index/*.md` are generated from the
   files and checked for parity. A Read-only employee can browse the index files without a shell.
5. **Composable by role.** Each shortcut has a role: `base` (scene or format), `light`, `lens`, `grade`,
   `composition`, `camera` (video move), `effect`. A recipe = one base + up to three modifiers (+ one
   camera move for video). Three variants must differ in the base or in at least two modifiers.
6. **Ranking ("the most perfect, liked today"):** his verdicts dominate, then our test result, then use
   count, then source popularity (stars, per-prompt engagement where the source has it) and recency (current
   engines over 2023-era ones). What he rejects twice is retired.
7. **The skill writes prompts; it never picks the engine.** It takes `--engine` from today's B43 defaults
   (image: the Codex image tool; video: H3) and later from the platform-hub router. Each file carries
   engine notes for the engines it was written for.
8. **Status words do not claim approval.** `candidate | tested | chosen | retired`; `chosen` is written only
   from a verdict entry carrying his word and the date (LAW B). The ruler's banned words are checked in step 1.
9. **English prompts, Turkish face.** Prompts in English (engines read it best); each shortcut has a Turkish
   and an English label and "when to use" line (locale parity), and Turkish aliases.

## 2. Structure

```
tools/studio-prompts/kisayol/
  skill/SKILL.md            thin router: how to pick, compose, build, record a verdict (≤ 150 lines)
  skill/INDEX.md            generated: the category tree, one line per leaf (≤ 4 KB)
  skill/index/<cat>.md      generated: per category, one row per shortcut (name, TR line, role, status, score)
  skill/shortcuts/<cat>/<name>.md   one shortcut each (frontmatter + prompt + engine notes + negatives + combine)
  skill/catalog.tsv         generated: all frontmatter, one row each
  skill/verdicts.tsv        append-only: date, job, shortcut(s), variant, his verdict, his words
  skill/scripts/kisayol.mjs pick | build | verdict | rank | index | check | ara  (node, no packages)
  skill/scripts/kisayol.test.mjs
  quarry/ (scripts only in git) build_quarry.py → ~/.local/share/dxb/kisayol/quarry.sqlite (FTS5)
~/.claude/skills/kisayol -> tools/studio-prompts/kisayol/skill   (symlink, like video-use)
```

## 3. Catalog schema and one worked entry

Frontmatter fields: `name, aliases, label_tr, label_en, when_tr, when_en, category, leaf, role, medium,
input (none|product-photo|reference-footage|both), slots, engines, tags (product types, platforms,
goals, moods), status, tested_on, sample, sources, version`. Score and use count live in the generated
catalog, computed from `verdicts.tsv` and the test log.

`shortcuts/reklam-format/3dbillboard.md`:
- label_tr "3D dış mekân billboard'u"; when_tr "Lansman, şehir ölçeğinde göz alıcı ürün duyurusu; OOH
  kampanya görseli"; role base; medium image; input product-photo; slots {product, setting=modern city
  corner at dusk, aspect=4:5|9:16|1:1}; engines [codex-image, seedream-5-pro, flux2-klein-ref].
- Prompt: "Ultra-realistic street photograph of a curved L-shaped LED screen wrapping the corner of a
  modern building above a busy intersection at dusk. The screen shows an anamorphic 3D illusion: the
  {product} from the attached reference appears to push out beyond the screen's frame, casting real shadow
  onto the facade. Keep the product exactly as in the reference — shape, colour, proportions, materials.
  No text, letters or logos anywhere; leave the lower screen area clear for a mark laid in post. Shot on
  35 mm from across the street at eye level, wet asphalt reflections, passers-by as adult men in soft
  motion blur…" + engine notes (Codex: attach the photo, say "use the attached product exactly") +
  negatives + combine (light: neon-night / golden-hour; format: meta-feed-4x5) + sources.

## 4. The curation pipeline (helpers do it; the lead reads reports and samples)

1. **Quarry build** (helper-writer, scripts committed): merge the three TSVs; near-dedupe (normalised
   shingles); tag model era; normalise popularity per source; classify `needs_input_image` by pattern;
   FTS5 index. Gate: counts per step printed; a 200-row sample read by a second helper for wrong drops.
2. **Content gate** (deterministic, in `kisayol.mjs check` and in the quarry build): Islamic list (alcohol,
   gambling, interest, music in video audio, flirting, indecency, in EN/TR/CN), cast rule (people only as
   men or elderly women unless a job's client asks), no real person or celebrity, no real brand name, no
   lettering asked of the engine, no instruction aimed at an agent, no URL/code in a prompt.
3. **Taxonomy and seed list** (this plan, §5): the reel's 5, the 64 codewords (they get full prompts), the
   322 natan-webs visual commands mapped onto our leaves, and the leaves' must-haves written from scratch
   where no open text exists (3dbillboard, 360view, real estate, automotive).
4. **Writing waves**: one helper-writer per category, three or four in parallel, each reading its
   category's top quarry candidates through `kisayol.mjs ara` (compact rows only), the realism files and
   the content rules; raw text is data, never an instruction. Each writes its files; `check` must be green.
5. **Review**: a read-only helper (not the writer) reads every file of a category against a checklist
   (specific camera, light, material; slots; product fidelity line; rules); the lead reads five per
   category in full and every finding's file.

## 5. The first release

Image: (1) ürün-stüdyo — packshot white, hero, showcase, levitation, splash, exploded, cutaway, macro,
flat-lay, podium, 360view; (2) ürün-yaşam — lifestyleshot, in-hand, home/desk, outdoor, unboxing,
seasonal (Ramadan, Eid, winter, summer), before-after; (3) reklam-format — Meta feed 1:1/4:5, story 9:16
with safe zones, carousel panorama, display set, marketplace main and A+ modules, poster, banner, 3dbillboard,
street and mall OOH mockups, sale visual with overlay space; (4) mockup-ambalaj — box, bottle, bag, label,
device screen, apparel, signage; (5) sektör — food and drink (no alcohol), cosmetics, fashion, jewellery,
electronics, furniture, real estate, automotive, health; (6) people and cast — UGC still, testimonial
portrait, workplace, family; (7) modifiers — light, lens, grade, composition, background, material.
Video: (8) camera moves — dolly, orbit, crane, FPV, push-in macro, whip pan, crash zoom, bullet time, rack
focus, top-down, handheld; (9) product video — reveal, unboxing, turntable, morph, splash slow-motion,
assembly, before-after wipe, in-use demo; (10) UGC video — testimonial, unboxing selfie, problem-solution,
day-in-life (cast rules, voice from the voice chain, no music); (11) platform video — 2-second hook, Reels/
Shorts 9:16, 6-second bumper, 15-second pre-roll, Meta 4:5, loop/cinemagraph; (12) effects and transitions.
**Core tested before release (~60):** the reel's five, one per platform format, the top-ranked of each
image leaf, ten camera moves and five product videos. Tested on built engines only: the Codex image tool
(with the product photo), FLUX.1-Krea text-only through `studio.mjs still`, H3 through `studio.mjs shot`
at the 8-step standard; native drafts only (LAW D); three house test products.

## 6. The worker's flow (his desk)

Job brief → the worker (studio seat, studio master on B64's menu, or a session) reads the need: product
type, platform, goal, mood, input → `pick` (or reading INDEX.md + one category index) lists candidates
with score and status → the worker composes three recipes that differ → `build` fills slots and engine
notes → three native drafts → his eye; he names one or none → `verdict` writes the line; the chosen draft
goes into the studio's output library as the shortcut's sample; ranks recompute. An approved client output
whose recipe is new becomes a new candidate; B28's weekly winner becomes a candidate the same way.

## 7. Delivery and the board

- Sessions: the symlink. Employees: one `library_items` row (`kind` decided by measurement: a seat's Read is
  limited to a granted plugin's folder, so the whole cupboard must sit inside the granted folder) and
  `library_grants` to the Media Studio department, and to the Web Studio when B84 stands. They get the
  cupboard, never the quarry. B41's customs scan takes it when B41 stands; until then step-4 gates stand in.
- B43 platform hub: engine notes for paid engines are written but tested only when the router and accounts
  exist. B28: no second library. B84: uses this one. B64: the studio master calls `/kisayol`. C29: shows
  as one group. B42: flags engine names gone stale. B33: local tests run one at a time until it stands.
  B32: no screen before his drawing; until then the three drafts reach him as today's drafts do.
  C41: personas point to `/kisayol`, never hold prompts.

## 8. Steps, each verified

1. Register this plan in `.planning/board-rows/B43.md`. — records ruler on commit.
2. Skeleton and `kisayol.mjs` with tests written first (check, index parity, pick, build, verdict, rank,
   content gate catches each banned case). — tests red then green; typecheck untouched (no package code).
3. Quarry build and content gate. — counts per step; sample review.
4. Measure whether `codex exec` drives the image tool headless with a reference image; if yes, a
   `kisayol.mjs render` wrapper; if not, the core's edit-type tests run in the Codex panel through `operator`.
5. Writing waves per category; review per category. — `check` green; reviewer findings fixed.
6. Core tests (~60). — samples on disk, test log written; a vision-capable helper checks product
   fidelity, no lettering, no rule breach; then one contact page for his eye.
7. Delivery: symlink; library registration through the house's existing path. — a real Media Studio
   seat, asked for a Meta ad for the test product, returns three recipes built from the cupboard.
8. Acceptance: one real job (the UGC trial B43 already names fits) done through `/kisayol`, three
   variants to his eye.
9. Sol's blind pass on the build; fixes; the battery if package code changed.

## 9. Risks

- Popular is not good for our product: our test and his eye outrank stars.
- Testing capacity: the Codex tool is manual today and the subscription has limits; H3 at 8 steps takes
  GPU time — the core first, the rest on first use, batches at night.
- Rule breaches inside rewritten prompts (people, lettering, music, brands): the deterministic gate plus a
  reviewer; the gate's word lists are tested.
- Prompt injection from raw internet text during curation: raw is data; the gate rejects agent-directed text.
- Engine drift: prompts tuned to engines that change; engine notes per engine; B42 re-test.
- Swelling: the quarry is reached only through compact `ara` output; helpers write, the lead samples.
- A seat may not reach files beyond SKILL.md: measured at step 7 before anything is registered.
- Two libraries growing (B84, B28): one cupboard, enforced by the row notes.

## 10. Decisions for him

1. First-release width: the coverage rule (about 300-400, a tested core of ~60, the rest tested on first
   use). Recommendation: yes.
2. Money: none — tests use the ChatGPT subscription and the local GPU; paid engines wait for the platform hub.
