## Report: Avenox, "Limitini Claude mu Bitiriyor, Efor Ayarın mı?" (Iy8x1GM49Qc)

### A. What was examined
- **Video metadata.** Uploaded 2026-10-07, which is after the Opus 5.5 release of 2026-09-22. Length 1321 s, 29,188 views, channel Avenox. Source: the `yt-dlp --print` output.
- **Transcript read whole: yes.** The Turkish captions are manual (`tr.vtt`), 558 lines, converted to `.../v6-avenox/tr.txt`. I read every line.
- **Description read.** It has the chapter list, a methods note and the links.
- **Frames.** I downloaded the 720p video, extracted 22 frames and read 17 of them. The ones that carry data are f44, f160, f300, f315, f383, f483, f560, f705, f1015, f1095, f1195 and f1245. Several others caught animation-blank title cards: f2, f278, f422 and f810.
- **Pages read.**
  - github.com/avenoxai: the repo list, the `avenoxskills` README, and `skills/fable-orchestration/SKILL.md` and `skills/limit/SKILL.md` in full.
  - Anthropic `platform.claude.com/docs/en/build-with-claude/effort.md` and `.../about-claude/pricing.md`, fetched 2026-10-12.
  - The channel's last 20 video titles.
- **The skill.** This video shows no skill. He says so at 21:33 ("Bu videoda herhangi bir özel skill kullanılmadı… özel bir MCP… özel bir repo"), and the description repeats it. For the CEO's "skilli izle" note I therefore read his published skill repo instead. Which video the CEO meant is unclear. A likely candidate is 5LLLxHxkCnI, "I'm Rewriting My Skills One by One" (UNVERIFIED, not watched).

### B. Findings
**Test setup**
1. MEASURED · He ran Opus 5.5 and Sonnet 5.5 at 5 effort levels on 12 tests. Costs are list-price equivalents, but the runs were done on a subscription. "Çoğu hücrede bir ya da iki koşu var; komşu seviyeler arasındaki küçük farklar kesin sonuç değildir." · description; 0:15.
2. MEASURED · There was no special skill, MCP or repo, only default usage · 21:33–21:46.

**Results per test**

3. MEASURED · Opening claim: the same Sonnet job cost $1.66 at one effort and $9.84 at another, with the same score ("neredeyse 6 kat parayı aslında boşuna vermişim") · 0:00–0:09 · description. This is the 8-task test (row 6).

4. MEASURED · **Chess engine tournament.** Each engine played 144 games.

| Model and effort | Score | W/D/L | Time | Cost |
|---|---|---|---|---|
| Sonnet max | 74 | 84/45/15 | 36 min | $2.99 |
| Sonnet xhigh | 69.8 | 74/53/17 | 9 min | $1.18 |
| Opus max | 64.6 | 69/48/27 | 18 min | $3.26 |
| Opus xhigh | 63.9 | 65/54/25 | 16 min | $2.49 |

Location: frame f44; 0:41–1:31.

5. MEASURED · **Compress three images under 2 KB, judged by a judge model.** Opus's best run took 32 min, cost $4.02, and used 70k thinking and 104k output tokens. Sonnet max scored 86.1 (average 83.2) in 34 min for $3.41, with 125k thinking and 165k output tokens. Sonnet high cost about $1 · f160; 4:37–4:48. In his words: "Opus'un xhigh'ı baya rezalet… high'ı da" · 4:22.

6. MEASURED · **PR review: 10 seeded flaws plus 3 traps.** Opus xhigh was the cheapest level that was good enough: 75.7 for $2.03. The best was Sonnet max at 75.9 for $4.28.

| Effort | Opus avg | Sonnet avg | Opus cost | Sonnet cost |
|---|---|---|---|---|
| low | 58 | 41 | $0.42 | – |
| medium | 60.1 | 47 | $0.70 | – |
| high | 70.3 | 56.2 | $0.95 | – |
| xhigh | 75.7 | 65.4 | $2.03 | $0.89 |
| max | 73.1 | 75.9 | $2.94 | $4.28 |

