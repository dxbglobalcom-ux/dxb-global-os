Title: Jev API docs — application endpoints + decision primitive

URL Source: https://jevtypesafeai.com/docs

Markdown Content:
[← Get Jev](https://jevtypesafeai.com/get-jev)
## API reference

You bought a general Decision API. Send a `state` and typed `questions` to `/v1/decide` and get calibrated `answers` — you decide what to build with it. The ready-made endpoints further down are optional shortcuts for common jobs; you never wait for us to add one.

## Authentication

Every endpoint uses the same Bearer key. Create one on the [pricing page](https://jevtypesafeai.com/pricing) (sign in, prepay a small balance) — keys look like `jv_live_…`. Keep it server-side, in an environment variable — never commit it or expose it client-side.

```
Authorization: Bearer jv_live_your_key_here
Content-Type: application/json
```

## Core API — /v1/decide

This is the product. One call: a `state` plus typed `questions`, calibrated `answers` back. Everything below (and every ready-made API) is just this with a fixed set of questions.

`POST https://jevtypesafeai.com/api/v1/decide`

### Request body

*   `model` — `jev-latest`, or a pinned version like `jev-1.13.0`. Optional.
*   `state` — the input to evaluate: a string, object, or array. Required.
*   `questions` — a map of your names to typed questions (`choice`, `score`, or `noul`), evaluated in parallel in one round trip. Required.

### The three question types

Every question is exactly one of these. Mix any number in one call.

#### choice — pick one option

A `criteria` map of up to 255 labelled options. Jev returns the winning `choice`, a `probability` for every option, and a `confidence`.

```
"route": {
  "type": "choice",
  "instructions": "Where should this ticket go?",
  "criteria": {
    "billing": "payments, refunds, invoices",
    "bug": "the product is broken",
    "account": "login or access"
  }
}
// → { "type":"choice", "choice":"billing", "confidence":0.99,
//     "probabilities": { "billing":0.99, "bug":0.0, "account":0.01 } }
```

#### score — rate on an ordered scale

An ordered `criteria` array of 2–10 concrete level descriptions, low to high. Jev returns a (possibly fractional) `score`, per-level `probabilities`, a `legend`, and a `confidence`.

```
"urgency": {
  "type": "score",
  "instructions": "How urgent is this message?",
  "criteria": ["routine, no rush", "today", "urgent", "critical, about to churn"]
}
// → { "type":"score", "score":2.97, "confidence":1.0,
//     "probabilities": { "0":0.0, "3":1.0 } }
```

#### noul — a calibrated yes/no

Just `instructions`. Jev returns `noul`, a calibrated 0–1 probability the answer is yes. Ideal for gates and guardrails.

```
"escalate": {
  "type": "noul",
  "instructions": "Escalate to a human immediately?"
}
// → { "type":"noul", "noul":0.94 }
```

Tip: `state` may be a string, object, or array — send only the context the decision needs. Two input budgets apply: up to 64k tokens for `state` plus all questions combined, and 32k tokens for `state` plus the single longest question. If a request exceeds either, the upstream model returns `max_tokens_exceeded` — trim the state or split the work rather than expecting us to truncate it.

### Example request

```
curl https://jevtypesafeai.com/api/v1/decide \
  -H "Authorization: Bearer $JEV_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "state": "Customer: I was charged twice and nobody has replied for 3 days.",
    "questions": {
      "route":    { "type": "choice", "instructions": "Where should this go?",
                    "criteria": { "billing": "money", "bug": "broken", "account": "login" } },
      "urgency":  { "type": "score",  "instructions": "How urgent is this?",
                    "criteria": ["routine", "today", "urgent", "critical"] },
      "escalate": { "type": "noul",   "instructions": "Escalate to a human now?" }
    }
  }'
```

Test your key — run this exact request against the live endpoint, once:

Sends the request above to https://jevtypesafeai.com/api/v1/decide with your key and bills one tiny decision (≈ $0.00003). Your key stays in your browser. In production, keep it server-side.

### Response

You get the resolved `model`, an `answers` map keyed to your questions, and a `usage` block. Because every answer's type is fixed by your request, you branch on it in plain code — no parsing, no regex.

```
{
  "model": "jev-1.13.0",
  "answers": {
    "route":    { "type": "choice", "choice": "billing", "confidence": 0.99,
                  "probabilities": { "billing": 0.99, "bug": 0.0, "account": 0.01 } },
    "urgency":  { "type": "score", "score": 3.0, "probabilities": { "0": 0.0, "3": 1.0 } },
    "escalate": { "type": "noul", "noul": 0.94 }
  },
  "usage": { "input_tokens": 62, "cost_usd": 0.000026, "credits_remaining_usd": 4.999974 }
}
```

### Errors

*   `400` — the request failed validation; the `error` field says what.
*   `401` — missing, invalid, or revoked API key.
*   `402` — insufficient credits (`code: "insufficient_credits"`).
*   `403` — the account is inactive.
*   `404` — unknown application endpoint.
*   `502` — upstream Jev error; retry with backoff.

### Best practice

*   Use an application endpoint when one fits; drop to `/decide` only for custom decisions.
*   Trim `state` to what the decision needs — you pay per input token.
*   Pin a model version in production so thresholds don't shift.
*   Keep your `jv_live_` key server-side.

## Ready-made APIs

Optional shortcuts. If one fits your job, send the plain fields shown and skip writing questions — you get a clean typed result and a `usage` block. If none fits, use `/v1/decide` above; you're never limited to our presets. Bad fields return `400` with an `expects` example.

### Email

`POST /api/v1/email/triage`— Email Triage

Classify an inbound email — category, priority, spam, needs-reply, routing.

```
# request
{"subject":"Charged twice","body":"I was charged twice and need this fixed today."}

# response
{"category":"billing","priority":"urgent","spam":false,"needs_reply":true,"route_to":"finance","confidence":0.96}
```

### Support

`POST /api/v1/support/triage`— Support Triage

Route a ticket — team, issue type, severity, urgency, escalate.

```
# request
{"subject":"App is down","body":"Production dashboard returns 500 for all users since 10am."}

# response
{"team":"technical","issue_type":"outage","severity":"critical","urgency":"now","escalate":true,"confidence":0.99}
```

### Agents

`POST /api/v1/agent/risk`— Agent Risk Check

Gate a proposed tool call — allow / confirm / block, a 0–1 risk score, categories.

```
# request
{"goal":"Clean up the build directory","tool":"bash","arguments":"rm -rf ./dist && aws s3 sync ./build s3://prod --delete","context":"CI deploy step"}

# response
{"action":"block","risk":0.84,
 "categories":["destructive","irreversible","external_side_effect","data_exposure"],"confidence":0.6}
```

### Coding agents

`POST /api/v1/context/filter`— Context Filter

Keep / truncate / drop an old context item to fight agent context bloat.

```
# request
{"task":"Fix the failing payment webhook test","item":"Tool call: read_file('README.md') -> 4000 tokens of project overview from 30 steps ago"}

# response
{"action":"drop","relevance":"minor","redundant":true,"confidence":0.53}
```

### LLM

`POST /api/v1/model/route`— Model Router

Pick a model tier for a prompt by its complexity. Pass models[] to get one named back.

```
# request
{"prompt":"Summarize this 2-sentence email in one line.","models":["fast-mini","balanced","frontier"]}

# response
{"recommended_tier":"fast","complexity":"simple","recommended_model":"fast-mini","confidence":0.78}
```

### RAG

`POST /api/v1/rag/relevance`— RAG Relevance

Score whether a retrieved passage actually answers a query — for reranking & filtering.

```
# request
{"query":"How do I rotate my API key?","passage":"To rotate a key, open Settings > API keys, click Revoke on the old key, then Create new key. Update your environment variable."}

# response
{"relevant":true,"relevance":"direct answer","supports_claim":true,"confidence":1.0}
```

### Sales

`POST /api/v1/leads/qualify`— Lead Qualify

Qualify an inbound lead — qualified, ICP match, segment, buying-now, routing.

```
# request
{"lead":"Jane Doe, VP Eng at Acme (500 employees). 'We're evaluating decision APIs to replace a brittle rules engine — hoping to pick something this quarter.'"}

# response
{"qualified":true,"icp_match":"ideal","segment":"mid_market","buying_now":true,"route":"sales","confidence":0.83}
```

### Moderation

`POST /api/v1/content/moderate`— Content Moderation

Moderate user text — allow / review / block, per-category flags, violations.

```
# request
{"text":"You're an idiot and I'll find where you live."}

# response
{"action":"block",
 "flags":{"toxicity":true,"harassment":true,"violence":true,"sexual":false,
   "self_harm":false,"spam":false,"fraud":false,"pii":false},
 "violation_types":["toxicity","harassment","violence"],"confidence":0.69}
```

### Content

`POST /api/v1/content/classify`— Content Classify

Tag any post — topic, format, hook style, tone, engagement potential.

```
# request
{"text":"I quit my $200k job to sell candles. Here's what nobody tells you about starting a business 🧵"}

# response
{"topic":"business","format":"listicle","hook_style":"bold_claim","tone":"inspirational","engagement_potential":"very high","confidence":0.82}
```

### Ads

`POST /api/v1/ads/analyze`— Ad Analyzer

Tag an ad — hook type, awareness stage, clear offer, CTA, and friction.

```
# request
{"headline":"Stop losing leads to slow follow-up","primary_text":"Our AI replies to every inbound lead in 60 seconds so you never lose a deal to a competitor again.","cta":"Start free trial"}

# response
{"hook_type":"problem","awareness_stage":"problem_aware","has_clear_offer":true,"has_cta":true,"friction":"low","confidence":0.72}
```

### SEO

`POST /api/v1/seo/page-relevance`— SEO Page Relevance

Decide whether one page should internally link to another, and how they relate.

```
# request
{"source":"Blog: 'How calibrated confidence scores work in decision models'","target":"Docs: 'noul — a calibrated yes/no question type'"}

# response
{"should_link":true,"relevance":"related","relationship":"narrower","confidence":0.62}
```

## Billing

*   Prepay credits and use them across the Core Decision API and every ready-made workflow API.
*   `$0.42 / 1M input tokens` on standard credits, with lower rates on larger credit packs. Output tokens are free.
*   Every response includes `cost_usd` and `credits_remaining_usd`.
*   Credits never expire.

### Included with your API key

*   Instant, self-serve access — no setup.
*   The Core `/v1/decide` decision API.
*   Ready-made APIs for email, support, agents, RAG, sales, SEO, ads and more.
*   One API key and one billing balance across every workflow.
*   Batch workflows and copy-paste curl / Python / JS examples.
*   New Jev use cases added as ready-made endpoints over time.

**Independent service.**JevTypeSafeAI.com is not affiliated with or endorsed by TypeSafe AI.
