# ScrollCraft → the holding's studio — Sol's verdict and the fixes (2026-10-15)

Job: ScrollCraft generates stills and clips on the holding's own ComfyUI studio (FLUX.1-Krea-dev, MiniMax H3)
instead of kie.ai; a paid engine only where the studio falls short, under a per-site budget
(`scrollcraft-studio-first-2026-10-15`). The skill lives outside git at `~/.claude/skills/scrollcraft/`;
the audited copies are in `evidence/` (`pre-fix/` = what Sol read).

Auditor: GPT-6.1 Sol, high, one blind pass (`sol.raw`, kept out of git). Real runs on the card before the audit:
still 1920x1088 in 70 s; clip 1152x640, 5.17 s, no audio stream, in 152 s.

## Findings and what was done

| # | Sol's claim | Verdict | Grade | Fix (studio.mjs after the fix) | Test |
|---|---|---|---|---|---|
| 1 | The studio link does what he asked | STANDS | — | — | real runs |
| 2 | The gate protects the machine | REFUTED: N/A GPU reading passed; any GPU process started in ComfyUI's folder was discounted | A | every missing/invalid card, RAM or swap reading refuses (exit 4); only the verified server PID (port listener ∩ `dxb-comfyui.service` MainPID) is discounted | 16, 17, 18 |
| 3 | Only 127.0.0.1 is contacted | REFUTED: redirects followed by default | A | `redirect: "error"` on the single fetch site | 19 |
| 4 | No debris in ComfyUI's input folder | REFUTED: failed ffmpeg left a file; timeout deleted inputs of a live job | B | target registered before ffmpeg; on timeout the job is deleted/interrupted and inputs go only when ComfyUI confirms it gone | 20, 21, 22 |
| 5 | Same CLI as kie.mjs | REFUTED: URL frames exit 1; extreme aspect exceeded the pixel cap | B | URL frame/ref → exit 3 `STUDIO_CANNOT`; aspect outside 1:3…3:1 → exit 3 before the GPU; size never above 1152x640 px | 23, 24 |
| 6 | Honest exit 3 for what the studio cannot do | STANDS | — | — | — |
| 7 | probe/doctor report the truth | REFUTED: gate refusal printed but exit 0, doctor green | B | probe 0 ready / 4 busy / 1 missing; doctor ok / busy / FAIL | 25, 26 |
| 8 | No secret read | STANDS | — | — | — |
| 9 | Tests prove the broad claims | REFUTED: failure paths untested; builders loaded from the live folder | B | the failure cases above added; builders pinned in `scripts/fixtures/h3/`; the file states its evidence boundary | all |

Every new test was red on the old code (26 run, 15 pass, 11 fail) and is green after the fix: `evidence/tests.txt`
(26 / 26). Lead's own checks after the fix: probe on the real machine exits 0 and names the ComfyUI PID;
a URL head exits 3.

## Left as they are (C — older than this work, or seen and small)

- `packages/outbox-executor/src/media-lane.ts:85-93` also passes on an invalid GPU reading (older; the holding's lane).
- SKILL.md's upstream body still describes `KIE_AI_API_KEY` as needed; house rule 2 overrides it by its own text.
- Seen by the fixer, not fixed: a `/queue` reply without the two lists counts as an empty queue (ComfyUI still
  queues the job; card/RAM/swap checks still apply); a `still` timeout does not cancel its job (stills stage no
  input file); still sizes have no aspect limit; a polling failure mid-`shot` (not a timeout) deletes the inputs.
- ⚠ UNVERIFIED: interrupting a real running H3 job (tested against the fake only); visual quality and first/last
  frame fidelity of real clips (ffprobe cannot judge them).
