# Matt Diamante's carousels — open questions (analyst C)

## 1. How the counts of PLAYBOOK §10 were made (so they can be re-run)

Source: `watch-links/2026-11-23-seo-geo/lists/matt-carousels.tsv` (comments, likes). Check run on 2026-11-23:
40 posts and 313 slides in the list; 40 posts and 313 slide lines in the four reader files; 313 slide files on
disk; no post differs. The ask class of each post was assigned by me from its slides and caption:

- **A** complete, no word: DTbo3RwDdNY DcTErNqlXq8 DUOtSVlEs3S Dfmi5P6FSrb Df4WVBwGedL DdgUnf2maYQ DUZqU8SjeN1
  DWyvowZDwZQ DfjwAyimfnp DU6L8dJDRfB DbiJjkKFfZy DUmnsqxjV3Y DfreVkvGcIK DWEZA96AQpi DWND7WtjRqN DaupsPsmd65
- **B** complete + word: Da54tyIlfki DajhYGSjSx8 DboSraDGWW4 DWJ5WlYlXTr DawbV2ajdnz Da_6d1jDbIG DbbhwTbGfx_
  DWR2tEAD1iX DdGkmPUFEBQ DWK1aI_jUNo Dcs0pjKmhFT Dc3H35UFZHL DWpFjAOgaSe DehxJkQmU6W
- **C** substance only by DM: DUqPtYGDbqe DdWBXiRmRHx DWPaZKlgb5P DcN7G7uFVHE DWXIHj4AfO9 Dd6EeDJGTM5 DdoC_-JGQF3
- **D** his own offer: DVb2N1JErkn DZNcWtrFY-G Dd3fwvVFLKZ

Two judgement calls a second reader may make differently: `Dcs0pjKmhFT` (method on the slides, tool address
only by DM) is B; `Dd6EeDJGTM5` (the idea on the slides, the prompt only by DM) is C. Moving either changes
no conclusion.

## 2. What I could not establish

| # | Open point | Why it matters | What was tried |
|---|---|---|---|
| 1 | **Saves, sends, views and reach** of the 40 posts. The slide captures show a third counter (reposts) beside likes and comments; the list did not record it, and an OCR pass on the 40 first slides read it reliably for only a few (e.g. 370 on `Da54tyIlfki`, 74 on `DaupsPsmd65`). | C20 rests on likes and comments only; likes are not reach. | OCR with tesseract on a crop of each capture; too noisy to use. Reading the 40 counters by eye, or a better crop, is a short job. |
| 2 | **Whether Instagram treats "comment WORD and I'll DM you" as engagement bait.** Meta has demoted "comment baiting" on Facebook since December 2017 (about.fb.com); I found no current Meta statement for Instagram. | If it is demoted, every class B and C post pays a reach cost the counts cannot show — one more reason for the public-page design. | Meta's Transparency Center page fetched empty; vendor guides only. |
| 3 | **OpenAI's own documentation of the ChatGPT business profile** — eligibility outside the US, what counts as a "mention", the business agent's inputs. | Rows 7 and 3 of the register lean on it. | Only third-party guides found (BrightLocal, LocalIQ, findskill.ai, Local Falcon); to be opened in the live product. |
| 4 | **Whether Google's AI calling has left the US**, and how Google chooses which businesses to call. | Decides where row 49 `ai-call-readiness` can be sold. | Google's two help pages (fetched) give the US list and no selection rule. |
| 5 | **His claim that the businesses Google's e-mail lists first are not the top-ranked ones** (`DcTErNqlXq8 s6`). | If true, answering beats ranking for this surface. | One screenshot of one search; only our own repeated test can say. |
| 6 | **The gated contents**: the BACKLINKS search-string sheet, the reply in the VIDEO post, the 20 prompts, the full content checklist, the TASKS checklist. | C13 is my reconstruction of the sheet; C15 infers the reply from his 2025 video. | Each needs a comment or an e-mail, which the brief forbids. a OPEN-QUESTIONS 3 and its CEO question 1 (ask him directly, as our consultant) cover the same. |
| 7 | **Dates and details of later Bing and Google reports**: Bing's grounding-query mapping, Intents and Topics (seen in Bing's June 2026 blog title and trade press); Search Console's "Search Generative AI performance reports" (a Google blog title of June 2026 seen in search, not read). | Register row 3 additions name them. | Titles seen; pages not read. Read before the skill is authored. |
| 8 | **Qwen-Image-Layered's licence** and quality on real client material. | Idea 7 and the row-29 addition. | Repository and paper located; licence not read. |
| 9 | **Who made whatismywebsiteabout.com** (no maker named; "launching soon"; uses Claude on titles and descriptions). | Only whether it is his — the method stands either way. | Page fetched. |
| 10 | **"Google just updated its AI content rules"** (`DehxJkQmU6W`, 15 Oct 2026) — whether the page changed then. | Minor; the text itself was fetched and used. | The fetched page carried no date. |

## 3. Do his other 237 carousels deserve reading?

**What these 40 held against a and b.** Of 21 items in PLAYBOOK, 5 are new (the AI-giveaway pass and client
rule, the topic map, Canva's layer split, the comment/like measurement, the repost measurement), about 10 are
sharper (mostly platform features a could only report — AI calling, ChatGPT profiles, Bing AI Performance,
Search Console platform properties — and his checklists' contents), and 6 contradict him or a source. Roughly
two thirds of the 40 posts added nothing beyond a line. By subject:

| Subject (posts) | Yield |
|---|---|
| platform news (8), Search Console and Bing how-to (5), Search Console social properties (4) | high — the slide-level steps and screens a lacked, and three factual errors found |
| checklists (4) | medium — his gated checklists' skeletons and numbers |
| free third-party tools (5) | medium — one new tool (layer split), one pattern (brand DNA) |
| backlinks (8) | low — three posts teach nothing on the slides; the rest is a §4 |
| AI prompts (3), his offers (3) | none — gated or sales |

**My judgement: do not read all 237 slide by slide** (about 1,850 slides at his median of 8). Instead:

1. **Collect the metadata of all 277** — comments, likes, the repost counter, the caption, the date, and the
   ask class from the caption and first and last slide. Cheap, and it tests C20 on the whole population
   instead of its two tails. This is the read with the highest value per hour.
2. **Read slide by slide only the platform-feature and checklist carousels** among the 237 — those whose
   caption or cover names a Google, OpenAI, Microsoft or Meta feature, a tool, or a checklist not in a's tool
   list. From the subject split above I would expect 40 to 60 posts. Backlink, prompt and offer carousels are
   skipped.
3. Keep the result to the same tags (new / sharper / contradicts) and stop if the first twenty yield nothing
   new.

## 4. For the CEO to decide

1. **The answering worker as a product** (FOR-THE-HOLDING idea 1): whether the holding offers an AI that
   answers a client's phone, in which market first (Google's calling is US-only today), and the telephony
   spend per client (money out). The AI-disclosure wording on calls is his to approve once.
2. **The carousel account**: the account itself is an identity step, and its first language and market are
   his. The format needs no face, so this decision does not wait on the face question of b OPEN-QUESTIONS 1.
3. **The holding's own entities on the AI surfaces**: the ChatGPT business profile (government ID through
   Persona) and the Google message agent (EIN or personal ID) stop at him — a OPEN-QUESTIONS 4 already holds
   this; the carousels add only that both are now live.
4. Nothing else here waits on him: the gate lines, the topic map, the layer split, the link strings and the
   news-truth gate can be built and tested inside the approval gate.
