# Persona Deletion List — CEO one-confirm (C8, 2026-07-19)

**Order:** CEO complaint C8 ("Loan Officer, Real Estate etc. — complained a
thousand times; delete the useless ones"). Per governance no silent deletion:
this list is the single confirmation surface. On the CEO's one "delete"
reply, every item below is removed (persona file + archived DB record) in one
audited commit. Items the CEO strikes stay.

**Already done without confirmation (display hygiene, not deletion):** the HR
page default view now shows the working organization only — archived/dormant
records no longer surface to the CEO (reachable via explicit status filter).

## Candidates (15 dormant reservoir files in `personas/_library/` — all also `archived` in DB)

| # | File | Why it is on the list |
|---|------|----|
| 1 | loan-officer-assistant.md | Interest-based lending domain — conflicts with the Islamic boundary sensitivity; named twice by the CEO |
| 2 | real-estate-buyer-seller.md | No real-estate business line exists or is planned; named by the CEO |
| 3 | healthcare-customer-service.md | No healthcare business line |
| 4 | healthcare-marketing-compliance.md | No healthcare business line |
| 5 | hospitality-guest-services.md | No hospitality business line |
| 6 | retail-customer-returns.md | Physical-retail returns — no such channel |
| 7 | legal-billing-time-tracking.md | Law-firm operations persona — DXB is not a law firm (legal dept covers company legal) |
| 8 | legal-client-intake.md | Same as above |
| 9 | government-digital-presales-consultant.md | Government presales — no such market motion |
| 10 | study-abroad-advisor.md | Education-consulting domain — no such line |
| 11 | specialized-civil-engineer.md | Physical construction engineering — outside a software holding |
| 12 | specialized-french-consulting-market.md | Market-specific speculative persona |
| 13 | specialized-korean-business-navigator.md | Market-specific speculative persona |
| 14 | specialized-salesforce-architect.md | Tool-specific; platform dept covers integration work — keep ONLY if a Salesforce client lands (CEO call) |
| 15 | language-translator.md | Translation is a model capability, not a staff role |

**Not on the list:** the 21 archived DB records that correspond to real former
roster slots stay as history unless the CEO orders otherwise; the 1 dormant
agent is the registered U17 case.

**Execution on confirm:** `git rm personas/_library/<files>` + `delete from
agents where slug in (…) and employment_status='archived'` + audit_log row —
one commit, evidence in the reply.
