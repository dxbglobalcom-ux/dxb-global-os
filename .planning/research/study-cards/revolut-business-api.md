# Study Card: Revolut Business API (payments in/out — Finance dept)

> CEO directive 2026-07-09: Revolut + Wise ADDED BESIDE Stripe (not replacing), same
> privilege class (payment in + out), Finance department only. Study-before-install
> (INTEG-01) executed same day.

- **Tool:** Revolut Business API (official REST) — candidate MCP surveyed: jeff-nasseri/revolut-mcp
- **Slug:** revolut-business-api
- **Category:** Payments / Finance
- **Status:** STUDY (install lands with the Phase-11 payment wave, beside Stripe/DocuSign)
- **Target Phase:** 11 (gated money integrations)
- **Owner (dept/tier):** Finance department ONLY (least-privilege; every other dept + ceo + research deny)
- **Trigger Type:** mcp-profile, gated (draft-only + approval-gated, same class as Stripe)
- **Source:** developer.revolut.com/docs/business (official) · github.com/jeff-nasseri/revolut-mcp (surveyed live 2026-07-09)

## Candidate findings (verified 2026-07-09)

### Community MCP: jeff-nasseri/revolut-mcp
- TypeScript, MIT, **v0.1.6 (2026-06-06)**, 27★, npm `@jeff-nasseri/revolut-mcp`; CI + tests + Docker; active, low abandonment risk.
- 21 tools / 8 scopes: accounts, balances, transactions, counterparties, FX rates, **money movement**; sandbox default, production via cert-based OAuth (`REVOLUT_ENVIRONMENT=production`).
- Business API only (no personal/Open Banking, no crypto, no Merchant API).

### Official API facts (payment in + out coverage)
- **Out (ödeme yapma):** Payments endpoints (create payment to counterparty), transfers between own accounts. Auth: certificate-based OAuth 2.0 — client-assertion JWT signed with a private key whose public cert is registered in the Business console; access tokens are short-lived, refresh via the assertion.
- **In (ödeme alma):** account details (IBAN/SWIFT) exposure + incoming transactions visible on the transactions endpoint; payment-request/checkout flows live in the separate Merchant API (NOT in scope v1 — inflow tracking via transactions is).

## VERDICT (⛔ FABLE, aligned with the LOCKED Stripe pattern)

**Money-moving tools are written IN-HOUSE (dxb-mcp `payments` group), community MCP NOT installed.**
Reason (architectural, not quality): any community MCP's `send`/`move money` tool executes
the API call the moment the model calls the tool — our approval gate (approvals_outbox,
Phase 3/4) never sees it. The doc's LOCKED rule for this class is "draft-only,
approval-gated": the tool may only CREATE A DRAFT row; the outbox-executor performs the
transfer AFTER CEO approval. That wiring is only possible in our own tool code.
- Community repo kept as REFERENCE (endpoint coverage map, sandbox setup, cert-OAuth flow shape).
- tool_pins covers our own tools identically (same corpus).
- Read-only subset (balances/transactions/rates) could reuse the community server later; v1 keeps ONE surface (ours) for a single audit path.

## DXB adoption shape (Phase 11)

| Tool (dxb-mcp payments group) | Class | Gate |
|---|---|---|
| `revolut_balances`, `revolut_transactions` | read | none (finance profile only) |
| `revolut_counterparty_add` | write | approval-gated (new payee = fraud surface) |
| `revolut_payment_draft` | write draft | creates approvals_outbox row ONLY |
| (outbox-executor) `revolut. execute` | money out | fires ONLY on CEO approval; idempotency key; audit row |
| `revolut_account_details` | read | none (for invoicing/receiving) |

- Secrets: cert private key + client id via vault/.env NAMES only (`DXB_REVOLUT_KEY_PATH`, `DXB_REVOLUT_CLIENT_ID`); sandbox creds first; production keys CEO-minted at Phase-11 checkpoint.
- **Least-privilege NOW (2026-07-09, this card's commit):** `revolut` denied to every department except finance in policy/denials.json; finance granted (pending_install — not emitted until a catalog entry exists).

## Known Pitfalls
- Cert-OAuth setup is console-manual (CEO identity step at Phase-11 checkpoint, like Hetzner token).
- Sandbox ≠ production parity on some payment rails — acceptance tests must run in sandbox AND a €1 live canary after CEO go.
- Merchant API (checkout links) is a separate product/auth — do not conflate; add a separate card if the CEO wants payment links.

- **Install Command:** none yet (Phase 11; in-house tools — no third-party package planned)
- **Legitimacy Verdict:** official API legitimate; community MCP legitimate but ARCHITECTURALLY rejected for money movement (bypasses approval gate)

## Lifecycle Checklist
- [x] STUDY (2026-07-09 — this card)
- [ ] INSTALL (Phase 11: dxb-mcp payments group + sandbox creds)
- [ ] ADOPT (draft→approve→execute flow proven in sandbox)
- [ ] EMBED (finance profile emits revolut tools; €1 live canary after CEO approval)
