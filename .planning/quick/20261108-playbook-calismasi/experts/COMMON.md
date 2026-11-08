# Expert study — common brief (read first)

## The claim being checked
Borja Fat (X article, 2026-10-20, "Stop building AI agents. Anthropic agrees. Do this."; same content as his Instagram reel):
instead of building many specialized agents wired together, run ONE general agent and give it a "playbook" folder per
recurring job — SKILL.md (when to use it, steps, decision rules, what "done" means), a toolbox (approved scripts,
templates, reference files, approved past outputs, so nothing is rebuilt), pass/fail checks the agent runs on its own
work before handing it over, and a loop: every correction is written into the file (instructions / toolbox / checks)
that caused the error, never left in the chat. Evidence he cites: Vercel's internal data assistant was simplified to
direct file access + basic command-line tools and its reported success rate rose from 80% to 100%; Anthropic's skills
guide (a general agent + a folder of instructions and reusable files per job); Anthropic found agents sometimes marked
features complete before testing the whole user flow. The reel opens: "the engineers at Anthropic quit building agents
months ago".

## Who asks and why
An organization run by one human with many AI "departments" and "AI employees" defined as role files; most roles sit
dormant in a cupboard and are called only when a job needs them. He asks: is this claim right, where is it wrong, what
should such an organization do. HIS INSTRUCTION: learn from the people who are truly expert — the labs and engineers
who build agent systems in production, and serious research. NOT users' opinions, NOT influencers, NOT Reddit chatter.

## Rules
- Primary sources, read in full: the lab's own post, the paper, the talk's full transcript. Not a summary of them.
- Every claim: source URL, author, date, a short verbatim quote. Separate what was MEASURED (on which model, which
  year, what sample) from what is ASSERTED. A figure measured on a 2024-2025 model is stated with that model and year.
- Today is 2026-11-08. Look for 2026 material from the same experts — later statements may revise earlier ones.
- Read only: never like, comment, follow, post. Never type the organization's own name into a search.
- Tools — both sides: Claude's own WebSearch/WebFetch AND the research toolbox:
    S="/home/dxb/DxB Global OS/.claude/skills/dxb-research"; export PATH="$S/bin:$PATH"
    bash "$S/scripts/mcpx.sh" exa|tavily|parallel "<short query>" 10
    python3 "$S/scripts/fetch.py" <url>            # a page that refuses
    opencli youtube transcript <url> -f plain      # a talk's transcript; or yt-dlp --write-auto-sub --skip-download <url>
    pdftotext -layout f.pdf -                      # papers (arxiv.org/pdf/<id>)
- Evidence rows (house standard): for every quote you cite,
    python3 "$S/scripts/evidence.py" fetch <OUT> --url <url>
    python3 "$S/scripts/evidence.py" add <OUT> --url <url> --quote "<verbatim>" --author "<A>" --date "<D>"
  and cite the returned id [L00xx] in the report. If a page will not fetch, say so; never invent a quote.
- Write <OUT>/report.md, in English:
  1. Answers to YOUR questions, first, plainly (the verdict), each with [Lxxxx].
  2. Per source: who, when, what they said, what they measured (model/year/sample).
  3. Where the experts disagree, and the conditions under which each side holds.
  4. What you could not open, and what you tried.
- Time box about 20 minutes. Final message to the lead: a 10-15 line summary + the report path.