No model found flaw #7 · f300/f315; 4:55–6:15.

7. MEASURED · **"8 gerçek iş": eight routine repo tasks, 2 easy, 4 medium, 2 hard.**
   - Sonnet low: 100 for $1.66.
   - Sonnet medium: 97 for $1.44. This was the cheapest level that was good enough.
   - Sonnet max: 100 for $9.84, taking 37 min with 139k thinking tokens.
   - Opus max: about $3.25. Opus low: 100.

   Moving from low to max added 0.0 points for both models · f383; 6:17–7:13. In his words: "Ciddi anlamda hiçbir mantığı yok" · 7:13.

8. MEASURED · **Vague optimization task ("bu problemi iyi hale getir").**
   - Sonnet max scored 79.3: 8.0× faster, 29/29 correct, 40 min, $6.04, 127k thinking tokens. It was the most expensive run.
   - Opus's best run was 7× faster.
   - One Opus run scored 32.5 because it changed the rules and failed 7 of 29 scenarios · f483, f560; 7:49–9:27.

9. MEASURED · **Three-shadow sculpture.** Opus was correct on every run and was faster and cheaper. Sonnet was bimodal ("ya çok iyi yaptı ya çok kötü"), and some Sonnet runs failed outright · 9:33–11:33.

10. MEASURED · **3D tea glass, Sonnet, scored by eye.**

| Effort | Time | Cost | Thinking tokens | His score |
|---|---|---|---|---|
| low | 4 min | $0.41 | 12k | 9 |
| high | 20 min | $0.74 | 27k | lower |
| max | 32 min | $3.95 | 137k | 9 |

Location: f705; 11:44–12:39.

11. MEASURED · **Bosphorus tour, Opus, scored by eye.** He gave low 3, high 7 and max 6. Low took 4 min and max took 32 min, which is "8 kat fark" in both time and cost · 12:58–13:36.

12. MEASURED · **Sofa move, Sonnet.** Low cost $0.74 and was "neredeyse tamamen doğru". Xhigh cost $2.73, about 4×, with no meaningful gain · 14:56–15:07.

13. MEASURED · **Striped-fabric cut plan.** Sonnet xhigh scored 100%, and the cost difference from low was small, so here higher effort paid · 15:47–16:13.

14. MEASURED · **Cash reconciliation.** Both models scored essentially full at low and at xhigh; Sonnet low was the winner at 99.98. The cost difference was 2.5× · f1015; 16:51–17:27. Even so, he would personally use Opus at medium or high when real money is involved · 17:27.

15. MEASURED · **"Site is broken on mobile", a deliberately vague prompt.** Sonnet low scored 79, losing points on UI-design rules. Sonnet xhigh scored full · 17:45–19:09.

**His rules and claims**

16. OPINION · The vagueness rule: "Modelin ne kadar düşünmesi gerekiyorsa… Opus tarzı modelleri belli bir düşünce seviyesinin üstüne çalıştırmak iyidir. … görev ne kadar netse…" az düşünme yeter. Also: "sizin zorunuz gibi düşünmeyin. Modelin zoru gibi düşünmeniz lazım." · 18:15–18:36; f1095.

17. OPINION · Sonnet "çoğu durumda sandığımız kadar ucuz olmuyor. Opus bazı durumlarda daha ucuz bile olabiliyor". The cause, in his words: Sonnet overthinks at high effort while Opus "kendine çok güveniyor" · 19:18–19:23, 21:11.

18. OPINION · His settings:
    - Opus at medium or high ("benim ayar"), xhigh rarely ("az"), max never ("hiç").
    - Sonnet only at low or medium. "medium'un üzerine atıyorsam… düşünülmesi lazım… Opus'u kullanmayı tercih ederim" · f1245; 20:23–21:06.
    - Even with plenty of limit, use it for parallelism, not effort: "High veya xhigh'da… Opus'u. Altına daha fazla agent veriyorum… paralelleştirmeye harcıyorum" · 3:35–3:39.
    - "8 kat daha çok token… limitlerim 8 kat daha hızlı bitecek" · 14:02–14:08.

