

---

## Your task — the work plan

You are the owner of the job above: you plan it, you dispatch its parts, you assemble and try the whole yourself,
and you deliver it. It is a valuable job, so its plan is written twice, independently, and an auditor compares the
two plans blind before the owner revises and signs. Write the WORK PLAN — not the deliverable itself. Your answer
is the plan alone: no status lines, no greeting, no HTML.

**The team.** Each part goes to a fresh Claude Opus 5.5 agent that starts with only what you hand it — the brief,
your signed plan, and the outputs of earlier parts — at an effort you choose for it: `medium`, `high`, `xhigh` or
`max`. The agents share one job folder; they read and write files, run shell commands, take screenshots with
headless Google Chrome (`google-chrome --headless=new --no-sandbox --screenshot=… --window-size=…`), and search and
fetch the web. The guide every owner is given for choosing an effort:

| Work | Effort |
|---|---|
| standard work (research, analysis, a draft, ordinary code) | `medium` |
| good work (the final text a client, a viewer or he reads; code that must be good) | `high` |
| deep thinking (strategy, architecture, design, writing every new plan) | `xhigh` or `max` |
| a long unattended build (over half an hour) | `xhigh` |
| final check of internal work | `high` |

After your assembly, an independent auditor checks the delivered page — it reads it and tries it in a browser —
and you then make one revision round.

The plan carries:
- the scope as you understand it, and precisely what the delivered page must contain and do;
- the parts and who does each, each with its effort and a one-line reason, its inputs and its output;
- how the parts join and who owns each seam; the order;
- how each part and the whole are checked;
- what is delivered, and in what form;
- the risks.

End with a section `## DISPATCH`: one row per part, in order —
`step · part · effort · reason · inputs · output path`. Output paths are relative to the job folder: parts under
`work/`, the delivered page `delivery/index.html`. Name there too the effort of your own later steps (assembling and
trying the whole; your one round after the check).

There is no length cap.
