# Study Card: Wise API (payments in/out — Finance dept)

> CEO directive 2026-07-09: Revolut + Wise ADDED BESIDE Stripe (not replacing), same
> privilege class (payment in + out), Finance department only. Study-before-install
> (INTEG-01) executed same day.

- **Tool:** Wise API (official REST, docs.wise.com) — candidate MCPs surveyed: 2060-io/mcp-wise, sergeiledvanov/mcp-wise, @kstam_wise/wise-mcp-server
- **Slug:** wise-api
- **Category:** Payments / Finance
- **Status:** STUDY (install lands with the Phase-11 payment wave, beside Stripe/DocuSign)
- **Target Phase:** 11 (gated money integrations)
- **Owner (dept/tier):** Finance department ONLY
- **Trigger Type:** mcp-profile, gated (draft-only + approval-gated, same class as Stripe)
- **Source:** docs.wise.com (official) · github.com/2060-io/mcp-wise (surveyed live 2026-07-09)

## Candidate findings (verified 2026-07-09)

### Community MCPs
- **2060-io/mcp-wise** — Python, MIT, **v0.4.1 (2026-04-12)**, 12 releases / 71 commits, Docker `io2060/mcp-wise`. Fullest coverage: balances, FX rates, transfer history, recipients, **full send flow (quote → transfer → fund) with SCA handling**, invoice payment requests (business profiles), sandbox via `WISE_IS_SANDBOX`. BUT: **1★, single contributor** — supply-chain trust floor too low for money-moving code; also Python (stack is TS; Python only in the Speaches container).
- **sergeiledvanov/mcp-wise** — recipients-only, too narrow. **@kstam_wise/wise-mcp-server** — TS, thin, low activity.
- No official Wise MCP exists (verified via search 2026-07-09).

### Official API facts (payment in + out coverage)
- **Out (ödeme yapma):** quote → recipient → transfer → fund flow; **SCA**: money movement requires request-signing with a registered public key (private key signs an approval challenge) on top of the API token — a second credential to manage.
- **In (ödeme alma):** multi-currency account details (local IBAN/routing) + **payment/invoice requests** (business profiles) + incoming transaction visibility on balance statements.
- Sandbox environment available; API-token auth (profile-scoped personal/business tokens).

## VERDICT (⛔ FABLE, aligned with the LOCKED Stripe pattern)

**In-house dxb-mcp `payments` group tools; NO community MCP installed.** Same
architectural reason as Revolut (community send-tool bypasses our approval gate) PLUS a
Wise-specific one: the best-coverage candidate has a 1-star/single-author trust floor —
unacceptable for code holding a money-movement token + SCA key. 2060-io repo kept as
REFERENCE for the quote→transfer→fund and SCA-signing flow shape.

## DXB adoption shape (Phase 11)

| Tool (dxb-mcp payments group) | Class | Gate |
|---|---|---|
| `wise_balances`, `wise_transfers_list`, `wise_rates` | read | none (finance profile only) |
| `wise_recipient_add` | write | approval-gated (new payee = fraud surface) |
| `wise_transfer_draft` | write draft | quote + draft → approvals_outbox row ONLY |
| (outbox-executor) `wise.execute` | money out | fund step fires ONLY on CEO approval; SCA signing inside executor; idempotency (customerTransactionId) |
| `wise_payment_request` | receive | invoice/payment request creation (business profile) — outward-facing → approval-gated |
| `wise_account_details` | read | none (share IBAN for receiving) |

- Secrets: `DXB_WISE_TOKEN`, `DXB_WISE_SCA_KEY_PATH` — NAMES only in repo; sandbox first; production token CEO-minted at Phase-11 checkpoint.
- **Least-privilege NOW (this card's commit):** `wise` denied to every department except finance; finance granted (pending_install).

## Known Pitfalls
- SCA key registration is console-manual (CEO identity step, Phase-11 checkpoint).
- Transfers are quote-based: quotes EXPIRE — draft must store quote id + expiry; executor re-quotes if the CEO approves after expiry (rate may drift; re-approval threshold if drift > X% — decide at Phase-11 planning).
- Idempotency via customerTransactionId is mandatory (retry storm = double payment).
- Personal vs business profile ids differ under one token — pin the business profile id at install.

- **Install Command:** none yet (Phase 11; in-house tools)
- **Legitimacy Verdict:** official API legitimate; community candidates legitimate-but-rejected (approval-gate bypass + 1★ trust floor on the only full-coverage option)

## Lifecycle Checklist
- [x] STUDY (2026-07-09 — this card)
- [ ] INSTALL (Phase 11: dxb-mcp payments group + sandbox creds)
- [ ] ADOPT (draft→approve→execute + payment-request flows proven in sandbox)
- [ ] EMBED (finance profile emits wise tools; €1 live canary after CEO approval)