19. OPINION · Sonnet as a sub-agent: "Opus'un altına Sonnet vermekten çekinmeyin" · 19:25–19:34.

20. OPINION/ANECDOTE · For a hard task, say so in the prompt ("Bu görevin ben zor olduğunu düşünüyorum. Elinden geleni ardına koyma") and Opus max would then beat Sonnet. He did not test this · 8:28–8:36, 21:17–21:25.

21. EXPERT claim · "Artık caching'i de patlatmıyor efor değiştirmek" · 20:03–20:21.

**Anthropic documentation (OFFICIAL, fetched 2026-10-12)**

22. Per-message effort keeps the prompt cache on Opus 5.5, Sonnet 5.5 and Haiku 5.5. It is a beta behind the header `mid-conversation-output-config-2026-07-01`. On other models a new top-level effort "starts the cache over" · effort.md, "Change effort mid-conversation".

23. Defaults: Opus 5.5 and Haiku 5.5 default to `medium`, and every other model defaults to `high`. Sonnet 5.5 levels are "recalibrated"; its guidance is medium for well-specified agentic tasks, high for harder ones, and "xhigh or max only where your evals show a quality gain". `low` is for "simpler tasks… such as subagents" · effort.md L225–247, L313–319.

24. Prices. Opus 5.5 input/output is $4/$20 per MTok. Sonnet 5.5 is $2/$10, exactly half. Haiku 5.5 is $0.10/$0.50 for prompts up to 100k tokens · pricing.md L21, L29, L34.

**His published skills**

25. github.com/avenoxai/avenoxskills (83 stars, last push 2026-09-25, after the release), `fable-orchestration/SKILL.md`, about 4.6 KB of prose policy with no code:
    - Route by difficulty.
    - "the scarce model must not do pleb work, and must not be spawned as a sub-agent".
    - Always set an explicit `model:` on every Agent call — "never omit-and-inherit… or you silently fan out your most expensive model".
    - "No mid-tiers."
    - Opus handles context-gathering; Codex gpt-6-astra executes against a complete spec; review gates run at max.

26. `limit/SKILL.md` plus a stdlib Python script. It reads the Claude usage windows from `api.anthropic.com/api/oauth/usage` with the OAuth token in `~/.claude/.credentials.json`, and the Codex windows from CodexBar or session JSONL. It treats stale data as "unknown, not empty" and gives a decision table: within about 5 points of full, narrow the work; if the 5-hour window resets within about 30 min, wait. The commits include tests: "test(limit)…" on 2026-09-21.

27. The raw data for this video is not published. No avenoxai repo name matches "efor" or "effort". Earlier benchmark repos exist: `opus-5.5-benchmarks` and `sonnet-5.5-benchmarks`.

### C. What this means for the question points
- **6 (model and effort per step).**
  - Effort is a per-task dial, not a global setting. From low to max, cost rose 4–8× while the score was often flat (findings 7, 10, 11, 12, 14) and sometimes lower (6, 11). That matches the doc's "use xhigh/max only where evals show a gain" (23).
  - The deciding variable is **how clear the brief is** (15, 16). A brief with measurable done-criteria lets low or medium carry the work; a vague goal needs higher effort and Opus. The holding's brief step is therefore what makes cheap steps possible.
  - Sonnet 5.5 costs half per token but overthinks at xhigh or max and can end up dearer than Opus (4, 7, 8, 17). The rule worth taking is **Sonnet at low or medium for well-specified execution and sub-agents; Opus at medium or high for judgment and vague goals; max essentially never; xhigh only where a measured gain exists.**
  - Opus 5.5 already defaults to medium on the API (23), so not setting effort means medium.
  - Per-message effort keeps the cache (22). The orchestrator can therefore change effort per step within one conversation at no cache penalty, on the API with the beta header.
