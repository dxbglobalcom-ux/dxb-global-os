# Persona scan for DxB Web Studio — reader brief (read-only)

The CEO's word (2026-11-02, verbatim): *"Personalize taranacak, evet. Ama yani o şey personal taranıp o şeye
bağlantılanacak, yani web ofisine bağlanacak aynı zamanda."*

DxB Web Studio is the holding's web office: it builds premium websites, landing pages, e-commerce sites, web and
mobile app interfaces for clients, with SEO (including AI-search visibility), multilingual sites, privacy/cookie
compliance, launch, and monthly care/SEO packages. Its default look is showy, luxurious, "wow".
A job is owned by a general site master; specialists are taken from department "cupboards" when needed.

Measured lesson (2026-10-22 trial): a team built from these personas did badly — titles were right, the insides
were narrow, long (~20 KB) and written for the holding's own dashboard; the 2026-10-29 winning team used short (~2 KB),
craft-focused specialists. So judge each persona by its CONTENT, not its title.

## Your job
Read EVERY file listed in your group file completely. For each, append one JSON object (one line) to your rows file.
Read-only: change no file except your own rows file. Do not open other groups' rows.

## The studio's seats
Core: `site-master` (owns the job, designs the whole) · `art-director` (directions, fresh-eye review before delivery) ·
`visual-producer` (studio photos/clips) · `copywriter` · `frontend-motion-dev` (pages, forms, motion) · `seo`.
Called ring: `legal-privacy` · `quality` (accessibility, speed, customer eye) · `commerce` (e-commerce, checkout/CRO) ·
`ads-tracking` · `media-studio` (film) · `research-domain` (unknown sector) · `sales-client` (client finding, later).

## Row keys (values in English)
{"file": path, "dept": folder, "title": the persona's own title, "does": 2 sentences on what it really does, from the content,
"fit": "core" | "ring" | "no", "seat": one seat key above or null, "why": 1 sentence from the content,
"faces": "clients" | "holding" | "mixed" (is it written for outside clients' work, or for the holding's own screens/CEO?),
"bytes": file size, "problems": list of short strings — e.g. written for the holding's dashboard, a construction-time
example frozen in as a goal, plainness/restraint direction left in, too long or too narrow for a web job, outdated model
names, duplicated with another persona (name it) — empty list if none,
"best_lines": up to 2 short quotes (≤ 25 words each) worth keeping in a short studio version, or []}

Finish with only: the number of rows written and any file you could not read.
