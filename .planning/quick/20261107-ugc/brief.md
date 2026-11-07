# Brief — the hyper-realistic AI UGC reel (important review, two blind readers)

Job folder: `/tmp/claude-1000/-home-dxb-DxB-Global-OS/d5674644-9681-41e7-88fc-684b1a3df0bd/scratchpad/ugc/`
Repository: `/home/dxb/DxB Global OS` (read its `.claude/CLAUDE.md` first section for what the holding is).

## His words (the CEO, 2026-11-07, verbatim parts)

"Bu bizim ajansta UGC videoları üretilecek değil mi? Bak, bu adam bize tam anlamıyla hangi UGC videoların çok realistik
olarak üretildiğini anlatıyor. Nasıl? Adım adım, bak, kelime kelime çok önemli. … Bizim UGC ve reklam videolarımız çok
önemli yani. Çok gerçekçi, ses, görüntü, her şey böyle orijinal. Yani hiçbir şekilde anlaşılmaması lazım … bizim stüdyoda
gerçekçi üretilmezse de bizim paralı şeyler kullanılacak yani. Ama ilk hedefimiz default olarak bizim fabrikada üretilmesi,
istasyonda üretilmesi lazım. … En sonunda Eleven Labs, yani voice olayını da söylüyor. Ama bizim tabii ki ücretsiz olarak …
Voice Studio'yu kullanacağız, Eleven Labs'in instead of. … Hyper realistic, super realistic … it shouldn't be understood by
anyone that is being made up of AI slop."

## The source

- Reel: https://www.instagram.com/reel/De86u1YgMrs/ — 96 s. Video: `/home/dxb/.cache/link-watch/U1-De86u1YgMrs.mp4`.
- Transcript (timed): `transcripts/U1-De86u1YgMrs.txt` — read every line.
- Frames: `frames/U1-De86u1YgMrs-all/sheet01.jpg … sheet09.jpg` (one a second + every scene cut) — read every sheet;
  the before/after examples and any on-screen tool names, prompts or settings are content. Where a name or setting flashes
  shorter than a second, step through it: `bash "/home/dxb/DxB Global OS/.claude/skills/dxb-watch-links/frames.sh" <jobfolder> <video> <sec> …`.

## What to produce — `reader-<your name>.md` in the job folder, in Turkish, and open nobody else's reader file

1. **Word by word, step by step.** Each of his five steps (and the before/after demo): exactly what he says and shows, the
   second it is at, and WHY it removes the "AI tell". Separate what he states from what you infer.
2. **Our factory first (free, default).** For each step: how the holding's own studio does it on our own GPU, with the tools we
   already hold or free open tools — name the tool, the setting, the order. Measure what we hold, do not guess:
   `.planning/board-rows/B43.md` (Media Studio), `B28.md` (agency seat, H6), `B12.md` if present (voice: Voice Studio and
   Voicebox), `tools/scrollcraft/skill/scripts/studio.mjs` (the studio's H3 / FLUX recipes), `~/tools/h3/studio/KATALOG.md`,
   `HOLDING-OS-MASTER-PLAN/CAPABILITY_ARSENAL_DOCTRINE.md` §1-bis (the paid shelf). Voice: Voice Studio instead of ElevenLabs
   (his word). Frame rate/upscale: a free equal of Topaz Starlight (e.g. RIFE/FILM interpolation, an open video upscaler) —
   look them up at their real source (GitHub stars, last commit, licence, GPU need).
3. **Paid fallback** for each step, only when the factory falls short — best quality for the price, named with price.
4. **The pipeline end to end** for one UGC ad on our studio: reference → script → image → video → voice → lip sync (if needed)
   → grade → interpolate/upscale → final check, with what is still missing in the holding to run it.
5. **Where it goes**: which board row(s) and what each must gain; nothing is installed or started.
6. **Anything in the video that is wrong, risky or overstated**, said plainly.

Under ~900 words. Exact tool names, versions and settings; a source URL beside every outside claim.
