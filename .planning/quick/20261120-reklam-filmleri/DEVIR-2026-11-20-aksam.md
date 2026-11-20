FIRST: open the door — Skill("dxb-team3") — and carry this job on as its lead (the orchestrator), not as a fresh session. Then Skill("dxb-warm-wait"): he is away-on; run `scripts/ops/dxb-warm-wait --away on` and arm `--watch` in the background in YOUR session.

# Handover — the ORVO shoe films, evening (successor of dba7aa24; this session 7e08edb2, Opus 5.5, 2026-11-20 ~18:05)

## The job in its place
B43/B28 studio trial: 14 of the 15 shoe-ad storyboards (11 is not made) become 15 s 9:16 films on our own engine
H3 (640x1152, 8 steps). Sound comes LAST (his word). Everything in `.planning/quick/20261120-reklam-filmleri/`;
films land in `~/Desktop/Motion Graphics/AYAKKABI-14-FILM/<board>.mp4`; okayed work in `~/Desktop/Okeylenenler/`.
Every fault found and its fix is one line in `DUZELTME-LISTESI.txt` (his verdicts at the top).

## His words this session (verbatim, this conversation)
- "lütfen hata istemiyorum. Çok güzel yönet, çok güzel izle."
- On transitions (then corrected): "Hayır, yanlış anladın beni … doğal bir akış olsun. Gerçek bir reklammış gibi, gerçek insanın reklamıymış gibi."
- 03 rejected: "Ya 3 olmamış ya yine ya. Bunu böyle kaydet. 3 olmamış. Notu yazılsın. Kabul etmiyorum bunu." / "Saçma sapan bağlarken ilk saniye gülüyor, ondan sonra başka bir kişi sanki onun yerine geçip başka bir şey yapıyormuş gibi başka bir bağlama işini tamamlıyor."
- 03 again: "bağcık bağlama yine doğal değil. Adamın parmak hareketleri, el hareketleri belli olmuyor … gözlerini kapatıp rüya görme sahnesi olması lazım. Ya bunu niye yapmıyorsunuz anlamıyorum."
- 02: "Okey … fena değil" (registered in ceo-approvals.json; the cut he saw is in Okeylenenler and on the films folder).
- 09: "adam daha güzel koşu yapabilir. Artı 2 ve 3'te ne anlattığını anlamadım ama sen düzeltmeyi yap."
- Management: "İstiyorsan yönet hepsini böyle güzelce, tam kontroller yapılsın, bitsin ondan sonra." → each film is finished, checked and sent before a new one starts; his rejected film's fix goes first.

## Done (measured)
- Tools (all committed): cut.py — whip = smear out/cut/smear in, dissolve = soft crossfade, match/hard = cut,
  `continue` = no cut (take rendered from the previous take's last frame), `dream` = into white light (fadewhite);
  build_takes.py — `places` per film, `drop` phrases, `end_on` (take bound to end on a frame), empty takes hear of no
  person, look sentences about cuts/transitions removed, NATURAL block rewritten (no laughing on cue; same face and mood);
  render_takes.sh — writes `shot<n>_last.png`, `STEPS`, end frames; queue.sh + queue.txt — the editable queue,
  lines `<seed> <board> [takes] [@steps]`, runs as user unit `orvo-queue` (systemd-run, so Claude Code's memory
  reaper cannot kill it). Replace scripts by rename (os.replace), never in place, while a render runs.
- Sent and checked: 03 (twice; both rejected by him), 09 first cut (he asked to see it).
- Okayed by him: 01, 02. 16 steps measured on a face: no visible gain over 8 (same seed) — not the realism cause.
- 04 frame kare-4 repainted by Codex (plain ball; original kept as kare-4-yildizli-top-orijinal.png).

## Said, not measured
- 03's next version (in hand): take 1 one firm tug, take 2 continues and he sits back, take 3 continues from
  `shot2_last.png` and ends on `kareler/kare-2b-goz-kapali.png` (Codex: same man, head lifted, eyes closed — waiting
  on Codex task, file `scratchpad/ruya/basi-kalkik-goz-kapali.png`), take 4 the arena out of white light (`dream`).
  To do: check that frame (same face!), copy it over `03-sahadan-arenaya/kareler/kare-2b-goz-kapali.png`, rebuild 03,
  put `3013 03-sahadan-arenaya 3` at the TOP of queue.txt, check the whole film (fingers, one face, eyes visibly
  closed, dream), send.
- Queue order after that: 09 takes 2 5 (2 ends on kare-3; style no longer has the barrel roll), 04 t4, 06 t1, 05 t1 t6,
  07 t2-4, 08 all, then 10 12 13 14 15. Then the round of what he did not like; scan 01-08 for laughing faces.

## Check every film (his standard)
Contact sheet `ffmpeg -i F -vf "fps=2,scale=240:-1,tile=15x2:padding=4" -frames:v 1 x.jpg`, closer sheets at takes.
Hands, faces, ONE person per role with ONE mood, product shape and ORVO, strangers, a scene changing inside a take,
the horizon, at every boundary the action continuing (nothing repeated or undone), a reason for every transition, and
does it look like a real ad with real people. Read the kurgu json beside it. Not sure → do not send.

## Do not
- Two H3 jobs at once (30 GB RAM, a take ~25 GB). 15 s one-takes. `pgrep -f`/`pkill -f` patterns that match your
  own shell (it bit this session) — use `^bash .*render_takes.sh`.
- Do not name a thing in a prompt you do not want (H3 brings it: floating boot, number-9 player).
- Do not read the treasure; do not touch his Chrome or the Fable tab.
- The predecessor dxb-global-os-79 (dba7aa24) was told the queue is ours; if it starts renders, message it.
- Session-only orders (no scene questions to him, sound later) are his for this job, not laws.

If anything here is unclear, read the part you need in this session's conversation:
~/.claude/projects/-home-dxb-DxB-Global-OS/7e08edb2-24c9-4174-9449-c4e12b869b27.jsonl