- **5 and 8 (orchestration, concurrency).** His "spend the limit on parallel agents, not on effort" (18) and the skill's "explicit model on every sub-agent call, never inherit" rule (25) are concrete guardrails against silent cost blow-up when many jobs fan out.
- **7 (verification).** His tests grade against fixed criteria: 29/29 scenarios, 10 known flaws, a byte limit. Opus's 32.5 shows that a "better" solution that changed the rules fails (8). That backs the holding's "verify against the brief, never refute toward a better version".
- **10 (CEO sees work).** The `limit` skill's stale-means-unknown discipline (26) fits "the machine says when it last knew".

### D. Contradictions, doubts, what could not be verified
- **Small samples.** He has 1–2 runs per cell and says so (1). Several tests use judge models whose prompts were not shown, and tests 7–8 are scored by his eye. The Opus 32.5 run shows high variance. None of this is statistically solid.
- **Numbers that do not match.**
  - The tea-glass cost is spoken as "Max 4 dolar" but the frame shows $3.95.
  - The opening "$1,5 vs $10" corresponds to $1.66 vs $9.84.
  - He admits a wrong label on one screen ("düşünme ve çıktı token'larını yanlış yazmışım", 7:45).
- **Subscription vs list price.** Costs are list-price conversions of subscription runs, and the token-to-dollar method is not shown. Subscription limit burn is not necessarily proportional to list dollars (UNVERIFIED).
- **Cache claim.** His "efor değiştirmek caching'i patlatmıyor" (21) is true per the docs for the API per-message beta on these models (22). Whether Claude Code's `/effort` switch uses that path is UNVERIFIED. The docs say a top-level change on other models resets the cache.
- **No raw data published for this video** (27), so nothing can be re-checked.
- **The "say it's hard" trick** (20) is untested. The docs give the same advice only for Opus 4.7 at low effort ("add targeted guidance…").
- **Haiku 5.5 and GPT-6.1 Sol were not tested.**
- **The CEO's "skill"** probably refers to another Avenox video, which I did not watch. The `limit` script code itself was not read; only its SKILL.md was.
- **`fable-orchestration` assumes economics that do not match the holding's setup:** "Opus (unlimited)", a Fable main loop, and Codex astra as the default executor.

### E. Verdict
**What the holding should take.**
- Set effort per step by brief clarity and stakes, never globally.
  - Sonnet 5.5 at low or medium for well-specified execution and sub-agents.
  - Opus 5.5 at medium or high for planning, vague goals and real-money judgment.
  - xhigh only where an eval shows a gain, and max as an exception, not a default.
- Always set the model and effort explicitly on every sub-agent spawn, because inheriting silently fans out the expensive model.
- Spend headroom on parallel workers rather than higher effort.
- Use per-message effort (the beta) so changing effort keeps the cache.
- From his skills, take two ideas without installing anything:
  - **`fable-orchestration`:** its explicit-model and difficulty-routing rules, as policy text.
  - **`limit`:** its usage-window "stale = unknown" check before delegating. Its idea fits the "when it last knew" principle.

**What not to take.**
- Do not treat his scores as a benchmark: 1–2 runs, unpublished data, judge-scored.
- Do not take his "Sonnet beats Opus" headline, which holds only for some algorithmic tasks at max effort, and at higher cost.
- Do not install the skills as they are. `fable-orchestration` encodes his own stack (unlimited Opus, Codex astra lanes). `limit` reads the OAuth token from `~/.claude/.credentials.json`; that is secret-handling the holding should review before any use.

The holding's own effort sweep on its own briefs, which is what both he and Anthropic recommend, is the only valid basis for the routing table.

Files are in `/tmp/claude-1000/-home-dxb-DxB-Global-OS/98d5669e-f759-4609-9b7d-3e469b1b84cd/scratchpad/b64/v6-avenox/`:
- `tr.txt`: the full timestamped transcript.
- `Iy8x1GM49Qc.mp4`: the video.
- `f*.jpg`: the frames.
- `effort2.md` and `pricing.md`: the Anthropic docs as fetched.