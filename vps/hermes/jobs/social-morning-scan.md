```yaml
job: social-morning-scan
schedule: "0 6 * * *"
budget: { max_steps: 30, max_tokens: 150000, max_cost_eur: 0.50 }
artifact: "reports/social-scan-{date}.md"
on_output: queue_review
```

# social-morning-scan

Bounded overnight job (master PHASE-07 §3 template — every field above is
MANDATORY; the loader rejects a job file missing any of them, Pitfall 9).

Task: scan the configured public social sources for mentions relevant to DXB
Global's positioning (AI-native consultancy, EU e-commerce), and write a short
markdown digest to the declared artifact: max 20 items, each with source link,
one-line summary, and a relevance score 1-5.

Rules (binding):
- STOP at the artifact. Never post, reply, DM, or contact anything outward —
  on_output: queue_review routes the digest to the CEO's morning review queue;
  the Phase-4 approval rails own every outward action (T-07-20).
- Respect the budget block: if max_steps or max_tokens is near, finalize the
  artifact early with what exists rather than continuing.
