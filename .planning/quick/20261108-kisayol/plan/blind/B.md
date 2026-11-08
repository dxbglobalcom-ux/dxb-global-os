**/kisayol plan for B43, 2026-11-08, second writer.** The raw TSVs, the home directory and the apple-design shelf skill were not readable in this sandbox, so those parts rest on the brief's measured facts.

**1. Decisions**

- **Home: `tools/studio-prompts/kisayol/`, installed as a global skill** at `~/.claude/skills/kisayol` by the scrollcraft pattern: repo copy is the truth, the installer copies and proves identity by sha256. Why: global skills are measured, not budgeted, so the project opening budget is untouched; a project door holds construction procedure, not agency craft; the same folder becomes the employees' plugin.
- **One file per shortcut, generated indexes per shelf.** Frontmatter for machine fields, body for the prompt forms. Why: the worker reads one shelf index and one file, so 300 or 10,000 shortcuts cost a session the same; TSV indexes load later into the registry unchanged.
- **Self-contained prompts.** Each file carries its full prompt; the realism files stay where they are as the authors' language. Why: an employee seat's Read is confined to the plugin folder.
- **Names: one English ASCII word, Turkish aliases.** Pattern `[a-z0-9]{3,24}`, unique across names and aliases. The trigger `/kisayol` keeps his word; everything under it is English.
- **Two statuses in one library: draft and tested.** This reconciles "64 is far too few" with the tested core. Every shelf is filled with drafts for breadth; a core per shelf is sampled and seen by his eye. Employees receive a bundle built from tested rows only; building sessions see everything, labelled. Why: LAW B.
- **Three variants, one axis apart.** Same base shortcut; each variant changes one axis: scene, light and camera, or format. Why: his yes or no then names one shortcut.
- **Ranking is his clicks only.** Rank is approvals minus rejections, recency-weighted; three rejections without an approval in 90 days sink a shortcut to dormant. Nothing is deleted; he never types a score.
- **Engine-neutral.** A shortcut yields prompt forms, never an engine; engine names appear only as form labels, which B42 can flag. Routing stays in the B43 hub.

**2. Structure**

```
tools/studio-prompts/kisayol/
  SKILL.md                how it works, the shelves, compose rules, three-variant flow, the rules
  INDEX.md                generated: shelves with counts
  index/<shelf>.tsv       generated: one row per shortcut
  shortcuts/<name>.md     frontmatter plus prompt forms
  feedback.tsv            his verdicts, appended by the session after his click
  SOURCES.md              generated: provenance and licence per source
  install.sh              copy to ~/.claude/skills/kisayol, sha256 identity, --check
  scripts/                build-index.mjs, lint.mjs, build-release.mjs, contact-sheet.sh
  curation/               filter.py, dedupe.py, rank.py, lexicons/  (python3 -I; raw TSVs stay out of git)
tests/studio/kisayol.test.ts   lint, index equals files, release holds only tested, locale parity
```

**3. Schema and worked entry**

| Field | Values |
|---|---|
| name, aliases | trigger word; Turkish and English aliases |
| title_en, title_tr, desc_en, desc_tr | what the index shows, both locales |
| medium, kind | image, video, both; base or modifier |
| shelf, tags | taxonomy cell; free tags |
| input, output | product-photo, cast-photo, still, none; aspect and platform |
| cast, scene_class | none, house, client-request; safe or review |
| forms | codex, seedream, klein, h3, each ok, untested, short, from-still or none |
| composes_with, conflicts | names that stack; names that never stack |
| status, rank | draft, tested, dormant; approved, rejected, last_approved |
| samples, provenance, version | KUTUPHANE rows; raw row ids; integer |

`shortcuts/3dbillboard.md`:

```yaml
name: 3dbillboard
aliases: [reklampanosu3d]
title_en: 3D corner billboard
title_tr: 3B köşe reklam panosu
desc_en: The product as a giant anamorphic display on a tower's corner screen, shot from the street
desc_tr: Ürün, bir kulenin köşe ekranında dev anamorfik gösterim olarak, sokaktan çekilmiş
medium: both   kind: base   shelf: product-outdoor   tags: [ooh, hero, urban]
input: product-photo   output: 3:2 still, 9:16 crop   cast: none   scene_class: safe
forms: {codex: ok, seedream: untested, klein: short, h3: from-still}
composes_with: [goldenhour, rainwet, nightcity, pushin]   conflicts: [whitebg, flatlay, 360sheet]
status: draft   rank: {approved: 0, rejected: 0}   samples: []   provenance: [ads-01044]   version: 1
```

Full form, Codex and Seedream:

```text
Use the attached product photo as the only source for the product: keep its exact shape, proportions, colours, label layout and material; do not redraw or restyle it. Show it as a giant hyper-real anamorphic 3D display on the curved corner screen of a glass-and-steel office tower at a busy junction, leaning out past the screen's bezel. Late-afternoon sun low from camera-left; the screen's own light adds a cool fill to the pavement and facades. Photographed from street level across the junction, full-frame camera, 35 mm lens, slight upward tilt; passers-by blurred in motion in the foreground, a bus passing on the right. Real materials: brushed-metal bezel with fine scratches, glass with layered sky reflections, stained concrete. Natural exposure, restrained grade, fine grain; no glow, no HDR look, no readable faces. The screen carries no text and no logo; leave its lower band a plain dark panel for a mark added in post.
```

Short form for klein: the same facts in two sentences. Video form for H3, from the approved still: a six-second push-in from street level, highlights shifting as the product leans out, pedestrians in motion blur, constant exposure, no text, no cuts. Post: the client's mark from the real file onto the dark band, grain per B43 step 8. Test: one native draft per form, a contact sheet, his eye; the status flips to tested only from a feedback row.

**4. Curation pipeline**

| Step | Who | What | Gate |
|---|---|---|---|
| 0 Freeze | helper | sha256 and row count of the three TSVs into B43.md | hashes recorded |
| 1 Filter | helper-writer writes, lead runs | drop rows hitting the forbidden lexicon, real-person names, SD tag-soup under 40 chars from non-A sources, CJK rows except grade-A sources kept for translation | lexicon hits on output 0 |
| 2 Dedupe | same | normalise, simhash near-duplicates with stdlib only, one representative per cluster, cluster size kept as popularity | under 2 % duplicates in a 500-row sample |
| 3 Rank | same | source grade from sources-*.md, stars, engagement or stability where present, recency, cluster size; top rows per keyword shelf into candidates.tsv | lead reads 30 random rows |
| 4 Shelve | helper-writers, one shelf each, own files | name the shortcuts from the shelf's candidates | lint exit 0 |
| 5 Rewrite | same | one house prompt from the best candidates: observable detail, motivated light, named lens, material, restrained grade, bans as instructions; brands and persons stripped; cast and scene set; three forms | lint; lead spot-reads 10 % per slice |
| 6 Translate | helper-writer | title_tr, desc_tr, aliases; grade-A CJK candidates to English before step 5 | parity in lint |
| 7 Sample | lead or fork, by hand | Codex image tool for stills; studio.mjs shot for video at 8 sampling steps; native size, no upscaling | files exist at native size |
| 8 His eye | the CEO | contact sheets, one click per frame | feedback row with his words and date |

The raw never enters the lead's context; the lead reads counts and samples.

**5. First release**

Shelves. Image: studio product, lifestyle, outdoor and OOH, platform ad formats, people and UGC stills, food and drink, fashion and accessories, cosmetics and skincare, real estate and interiors, automotive, poster and key visual, mockup and packaging, plus modifiers for light, camera, material, finish and format. Video: camera moves, product reveal, platform formats, UGC video, image-to-video, transitions, motion graphics.

Width is a coverage rule, not a count: every shelf holds at least eight drafts, and three per shelf are sampled and seen before ship. Yield is measured, not promised.

| At ship | Rough yield |
|---|---|
| drafts across 24 shelves | 200 to 300 |
| tested core | 60 to 75 |

His five named shortcuts and the 64 codewords enter as drafts with full prompts; the 15 realism and 15 UGC modules become the first modifiers. Tested before ship: lint on every file, one native sample per core shortcut per form, his eye, install identity, and the employee bundle holding tested rows only.

**6. The worker's flow**

1. Read the brief; write the need in one line: medium, platform and ratio, subject class, goal, cast constraint, inputs available.
2. Open INDEX.md, pick one or two shelves, read only their index files.
3. Per variant choose one base and up to three modifiers; drop any pair listed in conflicts; drop any variant whose scene_class is review or whose cast breaks rule g at B43.md:17 unless the brief records the client's request.
4. Compose three variants one axis apart; prefer higher rank, and put one draft or low-ranked shortcut in the third so the library learns.
5. Generate native drafts on the studio's current default engine; never upscale before his eye.
6. Build the contact sheet with ffmpeg, shortcut names under each frame, and bring it to him.
7. On his click append feedback rows; the approved output enters KUTUPHANE.tsv on his word and is proposed as a new shortcut when it carries a new recipe.

**7. Delivery and the board**

Building sessions run install.sh; the battery runs its check. Employees get a tested-only bundle tagged by date, registered in `library_items` as kind plugin, name kisayol, version the tag; the Media Studio department's grant goes through `control_library_action`, which he clicks. The seat then receives the Skill tool and a Read confined to the bundle, as `packages/orchestrator/src/worker-shim.ts:444` already does for granted plugins. No raw row reaches an employee; the bundle is the holding's own text, so B41's customs path holds.

Board: the B43 hub router consumes the forms; B64's studio master calls the skill; B28 winners and B84 needs enter as drafts through the same intake; B12 owns sound, video shortcuts carry none; B42 reads the form labels; B33 queues local samples once built, until then samples run by hand; C29 shows one group with children once a screen exists; B32 means no screen now; C41 personas point at the skill and hold no prompts. Order: the plan is registered in B43.md now; skill and library are built at B43's rank after the reorder.

**8. Ordered steps and verification**

1. Register the plan as an adaptation inside B43.md. Verify: only that file changes.
2. Freeze raw hashes. Verify: sha256sum output in the row.
3. Curation scripts, lexicons, fixture tests. Verify: tests pass, output lexicon hits 0, counts printed.
4. Skeleton: SKILL.md, taxonomy, lint, index builder, three seed shortcuts. Verify: lint exit 0, index equals files.
5. Shelf slices by parallel helper-writers. Verify: lint, spot-read, parity.
6. Core sampling and contact sheets. Verify: native-size files, one per form.
7. His eye. Verify: feedback rows; status flips only by script; until then every shortcut carries the UNVERIFIED label.
8. Install, typecheck, battery, Sol pass. Verify: IDENTICAL on check, battery green.
9. Release bundle, registry row and grant in the construction engine. Verify: SELECT shows the row, the bundle test passes, a granted seat lists the Skill.

**9. Risks**

- Keyword categories are guesses; step 4 shelves by hand and measures a sample.
- Popularity is not ad quality; grade and recency outrank cluster size, and cutting SD tag-soup wholesale loses some good rows.
- Brand or person leakage past lexicon, review and lint; the residue is named in the row.
- Safe parts can compose a forbidden whole; conflicts, scene_class and the drop rule guard it.
- Prompts tuned to Seedance or nano-banana may not transfer; re-sample on engine change through B42.
- His eye is the bottleneck; contact sheets batch verdicts.
- No local reference-edit model; edit-type shortcuts sample only through Codex or a paid engine.

**10. His decisions**

1. Money: none for the first release; sampling runs on the Codex tool and the local H3 lane. Recommend no spend now; paid engines arrive with the B43 hub.
2. Content: drop every raw row hitting the forbidden lexicon with no exception list; keep woman-presenter shortcuts flagged client-request and never a default pick; video shortcuts carry no music. Recommend yes to all three.
3. Scope: drafts visible to building sessions, tested only to employees. Recommend yes.
4. Order: may the curation, helpers only and no money, run before the board reorder while the skill build waits its rank? Recommend yes; it sorts, it does not build.
5. The creator's 45 DM shortcuts need an outward account step. Recommend skip; we build our own and the five named are covered.
